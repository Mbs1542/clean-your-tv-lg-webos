/* Home rows from the owner's Jellyfin, plus the weather. Read-only, and nothing here is
 * required: without personal.js, or with Jellyfin asleep, Home simply has no rows. */
(function (root) {
  'use strict';
  var personal = root.TV_PERSONAL || {}, jellyfin = personal.jellyfin, weather = personal.weather;
  var FEED_KEY = 'tvhome.mediafeed.v1', WEATHER_KEY = 'tvhome.weather.v1';
  var FEED_GAP = 5 * 60 * 1000, WEATHER_GAP = 30 * 60 * 1000, RETRY = 20 * 1000;
  var CARD_STEP = 278, VISIBLE = 6, JELLYFIN_APP = 'org.jellyfin.webos';
  var rows = [], cards = [], row = 0, column = 0, feedAt = 0, weatherAt = 0, retryTimer = null, hooks = null;
  var section = null;

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

  function imageUrl(item) {
    var id = item.Id, type = 'Primary';
    if (item.ImageTags && item.ImageTags.Thumb) type = 'Thumb';
    else if (item.ParentThumbItemId) { id = item.ParentThumbItemId; type = 'Thumb'; }
    else if (item.BackdropImageTags && item.BackdropImageTags.length) type = 'Backdrop';
    else if (item.ParentBackdropItemId) { id = item.ParentBackdropItemId; type = 'Backdrop'; }
    return jellyfin.url + '/Items/' + encodeURIComponent(id) + '/Images/' + type + '?fillWidth=400&quality=80';
  }
  function toCard(item) {
    var episode = item.Type === 'Episode', data = item.UserData || {};
    return {
      id: item.Id,
      title: episode ? item.SeriesName || item.Name : item.Name,
      subtitle: episode ? tr('Season') + ' ' + item.ParentIndexNumber + ' · ' + tr('Episode') + ' ' + item.IndexNumber : item.ProductionYear ? String(item.ProductionYear) : '',
      progress: data.PlayedPercentage > 0 && data.PlayedPercentage < 100 ? Math.round(data.PlayedPercentage) : 0,
      image: imageUrl(item)
    };
  }
  function buildRows(resume, nextUp, latest) {
    var seen = {}, watching = [];
    resume.concat(nextUp).forEach(function (item) {
      var key = item.SeriesId || item.Id;
      if (!seen[key]) { seen[key] = true; watching.push(toCard(item)); }
    });
    var result = [];
    if (watching.length) result.push({title: tr('Continue watching'), cards: watching.slice(0, 16)});
    var added = latest.map(toCard);
    if (added.length) result.push({title: tr('Recently added'), cards: added.slice(0, 16)});
    return result;
  }

  function render() {
    if (!section) return;
    section.innerHTML = '';
    cards = rows.map(function (entry, rowIndex) {
      var element = root.document.createElement('div'), heading = root.document.createElement('div'), track = root.document.createElement('div');
      element.className = 'mf-row';
      heading.className = 'mf-heading';
      heading.textContent = entry.title;
      track.className = 'mf-track';
      element.appendChild(heading);
      element.appendChild(track);
      section.appendChild(element);
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
    image.onerror = function () { image.style.visibility = 'hidden'; };
    image.src = card.image;
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
    node.addEventListener('click', function () { activate(rowIndex, cardIndex); });
    return node;
  }
  function paint() {
    var active = section.classList.contains('mf-active');
    cards.forEach(function (entry, rowIndex) {
      var start = rowIndex === row ? Math.max(0, column - VISIBLE + 1) : 0;
      entry.track.style.transform = 'translateX(' + (rtl() ? start * CARD_STEP : -start * CARD_STEP) + 'px)';
      entry.nodes.forEach(function (node, cardIndex) { node.classList.toggle('mf-focused', active && rowIndex === row && cardIndex === column); });
    });
  }
  // webOS has no way to open a given title in the Jellyfin app, so OK opens the app itself.
  function activate() { if (hooks) hooks.launch(JELLYFIN_APP, 'Jellyfin'); }

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
        rows = buildRows(parts.resume.Items || [], parts.nextUp.Items || [], parts.latest);
        save(FEED_KEY, rows);
        render();
        paint();
        if (hooks) hooks.changed();
      };
    }
    getJson(jellyfin.url + '/UserItems/Resume?' + user + '&mediaTypes=Video' + common, headers, collect('resume'));
    getJson(jellyfin.url + '/Shows/NextUp?' + user + '&enableResumable=false' + common, headers, collect('nextUp'));
    getJson(jellyfin.url + '/Items/Latest?' + user + '&groupItems=true' + common, headers, collect('latest'));
  }

  var CODES = [[0, 'Clear'], [3, 'Partly cloudy'], [48, 'Fog'], [67, 'Rain'], [77, 'Snow'], [82, 'Rain'], [86, 'Snow'], [99, 'Storm']];
  function describe(code) {
    for (var i = 0; i < CODES.length; i++) if (code <= CODES[i][0]) return tr(CODES[i][1]);
    return '';
  }
  function showWeather(data) {
    var element = root.document.getElementById('weather');
    if (!element || !data) return;
    element.textContent = Math.round(data.now) + '° ' + describe(data.code) + '  ·  ' + Math.round(data.high) + '°/' + Math.round(data.low) + '°';
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
      if (Array.isArray(cached)) rows = cached;
      render();
      showWeather(load(WEATHER_KEY));
      root.MediaFeed.refresh();
    },
    refresh: function () { refreshFeed(); refreshWeather(); },
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
