/* User preference > theme default > Classic. Profile schema remains unchanged. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HomeLayout = factory();
}(this, function () {
  'use strict';
  var KEY = 'tvhome.columns.v1';
  function valid(value) { return typeof value === 'number' && isFinite(value) && value % 1 === 0 && value >= 1 && value <= 8; }
  function create(storage, config, profileData) {
    var themeColumns = 5, override = valid(config.columns) && config.columns !== 5 ? config.columns : null;
    try {
      var saved = JSON.parse(storage.getItem(KEY));
      if (saved && saved.version === 1 && (saved.columns === null || valid(saved.columns))) override = saved.columns;
    } catch (_) {}
    function state() { return {columns: override === null ? themeColumns : override, override: override, themeColumns: themeColumns}; }
    function changed() { config.columns = state().columns; if (model.onchange) model.onchange(state()); }
    function setColumns(value) {
      if (value !== null && !valid(value)) throw Error('columns-invalid');
      var previous = storage.getItem(KEY), profile = null;
      if (profileData) {
        var raw = storage.getItem(profileData.key);
        if (raw !== null) {
          profile = profileData.validate(JSON.parse(raw));
          profile.config.columns = value === null ? themeColumns : value;
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
    var model = {state: state, setColumns: setColumns, setThemeColumns: function (value) {
      if (!valid(value)) throw Error('columns-invalid');
      themeColumns = value; changed();
    }};
    config.columns = state().columns;
    return model;
  }
  return {create: create, key: KEY};
}));
