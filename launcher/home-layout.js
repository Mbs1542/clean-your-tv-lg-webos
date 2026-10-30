/* User preference > theme default > Classic. Profile schema remains unchanged. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HomeLayout = factory();
}(this, function () {
  'use strict';
  var KEY = 'tvhome.columns.v1';
  function valid(value) { return typeof value === 'number' && isFinite(value) && value % 1 === 0 && value >= 1 && value <= 8; }
  var presets = ['dock-grid', 'icon-grid', 'side-grid', 'channel-list', 'scenic-grid'];
  // Only trusted presets own positions, hit areas and scrolling. Theme CSS owns appearance.
  function geometry(preset, columns) {
    if (presets.indexOf(preset) < 0 || !valid(columns)) throw Error('layout-invalid');
    var g = {preset: preset, left: 112, width: 1696, maxWidth: 360, maxHeight: 202,
      dockTop: 680, padding: 28, rowGap: 90, rowExtra: 36, heroOffset: 176,
      scrollTop: 104, scrollBottom: 1060, dock: preset === 'dock-grid'};
    if (preset === 'icon-grid') {
      g.maxWidth = 140; g.maxHeight = 140; g.dockTop = 260; g.padding = 0;
      g.rowGap = 110; g.rowExtra = 0; g.scrollTop = 230;
    } else if (preset === 'side-grid') {
      g.left = 560; g.width = 1248; g.maxWidth = 300; g.maxHeight = 190;
      g.dockTop = 210; g.padding = 0; g.rowGap = 90; g.rowExtra = 0; g.scrollTop = 200;
    } else if (preset === 'scenic-grid') {
      g.maxWidth = 128; g.maxHeight = 128; g.dockTop = 790; g.padding = 0;
      g.rowGap = 100; g.rowExtra = 0; g.scrollTop = 760;
    } else if (preset === 'channel-list') {
      g.left = 96; g.width = columns === 1 ? 1024 : 1728; g.maxWidth = g.width; g.maxHeight = columns >= 5 ? 104 : 88;
      g.dockTop = 240; g.padding = 0; g.rowGap = 18; g.rowExtra = 0; g.scrollTop = 200;
    }
    g.columnWidth = g.width / columns;
    g.cardWidth = Math.min(g.maxWidth, Math.floor((g.columnWidth - 36) / 1.05));
    g.cardHeight = preset === 'channel-list' ? g.maxHeight : Math.round(g.cardWidth * g.maxHeight / g.maxWidth);
    g.top = g.dockTop + g.padding;
    return g;
  }
  function create(storage, config, profileData) {
    var preset = 'dock-grid', themeColumns = 5, allowColumnOverride = true, override = valid(config.columns) && config.columns !== 5 ? config.columns : null;
    try {
      var raw = storage.getItem(KEY), saved = JSON.parse(raw);
      // Pre-release profiles captured effective theme columns without a preference key.
      // Retain genuine legacy migration until themes have actually been used.
      if (raw === null) {
        var choice = JSON.parse(storage.getItem('tvhome.theme.choice.v1'));
        if (choice && typeof choice.id === 'string' && /^(builtin:(classic|alpine)$|github:)/.test(choice.id)) {
          override = null; storage.setItem(KEY, JSON.stringify({version: 1, columns: null}));
        }
      }
      if (saved && saved.version === 1 && (saved.columns === null || valid(saved.columns))) override = saved.columns;
    } catch (_) {}
    function state() { return {columns: !allowColumnOverride || override === null ? themeColumns : override, override: override, themeColumns: themeColumns, preset: preset, allowColumnOverride: allowColumnOverride}; }
    // CONFIG is captured into profiles. Store preference, never theme-derived geometry.
    function changed() { config.columns = override === null ? 5 : override; if (model.onchange) model.onchange(state()); }
    function setColumns(value) {
      if (!allowColumnOverride) throw Error('columns-locked');
      if (value !== null && !valid(value)) throw Error('columns-invalid');
      var previous = storage.getItem(KEY), profile = null;
      if (profileData) {
        var raw = storage.getItem(profileData.key);
        if (raw !== null) {
          profile = profileData.validate(JSON.parse(raw));
          profile.config.columns = value === null ? 5 : value;
          profile = profileData.validate(profile);
        }
      }
      storage.setItem(KEY, JSON.stringify({version: 1, columns: value}));
      try {
        if (profile) storage.setItem(profileData.key, JSON.stringify(profile));
      } catch (error) {
        if (previous === null) storage.removeItem(KEY); else storage.setItem(KEY, previous);
        throw error;
      }
      override = value;
      changed();
    }
    var model = {supportsColumnPolicy: true, state: state, setColumns: setColumns, setThemeLayout: function (layout) {
      if (!layout || presets.indexOf(layout.preset) < 0 || !valid(layout.columns) ||
          (layout.allowColumnOverride !== undefined && typeof layout.allowColumnOverride !== 'boolean') ||
          layout.spacingScale !== 1 || layout.textScale !== 1 || layout.focusScale !== 1.1) throw Error('layout-invalid');
      preset = layout.preset; themeColumns = layout.columns; allowColumnOverride = layout.allowColumnOverride !== false; changed();
    }, setThemeColumns: function (value) {
      if (!valid(value)) throw Error('columns-invalid');
      themeColumns = value; changed();
    }};
    config.columns = state().columns;
    return model;
  }
  return {create: create, key: KEY, geometry: geometry};
}));
