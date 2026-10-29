'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const fixture = require('../showcase/fixture.cjs');
const {generateCatalog, buildCatalog} = require('../../scripts/build-tv-theme-catalog.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tv-catalog-'));
try {
  const active = fixture(root, 'active', 'Active');
  for (const availability of ['removed', 'unavailable']) {
    const entry = fixture(root, availability, availability);
    entry.record.availability = availability;
    fs.writeFileSync(path.join(root, 'registry', require('../../scripts/check-theme-submissions.cjs').keyFor(entry.record.id) + '.json'), JSON.stringify(entry.record));
  }
  const generated = generateCatalog({showcaseRoot: root});
  const catalog = JSON.parse(generated.get('theme-catalog.json'));
  assert.deepEqual(catalog.themes.map(t => t.id), ['builtin:classic', 'builtin:alpine', active.record.id]);
  assert.equal(catalog.themes[2].url, active.record.descriptorUrl);
  assert.equal(catalog.themes[2].digest, active.record.descriptorSha256);
  for (const t of catalog.themes) assert.match(t.preview, /^(?:theme-catalog|themes)\/[a-zA-Z0-9/._-]+$/);
  const output = path.join(root, 'output');
  buildCatalog({showcaseRoot:root, launcherRoot:output});
  assert.doesNotThrow(() => buildCatalog({showcaseRoot:root, launcherRoot:output, check:true}));
  const before = Array.from(generated, ([name, bytes]) => [name, require('node:crypto').createHash('sha256').update(bytes).digest('hex')]);
  assert.deepEqual(Array.from(generateCatalog({showcaseRoot:root}), ([name, bytes]) => [name, require('node:crypto').createHash('sha256').update(bytes).digest('hex')]), before);
  fs.writeFileSync(path.join(output, 'theme-catalog/orphan.txt'), 'old');
  assert.throws(() => buildCatalog({showcaseRoot:root, launcherRoot:output, check:true}), /stale/);
  buildCatalog({showcaseRoot:root, launcherRoot:output});
  assert.equal(fs.existsSync(path.join(output, 'theme-catalog/orphan.txt')), false);
  const inventory = JSON.parse(fs.readFileSync(path.join(output, 'builtin-theme-files.json')));
  for (const name of generated.keys()) assert.ok(inventory.includes(name));
  fs.appendFileSync(path.join(output, catalog.themes[2].preview), 'changed');
  assert.throws(() => buildCatalog({showcaseRoot:root, launcherRoot:output, check:true}), /stale/);
  active.record.previewFiles[0] = '../escape.png';
  fs.writeFileSync(path.join(root, 'registry', require('../../scripts/check-theme-submissions.cjs').keyFor(active.record.id) + '.json'), JSON.stringify(active.record));
  assert.throws(() => generateCatalog({showcaseRoot:root}));
  console.log('TV theme catalogue tests passed');
} finally { fs.rmSync(root, {recursive:true, force:true}); }
