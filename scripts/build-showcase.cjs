#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  loadRegistry,
  keyFor,
  readLocal
} = require('./check-theme-submissions.cjs');
const escape = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[c]);
function page(title, body, prefix = '') {
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src \'self\'; style-src \'self\'; script-src \'self\'; connect-src \'none\'; base-uri \'none\'; form-action \'none\'"><title>' + escape(title) + ' · Clean Your TV</title><link rel="stylesheet" href="' + prefix + 'showcase.css"><link rel="stylesheet" href="' + prefix + 'theme-card.css"><script src="' + prefix + 'showcase.js" defer></script></head><body><header class="masthead"><a href="' + prefix + 'index.html">CLEAN YOUR TV <span>/ THEMES</span></a><a href="' + prefix + '../">Launcher preview ↗</a></header><main>' + body + '</main><footer>Reviewed versions, original authors. No popularity scores or automatic inclusion.<br><a href="https://github.com/Razdva122/clean-your-tv-lg-webos/tree/release/next/showcase">Submission and review guide ↗</a></footer></body></html>\n';
}
function buildShowcase(destination, options = {}) {
  const root = options.showcaseRoot || path.resolve(__dirname, '../showcase');
  const entries = loadRegistry(root); // Validate every byte before creating public output.
  const output = path.resolve(destination);
  if (fs.existsSync(output) && fs.readdirSync(output).length) throw new Error('Showcase output must be an empty staging directory');
  fs.mkdirSync(output, {
    recursive: true
  });
  for (const name of ['showcase.css', 'showcase.js', 'theme-card.css']) fs.copyFileSync(path.join(__dirname, '../showcase/src', name), path.join(output, name));
  fs.mkdirSync(path.join(output, 'assets'), {recursive:true});
  for (const name of ['classic-preview.png', 'classic-preview.json', 'CLASSIC-CREDITS.txt']) fs.copyFileSync(path.join(__dirname, '../showcase/assets', name), path.join(output, 'assets', name));
  const active = entries.filter(({
    record: r
  }) => r.availability !== 'removed');
  const cards = active.map(({
    record: r
  }) => '<article class="theme-card ctv-theme-card" data-theme data-title="' + escape(r.title.toLowerCase() + ' ' + r.author.name.toLowerCase() + ' ' + r.description.toLowerCase()) + '" data-tags="' + escape(r.tags.join(' ')) + '" data-api="' + r.themeApiVersion + '" data-added="' + r.addedAt + '" data-updated="' + r.reviewedAt + '"><a class="preview" href="' + keyFor(r.id) + '/index.html"><img class="ctv-theme-card__image" src="' + escape(r.previewFiles[0]) + '" alt="' + escape(r.title) + ' Home preview" width="960" height="540" loading="lazy"></a><div class="card-copy"><span class="eyebrow">COMMUNITY' + (r.availability === 'unavailable' ? ' / SOURCE UNAVAILABLE' : '') + ' / API ' + r.themeApiVersion + '</span><h2><a href="' + keyFor(r.id) + '/index.html">' + escape(r.title) + '</a></h2><p class="byline">By ' + escape(r.author.name) + '</p><p>' + escape(r.description) + '</p><p class="meta">' + escape(r.license) + ' · v' + escape(r.themeVersion) + '</p></div></article>').join('');
  const intro = '<section class="intro"><p class="eyebrow">MAKE HOME YOUR OWN</p><h1>A different view.<br>The same Home.</h1><p class="lede">Community styles for your TV, reviewed one version at a time.</p><p class="notice">Candidate feature · URL installation is in development for a future release. These pages do not establish TV compatibility.</p></section>';
  const controls = '<form class="filters" role="search"><label>Find a theme<input type="search" id="search" placeholder="Name, author or description"></label><label>Style<select id="style"><option value="">All styles</option>' + ['dark', 'light', 'minimal', 'colorful', 'photographic', 'high-contrast'].map(t => '<option>' + t + '</option>').join('') + '</select></label><label>API<select id="api"><option value="">All APIs</option><option value="1">API 1</option></select></label><label>Order<select id="sort"><option value="curated">Curated</option><option value="recent">Recently added</option><option value="updated">Recently reviewed</option></select></label></form>';
  const builtIn = '<section class="upcoming"><p class="eyebrow">BUILT-IN THEMES / UPCOMING</p><h2>Built-in Classic</h2><article class="ctv-theme-card builtin-card"><span class="ctv-theme-card__preview"><img class="ctv-theme-card__image" src="assets/classic-preview.png" alt="Built-in Classic Home preview" width="960" height="540"></span><div class="ctv-theme-card__footer"><span class="ctv-theme-card__name">Classic</span><span class="meta">Built-in</span></div></article><p>The original Home appearance. This renderer capture uses synthetic browser data; it is not a community submission or a hardware acceptance record. <a href="assets/CLASSIC-CREDITS.txt">Image credits</a> · <a href="assets/classic-preview.json">Capture provenance</a></p></section>';
  const empty = '<section class="empty"><p class="eyebrow">THE COLLECTION STARTS HERE</p><h2>No community themes listed yet.</h2><p>Every listing needs a pinned installable descriptor, licensed assets and reviewed previews. The first approved submission will appear here.</p><a href="https://github.com/Razdva122/clean-your-tv-lg-webos/tree/release/next/showcase">Read the submission guide ↗</a></section>' + builtIn;
  fs.writeFileSync(path.join(output, 'index.html'), page('Themes', intro + (active.length ? controls + '<p id="result-count" role="status">' + active.length + ' themes</p><section class="grid" id="themes">' + cards + '</section><p id="no-results" class="empty" hidden>No themes match those filters. Try another search or style.</p>' + builtIn : empty)));
  const catalog = active.map(({
    record: r
  }) => ({
    ...r,
    availability: r.availability || 'reviewed-version',
    reviewedVersion: {
      commit: r.sourceCommit,
      descriptorSha256: r.descriptorSha256
    },
    page: keyFor(r.id) + '/index.html'
  }));
  fs.writeFileSync(path.join(output, 'catalog.json'), JSON.stringify({
    schemaVersion: 1,
    themes: catalog
  }, null, 2) + '\n');
  for (const {
    record: r,
    manifest: m,
    base,
    files
  } of entries) {
    for (const file of r.availability === 'removed' ? [] : files) {
      const dest = path.join(output, base, file);
      fs.mkdirSync(path.dirname(dest), {
        recursive: true
      });
      fs.writeFileSync(dest, readLocal(root, base + file, 6291456));
    }
    let detail = '<nav><a href="../index.html">← All themes</a></nav><section class="detail-heading"><p class="eyebrow">COMMUNITY / REVIEWED VERSION</p><h1>' + escape(r.title) + '</h1><p class="lede">' + escape(r.description) + '</p><p>By <a href="' + escape(r.author.sourceProfile) + '">' + escape(r.author.name) + '</a> · v' + escape(r.themeVersion) + ' · Theme API ' + r.themeApiVersion + '</p></section><section class="screenshots">' + r.previewFiles.map((p, i) => '<img src="../' + escape(p) + '" alt="' + escape(r.title) + ' reviewed screenshot ' + (i + 1) + '" width="960" height="540" loading="lazy">').join('') + '</section><section class="detail-columns"><div><h2>Try this reviewed version</h2><p class="notice">Candidate feature · Requires a future Home release with URL theme installation. Current public releases do not offer this control.</p><p>Copy the fixed descriptor for review or for a future supported installer. Until the TV installer ships, use the author toolkit to try the theme in a browser. The link selects this theme at the reviewed commit.</p><label class="link-label">TV installation URL<input class="tv-link" readonly value="' + escape(r.descriptorUrl) + '" aria-label="Pinned TV installation URL"></label><button type="button" data-copy>Copy TV link</button><p data-copy-status role="status">You can also select and copy the URL above.</p><p><a href="' + escape(r.sourceRepository) + '">Source repository ↗</a></p><p>License: ' + escape(r.license) + ' · <a href="../' + escape(base + m.license.textPath) + '">License text</a> · <a href="../' + escape(r.creditsFile) + '">Asset credits</a></p></div><div><h2>Review evidence</h2>' + r.evidence.map(e => '<article class="evidence"><strong>' + (e.kind === 'browser' ? 'Browser review' : 'Device review') + '</strong><p>' + escape(e.summary) + '</p>' + (e.url ? '<a href="' + escape(e.url) + '">Review record ↗</a>' : '') + '</article>').join('') + '<p>Browser previews do not verify remote input, standby, cold boot or model compatibility.</p><dl><dt>Reviewed</dt><dd>' + r.reviewedAt + '</dd><dt>Source commit</dt><dd><code>' + r.sourceCommit + '</code></dd><dt>Descriptor SHA-256</dt><dd><code>' + r.descriptorSha256 + '</code></dd><dt>Minimum Home</dt><dd>' + escape(m.requires.minimumHomeVersion) + '</dd></dl></div></section>';
    if (r.availability) detail = '<nav><a href="../index.html">← All themes</a></nav><section class="detail-heading"><p class="eyebrow">' + (r.availability === 'removed' ? 'REMOVED LISTING' : 'SOURCE UNAVAILABLE') + '</p><h1>' + escape(r.title) + '</h1><p>This reviewed version is currently unavailable for installation. No replacement source has been substituted.</p><p>Recorded author: ' + escape(r.author.name) + ' · Version ' + escape(r.themeVersion) + ' · ' + escape(r.license) + '</p><p>Reviewed ' + r.reviewedAt + ' · Theme API ' + r.themeApiVersion + '</p><p>Descriptor SHA-256: <code>' + r.descriptorSha256 + '</code></p></section>';
    const dir = path.join(output, keyFor(r.id));
    fs.mkdirSync(dir, {
      recursive: true
    });
    fs.writeFileSync(path.join(dir, 'index.html'), page(r.title, detail, '../'));
  }
  return {
    destination: output,
    count: entries.length
  };
}
module.exports = {
  buildShowcase,
  escape
};
if (require.main === module) {
  try {
    if (!process.argv[2]) throw new Error('Usage: node scripts/build-showcase.cjs OUTPUT_THEMES_DIRECTORY');
    console.log(JSON.stringify(buildShowcase(process.argv[2])));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
