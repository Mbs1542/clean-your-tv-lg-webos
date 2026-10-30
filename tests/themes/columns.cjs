// Wrong precedence, accepting malformed geometry, or committing memory before
// storage succeeds must fail independently of the browser and TV services.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const filename = require('node:path').resolve(__dirname, '../../launcher/home-layout.js');
assert(fs.existsSync(filename), 'column preference model is missing');
const {create, key} = require(filename);
function storage() {
  const values = new Map();
  return {getItem: name => values.has(name) ? values.get(name) : null,
    setItem: (name, value) => values.set(name, String(value)), removeItem: name => values.delete(name)};
}
const saved = storage(), config = {columns: 5};
let model = create(saved, config);
assert.deepEqual(model.state(), {columns: 5, override: null, themeColumns: 5, preset: 'dock-grid', allowColumnOverride: true});
model.setThemeColumns(6);
assert.equal(model.state().columns, 6);
model.setColumns(3);
model.setThemeColumns(8);
assert.deepEqual(model.state(), {columns: 3, override: 3, themeColumns: 8, preset: 'dock-grid', allowColumnOverride: true});
assert.equal(config.columns, 3);
model = create(saved, config);
model.setThemeColumns(7);
assert.equal(model.state().columns, 3, 'explicit choice survives reload and theme switch');
model.setColumns(null);
assert.equal(model.state().columns, 7, 'By theme restores the current author default');
assert.equal(create(saved, {columns: 7}).state().override, null, 'auto stays auto after reload');
for (const bad of [0, 9, -1, 1.5, NaN, Infinity, '4', {}, undefined]) {
  assert.throws(() => model.setColumns(bad), /columns-invalid/);
  assert.throws(() => model.setThemeColumns(bad), /columns-invalid/);
}
saved.setItem(key, '{broken');
assert.equal(create(saved, {columns: 4}).state().columns, 4, 'legacy configured count is retained');
assert.equal(create(storage(), {columns: 0}).state().columns, 5, 'malformed configuration falls back safely');
const unavailable = storage();
model = create(unavailable, {columns: 5});
unavailable.setItem = () => {throw Error('quota');};
assert.throws(() => model.setColumns(8), /quota/);
assert.equal(model.state().columns, 5, 'failed save preserves rendered state');
const profileStore = storage();
profileStore.setItem('profile', JSON.stringify({schema: 1, config: {columns: 5}, settings: {}}));
const adapter = {key: 'profile', validate: value => value};
model = create(profileStore, {columns: 5}, adapter);
model.setColumns(2);
assert.equal(JSON.parse(profileStore.getItem('profile')).config.columns, 2, 'existing profile keeps the effective count');
const previous = profileStore.getItem('profile'), setItem = profileStore.setItem;
profileStore.setItem = (name, value) => {if (name === 'profile') throw Error('profile-quota'); setItem(name, value);};
assert.throws(() => model.setColumns(8), /profile-quota/);
assert.equal(model.state().columns, 2);
assert.equal(JSON.parse(profileStore.getItem(key)).columns, 2, 'preference rolls back after profile save failure');
assert.equal(profileStore.getItem('profile'), previous);
const automaticStore = storage(), automaticConfig = {columns: 5};
const automatic = create(automaticStore, automaticConfig);
automatic.setThemeLayout({preset:'scenic-grid', columns:8, allowColumnOverride:false, spacingScale:1, textScale:1, focusScale:1.1});
assert.equal(automatic.state().columns,8);
assert.equal(automaticConfig.columns,5,'effective theme columns must not become a captured legacy preference');
assert.equal(create(automaticStore,JSON.parse(JSON.stringify(automaticConfig))).state().override,null,'capture/reload preserves By theme without a dedicated key');
automatic.setThemeLayout({preset:'channel-list',columns:1,spacingScale:1,textScale:1,focusScale:1.1});
assert.equal(automatic.state().columns,1,'Channel inherits its author default after Alpine');
automatic.setColumns(4);automatic.setThemeColumns(8);
assert.equal(automaticConfig.columns,4,'explicit preference remains capturable');
automatic.setColumns(null);
assert.equal(automaticConfig.columns,5,'By theme captures the neutral legacy default, not current theme columns');
const legacyConfig={columns:8},legacy=create(storage(),legacyConfig);
assert.equal(legacy.state().override,8,'genuine nondefault legacy preference is still imported');
const candidateStore=storage();candidateStore.setItem('tvhome.theme.choice.v1',JSON.stringify({id:'builtin:alpine',title:'Alpine'}));
const candidate=create(candidateStore,{columns:8});
assert.equal(candidate.state().override,null,'ambiguous pre-release theme-derived profile count resets when no explicit Columns key exists');
candidate.setThemeLayout({preset:'channel-list',columns:1,spacingScale:1,textScale:1,focusScale:1.1});
assert.equal(candidate.state().columns,1,'existing polluted candidate profile recovers Channel default');
candidateStore.removeItem('tvhome.theme.choice.v1');
assert.equal(create(candidateStore,{columns:8}).state().override,null,'reset/recovery cannot resurrect the persisted polluted profile after theme choice is removed');
candidateStore.setItem(key,JSON.stringify({version:1,columns:4}));
assert.equal(create(candidateStore,{columns:8}).state().override,4,'saved explicit preference still wins during candidate recovery');
console.log('PASS columns precedence, bounds, reload, legacy profiles and failed persistence');
