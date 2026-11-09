// Optional real-browser smoke test. Start the preview server on 8080 first.
// npm i --no-save jsdom playwright-core @sparticuz/chromium
const assert = require('node:assert/strict');
const {chromium} = require('playwright-core');
const chromiumPackage = require('@sparticuz/chromium');
const engine = chromiumPackage.default || chromiumPackage;
(async () => {
 const browser = await chromium.launch({args:engine.args, executablePath:await engine.executablePath(), headless:true});
 try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:8080/tool.html');
  for (const sample of ['soic','chip','bga100','dip','sot23']) {
   await page.selectOption('#smp',sample);
   const result=await page.evaluate(()=>{
    const svg=document.querySelector('#svg'),r=svg.getBoundingClientRect();
    return {mode:document.compatMode,width:r.width,height:r.height,empty:document.querySelector('#stageEmpty').hidden,count:+document.querySelector('#mCount').textContent,shapes:svg.querySelectorAll('rect,circle').length};
   });
   assert.equal(result.mode,'CSS1Compat');assert(result.width>0&&result.height>0&&result.empty&&result.count>0&&result.shapes>0);
   await page.screenshot({path:'/tmp/ipc-'+sample+'.png'});
   console.log(sample,'visible:',result.count,'pads');
  }
  await page.locator('#advancedGeometry').evaluate(e=>e.open=true);
  await page.selectOption('#smp','chip');
  assert.equal(await page.locator('#fam').inputValue(),'chip');
  await page.selectOption('#fam','gull');
  assert.equal(await page.locator('#smp').inputValue(),'');
  await page.selectOption('#smp','soic');
  assert.equal(await page.locator('#fam').inputValue(),'gull');
  await page.locator('#Lmax').fill('6.3');
  assert.equal(await page.locator('#smp').inputValue(),'');
  console.log('Preset/family relationship and custom editing: PASS');
  await page.selectOption('#component','capacitor');
  assert.equal(await page.locator('#fam').inputValue(),'chip');
  assert.equal(await page.locator('#cType').inputValue(),'CAPC');
  await page.selectOption('#smp','chip0603');
  assert.equal(await page.locator('#mCount').textContent(),'2');
  await page.selectOption('#component','transistor');
  assert.equal(await page.locator('#smp').inputValue(),'sot23');
  assert.equal(await page.locator('#mCount').textContent(),'3');
  assert((await page.locator('#insName').textContent()).startsWith('SOT'));
  await page.locator('#mkA').evaluate(e=>e.click());
  const alt=await page.locator('#alt').inputValue();assert(alt.includes('3'));
  console.log('Cascading selection and SOT-23: PASS');
  await page.selectOption('#component','ic');await page.selectOption('#package','qfn');
  assert.equal(await page.locator('#Lmax').inputValue(),'');
  assert(await page.locator('#stageEmpty').isVisible());
  await page.selectOption('#package','lga');
  assert.equal(await page.locator('#pads').inputValue(),'');
  assert((await page.locator('#packageStatus').textContent()).includes('پیاده‌سازی نشده'));
  await page.reload();
  assert.equal(await page.locator('#package').inputValue(),'lga');
  assert.equal(await page.locator('#pads').inputValue(),'');
  await page.selectOption('#component','led');assert.equal(await page.locator('#cType').inputValue(),'LEDC');
  console.log('Catalogue filtering, blocked output and persisted package: PASS');
  // Old 1206 state must survive a reload without becoming blank.
  await page.selectOption('#smp','chip');
  await page.evaluate(()=>{const o=JSON.parse(localStorage.getItem('fp7352'));o.Lmin='5.8';localStorage.setItem('fp7352',JSON.stringify(o))});
  await page.reload();assert.equal(await page.locator('#mCount').textContent(),'2');
  await page.locator('#Lmax').fill('0');
  assert(await page.locator('#stageEmpty').isVisible());
  assert((await page.locator('#emptyReason').textContent()).includes('Lmax'));
  await page.locator('#restoreDrawing').click();assert.equal(await page.locator('#mCount').textContent(),'16');
  assert.deepEqual(errors,[]);
  console.log('Stored-state recovery and visible error/recovery: PASS');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
