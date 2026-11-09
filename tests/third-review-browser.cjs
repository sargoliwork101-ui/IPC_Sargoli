const assert=require('node:assert/strict'),{chromium}=require('playwright-core'),pkg=require('@sparticuz/chromium'),engine=pkg.default||pkg;
(async()=>{const browser=await chromium.launch({args:engine.args,executablePath:await engine.executablePath(),headless:true});try{
const page=await browser.newPage();await page.goto('http://localhost:8080/tool.html');await page.selectOption('#component','ic');await page.selectOption('#package','soic');await page.selectOption('#smp','lib-soic');await page.selectOption('#pShape','auto');
const put=async(pad)=>page.evaluate(p=>{document.querySelector('#referenceBody').value=JSON.stringify({lines:[],circles:[]});const e=document.querySelector('#referencePads');e.value=JSON.stringify([p]);e.dispatchEvent(new Event('input',{bubbles:true}))},pad);
const base={n:'1',x:0,y:0,w:2,h:2,sh:'c',rotation:45,hole:0,pl:true};
await put(base);let size=await page.locator('#svg rect[stroke="#c0392b"]').evaluate(e=>[+e.dataset.mmWidth,+e.dataset.mmHeight]);assert.deepEqual(size,[2.5,2.5]);
await put({...base,w:4,h:2,sh:'rr',radius:.5});await page.selectOption('#pShape','o');size=await page.locator('#svg rect[stroke="#c0392b"]').evaluate(e=>[+e.dataset.mmWidth,+e.dataset.mmHeight]);assert(size.every(v=>Math.abs(v-(2+Math.SQRT2+.5))<1e-9));assert.equal(+(await page.locator('#pads').inputValue()).split('\n')[1].split(',')[11],1);
await page.selectOption('#pShape','r');assert.equal(+(await page.locator('#pads').inputValue()).split('\n')[1].split(',')[11],0);
await put({...base,pl:'false'});assert.equal(await page.locator('#pads').inputValue(),'');assert(await page.locator('#stageEmpty').isVisible());
await put({...base,w:4,h:2,sh:'r',hole:0,holeType:'slot',holeL:2,holeW:.8});assert.equal(await page.locator('#pads').inputValue(),'');
console.log('Real browser: exact curved-pad envelope, matching CSV radius and invalid metadata rejection — PASS');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
