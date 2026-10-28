// Catches hidden Developer Mode actions receiving remote focus, broken Back routing,
// lost error summaries, and update markers covering their link arrows.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8876';
const output=process.env.CYTV_TEST_OUTPUT_DIR||'build/tests';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 let geometryCases=0;
 try{
  for(const edition of ['launcher','root-launcher']){
   const page=await browser.newPage({viewport:{width:1920,height:1080},locale:'en'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',response=>{if(response.request().resourceType()==='font'&&response.status()>=400)errors.push('Font HTTP '+response.status()+': '+response.url());});
   // Keep asynchronous preview checks from clearing a manually inspected badge.
   await page.route('**/preview/bridge.js',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:await response.text()+`
(function(){
     window.settingsUpdateAvailable=true;window.settingsPendingUpdateChecks=0;
     const call=PalmServiceBridge.prototype.call;
     PalmServiceBridge.prototype.call=function(uri,raw){
      if(uri==='luna://com.cleanyourtv.system.updater.service/check'){
       window.settingsPendingUpdateChecks++;const receive=this.onservicecallback;
       this.onservicecallback=function(raw){
        window.settingsPendingUpdateChecks--;const reply=JSON.parse(raw);
        if(reply.result)reply.result.canInstall=window.settingsUpdateAvailable;
        receive.call(this,JSON.stringify(reply));
       };
      }
      return call.call(this,uri,raw);
     };
    }());`});
   });
   await page.goto(base+'/'+edition+'/index.html');
   await page.locator('#tiles .item').first().waitFor();
   await page.locator('#btnSettings').click();
   const panel=page.locator(edition==='launcher'?'#renewalPanel':'.root-settings:not(.root-updates)');
   const card=panel.locator('.settings-main');
   await card.waitFor({timeout:3000});
   await page.waitForFunction(()=>{const b=document.querySelector('#homeRoutingToggle')||document.querySelector('.home-routing-switch');return b&&!b.disabled;});
   assert.equal((await card.boundingBox()).width,1120);
   assert(await card.evaluate(el=>el.scrollHeight<=el.clientHeight+1),'main settings should fit without scrolling at 1080p');
   const updates=panel.locator('.settings-links button:has(.settings-update-dot)');
   async function setBadge(available){
    await page.evaluate(value=>window.settingsUpdateAvailable=value,available);
    await page.waitForFunction(()=>window.settingsPendingUpdateChecks===0);
    await updates.evaluate((el,value)=>el.setAttribute('data-update-available',String(value)),available);
   }
   async function verifyGeometry(locale,width,height){
    const label=edition+' '+locale+' '+width+'x'+height;
    await page.setViewportSize({width,height});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForFunction(()=>window.settingsPendingUpdateChecks===0);
    assert.equal(await page.evaluate(()=>document.fonts.status),'loaded',label+' fonts loaded');
    const expectedFonts=['Outfit',({ru:'CYTV NotoSans',hi:'CYTV NotoSansDevanagari',ko:'CYTV NotoSansKR',
     'zh-Hans':'CYTV NotoSansSC','zh-Hant':'CYTV NotoSansTC'})[locale]].filter(Boolean);
    const fontFaces=await page.evaluate(families=>families.map(family=>{
     const face=Array.from(document.fonts).find(face=>face.family.replace(/["']/g,'')===family&&face.weight==='400');
     return {family,status:face?face.status:'missing'};
    }),expectedFonts);
    assert(fontFaces.every(face=>face.status!=='missing'),label+' expected packaged font declarations present');
    assert.equal(fontFaces[0].status,'loaded',label+' Outfit400 successfully loaded');
    // A declared fallback can remain unused; every requested face must succeed.
    assert.deepEqual(await page.evaluate(()=>Array.from(document.fonts).filter(face=>face.status==='error').map(face=>face.family)),[],label+' requested font faces loaded without errors');
    assert(await card.evaluate(el=>el.scrollHeight<=el.clientHeight+1),label+' no vertical scrolling');
    assert(await card.evaluate(el=>el.scrollWidth<=el.clientWidth+1),label+' no horizontal scrolling');
    const style=await card.evaluate(el=>({width:el.getBoundingClientRect().width,
     heading:getComputedStyle(el.querySelector('.settings-heading h1,.settings-heading h2')).fontSize,
     routing:getComputedStyle(el.querySelector('.home-routing-switch')).minHeight}));
    assert.deepEqual(style,{width:1120,heading:height===720?'34px':'40px',routing:height===720?'72px':'88px'},label+' retained width, type and routing target');
    assert(await card.locator('.settings-links button').evaluateAll(buttons=>buttons.every(el=>el.scrollWidth<=el.clientWidth+1)),label+' link labels fit');
    const buttons=await card.locator('button:visible:not(:disabled)').elementHandles();
    await buttons[0].focus();
    for(let index=0;index<buttons.length;index++){
     assert(await buttons[index].evaluate(el=>el===document.activeElement),label+' remote order '+index);
     const focus=await card.evaluate(el=>{
      const button=document.activeElement,box=button.getBoundingClientRect(),card=el.getBoundingClientRect(),style=getComputedStyle(button);
      const ring=style.outlineStyle==='none'?0:parseFloat(style.outlineWidth)+Math.max(0,parseFloat(style.outlineOffset));
      return {inside:box.top-ring>=card.top+el.clientTop-1&&box.bottom+ring<=card.top+el.clientTop+el.clientHeight+1&&
       box.left-ring>=card.left+el.clientLeft-1&&box.right+ring<=card.left+el.clientLeft+el.clientWidth+1,scrollTop:el.scrollTop,ring};
     });
     assert(focus.ring>0,label+' visible focus outline '+index);
     assert(focus.inside,label+' complete focus outline inside card '+index);
     assert.equal(focus.scrollTop,0,label+' remote traversal must not scroll');
     if(index<buttons.length-1)await page.keyboard.press('ArrowDown');
    }
    assert(await card.locator('.settings-footer button').evaluate(el=>el===document.activeElement),label+' last action is Return Home');
    await page.keyboard.press('Enter');assert(!(await panel.isVisible()),label+' Return Home activates with Enter');
    await page.locator('#btnSettings').click();await card.waitFor();
    await page.waitForFunction(()=>{const b=document.querySelector('#homeRoutingToggle')||document.querySelector('.home-routing-switch');return b&&!b.disabled;});
    geometryCases++;
   }
   await setBadge(true);
   const marker=updates.locator('.settings-update-dot'),arrow=updates.locator('.settings-chevron');
   assert(await marker.isVisible());assert(await arrow.isVisible());
   const a=await arrow.boundingBox(),m=await marker.boundingBox();assert(m.x+m.width<a.x,'update dot must precede the trailing arrow');
   assert.equal(await marker.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 179, 71)');
   await setBadge(false);
   assert(!(await marker.isVisible()));assert(await arrow.isVisible(),'arrow remains without an update');
   if(edition==='launcher'){
    const developer=page.locator('#developerSettings');
    assert(!(await developer.isVisible()));
    await page.locator('#homeRoutingToggle').focus();
    for(let i=0;i<10;i++){
     await page.keyboard.press('ArrowRight');
     assert(await page.evaluate(()=>document.activeElement.offsetHeight>0),'remote must skip hidden actions');
    }
    await page.locator('#developerOpen').click();await developer.waitFor({state:'visible'});
    await page.locator('#renewalDiagnostics').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'renewalDetails');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    assert(await page.evaluate(()=>document.activeElement.offsetHeight>0),'report focus must return to a visible action');
    await page.keyboard.press('Escape');assert(!(await developer.isVisible()));
    assert.equal(await page.evaluate(()=>document.activeElement.id),'developerOpen');
    await page.locator('#developerOpen').click();
    await page.locator('#renewalToggle').click();
    await page.waitForFunction(()=>document.getElementById('renewalToggle').getAttribute('aria-checked')==='true');
    await page.locator('#renewalDiagnostics').click();assert(await page.locator('#renewalDetails').isVisible());
    await page.locator('#developerBack').click();
    assert(await page.locator('#renewalSummary').evaluate(el=>el.textContent.includes('enabled')));
    await updates.click();await page.locator('#systemUpdates').waitFor({state:'visible'});
    await page.keyboard.press('Escape');await card.waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>document.activeElement.id),'renewalUpdates');
    await page.locator('#developerOpen').click();
    await page.evaluate(()=>{
     const call=PalmServiceBridge.prototype.call;
     PalmServiceBridge.prototype.call=function(uri,raw){
      if(uri==='luna://com.gathin.tvhome.renewal/check'){
       window.replyRenewalCheck=()=>this.onservicecallback(JSON.stringify({returnValue:true,state:{enabled:true,last:{status:'expired'},error:'setup-failed'}}));
      }else call.call(this,uri,raw);
     };
    });
    await page.locator('#renewalCheck').click();await page.locator('#developerBack').click();
    await page.evaluate(()=>window.replyRenewalCheck());
    assert.equal(await page.evaluate(()=>document.activeElement.id),'developerOpen','late renewal reply must keep focus on the visible entry');
    assert.match(await page.locator('#renewalSummary').innerText(),/setup-failed/,'setup error must remain visible outside details');
    await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
    await page.locator('#btnSettings').click();assert(!(await developer.isVisible()),'reopening starts on main settings');
   }
   await page.waitForFunction(()=>{const b=document.querySelector('#homeRoutingToggle')||document.querySelector('.home-routing-switch');return b&&!b.disabled;});
   if(edition==='launcher')await page.waitForFunction(()=>!document.getElementById('renewalSummary').textContent.includes('Working'));
   await setBadge(true);
   fs.mkdirSync(output,{recursive:true});
   await page.screenshot({path:output+'/settings-'+edition+'.png'});
   for(const locale of ['en','de','es','pt-BR','fr','it','ko','hi','pl','ru','zh-Hans','zh-Hant']){
    await page.evaluate(code=>localStorage.setItem('tvhome.language',code),locale);
    await page.reload();await page.locator('#tiles .item').first().waitFor();await page.locator('#btnSettings').click();await card.waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await setBadge(true);
    await verifyGeometry(locale,1920,1080);
    await verifyGeometry(locale,1280,720);
    await page.setViewportSize({width:1920,height:1080});
    if(edition==='launcher'){
     await page.waitForFunction(()=>!document.getElementById('homeRoutingToggle').disabled);
     await page.evaluate(()=>{
      const call=PalmServiceBridge.prototype.call;
      PalmServiceBridge.prototype.call=function(uri,raw){
       if(uri==='luna://com.gathin.tvhome.renewal/homeStatus')window.pendingHomeStatus=this;
       else call.call(this,uri,raw);
      };
     });
     await page.locator('#renewalClose').click();await page.locator('#btnSettings').click();
     assert(await page.locator('#homeRoutingToggle').isHidden(),'pending status must not look off');
     assert(await page.evaluate(()=>document.activeElement.id!=='homeRoutingToggle'&&document.activeElement.offsetHeight>0),'pending status must leave a visible focused action');
     await page.evaluate(()=>pendingHomeStatus.onservicecallback(JSON.stringify({returnValue:false,errorText:'Home Helper data unavailable'})));
     assert(await page.locator('#homeRoutingToggle').isHidden(),'unreadable status must not expose a false off switch');
     assert(await page.evaluate(()=>document.activeElement.id!=='homeRoutingToggle'&&document.activeElement.offsetHeight>0),'failed status must leave a visible focused action');
     assert(await page.locator('#homeRoutingStatus').isVisible());
     await page.setViewportSize({width:1280,height:720});
     assert(await card.evaluate(el=>el.scrollHeight<=el.clientHeight+1),locale+' unknown status must fit without scrolling at 720p');
     await page.locator('#homeVisit').focus();await page.keyboard.press('ArrowLeft');
     assert.notEqual(await page.evaluate(()=>document.activeElement.id),'homeRoutingToggle','remote must skip the unavailable switch');
     if(['de','ko','ru'].includes(locale))await page.screenshot({path:output+'/issue12-status-unknown-'+locale+'.png'});
     for(const enabled of [false,true]){
      await page.locator('#renewalClose').click();await page.locator('#btnSettings').click();
      await page.evaluate(enabled=>pendingHomeStatus.onservicecallback(JSON.stringify({returnValue:true,enabled})),enabled);
      assert(await page.locator('#homeRoutingToggle').isVisible());
      assert.equal(await page.locator('#homeRoutingToggle').getAttribute('aria-checked'),String(enabled));
     }
     await page.setViewportSize({width:1920,height:1080});
    }
   }
   assert.deepEqual(errors,[]);await page.close();
  }
  assert.equal(geometryCases,48);
  console.log('PASS 48 font-loaded settings layouts, complete remote focus outlines and Return Home Enter; settings layout, update indicator, Developer Mode remote/Back/error handling and twelve languages in both editions');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
