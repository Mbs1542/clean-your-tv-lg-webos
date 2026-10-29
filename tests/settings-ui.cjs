// Catches hidden-category focus, broken column navigation and lost subdialog return.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try {
  for(const edition of ['launcher','root-launcher']){
   const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:8876')+'/'+edition+'/index.html');
   await page.locator('#tiles .item').first().waitFor();await page.locator('#btnSettings').click();
   const nav=page.locator('.settings-categories');
   assert.equal(await nav.count(),1,'settings must expose category navigation');
   await nav.locator('button').first().focus();
   await page.keyboard.press('ArrowDown');
   assert.equal(await nav.locator('[aria-selected=true]').getAttribute('data-category'),'appearance');
   assert(await page.locator('#homeThemes').isVisible());
   assert(!(await page.locator('.home-routing-switch').first().isVisible()));
   await page.keyboard.press('ArrowRight');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'homeThemes');
   await page.keyboard.press('ArrowDown');
   await page.keyboard.press('ArrowDown');
   assert(await page.locator('.settings-workspace .settings-footer button').evaluate(el=>el===document.activeElement),'D-pad reaches Back to Home');
   await nav.locator('[data-category=appearance]').focus();
   await page.keyboard.press('ArrowRight');
   await page.keyboard.press('ArrowLeft');
   assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('data-category')),'appearance');
   await page.keyboard.press('ArrowRight');
   await page.keyboard.press('Enter');
   await page.locator('#homeThemePanel').waitFor({state:'visible'});
   await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'homeThemes');
   await page.evaluate(()=>HomeLayoutState.setThemeLayout({preset:'scenic-grid',columns:8,allowColumnOverride:false,spacingScale:1,textScale:1,focusScale:1.1}));
   assert(!(await page.locator('#homeColumns').isVisible()),'fixed themes hide Columns');
   await page.evaluate(()=>ThemeRuntime.reset());
   await nav.locator('[data-category=updates]').click();
   await page.locator('.settings-pane:not([hidden]) button').first().click();
   await page.locator('#systemUpdates').waitFor({state:'visible'});
   await page.keyboard.press('Escape');
   assert.equal(await nav.locator('[aria-selected=true]').getAttribute('data-category'),'updates');
   assert(await page.evaluate(()=>document.activeElement.offsetHeight>0),'update return restores visible focus');
   if(edition==='launcher'){
    await nav.locator('[data-category=developer]').click();
    await page.locator('#developerOpen').click();
    await page.locator('#renewalDiagnostics').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'renewalDetails');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'developerOpen');
    assert.equal(await nav.locator('[aria-selected=true]').getAttribute('data-category'),'developer');
   }
   for(const locale of ['en','de','es','pt-BR','fr','it','ko','hi','pl','ru','zh-Hans','zh-Hant']){
    await page.evaluate(code=>localStorage.setItem('tvhome.language',code),locale);
    await page.reload();await page.locator('#tiles .item').first().waitFor();await page.locator('#btnSettings').click();
    for(const size of [{width:1920,height:1080},{width:1280,height:720}]){
     await page.setViewportSize(size);
     for(const tab of await page.locator('.settings-categories [role=tab]').all()){
      await tab.click();
      assert(await page.locator('.settings-workspace').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'workspace fits horizontally');
      const pane=page.locator('.settings-pane:not([hidden])');
      assert.equal(await pane.count(),1);
      await page.keyboard.press('ArrowRight');
      assert(await page.evaluate(()=>{const el=document.activeElement,r=el.getBoundingClientRect();return el.offsetHeight>0&&r.top>=0&&r.bottom<=innerHeight;}),'focus stays visible');
     }
    }
   }
   await page.evaluate(()=>localStorage.setItem('tvhome.language','ru'));
   await page.reload();await page.locator('#tiles .item').first().waitFor();await page.locator('#btnSettings').click();
   await page.setViewportSize({width:1920,height:1080});
   await page.screenshot({path:'build/tests/categories-'+edition+'.png'});
   assert.deepEqual(errors,[],edition+' browser errors');
   await page.close();
  }
  console.log('PASS category switching, remote column navigation, theme return and 48 localized layouts');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
