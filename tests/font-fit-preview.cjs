// Real Chromium geometry assertions; browser font metrics, not character-count approximations.
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');const pkg=require('@sparticuz/chromium');const engine=pkg.default||pkg;
(async()=>{const browser=await chromium.launch({args:engine.args,executablePath:await engine.executablePath(),headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://localhost:8080/tool.html');await page.evaluate(()=>document.fonts.ready);
 const selectSample=async(value)=>{await page.evaluate(v=>{
 const d=document,pk=v.startsWith('lib-')?v.slice(4):({'ti-db5':'sot23-5','ti-db6':'sot23-6','ti-pw16':'tssop','bga100':'bga'}[v]||(/^chip/.test(v)?'chip':/^soic/.test(v)?'soic':v));
 const comp=d.getElementById('component'),pkg=d.getElementById('package'),change=e=>e.dispatchEvent(new Event('change',{bubbles:true}));
 if(!Array.from(pkg.options).some(o=>o.value===pk)){comp.value=pk==='chip'?'resistor':/^(sot|dpak|to-th)/.test(pk)?'transistor':/^(connector|hdr|socket|npth|pressfit)/.test(pk)?'connector':'ic';change(comp)}
 pkg.value=pk;change(pkg);
 },value);await page.selectOption('#smp',value)};
 const check=async(label)=>{const errors=await page.evaluate(()=>{
  const errors=[];for(const e of document.querySelectorAll('#padG text')){const b=e.getBBox(),x=+e.dataset.fitX,y=+e.dataset.fitY,w=+e.dataset.fitWidth,h=+e.dataset.fitHeight,stroke=parseFloat(e.getAttribute('stroke-width')||0)/2;
   if(b.x-stroke<x-.02||b.y-stroke<y-.02||b.x+b.width+stroke>x+w+.02||b.y+b.height+stroke>y+h+.02)errors.push({text:e.textContent,b:{x:b.x,y:b.y,w:b.width,h:b.height},x,y,w,h});}
  for(const e of document.querySelectorAll('#dimG g text')){const b=e.getBBox(),r=e.parentNode.querySelector('rect');if(!r)continue;const x=+r.getAttribute('x'),y=+r.getAttribute('y'),w=+r.getAttribute('width'),h=+r.getAttribute('height');if(b.x<x-.15||b.y<y-.15||b.x+b.width>x+w+.15||b.y+b.height>y+h+.15)errors.push({dimension:e.textContent});}
  return errors;
 });assert.deepEqual(errors,[],label);console.log(label+': PASS');};
 for(const sample of ['soic','chip0603','ti-db5','dip','lib-sot223','lib-sot89','lib-connector-smd']){await selectSample(sample);await check(sample);}
 await selectSample('lib-sot223');await page.evaluate(()=>{const e=document.querySelector('#referencePads'),p=JSON.parse(e.value);p[0].rotation=45;p[0].n='LONG_PAD_LABEL_12345';e.value=JSON.stringify(p);e.dispatchEvent(new Event('input',{bubbles:true}));});await check('rotated 45 degrees and long pin name');
 await page.locator('#fitBtn').click();await page.locator('#svg').screenshot({path:'/tmp/ipc-font-fit.png'});
 await page.setViewportSize({width:420,height:860});await selectSample('ti-db5');await page.locator('#mfrL').fill('123.456');
 await page.waitForTimeout(100);assert(await page.locator('.metric strong').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)),'mobile metric cards must not truncate horizontally');await check('mobile');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
