// Channel must remain readable while moving apps, and use the whole screen for multiple columns.
const {assert,chromium,stage,open}=require('./browser.cjs');
const {compileThemeCss}=require('../../theme-api/compile.cjs');
(async()=>{
 const rules=(await compileThemeCss('.ctv-home {background-color:#121c85;color:#ffffff;} .ctv-card.is-focused {background-color:#ffffff;color:#121c85;} .ctv-label.is-focused {color:#121c85;} .ctv-focus {background-color:#ffffff;} .ctv-library-panel {background-color:#121c85;border-radius:0px;} .ctv-library-close.is-focused {background-color:#ffffff;color:#121c85;}')).bundle;
 const manifest=require('./fixtures/valid-manifest.json');manifest.layout.preset='channel-list';manifest.layout.columns=1;
 const site=stage(),browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});
 try {for(const edition of ['launcher','root-launcher']){
  const {page,errors}=await open(browser,site,edition);
  try{
   const original=await page.locator('#tiles .card').first().evaluate(el=>el.style.background);
   await page.evaluate(({manifest,rules})=>ThemeRuntime.apply({manifest,rules,assetHandles:{}}),{manifest,rules});
   await page.keyboard.down('Enter');await page.waitForTimeout(700);await page.keyboard.up('Enter');
   assert.equal(await page.locator('#tiles .moving').count(),1);
   assert.equal(await page.locator('#tiles .moving .card').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)','moving row keeps a readable background without the glass');
   await page.keyboard.press('Escape');
   for(const columns of [1,2,4,5,8]){
    await page.evaluate(columns=>HomeLayoutState.setColumns(columns),columns);
    const g=await page.evaluate(()=>HomeLayout.geometry('channel-list',HomeLayoutState.state().columns));
    if(columns>1) assert(g.width>=1600,'multiple columns use full width');
    const label=await page.locator('#tiles .focused .name').evaluate(el=>({font:parseFloat(getComputedStyle(el).fontSize),width:el.clientWidth}));
    assert(label.font>=24&&label.width>=60,'compact text stays readable');
   }
   await page.evaluate(()=>HomeLayoutState.setColumns(null));
   await page.waitForFunction(()=>{const img=document.getElementById('channelArtwork');return img&&img.complete&&img.naturalWidth>0;});
   const count=await page.locator('#tiles .item').count();
   await page.locator('.add-app').dispatchEvent('mouseover');await page.locator('.add-app').click();
   await page.locator('#appPicker .app-choice').waitFor();
   assert.equal(await page.locator('.ctv-library-panel').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(18, 28, 133)');
   await page.locator('.ctv-library-close').focus();
   assert.equal(await page.locator('.ctv-library-close').getAttribute('class'),'ctv-library-close focused is-focused');
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#appPicker').evaluate(el=>el.hidden),true,'keyboard Close does not accidentally add an app');
   assert.equal(await page.locator('#tiles .item').count(),count);
   await page.evaluate(()=>{HomeLayoutState.setColumns(null);ThemeRuntime.reset();});
   assert.equal(await page.locator('#tiles .card').first().evaluate(el=>el.style.background),original,'Classic restores brand backgrounds');
   await page.keyboard.press('ArrowDown');
   await page.evaluate(({manifest,rules})=>ThemeRuntime.apply({manifest,rules,assetHandles:{}}),{manifest,rules});
   assert.equal(await page.locator('#channelArtwork').count(),1,'Classic scrolling and returning to Channel reuse one artwork node');
   const iconName=(await page.locator('#tiles .card img').first().getAttribute('src')).split('/').pop();
   await page.route('**/'+iconName,route=>route.abort());
   await page.reload();await page.locator('#tiles .card.missing-icon').first().waitFor();
   await page.evaluate(({manifest,rules})=>ThemeRuntime.apply({manifest,rules,assetHandles:{}}),{manifest,rules});
   await page.waitForFunction(()=>{const img=document.getElementById('channelArtwork');return img&&img.complete&&img.naturalWidth===0;});
   await page.locator('#btnInputs').click();await page.keyboard.press('Escape');
   await page.locator('#tiles .item').first().dispatchEvent('mouseover');
   assert.equal(await page.locator('#channelArtwork').evaluate(el=>getComputedStyle(el).visibility),'hidden','refocusing a failed image does not expose a broken preview');
   assert.deepEqual(errors,[]);console.log('PASS Channel moving contrast, dense columns and Classic reset: '+edition);
  }finally{await page.close();}
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
