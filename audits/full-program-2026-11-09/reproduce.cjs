// Audit only: reads current application, changes DOM inputs in isolation, never edits product code.
const fs=require('node:fs'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('IPC-7352/tool.html','utf8');let results=[];
function session(){let w=new JSDOM(html,{runScripts:'dangerously',url:'https://whole-audit.test/tool.html',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}).window,d=w.document;function set(id,v){let e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}return {w,d,set,close:()=>w.close(),state:()=>({valid:!!d.getElementById('pads').value,warning:d.getElementById('warn').textContent,rows:d.getElementById('res').textContent})}}
function check(id,fn){let s=session();try{results.push({id,...fn(s)})}finally{s.close()}}
function chip(s){s.set('component','resistor');s.set('package','chip');s.set('smp','chip0603')}
check('A02-unused-P-chip',s=>{chip(s);const before=s.state();s.set('P',0);return{before,after:s.state()}});
check('A03-manual-S-unused-T',s=>{chip(s);s.set('sMode','manual');s.set('Smax',1.33);const before=s.state();s.set('Tmin','');s.set('Tmax','');return{before,after:s.state()}});
check('A04-direct-land-pattern-depends-on-L',s=>{s.set('component','ic');s.set('package','tssop');s.set('smp','ti-pw16');const before=s.state();const computed=[...s.d.querySelectorAll('#autoParameters input')].map(e=>({id:e.id,value:e.value}));s.set('Lmax',0);return{before,computedDespiteDirect:computed,after:s.state()}});
check('A05-fixed-up-to-thickness-correction',s=>{s.set('component','ic');s.set('package','dip');s.set('smp','dip');s.set('tB',.7);return s.state()});
check('A06-incomplete-S-input-computed-output',s=>{chip(s);s.set('Tmin',-.1);return{...s.state(),calculatedS:s.d.getElementById('calculatedS').value,calculatedSHidden:s.d.getElementById('calculatedS').parentNode.hidden}});
check('A07-display-rounding-does-not-change-RC0603-copper',s=>{chip(s);for(const [k,v]of Object.entries({Lmin:1.5,Lmax:1.7,Tmin:.1,Tmax:.4,W:.9,H:.45,BW:.9,bodyLength:1.7}))s.set(k,v);s.set('autoS',true);const csv=s.d.getElementById('pads').value;const state=s.state();s.set('pDec',0);const same=csv===s.d.getElementById('pads').value;return{...state,csv,sameAfterDisplayChange:same}});
fs.writeFileSync('audits/full-program-2026-11-09/reproductions.json',JSON.stringify(results,null,2));for(const r of results)console.log(r.id,JSON.stringify(r).slice(0,450));
