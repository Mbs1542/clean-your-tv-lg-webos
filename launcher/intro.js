/* Shows the owner's photo when the helper opens Home after a power-on. Home key presses pass no flag. */
(function (root) {
  'use strict';
  var photo = root.TV_PERSONAL && root.TV_PERSONAL.intro, element = null, timer = null;
  if (!photo) return;
  function hide() { clearTimeout(timer); if (element) element.classList.remove('on'); }
  function show() {
    if (!element) {
      element = root.document.createElement('div');
      element.id = 'bootIntro';
      element.style.backgroundImage = 'url("' + photo + '")';
      root.document.body.appendChild(element);
      element.offsetWidth;
    }
    element.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(hide, 3000);
  }
  function requested(raw) {
    try { return (typeof raw === 'string' ? JSON.parse(raw) : raw).intro === true; } catch (_) { return false; }
  }
  if (root.PalmSystem && requested(root.PalmSystem.launchParams)) show();
  root.document.addEventListener('webOSRelaunch', function (event) {
    if (requested(event.detail) || root.PalmSystem && requested(root.PalmSystem.launchParams)) show();
  });
  // A press while the photo shows only dismisses it, so it cannot open the app behind the photo.
  root.document.addEventListener('keydown', function (event) {
    if (!element || !element.classList.contains('on')) return;
    hide();
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}(this));
