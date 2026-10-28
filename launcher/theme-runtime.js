/* Trusted appearance lifecycle. Transport and persistent trials are separate. */
(function (root) {
  'use strict';
  var owners = Object.create(null), heldSheet = null, wasEnabled = false, accepted = null;
  function suspended() { return Object.keys(owners).length > 0; }
  function sheet() { return root.document.getElementById('ctv-theme-style'); }
  function surfaceState(active) {
    var surface = root.document.getElementById('homeSurface');
    if (surface) surface.classList[active ? 'add' : 'remove']('ctv-theme-suspended');
  }
  function suspend(owner) {
    if (!suspended()) {
      heldSheet = sheet(); wasEnabled = !!heldSheet && !heldSheet.disabled;
      if (wasEnabled) heldSheet.disabled = true;
      surfaceState(wasEnabled);
    }
    owners[owner || 'manual'] = true;
  }
  function resume(owner) {
    delete owners[owner || 'manual'];
    if (suspended()) return;
    if (heldSheet && wasEnabled) heldSheet.disabled = false;
    heldSheet = null; wasEnabled = false; surfaceState(false);
  }
  function fail(code, field) { var error = new Error(code + ': invalid ' + field); error.code = code; error.field = field; throw error; }
  function release(previous, next) {
    if (!previous || !root.URL || !root.URL.revokeObjectURL) return;
    Object.keys(previous).forEach(function (key) {
      var value = previous[key];
      if (typeof value === 'string' && value.indexOf('blob:') === 0 && (!next || Object.keys(next).every(function (k) { return next[k] !== value; }))) root.URL.revokeObjectURL(value);
    });
  }
  function apply(input) {
    var policy = root.ThemePolicy;
    if (!policy) fail('api-unsupported', 'ThemePolicy');
    var manifest = policy.validateManifest(input.manifest), rules = policy.validateRules(input.rules);
    /* Trusted layouts currently implement only the Classic scale values. */
    if (manifest.layout.spacingScale !== 1 || manifest.layout.textScale !== 1 || manifest.layout.focusScale !== 1.1) fail('layout-invalid', 'unsupported scale preset');
    if (manifest.layout.preset !== 'dock-grid' && (!root.HomeLayoutState || !root.HomeLayoutState.setThemeLayout)) fail('layout-invalid', 'unsupported renderer preset');
    if (manifest.layout.allowColumnOverride === false && (!root.HomeLayoutState || root.HomeLayoutState.supportsColumnPolicy !== true)) fail('layout-invalid', 'unsupported column policy');
    var handles = input.assetHandles || {}, overrides = input.overrides || {}, own = Object.prototype.hasOwnProperty;
    Object.keys(overrides).forEach(function (key) { if (['accent', 'dim', 'wallpaperAssetId'].indexOf(key) < 0) fail('manifest-invalid', 'overrides'); });
    var accent = own.call(overrides, 'accent') ? overrides.accent : manifest.defaults.accent;
    var dim = own.call(overrides, 'dim') ? overrides.dim : manifest.defaults.dim;
    var wallpaper = own.call(overrides, 'wallpaperAssetId') ? overrides.wallpaperAssetId : manifest.defaults.wallpaperAssetId;
    if (typeof accent !== 'string' || !/^#[a-fA-F0-9]{6}$/.test(accent)) fail('manifest-invalid', 'accent');
    if (typeof dim !== 'number' || !isFinite(dim) || dim < 0 || dim > .85) fail('manifest-invalid', 'dim');
    var css = policy.compileRules(rules, handles);
    function appendCss(text) {
      if (text.length > policy.limits.emittedCssBytes - css.length) fail('css-budget', 'emitted CSS bytes');
      css += text;
    }
    if (wallpaper !== null) {
      if (!manifest.assets.some(function (asset) { return asset.id === wallpaper; })) fail('asset-invalid', 'wallpaperAssetId');
      var wallpaperBundle = {schemaVersion: 1, rules: [{selector: [{part: 'home', states: []}], declarations: [{property: 'background-image', value: {type: 'asset', id: wallpaper}}]}]};
      var wallpaperCss = policy.compileRules(wallpaperBundle, handles);
      appendCss('\n' + wallpaperCss.replace('background-image:', 'background-image:linear-gradient(rgba(0,0,0,' + dim + '),rgba(0,0,0,' + dim + ')),'));
    }
    /* A trusted minimum remains visible even against higher-specificity author states.
       Author CSS cannot emit !important; this narrow engine-owned border may. */
    appendCss('\n#homeSurface.ctv-home .ctv-card.is-focused{border-color:' + accent + '!important;border-style:solid!important;border-width:' + (manifest.layout.preset === 'scenic-grid' ? '3' : '2') + 'px!important;}');
    /* All untrusted input is checked before either geometry or styles are changed. */
    if (root.HomeLayoutState && root.HomeLayoutState.setThemeLayout) root.HomeLayoutState.setThemeLayout(manifest.layout);
    else if (root.HomeLayoutState && root.HomeLayoutState.setThemeColumns) root.HomeLayoutState.setThemeColumns(manifest.layout.columns);
    var current = sheet(), previous = accepted;
    if (!current) { current = root.document.createElement('style'); current.id = 'ctv-theme-style'; current.disabled = true; root.document.head.appendChild(current); }
    current.disabled = true; current.textContent = css;
    current.disabled = suspended();
    if (suspended()) { heldSheet = current; wasEnabled = true; surfaceState(true); }
    else surfaceState(false);
    var ownedHandles = Object.create(null);
    Object.keys(handles).forEach(function (key) { ownedHandles[key] = handles[key]; });
    accepted = {themeId: manifest.id, themeVersion: manifest.themeVersion, handles: ownedHandles};
    var surface = root.document.getElementById('homeSurface');
    if (surface) surface.classList.add('ctv-theme-active');
    release(previous && previous.handles, ownedHandles);
    return {themeId: manifest.id, themeVersion: manifest.themeVersion};
  }
  function reset() {
    var current = sheet(), previous = accepted;
    if (root.HomeLayoutState && root.HomeLayoutState.setThemeLayout) root.HomeLayoutState.setThemeLayout({preset: 'dock-grid', columns: 5, spacingScale: 1, textScale: 1, focusScale: 1.1});
    else if (root.HomeLayoutState && root.HomeLayoutState.setThemeColumns) root.HomeLayoutState.setThemeColumns(5);
    if (current && current.parentNode) current.parentNode.removeChild(current);
    accepted = null; heldSheet = null; wasEnabled = false; surfaceState(false);
    var surface = root.document.getElementById('homeSurface');
    if (surface) surface.classList.remove('ctv-theme-active');
    release(previous && previous.handles, null);
    return {themeId: 'builtin:classic', themeVersion: null};
  }
  root.ThemeRuntime = {isSuspended: suspended, apply: apply, suspend: suspend, resume: resume, reset: reset};
}(this));
