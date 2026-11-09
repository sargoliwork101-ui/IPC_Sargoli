const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(process.env.TOOL_FILE||'IPC-7352/tool.html','utf8');
function load(storage={}){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://fourth-review.test/tool.html',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){for(const [k,v] of Object.entries(storage))w.localStorage.setItem(k,v);w.confirm=()=>true}});return {dom,errors}}
for(const value of ['null','[]','42','"invalid"','{broken']){const {dom,errors}=load({fp7352_groups:value});assert(dom.window.document.getElementById('pads').value.split('\n').length>2,'bad sidebar storage must not stop calculation: '+value);assert(!errors.some(e=>e.type==='unhandled exception'));dom.window.close()}
console.log('Malformed or null sidebar settings cannot stop application startup: PASS');
const {dom}=load(),w=dom.window,d=w.document;
function set(id,value){const e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!value;else e.value=String(value);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
set('component','ic');set('package','soic');set('smp','lib-soic');d.getElementById('referencePads').value='<hr>';d.getElementById('referencePads').dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(d.querySelectorAll('#res hr').length,0);assert(d.getElementById('res').textContent.includes('<hr>'));
console.log('Error messages render malformed user JSON as text, not HTML: PASS');
set('smp','soic');set('man',true);set('pZJ',-5);assert.equal(d.getElementById('pads').value,'','negative computed pad length must not reach CSV');d.getElementById('mkA').click();assert(!d.getElementById('alt').value.includes('  AddPad('));set('pZJ',.35);assert(d.getElementById('pads').value.split('\n').length>2);
console.log('Manual coefficients cannot produce zero/negative pad geometry in CSV or Altium: PASS');
set('nPf','PRESERVE');set('dIn','c150h90');set('package','sot23-5');set('package','soic');assert(w.localStorage.getItem('fp7352PackageDrafts'));
d.getElementById('rowReset').click();const saved=w.localStorage.getItem('fp7352');assert.equal(w.localStorage.getItem('fp7352PackageDrafts'),null);assert.equal(JSON.parse(saved).nPf,'PRESERVE');assert.equal(JSON.parse(saved).dIn,'c150h90');assert.equal(JSON.parse(saved).pZJ,undefined);
const fresh=load({fp7352:saved});assert.equal(fresh.dom.window.document.getElementById('nPf').value,'PRESERVE');assert(fresh.dom.window.document.getElementById('pads').value.split('\n').length>2);fresh.dom.window.close();w.close();
console.log('Reset clears stale package drafts while preserving promised naming/decoder inputs: PASS');
