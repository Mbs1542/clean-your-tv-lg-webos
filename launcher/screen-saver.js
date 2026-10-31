/* Photo screensaver and power-off for an untouched Home. Off unless personal.js sets saver. */
(function (root) {
  'use strict';
  var config = root.TV_PERSONAL && root.TV_PERSONAL.saver;
  if (!config || !root.IdlePolicy) return;
  var photos = config.photos || [], SLIDE_MS = 10000, TICK_MS = 1000;
  var policy = root.IdlePolicy.create(photos.length ? config.afterMs : 0, config.offAfterMs, Date.now());
  var element = null, layers = [], front = 0, order = [], position = 0, slideTimer = null;

  function shuffled(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), held = copy[i];
      copy[i] = copy[j];
      copy[j] = held;
    }
    return copy;
  }
  function build() {
    element = root.document.createElement('div');
    element.id = 'photoSaver';
    for (var i = 0; i < 2; i++) {
      var layer = root.document.createElement('div');
      layer.className = 'saver-layer';
      element.appendChild(layer);
      layers.push(layer);
    }
    root.document.body.appendChild(element);
  }
  function nextPhoto() {
    if (position >= order.length) { order = shuffled(photos); position = 0; }
    return order[position++];
  }
  // Load first, so a slow TV never fades to a half-drawn or missing photo.
  function advance() {
    var src = nextPhoto(), probe = new root.Image();
    probe.onload = function () {
      if (!element || !element.classList.contains('on')) return;
      var incoming = layers[1 - front];
      incoming.style.backgroundImage = 'url("' + src + '")';
      incoming.classList.add('shown');
      layers[front].classList.remove('shown');
      front = 1 - front;
    };
    probe.src = src;
  }
  function start() {
    if (!element) build();
    element.classList.add('on');
    advance();
    clearInterval(slideTimer);
    slideTimer = setInterval(advance, SLIDE_MS);
  }
  function stop() {
    clearInterval(slideTimer);
    if (!element) return;
    element.classList.remove('on');
    layers.forEach(function (layer) { layer.classList.remove('shown'); });
  }
  // Apps cannot power the TV off themselves. The helper can, over its paired control channel.
  function powerOff() {
    var bridge = new root.PalmServiceBridge();
    root.ScreenSaverBridge = bridge; // Keep it alive until the reply arrives.
    bridge.onservicecallback = function () {};
    bridge.call('luna://com.gathin.tvhome.renewal/powerOff', '{}');
  }
  function touched() {
    if (policy.activity(Date.now())) { stop(); return true; }
    return false;
  }
  // A press that clears the photos does only that, including its auto-repeat while held: it must not
  // also open the app behind them.
  var swallowed = null;
  root.document.addEventListener('keydown', function (event) {
    if (event.keyCode === swallowed || touched()) {
      swallowed = event.keyCode;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  root.document.addEventListener('keyup', function (event) {
    if (event.keyCode !== swallowed) return;
    swallowed = null;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  ['mousemove', 'mousedown', 'wheel'].forEach(function (name) {
    root.document.addEventListener(name, touched, true);
  });
  root.document.addEventListener('visibilitychange', function () {
    policy.visible(!root.document.hidden, Date.now());
    stop();
  });
  root.document.addEventListener('webOSRelaunch', function () {
    policy.activity(Date.now());
    stop();
  });
  policy.visible(!root.document.hidden, Date.now());
  setInterval(function () {
    var what = policy.tick(Date.now());
    if (what === 'saver') start();
    else if (what === 'off') powerOff();
    else if (what === 'wake') stop();
  }, TICK_MS);
}(this));
