#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {loadRegistry, keyFor, readLocal} = require('./check-theme-submissions.cjs');
const projectRoot = path.resolve(__dirname, '..');
function generateCatalog(options = {}) {
  const showcaseRoot = options.showcaseRoot || path.join(projectRoot, 'showcase');
  const entries = loadRegistry(showcaseRoot);
  const files = new Map();
  const add = (name, bytes) => files.set(name, Buffer.from(bytes));
  for (const name of ['classic-preview.png', 'CLASSIC-CREDITS.txt']) {
    add('theme-catalog/' + name, readLocal(path.join(projectRoot, 'showcase'), 'assets/' + name, 6291456));
  }
  const alpine = JSON.parse(fs.readFileSync(path.join(projectRoot, 'launcher/themes/alpine/cytv-theme.json')));
  const themes = [
    {id:'builtin:classic', title:'Classic', builtin:true, preview:'theme-catalog/classic-preview.png'},
    {id:'builtin:alpine', title:'Alpine', builtin:true, preview:'themes/alpine/' + alpine.assets.find(a => a.id === alpine.previewAssetId).path}
  ];
  for (const {record:r, manifest:m, base} of entries) {
    if (r.availability === 'removed' || r.availability === 'unavailable') continue;
    const directory = 'theme-catalog/' + keyFor(r.id) + '/' + r.descriptorSha256 + '/';
    const preview = directory + 'preview' + path.extname(r.previewFiles[0]);
    add(preview, readLocal(showcaseRoot, r.previewFiles[0], 6291456));
    add(directory + 'CREDITS.txt', readLocal(showcaseRoot, r.creditsFile, 6291456));
    add(directory + 'LICENSE.txt', readLocal(showcaseRoot, base + m.license.textPath, 6291456));
    themes.push({id:r.id, title:r.title, version:r.themeVersion, author:r.author.name, license:r.license, description:r.description, preview, url:r.descriptorUrl, digest:r.descriptorSha256});
  }
  add('theme-catalog.json', JSON.stringify({schemaVersion:1, themes}, null, 2) + '\n');
  return files;
}
function buildCatalog(options = {}) {
  const launcherRoot = options.launcherRoot || path.join(projectRoot, 'launcher');
  const files = generateCatalog(options);
  const inventoryPath = path.join(launcherRoot, 'builtin-theme-files.json');
  const prior = fs.existsSync(inventoryPath) ? JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) : [];
  const inventory = prior.filter(name => name !== 'theme-catalog.json' && !name.startsWith('theme-catalog/')).concat(Array.from(files.keys())).sort();
  files.set('builtin-theme-files.json', Buffer.from(JSON.stringify(inventory, null, 2) + '\n'));
  if (options.check) {
    const inspect = (directory, prefix) => {
      if (!fs.existsSync(directory)) return;
      for (const item of fs.readdirSync(directory, {withFileTypes:true})) {
        const name = prefix + item.name;
        if (item.isDirectory()) inspect(path.join(directory, item.name), name + '/');
        else if (!files.has(name)) throw new Error('TV theme catalogue is stale: ' + name);
      }
    };
    inspect(path.join(launcherRoot, 'theme-catalog'), 'theme-catalog/');
    for (const [name, bytes] of files) {
      const target = path.join(launcherRoot, name);
      if (!fs.existsSync(target) || !fs.readFileSync(target).equals(bytes)) throw new Error('TV theme catalogue is stale: ' + name);
    }
  } else {
    fs.rmSync(path.join(launcherRoot, 'theme-catalog'), {recursive:true, force:true});
    for (const [name, bytes] of files) {
      const target = path.join(launcherRoot, name);
      fs.mkdirSync(path.dirname(target), {recursive:true});
      fs.writeFileSync(target, bytes);
    }
  }
  return {themes:JSON.parse(files.get('theme-catalog.json')).themes.length, files:files.size};
}
module.exports = {generateCatalog, buildCatalog};
if (require.main === module) {
  try {
    if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('Usage: node scripts/build-tv-theme-catalog.cjs [--check]');
    console.log(JSON.stringify(buildCatalog({check:process.argv.includes('--check')})));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
