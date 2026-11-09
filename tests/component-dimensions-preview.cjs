const assert=require('node:assert/strict');
const {chromium}=require('playwright-core'),pkg=require('@sparticuz/chromium'),engine=pkg.default||pkg;
(async()=>{const browser=await chromium.launch({args:engine.args,executablePath:await engine.executablePath(),headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8080/tool.html');
await page.selectOption('#component','resistor');
assert.deepEqual(await page.locator('#package option').evaluateAll(es=>es.map(e=>e.value)),['chip','array-conc','array-convex','array-flat','axial']);
for(const key of ['chip','array-conc','array-convex','axial']){
 await page.selectOption('#package',key);
 const texts=await page.locator('#smp option').allTextContents();assert(!texts.some(s=>/CP_|C_Elec|D_MiniMELF|SMA|خازن|TI /.test(s)),texts.join('\n'));
 assert(!(await page.locator('#referenceComment').textContent()).includes('CP_Radial'));
}
assert.deepEqual(await page.locator('#tExample option').evaluateAll(es=>es.filter(e=>e.value).map(e=>e.value)),['cfr25']);
await page.selectOption('#package','chip');assert.deepEqual(await page.locator('#cType option').evaluateAll(es=>es.map(e=>e.value)),['RESC']);
await page.locator('#footprintSearch').fill('خازن');assert.equal(await page.locator('#footprintSearchResults button').count(),0);
console.log('Resistor packages, named examples, prefixes and search exclude capacitor/diode models: PASS');
const cases=[['ic','soic','soic'],['resistor','chip','chip0603'],['ic','bga','bga100'],['ic','dip','dip'],['resistor','axial','lib-axial'],['capacitor','radial','lib-radial'],['transistor','sot89','lib-sot89'],['connector','connector-smd','lib-connector-smd']];
for(const [component,key,sample] of cases){
 await page.selectOption('#component',component);await page.selectOption('#package',key);await page.selectOption('#smp',sample);
 const result=await page.evaluate(()=>{
  const rows=document.querySelector('#pads').value.trim().split('\n').slice(1).map(s=>s.split(','));
  const xs=rows.map(p=>+p[1]),ys=rows.map(p=>+p[2]);const labels=Array.from(document.querySelectorAll('[data-common-dimensions] text')).map(t=>t.textContent);
  const all=Array.from(document.querySelectorAll('#dimG text')).map(t=>t.textContent);
  const plates=Array.from(document.querySelectorAll('#dimG rect')).map(r=>{const b=r.getBBox();return {x:b.x,y:b.y,w:b.width,h:b.height}});
  const overlaps=[];for(let i=0;i<plates.length;i++)for(let j=i+1;j<plates.length;j++){let a=plates[i],b=plates[j];if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1)overlaps.push([i,j])}
  return {dx:Math.max(...xs)-Math.min(...xs),dy:Math.max(...ys)-Math.min(...ys),labels,all,overlaps};
 });
 for(const [axis,delta] of [['X',result.dx],['Y',result.dy]]){
  const expected='C-C '+axis+' '+delta.toFixed(2)+' mm';assert.equal(result.labels.filter(s=>s.startsWith('C-C '+axis+' ')).length,delta>1e-7?1:0,sample);
  if(delta>1e-7)assert(result.labels.includes(expected),sample+': '+expected+' '+result.labels);
 }
 assert(result.all.some(s=>s.startsWith('Courtyard X ')),sample+': common X envelope');assert(result.all.some(s=>s.startsWith('Courtyard Y ')),sample+': common Y envelope');
 assert.deepEqual(result.overlaps,[],sample+': dimension plates must not overlap');
 console.log(sample+': exact common centre spans, envelope and non-overlap — PASS');
}
await page.locator('#svg').screenshot({path:'/tmp/ipc-common-dimensions.png'});assert.deepEqual(errors,[]);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
