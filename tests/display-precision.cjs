const assert=require('node:assert/strict'),fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('IPC-7352/tool.html','utf8'),{runScripts:'dangerously',url:'https://precision.test',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
function set(id,v){let e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
function pads(){return d.getElementById('pads').value.trim().split('\n').slice(1).map(r=>r.split(','))}
function close(a,b){assert(Math.abs(a-b)<1e-12,`${a} != ${b}`)}
assert.equal(d.getElementById('pDec').value,'3');assert(!d.getElementById('pDec').disabled);assert(d.getElementById('displaySettings').contains(d.getElementById('pDec')));
set('component','resistor');set('package','chip');set('smp','chip');for(const[k,v]of Object.entries({Lmin:.95,Lmax:1.031,Smax:.51017,W:.5134,H:.24,P:.5}))set(k,v);
let p=pads()[0];close(+p[3],(1.15-.51)/2);close(+p[4],.51);let raw=d.getElementById('pads').value;set('P',.3);assert.equal(d.getElementById('pads').value,raw);
for(const dec of [0,2,3,5,8]){set('pDec',dec);assert.equal(d.getElementById('pads').value,raw);const x=[...d.querySelectorAll('#res tr')].find(r=>r.cells[0].textContent==='X (عرض پد)');assert.equal(x.cells[1].textContent,Number(.51).toFixed(dec)+' mm')}
set('pDec',3);set('unit','mil');let mil=pads()[0];close(+mil[4],.51/.0254);assert(d.getElementById('res').textContent.includes((.51/.0254).toFixed(3)+' mil'));set('unit','mm');close(+pads()[0][4],.51);
set('component','resistor');set('package','axial');set('tExample','cfr25');set('tS','1');set('tW',.6);let th=pads()[0];close(+th[4],Math.SQRT2*.6+.4);close(+th[3],Math.SQRT2*.6+.4+.75);raw=d.getElementById('pads').value;set('pDec',6);assert.equal(d.getElementById('pads').value,raw);
set('component','custom');set('kind','bga');set('man',false);set('lv','B');set('bB',.51347);set('bT','C');let b=pads()[0];close(+b[3],.41);raw=d.getElementById('pads').value;set('pDec',3);assert.equal(d.getElementById('pads').value,raw);
console.log('PASS: IPC-rounded SMD/BGA and unrounded TH geometry; pitch independence; 0–8 display decimals; units; precise CSV invariant.');w.close();
