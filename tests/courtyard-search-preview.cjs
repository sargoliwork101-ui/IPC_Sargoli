const assert=require('node:assert/strict');const {chromium}=require('playwright-core'),p=require('@sparticuz/chromium'),engine=p.default||p;
(async()=>{const browser=await chromium.launch({args:engine.args,executablePath:await engine.executablePath(),headless:true});try{
const page=await browser.newPage();await page.goto('http://localhost:8080/tool.html');
await page.selectOption('#component','resistor');await page.locator('#footprintSearch').fill('CP_Radial');await page.locator('#footprintSearchResults button').first().click();assert.equal(await page.locator('#component').inputValue(),'capacitor');assert.equal(await page.locator('#package').inputValue(),'radial');
const check=async(label)=>{const info=await page.evaluate(()=>{
const rect=document.querySelector('#svg rect[stroke="#c0392b"]');const scale=window.SCU; // derive the scale from same-drawing CSV centres if needed; frame stores exact model mm.
const rows=document.querySelector('#pads').value.split('\n').slice(1).map(s=>s.split(','));
const texts=Array.from(document.querySelectorAll('#dimG text')).map(t=>t.textContent);
return {width:+rect.getAttribute('width'),height:+rect.getAttribute('height'),mmW:+rect.dataset.mmWidth,mmH:+rect.dataset.mmHeight,texts};
});assert(info.texts.includes('Courtyard X '+info.mmW.toFixed(2)+' mm'),label+': X');assert(info.texts.includes('Courtyard Y '+info.mmH.toFixed(2)+' mm'),label+': Y');assert(Math.abs(info.width/info.height-info.mmW/info.mmH)<1e-7,label+': actual rectangle aspect ratio');console.log(label+': red rectangle and numeric dimensions agree — PASS')};
await check('radial');
for(const key of ['sot23-5','sot23-6']){await page.selectOption('#component','transistor');await page.selectOption('#package',key);assert(await page.locator('#stageEmpty').isHidden());assert.equal(await page.locator('#mCount').textContent(),key.endsWith('5')?'5':'6');await check(key)}
await page.selectOption('#component','switch');await page.selectOption('#package','unique');await check('off-origin switch');
await page.locator('#referencePads').evaluate(e=>{let pads=JSON.parse(e.value);pads.forEach(p=>{p.x+=12;p.y-=7;p.rotation=45});e.value=JSON.stringify(pads);e.dispatchEvent(new Event('input',{bubbles:true}))});await check('translated, rotated pads');
await page.selectOption('#component','resistor');await page.locator('#footprintSearch').fill('SN74LVC1G04');await page.locator('#footprintSearchResults button').first().click();assert.equal(await page.locator('#component').inputValue(),'ic');assert.equal(await page.locator('#smp').inputValue(),'ti-db5');await check('manufacturer SMD');
await page.locator('#svg').screenshot({path:'/tmp/ipc-courtyard-fixed.png'});
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
