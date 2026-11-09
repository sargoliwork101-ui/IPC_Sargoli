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
 const selectSample=async(value)=>{await page.evaluate(v=>{
 const d=document,pk=v.startsWith('lib-')?v.slice(4):({'ti-db5':'sot23-5','ti-db6':'sot23-6','ti-pw16':'tssop','bga100':'bga'}[v]||(/^chip/.test(v)?'chip':/^soic/.test(v)?'soic':v));
 const comp=d.getElementById('component'),pkg=d.getElementById('package'),change=e=>e.dispatchEvent(new Event('change',{bubbles:true}));
 if(!Array.from(pkg.options).some(o=>o.value===pk)){comp.value=pk==='chip'?'resistor':/^(sot|dpak|to-th)/.test(pk)?'transistor':/^(connector|hdr|socket|npth|pressfit)/.test(pk)?'connector':'ic';change(comp)}
 pkg.value=pk;change(pkg);
 },value);await page.selectOption('#smp',value)};
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:8080/tool.html');
  for (const sample of ['soic','chip','bga100','dip','sot23']) {
   await selectSample(sample);
   const result=await page.evaluate(()=>{
    const svg=document.querySelector('#svg'),r=svg.getBoundingClientRect();
    return {mode:document.compatMode,width:r.width,height:r.height,empty:document.querySelector('#stageEmpty').hidden,count:+document.querySelector('#mCount').textContent,shapes:svg.querySelectorAll('rect,circle').length};
   });
   assert.equal(result.mode,'CSS1Compat');assert(result.width>0&&result.height>0&&result.empty&&result.count>0&&result.shapes>0);
   await page.screenshot({path:'/tmp/ipc-'+sample+'.png'});
   console.log(sample,'visible:',result.count,'pads');
  }
  await page.locator('#advancedGeometry').evaluate(e=>e.open=true);
  await selectSample('chip');
  assert.equal(await page.locator('#fam').inputValue(),'chip');
  await page.selectOption('#fam','gull');
  assert.equal(await page.locator('#smp').inputValue(),'');
  await selectSample('soic');
  assert.equal(await page.locator('#fam').inputValue(),'gull');
  await page.locator('#Lmax').fill('6.3');
  assert.equal(await page.locator('#smp').inputValue(),'');
  console.log('Preset/family relationship and custom editing: PASS');
  await page.selectOption('#component','capacitor');
  assert.equal(await page.locator('#fam').inputValue(),'chip');
  assert.equal(await page.locator('#cType').inputValue(),'CAPC');
  await selectSample('chip0603');
  assert.equal(await page.locator('#mCount').textContent(),'2');
  await page.selectOption('#component','transistor');
  assert.equal(await page.locator('#package').inputValue(),'sot23');
  assert.equal(await page.locator('#mCount').textContent(),'3');
  assert((await page.locator('#insName').textContent()).startsWith('SOT'));
  await page.locator('#mkA').evaluate(e=>e.click());
  const alt=await page.locator('#alt').inputValue();assert(alt.includes('3'));
  console.log('Cascading selection and SOT-23: PASS');
  assert(await page.locator('#pShape').isVisible());assert(await page.locator('#pShape').isEnabled());
  await page.selectOption('#pShape','r');
  assert(await page.locator('#svg rect[fill="#d4a017"]').evaluateAll(es=>es.length===3&&es.every(e=>!e.hasAttribute('rx'))));
  await page.selectOption('#pShape','o');
  assert(await page.locator('#svg rect[fill="#d4a017"]').evaluateAll(es=>es.length===3&&es.every(e=>+e.getAttribute('rx')>0)));
  await page.reload();assert.equal(await page.locator('#pShape').inputValue(),'o');
  await page.selectOption('#package','sot23-5');
  for(const [id,v] of Object.entries({Lmin:2.6,Lmax:3,Tmin:.3,Tmax:.6,Smax:1.8,W:.5,H:1.45,P:.95,BW:1.7,bodyLength:3}))await page.locator('#'+id).fill(String(v));
  assert.equal(await page.locator('#mCount').textContent(),'5');
  await page.locator('#fitBtn').click();await page.locator('#svg').screenshot({path:'/tmp/ipc-sot23-5.png'});
  await page.selectOption('#package','sot23-6');
  for(const [id,v] of Object.entries({Lmin:2.6,Lmax:3,Tmin:.3,Tmax:.6,Smax:1.8,W:.5,H:1.45,P:.95,BW:1.7,bodyLength:3}))await page.locator('#'+id).fill(String(v));
  assert.equal(await page.locator('#mCount').textContent(),'6');
  console.log('User-selected shape, reload and SOT-23-5/6 geometry: PASS');
  await page.selectOption('#component','resistor');await page.selectOption('#package','axial');if(await page.locator('#leaveReference').isVisible())await page.locator('#leaveReference').click();
  await page.selectOption('#tExample','cfr25');assert.equal(await page.locator('#mCount').textContent(),'2');
  await selectSample('soic');assert.equal(await page.locator('#mCount').textContent(),'16');
  assert.equal(await page.locator('#kind').inputValue(),'smd');
  await page.reload();assert.equal(await page.locator('#mCount').textContent(),'16');
  await page.selectOption('#component','transistor');await page.selectOption('#package','sot23-5');
  if(await page.locator('#previewPackage').isVisible())await page.locator('#previewPackage').click();assert.equal(await page.locator('#mCount').textContent(),'5');
  await page.locator('#W').fill('0.47');
  await page.selectOption('#package','sot23-6');if(await page.locator('#previewPackage').isVisible())await page.locator('#previewPackage').click();
  assert.equal(await page.locator('#mCount').textContent(),'6');
  await page.selectOption('#package','sot23-5');assert.equal(await page.locator('#W').inputValue(),'0.47');
  assert.equal(await page.locator('#mCount').textContent(),'5');
  console.log('THT to SMD isolation, persisted stale THT model and per-package input recovery: PASS');
  await selectSample('ti-db5');
  assert.equal(await page.locator('#mfrL').inputValue(),'1.1');assert.equal(await page.locator('#mfrW').inputValue(),'0.6');
  await page.locator('#mfrL').fill('1.2');await page.reload();
  assert.equal(await page.locator('#padBasis').inputValue(),'manufacturer');assert.equal(await page.locator('#mfrL').inputValue(),'1.2');
  assert((await page.locator('#pads').inputValue()).includes('1.2000'));
  assert(await page.locator('#manufacturerReference').isVisible());
  console.log('Official manufacturer template, direct editing and reload: PASS');
  await page.locator('#footprintSearch').fill('SN74LVC1G04');
  await page.locator('#footprintSearchResults button').first().click();
  assert.equal(await page.locator('#smp').inputValue(),'ti-db5');
  assert((await page.locator('#dimG').textContent()).includes('C-C X 2.60 mm'));
  await page.locator('#fitBtn').click();await page.locator('#svg').screenshot({path:'/tmp/ipc-horizontal-centers.png'});
  await page.selectOption('#component','resistor');await page.locator('#footprintSearch').fill('CFR-25');await page.locator('#footprintSearchResults button').first().click();
  assert.equal(await page.locator('#tExample').inputValue(),'cfr25');assert.equal(await page.locator('#mCount').textContent(),'2');
  await page.locator('#footprintSearch').fill('no-match-xyz');assert.equal(await page.locator('#footprintSearchResults button').count(),0);
  await page.locator('#footprintSearch').press('Escape');assert.equal(await page.locator('#footprintSearch').inputValue(),'');
  console.log('Component-scoped footprint search and horizontal center-to-center dimension: PASS');




  await page.selectOption('#component','ic');await page.selectOption('#package','qfn');
  assert(await page.locator('#referenceEditor').isVisible());assert((await page.locator('#pads').inputValue()).length>0);
  await page.selectOption('#package','lga');
  assert((await page.locator('#pads').inputValue()).length>0);
  assert((await page.locator('#packageStatus').textContent()).includes('KiCad'));
  await page.reload();
  assert.equal(await page.locator('#package').inputValue(),'lga');
  assert((await page.locator('#pads').inputValue()).length>0);
  await page.selectOption('#component','led');assert.equal(await page.locator('#cType').inputValue(),'LEDC');
  console.log('Catalogue filtering, blocked output and persisted package: PASS');
  await selectSample('lib-sot223');
  assert(await page.locator('#referenceComment').textContent().then(t=>t.includes('SOT-223-3_TabPin2')&&t.includes('دیتاشیت')));
  await page.locator('#referenceTable input[data-row="0"][data-key="w"]').fill('1.7');
  assert((await page.locator('#pads').inputValue()).includes('1.7000'));
  await page.reload();assert.equal(await page.locator('#referenceTable input[data-row="0"][data-key="w"]').inputValue(),'1.7');
  await page.locator('#fitBtn').click();await page.locator('#svg').screenshot({path:'/tmp/ipc-ref-sot223.png'});
  await selectSample('lib-sot89');assert.equal(await page.locator('#svg polygon').count(),1);
  await selectSample('lib-connector-smd');assert.equal(await page.locator('#mCount').textContent(),'13');
  await page.locator('#fitBtn').click();await page.locator('#svg').screenshot({path:'/tmp/ipc-ref-usb.png'});
  console.log('Library references, numeric editing, polygon, slot and persisted geometry: PASS');

  // Old 1206 state must survive a reload without becoming blank.
  await selectSample('chip');
  await page.evaluate(()=>{const o=JSON.parse(localStorage.getItem('fp7352'));o.Lmin='5.8';localStorage.setItem('fp7352',JSON.stringify(o))});
  await page.reload();assert.equal(await page.locator('#mCount').textContent(),'2');
  await page.locator('#Lmax').fill('0');
  assert(await page.locator('#stageEmpty').isVisible());
  assert((await page.locator('#emptyReason').textContent()).includes('Lmax'));
  await page.locator('#restoreDrawing').click();assert.equal(await page.locator('#mCount').textContent(),'16');
  await selectSample('dip');
  await page.selectOption('#tS','1');await page.locator('#tW').fill('0.5');await page.selectOption('#tPr','0');
  let pin=(await page.locator('#pads').inputValue()).split('\n')[1].split(',');
  assert.equal(+pin[3],1.36);assert.equal(+pin[4],.86);
  await page.selectOption('#tPr','1');
  pin=(await page.locator('#pads').inputValue()).split('\n')[1].split(',');
  assert.equal(+pin[3],1.86);assert.equal(+pin[4],1.11);
  await page.selectOption('#tPr','0');await page.locator('#man').check();await page.locator('#pHole').fill('1.2');await page.locator('#man').uncheck();
  await page.reload();
  pin=(await page.locator('#pads').inputValue()).split('\n')[1].split(',');
  assert.equal(+pin[3],1.36);assert.equal(+pin[4],.86);
  await page.locator('#fitBtn').click();await page.locator('#svg').screenshot({path:'/tmp/ipc-square-corrected.png'});
  console.log('Square pin hole/pad and disabled override across reload: PASS');
  await page.selectOption('#tS','2');await page.locator('#tW').fill('2');await page.locator('#tW2').fill('0.3');
  await page.selectOption('#tHoleShape','slot');
  assert.equal(await page.locator('#pads').inputValue(),'');
  await page.locator('#tSlotL').fill('3');await page.locator('#tSlotW').fill('1');await page.locator('#tSlotRing').fill('0.5');
  const slotCSV=await page.locator('#pads').inputValue();
  assert(slotCSV.includes('SlotLength,SlotWidth,HoleType'));
  let slotPin=slotCSV.split('\n')[1].split(',');
  assert.equal(+slotPin[3],4);assert.equal(+slotPin[4],2);assert.equal(+slotPin[5],3);assert.equal(+slotPin[6],1);
  await page.locator('#mkA').evaluate(e=>e.click());
  assert((await page.locator('#alt').inputValue()).includes('خروجی Altium برای شیار هنوز'));
  await page.reload();assert.equal(await page.locator('#tHoleShape').inputValue(),'slot');
  assert((await page.locator('#pads').inputValue()).includes('SlotLength'));
  await page.locator('#fitBtn').click();await page.locator('#svg').screenshot({path:'/tmp/ipc-slot.png'});
  await page.locator('#tSlotL').fill('2');await page.locator('#tSlotW').fill('0.3');
  assert.equal(await page.locator('#pads').inputValue(),'');
  assert((await page.locator('#emptyReason').textContent()).includes('جا نمی‌شوند'));
  console.log('Manual slot dimensions, standard name, drawing, reload and invalid corners: PASS');
  assert.deepEqual(errors,[]);
  console.log('Stored-state recovery and visible error/recovery: PASS');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
