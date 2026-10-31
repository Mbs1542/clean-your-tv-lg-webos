/* Home rows from the owner's Jellyfin and Stremio's public catalog, plus the weather. Read-only,
 * and nothing here is required: with no data, Home simply has no rows. */
(function (root) {
  'use strict';
  var personal = root.TV_PERSONAL || {}, jellyfin = personal.jellyfin, weather = personal.weather, stremio = personal.stremio;
  var FEED_KEY = 'tvhome.mediafeed.v2', WEATHER_KEY = 'tvhome.weather.v1';
  var FEED_GAP = 5 * 60 * 1000, STREMIO_GAP = 6 * 60 * 60 * 1000, WEATHER_GAP = 30 * 60 * 1000, RETRY = 20 * 1000;
  var CARD_STEP = 278, VISIBLE = 6, ROW_STEP = 240, ROWS_SHOWN = 2;
  var JELLYFIN_APP = 'org.jellyfin.webos', STREMIO_APP = 'io.strem.tv';
  var STREMIO_CATALOG = 'https://cinemeta-catalogs.strem.io/top/catalog/';
  var rows = [], cards = [], row = 0, column = 0, feedAt = 0, stremioAt = 0, libraryAt = 0, weatherAt = 0, retryTimer = null, hooks = null;
  var section = null, stack = null, sources = {stremioWatching: [], watching: [], stremio: [], added: []};

  function tr(text) { return root.HomeI18n ? root.HomeI18n.t(text) : text; }
  function rtl() { return root.document.documentElement.dir === 'rtl'; }
  function load(key) { try { return JSON.parse(root.localStorage.getItem(key)); } catch (_) { return null; } }
  function save(key, value) { try { root.localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }

  // A sleeping Jellyfin answers through Sablier with a 200 HTML page: only JSON counts.
  function getJson(url, headers, done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.timeout = 8000;
    Object.keys(headers || {}).forEach(function (name) { xhr.setRequestHeader(name, headers[name]); });
    xhr.onload = function () {
      var value = null;
      if (xhr.status === 200) { try { value = JSON.parse(xhr.responseText); } catch (_) {} }
      done(value);
    };
    xhr.onerror = xhr.ontimeout = function () { done(null); };
    xhr.send();
  }

  function postJson(url, body, done) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = 12000;
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      var value = null;
      if (xhr.status === 200) { try { value = JSON.parse(xhr.responseText); } catch (_) {} }
      done(value);
    };
    xhr.onerror = xhr.ontimeout = function () { done(null); };
    xhr.send(JSON.stringify(body));
  }

  function imageUrl(item) {
    var id = item.Id, type = 'Primary';
    if (item.ImageTags && item.ImageTags.Thumb) type = 'Thumb';
    else if (item.ParentThumbItemId) { id = item.ParentThumbItemId; type = 'Thumb'; }
    else if (item.BackdropImageTags && item.BackdropImageTags.length) type = 'Backdrop';
    else if (item.ParentBackdropItemId) { id = item.ParentBackdropItemId; type = 'Backdrop'; }
    else if (!item.ImageTags || !item.ImageTags.Primary) return '';
    return jellyfin.url + '/Items/' + encodeURIComponent(id) + '/Images/' + type + '?fillWidth=400&quality=80';
  }
  function episodeLabel(item) {
    var parts = [];
    if (item.ParentIndexNumber != null) parts.push(tr('Season') + ' ' + item.ParentIndexNumber);
    if (item.IndexNumber != null) parts.push(tr('Episode') + ' ' + item.IndexNumber);
    return parts.join(' · ');
  }
  function toCard(item) {
    var episode = item.Type === 'Episode', data = item.UserData || {};
    return {
      id: item.Id,
      title: episode ? item.SeriesName || item.Name : item.Name,
      subtitle: episode ? episodeLabel(item) : item.ProductionYear ? String(item.ProductionYear) : '',
      progress: data.PlayedPercentage > 0 && data.PlayedPercentage < 100 ? Math.round(data.PlayedPercentage) : 0,
      image: imageUrl(item)
    };
  }
  function toStremioCard(meta) {
    return {
      id: meta.id,
      title: meta.name,
      subtitle: meta.releaseInfo ? String(meta.releaseInfo) : '',
      progress: 0,
      image: meta.background || meta.poster
    };
  }
  function toLibraryCard(item) {
    var state = item.state || {}, parts = /:(\d+):(\d+)$/.exec(state.video_id || ''), label = [];
    if (item.type === 'series' && parts) label = [tr('Season') + ' ' + parts[1], tr('Episode') + ' ' + parts[2]];
    return {
      id: item._id,
      title: item.name,
      subtitle: label.length ? label.join(' · ') : item.year ? String(item.year) : '',
      progress: state.duration > 0 ? Math.min(99, Math.round(state.timeOffset / state.duration * 100)) : 0,
      image: /^tt\d+$/.test(item._id) ? 'https://images.metahub.space/background/medium/' + item._id + '/img' : item.background || item.poster || ''
    };
  }
  // Titles played without adding them to the library come back as removed and temp. Past 90% counts as finished.
  function libraryCards(items) {
    return items.filter(function (item) {
      var state = item && item.state;
      if (!state || item.type === 'other' || (item.removed && !item.temp) || !(state.timeOffset > 0)) return false;
      return !(state.duration > 0) || state.timeOffset / state.duration < 0.9;
    }).sort(function (a, b) {
      return String(b.state.lastWatched || '').localeCompare(String(a.state.lastWatched || ''));
    }).slice(0, 16).map(toLibraryCard);
  }
  function watchingCards(resume, nextUp) {
    var seen = {}, watching = [];
    resume.concat(nextUp).forEach(function (item) {
      var key = item.SeriesId || item.Id;
      if (!seen[key]) { seen[key] = true; watching.push(toCard(item)); }
    });
    // Untagged imports have no artwork at all: keep them, after the ones that look right.
    return watching.filter(function (card) { return card.image; }).concat(watching.filter(function (card) { return !card.image; })).slice(0, 16);
  }
  function buildRows() {
    var result = [];
    if (sources.stremioWatching.length) result.push({title: tr('Continue on Stremio'), app: STREMIO_APP, appName: 'Stremio', cards: sources.stremioWatching});
    if (sources.watching.length) result.push({title: tr('Continue on Jellyfin'), app: JELLYFIN_APP, appName: 'Jellyfin', cards: sources.watching});
    if (sources.stremio.length) result.push({title: tr('Popular on Stremio'), app: STREMIO_APP, appName: 'Stremio', cards: sources.stremio});
    if (sources.added.length) result.push({title: tr('Recently added'), app: JELLYFIN_APP, appName: 'Jellyfin', cards: sources.added});
    return result;
  }
  function publish() {
    rows = buildRows();
    save(FEED_KEY, sources);
    render();
    paint();
    if (hooks) hooks.changed();
  }

  function render() {
    if (!section) return;
    section.innerHTML = '';
    stack = root.document.createElement('div');
    stack.className = 'mf-stack';
    section.appendChild(stack);
    cards = rows.map(function (entry, rowIndex) {
      var element = root.document.createElement('div'), heading = root.document.createElement('div'), track = root.document.createElement('div');
      element.className = 'mf-row';
      heading.className = 'mf-heading';
      heading.textContent = entry.title;
      track.className = 'mf-track';
      element.appendChild(heading);
      element.appendChild(track);
      stack.appendChild(element);
      return {track: track, nodes: entry.cards.map(function (card, cardIndex) { return renderCard(card, track, rowIndex, cardIndex); })};
    });
    var surface = root.document.getElementById('homeSurface');
    if (surface) surface.classList.toggle('mf-on', rows.length > 0);
    if (row >= rows.length) row = 0;
  }
  function renderCard(card, track, rowIndex, cardIndex) {
    var node = root.document.createElement('div'), frame = root.document.createElement('div'), image = root.document.createElement('img');
    var title = root.document.createElement('div'), subtitle = root.document.createElement('div');
    node.className = 'mf-card';
    frame.className = 'mf-frame';
    image.alt = '';
    image.onerror = function () { image.style.visibility = 'hidden'; frame.setAttribute('data-title', card.title); };
    if (card.image) image.src = card.image;
    else { image.style.visibility = 'hidden'; frame.setAttribute('data-title', card.title); }
    frame.appendChild(image);
    if (card.progress) {
      var bar = root.document.createElement('div'), fill = root.document.createElement('div');
      bar.className = 'mf-progress';
      fill.style.width = card.progress + '%';
      bar.appendChild(fill);
      frame.appendChild(bar);
    }
    title.className = 'mf-title';
    title.textContent = card.title;
    subtitle.className = 'mf-subtitle';
    subtitle.textContent = card.subtitle;
    node.appendChild(frame);
    node.appendChild(title);
    node.appendChild(subtitle);
    track.appendChild(node);
    node.addEventListener('mousemove', function () {
      if (hooks && (row !== rowIndex || column !== cardIndex || !section.classList.contains('mf-active'))) hooks.pointerFocus(rowIndex, cardIndex);
    });
    node.addEventListener('click', function () { activate(rowIndex); });
    return node;
  }
  function paint() {
    if (!section || !stack) return;
    var active = section.classList.contains('mf-active');
    stack.style.transform = 'translateY(' + -Math.max(0, row - ROWS_SHOWN + 1) * ROW_STEP + 'px)';
    cards.forEach(function (entry, rowIndex) {
      var start = rowIndex === row ? Math.max(0, column - VISIBLE + 1) : 0;
      entry.track.style.transform = 'translateX(' + (rtl() ? start * CARD_STEP : -start * CARD_STEP) + 'px)';
      entry.nodes.forEach(function (node, cardIndex) { node.classList.toggle('mf-focused', active && rowIndex === row && cardIndex === column); });
    });
  }
  // Neither TV app can be opened at a given title, so OK opens the app itself.
  function activate(rowIndex) {
    var entry = rows[rowIndex === undefined ? row : rowIndex];
    if (hooks && entry) hooks.launch(entry.app, entry.appName);
  }

  function refreshFeed() {
    if (!jellyfin || !jellyfin.url || !jellyfin.token || !jellyfin.userId) return;
    var now = Date.now();
    if (now - feedAt < FEED_GAP) return;
    feedAt = now;
    clearTimeout(retryTimer);
    var user = 'userId=' + encodeURIComponent(jellyfin.userId), headers = {'X-Emby-Token': jellyfin.token};
    var common = '&enableImageTypes=Primary,Backdrop,Thumb&imageTypeLimit=1&limit=16';
    var parts = {}, pending = 3;
    function collect(name) {
      return function (value) {
        parts[name] = value;
        if (--pending) return;
        if (!parts.resume || !parts.nextUp || !parts.latest) {
          // First request woke Jellyfin: ask once more while it comes up.
          feedAt = 0;
          retryTimer = setTimeout(refreshFeed, RETRY);
          return;
        }
        sources.watching = watchingCards(parts.resume.Items || [], parts.nextUp.Items || []);
        sources.added = parts.latest.map(toCard).slice(0, 16);
        publish();
      };
    }
    getJson(jellyfin.url + '/UserItems/Resume?' + user + '&mediaTypes=Video' + common, headers, collect('resume'));
    getJson(jellyfin.url + '/Shows/NextUp?' + user + '&enableResumable=false' + common, headers, collect('nextUp'));
    getJson(jellyfin.url + '/Items/Latest?' + user + '&groupItems=true' + common, headers, collect('latest'));
  }

  function refreshLibrary() {
    if (!stremio || !stremio.authKey || Date.now() - libraryAt < FEED_GAP) return;
    libraryAt = Date.now();
    postJson('https://api.strem.io/api/datastoreGet', {authKey: stremio.authKey, collection: 'libraryItem', ids: [], all: true}, function (value) {
      if (!value || !Array.isArray(value.result)) { libraryAt = 0; return; }
      sources.stremioWatching = libraryCards(value.result);
      publish();
    });
  }
  function refreshStremio() {
    if (Date.now() - stremioAt < STREMIO_GAP) return;
    stremioAt = Date.now();
    var parts = {}, pending = 2;
    function collect(name) {
      return function (value) {
        parts[name] = value && value.metas || [];
        if (--pending) return;
        var mixed = [], length = Math.max(parts.movie.length, parts.series.length);
        for (var i = 0; i < length && mixed.length < 16; i++) {
          if (parts.movie[i]) mixed.push(toStremioCard(parts.movie[i]));
          if (parts.series[i]) mixed.push(toStremioCard(parts.series[i]));
        }
        if (!mixed.length) { stremioAt = 0; return; }
        sources.stremio = mixed;
        publish();
      };
    }
    getJson(STREMIO_CATALOG + 'movie/top.json', null, collect('movie'));
    getJson(STREMIO_CATALOG + 'series/top.json', null, collect('series'));
  }

  var CODES = [[0, 'Clear'], [3, 'Partly cloudy'], [48, 'Fog'], [67, 'Rain'], [77, 'Snow'], [82, 'Rain'], [86, 'Snow'], [99, 'Storm']];
  function describe(code) {
    for (var i = 0; i < CODES.length; i++) if (code <= CODES[i][0]) return tr(CODES[i][1]);
    return '';
  }
  function showWeather(data) {
    var element = root.document.getElementById('weather');
    if (!element || !data) return;
    // The marks keep each degree sign beside its number in a right-to-left line.
    element.textContent = Math.round(data.now) + '°\u200E ' + describe(data.code) + '  ·  ' + Math.round(data.high) + '°\u200E/' + Math.round(data.low) + '°\u200E';
  }
  function refreshWeather() {
    if (!weather || Date.now() - weatherAt < WEATHER_GAP) return;
    weatherAt = Date.now();
    getJson('https://api.open-meteo.com/v1/forecast?latitude=' + weather.latitude + '&longitude=' + weather.longitude +
      '&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1', null, function (value) {
      if (!value || !value.current || !value.daily) { weatherAt = 0; return; }
      var data = {now: value.current.temperature_2m, code: value.current.weather_code, high: value.daily.temperature_2m_max[0], low: value.daily.temperature_2m_min[0]};
      save(WEATHER_KEY, data);
      showWeather(data);
    });
  }

  root.MediaFeed = {
    attach: function (appHooks) {
      hooks = appHooks;
      section = root.document.getElementById('mediaFeed');
      var cached = load(FEED_KEY);
      if (cached && Array.isArray(cached.watching) && Array.isArray(cached.stremio) && Array.isArray(cached.added)) {
        sources = cached;
        if (!Array.isArray(sources.stremioWatching)) sources.stremioWatching = [];
      }
      rows = buildRows();
      render();
      showWeather(load(WEATHER_KEY));
      root.MediaFeed.refresh();
    },
    refresh: function () { refreshFeed(); refreshLibrary(); refreshStremio(); refreshWeather(); },
    hasItems: function () { return rows.length > 0; },
    enter: function (rowIndex, cardIndex) {
      row = Math.min(rowIndex === undefined ? rows.length - 1 : rowIndex, rows.length - 1);
      column = Math.min(cardIndex || 0, rows[row].cards.length - 1);
      section.classList.add('mf-active');
      paint();
    },
    leave: function () {
      if (section) section.classList.remove('mf-active');
      cards.forEach(function (entry) { entry.nodes.forEach(function (node) { node.classList.remove('mf-focused'); }); });
    },
    // 'up' / 'down' leave the rows; true means handled; false leaves the key to the page.
    key: function (key) {
      if (key === 38) { if (row === 0) return 'up'; row--; column = Math.min(column, rows[row].cards.length - 1); paint(); return true; }
      if (key === 40) { if (row === rows.length - 1) return 'down'; row++; column = Math.min(column, rows[row].cards.length - 1); paint(); return true; }
      if (key === 37) { column = Math.max(0, column - 1); paint(); return true; }
      if (key === 39) { column = Math.min(rows[row].cards.length - 1, column + 1); paint(); return true; }
      if (key === 13) { activate(); return true; }
      if (key === 461 || key === 27) return 'down';
      return false;
    }
  };
}(this));
