/* Shows the owner's photo when the helper opens Home after a power-on. Home key presses pass no flag.
 * Home can be asked to open several seconds before it reaches the screen, so the photo is put up at
 * once and its time only starts counting while Home is really visible. */
(function (root) {
  'use strict';
  var photo = root.TV_PERSONAL && root.TV_PERSONAL.intro, element = null, timer = null;
  var SHOWN_MS = 4000;
  if (!photo) return;
  function hide() { clearTimeout(timer); if (element) element.classList.remove('on'); }
  function isOn() { return element && element.classList.contains('on'); }
  function count() {
    clearTimeout(timer);
    if (!root.document.hidden) timer = setTimeout(hide, SHOWN_MS);
  }
  function show() {
    if (!element) {
      element = root.document.createElement('div');
      element.id = 'bootIntro';
      element.style.backgroundImage = 'url("' + photo + '")';
      root.document.body.appendChild(element);
      element.offsetWidth;
    }
    element.classList.add('on');
    count();
  }
  function requested(raw) {
    try { return (typeof raw === 'string' ? JSON.parse(raw) : raw).intro === true; } catch (_) { return false; }
  }
  if (root.PalmSystem && requested(root.PalmSystem.launchParams)) show();
  root.document.addEventListener('webOSRelaunch', function (event) {
    if (requested(event.detail) || root.PalmSystem && requested(root.PalmSystem.launchParams)) show();
  });
  root.document.addEventListener('visibilitychange', function () { if (isOn()) count(); });
  // A press while the photo shows only dismisses it, so it cannot open the app behind the photo.
  root.document.addEventListener('keydown', function (event) {
    if (!isOn()) return;
    hide();
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}(this));
