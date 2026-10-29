'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
async function check(rendererVersion){
 let checked;
 const ctx={Promise,Date,setTimeout,clearTimeout,CustomEvent:function(){},requestAnimationFrame:f=>f(),document:{dispatchEvent(){}},localStorage:{getItem:()=>null},ThemeStore:{list:async()=>[{id:'github:owner/repo:test',digest:'a'.repeat(64)}]},ThemeData:{request:async url=>url==='appinfo.json'?{version:'0.5.1'}:{schemaVersion:1,themes:[{id:'builtin:alpine'}]},decode:x=>JSON.stringify(x),verify:(pack,version)=>{checked=version;return {manifest:{id:pack.id,title:'Test',themeVersion:'1.0.0',license:{identifier:'MIT'},author:{name:'Test'}}};}},ThemeRuntime:{reset(){}}};
 if(rendererVersion!==undefined)ctx.CYTV_THEME_RENDERER_VERSION=rendererVersion;
 vm.runInNewContext(fs.readFileSync('launcher/theme-manager.js','utf8'),ctx);await ctx.ThemeManager.list();return checked;
}
(async()=>{assert.equal(await check('1.5.1'),'1.5.1','Root theme checks use shared renderer version, not 0.5.1 package version');assert.equal(await check(),'0.5.1','ordinary Home falls back to its own version');await assert.rejects(()=>check('invalid'),/version unavailable/);console.log('PASS independent Root package and shared renderer theme versions');})().catch(e=>{console.error(e);process.exitCode=1});
