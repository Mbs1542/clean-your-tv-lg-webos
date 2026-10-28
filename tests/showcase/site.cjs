'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {buildShowcase,escape}=require('../../scripts/build-showcase.cjs'), fixture=require('./fixture.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'cytv-site-'));
try {
 const emptySource=path.join(root,'empty-source');fs.mkdirSync(path.join(emptySource,'registry'),{recursive:true});
 const empty=path.join(root,'empty');buildShowcase(empty,{showcaseRoot:emptySource});
 const html=fs.readFileSync(path.join(empty,'index.html'),'utf8');assert.match(html,/No community themes listed yet/);assert.match(html,/BUILT-IN THEMES \/ UPCOMING/);assert.doesNotMatch(html,/data-theme|data-copy|vote|applause|shrug/i);
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(empty,'catalog.json'))).themes,[]);
 assert.ok(fs.existsSync(path.join(empty,'theme-card.css')),'gallery card styles are shipped');
 assert.match(html,/classic-preview.png/,'built-in Classic has an actual preview');
 const data=path.join(root,'data'),out=path.join(root,'pages','repo','themes');const {record}=fixture(data);fixture(data,'day');
 assert.equal(buildShowcase(out,{showcaseRoot:data}).count,2);
 const listing=fs.readFileSync(path.join(out,'index.html'),'utf8');assert.match(listing,/ctv-theme-card/);assert.match(listing,/theme-card.css/);
 const catalog=JSON.parse(fs.readFileSync(path.join(out,'catalog.json')));assert.equal(catalog.themes.length,2);
 for(const r of catalog.themes) { const detail=fs.readFileSync(path.join(out,r.page),'utf8');assert.match(detail,/Copy TV link/);assert.ok(detail.includes(record.sourceCommit));assert.match(detail,/Browser review/);assert.match(detail,/Candidate feature/);assert.ok(fs.existsSync(path.join(out,r.previewFiles[0]))); }
 assert.equal(escape('<script>"&\''),'&lt;script&gt;&quot;&amp;&#39;');
 // All local HTML resources stay beneath the shared Pages artifact even at a repository base path.
 function walk(dir) {for(const item of fs.readdirSync(dir,{withFileTypes:true})) {const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else if(item.name.endsWith('.html')) {const text=fs.readFileSync(file,'utf8');for(const match of text.matchAll(/(?:href|src)="([^"]+)"/g)) {if(match[1].startsWith('https:')||match[1].endsWith('../'))continue;assert.ok(fs.existsSync(path.resolve(path.dirname(file),match[1])),match[1]);assert.ok(!match[1].startsWith('/'),'resource must preserve repository Pages base path');}}}}
 walk(out);
 assert.throws(()=>buildShowcase(out,{showcaseRoot:data}),/empty staging/);
 const recordPath=path.join(data,'registry','owner--collection--night.json');
 fs.writeFileSync(recordPath,JSON.stringify({...record,availability:'unavailable'}));
 const unavailable=path.join(root,'unavailable');buildShowcase(unavailable,{showcaseRoot:data});
 let state=fs.readFileSync(path.join(unavailable,'owner--collection--night/index.html'),'utf8');assert.match(state,/SOURCE UNAVAILABLE/);assert.doesNotMatch(state,/data-copy|class="tv-link"/);
 fs.writeFileSync(recordPath,JSON.stringify({...record,availability:'removed'}));
 const removed=path.join(root,'removed');buildShowcase(removed,{showcaseRoot:data});
 state=fs.readFileSync(path.join(removed,'owner--collection--night/index.html'),'utf8');assert.match(state,/REMOVED LISTING/);assert.doesNotMatch(state,/data-copy|class="tv-link"/);
 assert.equal(JSON.parse(fs.readFileSync(path.join(removed,'catalog.json'))).themes.length,1);
 assert.equal(fs.existsSync(path.join(removed,record.previewFiles[0])),false,'removed theme assets must not be published');
 console.log('Showcase site: honest empty catalog, pinned per-theme pages, escaping and repository-base resources passed');
} finally {fs.rmSync(root,{recursive:true,force:true});}
