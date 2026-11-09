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
  for (const sample of ['soic','chip','bga100','dip']) {
   await page.selectOption('#smp',sample);
   const result=await page.evaluate(()=>{
    const svg=document.querySelector('#svg'),r=svg.getBoundingClientRect();
    return {mode:document.compatMode,width:r.width,height:r.height,empty:document.querySelector('#stageEmpty').hidden,count:+document.querySelector('#mCount').textContent,shapes:svg.querySelectorAll('rect,circle').length};
   });
   assert.equal(result.mode,'CSS1Compat');assert(result.width>0&&result.height>0&&result.empty&&result.count>0&&result.shapes>0);
   await page.screenshot({path:'/tmp/ipc-'+sample+'.png'});
   console.log(sample,'visible:',result.count,'pads');
  }
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
