// Glasshouse is one looping row, with no duplicate app nodes or vertical paging.
const {assert,chromium,stage,open}=require('./browser.cjs');
(async()=>{
 const site=stage(),browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});
 try{for(const edition of ['launcher','root-launcher']){
  const {page,errors}=await open(browser,site,edition);
  try{
   await page.evaluate(()=>HomeLayoutState.setThemeLayout({preset:'scenic-grid',columns:8,allowColumnOverride:false,spacingScale:1,textScale:1,focusScale:1.1}));
   const items=page.locator('#tiles .item'),ids=await items.evaluateAll(nodes=>nodes.map(n=>n.dataset.appId||'add'));
   assert.equal(await items.evaluateAll(nodes=>new Set(nodes.map(n=>n.style.top)).size),1,'all apps occupy one row');
   const selected=()=>items.evaluateAll(nodes=>nodes.findIndex(n=>n.classList.contains('focused')));
   for(const columns of [1,3,8]){
    await page.evaluate(columns=>HomeLayoutState.setThemeLayout({preset:'scenic-grid',columns,allowColumnOverride:false,spacingScale:1,textScale:1,focusScale:1.1}),columns);
    let current=await selected();
    for(const [key,step] of [['ArrowRight',1],['ArrowLeft',-1]]){
     for(let i=0;i<ids.length*2+1;i++){
      await page.keyboard.press(key);current=(current+step+ids.length)%ids.length;
      assert.equal(await selected(),current,'wrap follows exact app order in '+key);
      const box=await page.locator('#tiles .focused .card').boundingBox();
      assert(box.x>=0&&box.x+box.width<=1920,'selected app stays fully visible');
      assert.equal(await items.evaluateAll(nodes=>new Set(nodes.map(n=>n.style.top)).size),1);
     }
    }
   }
   const previous=await selected();await page.keyboard.press('ArrowDown');assert.equal(await selected(),previous,'Down never enters a second row');
   await page.keyboard.press('ArrowUp');assert.equal(await page.locator('#topButtons .focused').count(),1);
   await page.keyboard.press('ArrowDown');assert.equal(await selected(),previous,'menu returns to the same app');
   while(await selected()!==0)await page.keyboard.press('ArrowRight');
   await page.keyboard.down('Enter');await page.waitForTimeout(700);await page.keyboard.up('Enter');
   await page.keyboard.press('ArrowLeft');assert.equal(await selected(),ids.length-2,'reorder also wraps, excluding Add app');
   await page.keyboard.press('Escape');
   assert.deepEqual(await items.evaluateAll(nodes=>nodes.map(n=>n.dataset.appId||'add')),ids,'cancel restores order and no clones are introduced');
   // Real motion plus a parked pointer must preserve exact remote focus.
   await page.locator('style').evaluateAll(styles=>styles.filter(s=>s.textContent.includes('* { transition: none !important; animation: none !important; }')).forEach(s=>s.remove()));
   await page.locator('#tiles .item').nth(3).hover();
   let expected=await selected();
   for(let i=0;i<ids.length+2;i++){
    await page.keyboard.press('ArrowRight');expected=(expected+1)%ids.length;
    await page.waitForTimeout(190);assert.equal(await selected(),expected,'moving cards cannot steal remote focus');
   }
   const sameHeight=await items.evaluateAll(nodes=>new Set(nodes.map(n=>Math.round(n.getBoundingClientRect().y))).size);
   assert.equal(sameHeight,1,'real motion remains horizontal');
   // A short or empty app library must not manufacture cloned tiles.
   for(const count of [1,0]){
    await page.evaluate(count=>{const apps=TV_APPS.apps.filter(a=>!a.hidden);localStorage.setItem(AppLibrary.key,JSON.stringify({version:1,ids:apps.slice(0,count).map(a=>a.id),hidden:apps.slice(count).map(a=>a.id),catalog:apps}));},count);
    await page.reload();await page.locator('#tiles .focused').waitFor();
    await page.evaluate(()=>HomeLayoutState.setThemeLayout({preset:'scenic-grid',columns:8,allowColumnOverride:false,spacingScale:1,textScale:1,focusScale:1.1}));
    assert.equal(await items.count(),count+1,'only real apps and one Add app tile');
    for(let i=0;i<5;i++){await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowRight');}
    assert.equal(await items.count(),count+1);
   }
   assert.deepEqual(errors,[]);console.log('PASS looping ribbon, both directions, one row, menu and reorder: '+edition);
  }finally{await page.close();}
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
