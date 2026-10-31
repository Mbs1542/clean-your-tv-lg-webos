/* When Home has sat untouched: photos after a while, then power off. No timers or DOM here, so a test
 * can drive the clock. Time only counts while Home is on screen, and a gap between ticks means the
 * TV was asleep: that gap must never read as inactivity, or the TV would turn off as it wakes. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IdlePolicy = factory();
}(this, function () {
  'use strict';
  var SLEEP_GAP = 10000;
  function create(saverAfter, offAfter, now) {
    var lastActive = now, lastTick = now, saver = false, off = false, visible = true;
    function reset(at) { lastActive = at; lastTick = at; saver = false; off = false; }
    return {
      activity: function (at) {
        var wasSaver = saver;
        reset(at);
        return wasSaver;
      },
      visible: function (isVisible, at) {
        visible = isVisible;
        reset(at);
      },
      // Returns 'saver' or 'off' once each, when that moment arrives. Otherwise null.
      tick: function (at) {
        if (!visible) { lastTick = at; return null; }
        if (at < lastTick || at - lastTick > SLEEP_GAP) { reset(at); return 'wake'; }
        lastTick = at;
        var idle = at - lastActive;
        if (offAfter > 0 && !off && idle >= offAfter) { off = true; return 'off'; }
        if (saverAfter > 0 && !saver && idle >= saverAfter) { saver = true; return 'saver'; }
        return null;
      },
      saverShown: function () { return saver; }
    };
  }
  return {create: create, SLEEP_GAP: SLEEP_GAP};
}));
