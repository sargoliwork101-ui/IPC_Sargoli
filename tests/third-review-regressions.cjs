const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync(process.env.TOOL_FILE||'IPC-7352/tool.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://third-review.test/tool.html',pretendToBeVisual:true}),w=dom.window,d=w.document;
function set(id,value){const e=d.getElementById(id);e.value=String(value);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
set('component','ic');set('package','soic');set('smp','lib-soic');set('pShape','auto');
function put(pads){d.getElementById('referenceBody').value=JSON.stringify({lines:[],circles:[]});d.getElementById('referencePads').value=JSON.stringify(pads);d.getElementById('referencePads').dispatchEvent(new w.Event('input',{bubbles:true}))}
function base(extra){return Object.assign({n:'1',x:0,y:0,w:2,h:2,sh:'c',rotation:0,hole:0,pl:true},extra)}
function size(){const frame=d.querySelector('#svg rect[stroke="#c0392b"]');assert(frame,'valid frame');return [+frame.dataset.mmWidth,+frame.dataset.mmHeight]}
for(const rotation of [0,30,45,90,270]){put([base({rotation})]);assert.deepEqual(size(),[2.5,2.5],'a circle cannot get larger when rotated')}
put([base({w:4,h:2,sh:'o',rotation:45})]);for(const side of size())assert(Math.abs(side-(2+Math.SQRT2+.5))<1e-9,'oblong bounds must use the capsule, not its rotated bounding rectangle');
put([base({w:4,h:2,sh:'rr',radius:.5,rotation:45})]);for(const side of size())assert(Math.abs(side-(1+2*Math.SQRT2+.5))<1e-9);
set('pShape','o');for(const side of size())assert(Math.abs(side-(2+Math.SQRT2+.5))<1e-9,'shape override must recompute the matching envelope');
assert.equal(+d.getElementById('pads').value.split('\n')[1].split(',')[11],1,'oblong export must use the actual end radius');set('pShape','r');assert.equal(+d.getElementById('pads').value.split('\n')[1].split(',')[11],0,'rectangle export must not retain an old roundrect radius');
set('pShape','auto');console.log('Circle, capsule and roundrect bounds match their actual rendered geometry: PASS');
const slot=base({w:4,h:2,sh:'r',hole:.8,holeType:'slot',holeL:2,holeW:.8});
const invalid=[base({n:undefined}),base({pl:'false'}),base({holeType:'conical'}),Object.assign({},slot,{hole:0}),Object.assign({},slot,{hole:.5}),base({sh:'poly',polygon:[[0,0],[1,0],[2,0]]})];
for(const pad of invalid){put([pad]);assert.equal(d.getElementById('pads').value,'','invalid reference metadata must not become a valid footprint');assert(d.getElementById('emptyReason').textContent.includes('ویرایش مرجع'))}
put([slot]);assert.equal(+d.getElementById('pads').value.split('\n')[1].split(',')[9],2);assert.equal(+d.getElementById('pads').value.split('\n')[1].split(',')[10],.8);assert(d.getElementById('pads').value.includes('plated'));
console.log('Missing pad ID, ambiguous plating, unknown hole types, inconsistent slots and zero-area polygons are rejected: PASS');
set('pS','v');set('pH',0);assert(d.getElementById('pOut').textContent.startsWith('نامعتبر:'));
set('pS','c');set('p1',1.5);set('pH',2);assert(d.getElementById('pOut').textContent.startsWith('نامعتبر:'));
set('pH',.9);assert.equal(d.getElementById('pOut').textContent,'c150h90');
console.log('Standalone via requires a hole; impossible hole/pad dimensions are rejected: PASS');w.close();
