const assert=require('node:assert/strict'),{chromium}=require('playwright-core'),p=require('@sparticuz/chromium'),engine=p.default||p;
(async()=>{const browser=await chromium.launch({args:engine.args,executablePath:await engine.executablePath(),headless:true});try{
const page=await browser.newPage();await page.goto('http://localhost:8080/tool.html');
await page.selectOption('#component','ic');await page.selectOption('#package','sot23-5');await page.selectOption('#smp','ti-db5');await page.locator('#mfrSpan').fill('2.612345678901');await page.locator('#mfrW').fill('0.612345678901');const original=await page.locator('#pads').inputValue();
for(let i=0;i<10;i++)for(const unit of ['mil','in','mm'])await page.selectOption('#unit',unit);
assert.equal(await page.locator('#pads').inputValue(),original);await page.selectOption('#unit','in');await page.reload();await page.selectOption('#unit','mm');assert.equal(await page.locator('#pads').inputValue(),original);
console.log('Real browser repeated unit conversion and reload preserve exported dimensions: PASS');
await page.selectOption('#component','resistor');await page.selectOption('#package','array-flat');
for(const [id,value] of Object.entries({dmName:'Browser-rebuild',dmCount:'2',dmPitch:'1',dmSpan:'4',dmPadW:'.6',dmPadH:'.6',dmBodyW:'3',dmBodyH:'3',dmHole:'0'}))await page.locator('#'+id).fill(value);
await page.locator('#buildDirectModel').click();assert(await page.locator('#stageEmpty').isHidden());await page.locator('#dmPadW').fill('-1');assert.equal(await page.locator('#pads').inputValue(),'');await page.locator('#buildDirectModel').click();await page.selectOption('#unit','mil');assert.equal(await page.locator('#pads').inputValue(),'');await page.reload();assert.equal(await page.locator('#pads').inputValue(),'');
console.log('Real browser rejects dirty/invalid direct model without resurrecting old geometry: PASS');
await page.selectOption('#component','ic');await page.selectOption('#package','bga');await page.selectOption('#smp','bga100');await page.locator('#bPX').fill('1.2');await page.locator('#bPY').fill('.6');assert.equal(await page.locator('#mPitch').textContent(),'1.20 mm × 0.60 mm');
console.log('Real browser dual-axis BGA pitch summary: PASS');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
