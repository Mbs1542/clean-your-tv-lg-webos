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
assert.deepEqual(model.state(), {columns: 5, override: null, themeColumns: 5, preset: 'dock-grid'});
model.setThemeColumns(6);
assert.equal(model.state().columns, 6);
model.setColumns(3);
model.setThemeColumns(8);
assert.deepEqual(model.state(), {columns: 3, override: 3, themeColumns: 8, preset: 'dock-grid'});
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
console.log('PASS columns precedence, bounds, reload, legacy profiles and failed persistence');
