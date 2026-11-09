const assert=require('node:assert/strict');
const {chromium}=require('playwright-core'),pkg=require('@sparticuz/chromium'),engine=pkg.default||pkg;
(async()=>{const browser=await chromium.launch({args:engine.args,executablePath:await engine.executablePath(),headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8080/tool.html');
const groups={resistor:['array-flat'],crystal:['corner'],ic:['lcc','cga','cfp','sol'],connector:['pressfit'],oscillator:['osc-l'],diode:['diode-nonpolar'],capacitor:['dfn-polar']};
// corner is available in oscillator, not crystal.
delete groups.crystal;groups.oscillator.push('corner');
for(const [component,keys] of Object.entries(groups))for(const key of keys){
 await page.selectOption('#component',component);await page.selectOption('#package',key);
 assert(await page.locator('#directModelEditor').isVisible(),key);
 const fields={dmName:'TEST-'+key,dmCount:key==='corner'?'1':'2',dmPitch:'1',dmSpan:'4',dmPadW: key==='pressfit'?'1.5':'.6',dmPadH:key==='pressfit'?'1.5':'.6',dmBodyW:'3',dmBodyH:'3',dmHole:key==='pressfit'?'.8':'0',dmRows:'2'};
 for(const [id,value] of Object.entries(fields))if(await page.locator('#'+id).isVisible())await page.locator('#'+id).fill(value);
 await page.locator('#buildDirectModel').click();
 assert(await page.locator('#stageEmpty').isHidden(),key+': valid drawing');assert.equal(await page.locator('#referenceSourceLink').isHidden(),true);
 let csv=await page.locator('#pads').inputValue();assert(csv.split('\n').length>4,key+': pad geometry');assert((await page.locator('#methodReadout').textContent()).includes('بدون تبدیل'));
 await page.reload();assert.equal(await page.locator('#pads').inputValue(),csv,key+': reload');
 await page.locator('#dmPadW').fill('-1');await page.locator('#buildDirectModel').click();assert(await page.locator('#stageEmpty').isVisible(),key+': invalid dimensions cannot leave old output');
 console.log(key+': generated, persisted, invalid input guarded — PASS');
}
await page.selectOption('#component','transistor');await page.selectOption('#package','sotfl');assert(await page.locator('#referenceComment').textContent().then(s=>s.includes('SOT-383FL')));assert.equal(await page.locator('#mCount').textContent(),'8');
assert.deepEqual(errors,[]);await page.screenshot({path:'/tmp/ipc-models-current.png'});
console.log('SOT-383FL real source: PASS');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
