const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const html=fs.readFileSync(process.env.TOOL_FILE||'IPC-7352/tool.html','utf8');
function load(saved){return new JSDOM(html,{runScripts:'dangerously',url:'https://second-review.test/tool.html',pretendToBeVisual:true,beforeParse(w){if(saved)w.localStorage.setItem('fp7352',saved)}})}
let dom=load(),w=dom.window,d=w.document;
function set(id,v){const e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
set('component','ic');set('package','sot23-5');set('smp','ti-db5');set('mfrSpan',2.612345678901);set('mfrW',.612345678901);
const original=d.getElementById('pads').value;
for(let i=0;i<15;i++)for(const unit of ['mil','in','mm'])set('unit',unit);
assert.equal(d.getElementById('pads').value,original,'unit conversion must not change physical exported geometry');
set('unit','in');const saved=w.localStorage.getItem('fp7352');assert.equal(JSON.parse(saved)._mm.mfrSpan.mm,2.612345678901);
dom.window.close();dom=load(saved);w=dom.window;d=w.document;set('unit','mm');assert.equal(d.getElementById('pads').value,original,'canonical mm survives reload in another display unit');
set('package','soic');set('package','sot23-5');assert.equal(d.getElementById('pads').value,original,'package drafts preserve canonical mm');
console.log('Repeated unit round trips, reload and per-package drafts preserve physical geometry: PASS');
set('nT','3');set('nPf','RESC');set('nL',12.3);set('nW',4.5);set('nH',1);set('nP',0);set('nN',0);
assert.equal(d.getElementById('nOut').textContent,'RESC12345X100N');
set('nT','1');set('nPf','SOP');set('nP',.5);set('nN','1e3');assert(d.getElementById('nOut').textContent.includes('-1000N'));
console.log('Standalone chip names retain leading digits; unused chip pitch/count do not block names: PASS');
set('component','ic');set('package','bga');set('smp','bga100');set('bPX',1.2);set('bPY',.6);assert.equal(d.getElementById('mPitch').textContent,'1.20 mm × 0.60 mm');
console.log('BGA summary uses both actual axis pitches rather than the unused common pitch: PASS');
set('component','resistor');set('package','array-flat');
for(const [id,v] of Object.entries({dmName:'Rebuild-test',dmCount:2,dmPitch:1,dmSpan:4,dmPadW:.6,dmPadH:.6,dmBodyW:3,dmBodyH:3,dmHole:0}))set(id,v);
d.getElementById('buildDirectModel').click();assert(d.getElementById('pads').value);
set('dmPadW',-1);assert.equal(d.getElementById('pads').value,'','editing constructor parameters immediately invalidates generated geometry');
d.getElementById('buildDirectModel').click();set('unit','mil');assert.equal(d.getElementById('pads').value,'','unit changes must not resurrect the old valid geometry');
const invalidSaved=w.localStorage.getItem('fp7352');w.close();dom=load(invalidSaved);w=dom.window;d=w.document;assert.equal(d.getElementById('pads').value,'','reload must not resurrect rejected geometry');
console.log('Dirty/invalid direct model cannot resurrect old output through unit changes or reload: PASS');w.close();
