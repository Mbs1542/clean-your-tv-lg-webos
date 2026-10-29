'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const data=require('../../launcher/theme-data.js'),entry=require('../../scripts/check-theme-submissions.cjs').loadRegistry().find(e=>e.record.title==='Channel');
const descriptor=fs.readFileSync(path.resolve('showcase',entry.base,'cytv-theme.json')),url=entry.record.descriptorUrl;
let calls=[],target=url,error=null,pending=false,redirect=false;
global.XMLHttpRequest=class {open(method,url){this.url=url;calls.push(url);}abort(){this.onabort();}send(){if(pending)return;this.status=200;this.responseURL=redirect?'https://evil.test/':this.url;this.response=Uint8Array.from(this.url.startsWith('https://is.gd/')?Buffer.from(JSON.stringify(error||{url:target})):descriptor).buffer;this.onload();}};
(async()=>{
 for(const short of ['test12','is.gd/test12','https://is.gd/test12']){calls=[];const entries=await data.resolve(short);assert.equal(entries[0].id,entry.record.id);assert.equal(entries[0].url,url);assert.equal(calls[0],'https://is.gd/forward.php?format=json&shorturl=test12');assert.equal(calls.length,2);}
 for(const bad of ['http://192.168.1.2/p','https://evil.test/theme','https://is.gd/nested','https://raw.githubusercontent.com/a/b/main/cytv-theme.json']){target=bad;calls=[];await assert.rejects(data.resolve('is.gd/test12'));assert.equal(calls.length,1,'invalid targets never receive a request');}
 target=url;error={errorcode:3,errormessage:'private provider text'};await assert.rejects(data.resolve('is.gd/test12'),/unavailable/i);error=null;
 redirect=true;await assert.rejects(data.resolve('is.gd/test12'),/redirect/);redirect=false;
 for(const bad of ['https://is.gd.evil/test12','https://is.gd@evil/test12','https://is.gd/test12?x=y','http://is.gd/test12']){calls=[];await assert.rejects(data.resolve(bad));assert.equal(calls.length,0);}
 pending=true;const signal={cancelled:false},result=data.resolve('is.gd/test12',signal);await new Promise(r=>setImmediate(r));signal.cancelled=true;signal.cancel();await assert.rejects(result,/Cancelled/);
 console.log('PASS short-link expansion, pinned GitHub target, provider failure, redirects and cancellation');
})().catch(e=>{console.error(e);process.exitCode=1;});
