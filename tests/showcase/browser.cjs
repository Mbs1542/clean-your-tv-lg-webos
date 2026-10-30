'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {buildShowcase}=require('../../scripts/build-showcase.cjs'),fixture=require('./fixture.cjs');
(async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'cytv-showcase-browser-'));let browser;
 try {
  const source=path.join(root,'source'),out=path.join(root,'repo/themes');fixture(source);fixture(source,'day');buildShowcase(out,{showcaseRoot:source});
  const origin='https://showcase.invalid';
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',route=>{
   const url=new URL(route.request().url());if(url.origin!==origin){external.push(url.href);return route.abort();}
   let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep))return route.fulfill({status:403,body:''});
   if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   if(!fs.existsSync(file))return route.fulfill({status:404,body:''});
   return route.fulfill({contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':file.endsWith('.html')?'text/html':'text/plain',body:fs.readFileSync(file)});
  });
  await page.goto(origin+'/repo/themes/');assert.equal(await page.locator('[data-theme]:visible').count(),2);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'mobile page must not overflow');
  await page.locator('#search').fill('does not exist');assert.equal(await page.locator('[data-theme]:visible').count(),0);assert.equal(await page.locator('#no-results').isVisible(),true);
  await page.locator('#search').fill('');await page.locator('#style').selectOption('light');assert.equal(await page.locator('[data-theme]:visible').count(),0);await page.locator('#style').selectOption('dark');assert.equal(await page.locator('[data-theme]:visible').count(),2);
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.tagName),'SELECT');
  await page.locator('#search').fill('Classic');
  await page.locator('.card-copy a').first().click();await page.locator('[data-copy]').waitFor({timeout:3000});assert.match(await page.title(),/Classic/);assert.equal(await page.locator('[data-copy]').count(),1);
  await page.locator('[data-copy]').click();assert.match(await page.locator('.tv-link').inputValue(),/raw\.githubusercontent\.com\/owner\/collection\/[a-f0-9]{40}\/day\/cytv-theme\.json/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'mobile detail must not overflow');
  await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/repo/themes/');assert.equal(await page.locator('[data-theme]:visible').count(),2);
  assert.equal(await page.locator('.preview img').first().evaluate(img=>img.complete&&img.naturalWidth===1),true);
  const longSource=path.join(root,'long-source');fixture(longSource,'long','A'.repeat(100));buildShowcase(path.join(root,'repo/long'),{showcaseRoot:longSource});
  await page.setViewportSize({width:320,height:780});await page.goto(origin+'/repo/long/');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'long card title must wrap');
  await page.locator('.card-copy a').click();await page.locator('.detail-heading h1').waitFor();await page.waitForLoadState('load');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'long detail title must wrap');
  await page.setViewportSize({width:1440,height:1000});
  const shot=process.env.SHOWCASE_SCREENSHOT;if(shot){buildShowcase(path.join(root,'repo/empty'));await page.goto(origin+'/repo/empty/');await page.screenshot({path:path.resolve(shot),fullPage:true});}
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('Showcase browser: narrow/desktop layout, filters, keyboard, pinned copy link, image load and zero external requests passed');
 } finally {if(browser)await browser.close();fs.rmSync(root,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
