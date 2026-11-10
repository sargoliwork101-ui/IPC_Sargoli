/* Read-only review: independent table expectations + actual public-UI outputs. No formula changes. */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('IPC-7352/tool.html','utf8');const code=html.slice(html.indexOf('function smax('),html.indexOf('function kit('));const ctx={Math};vm.createContext(ctx);vm.runInContext(code,ctx);
let coefficientCases=0;for(const W of [.321,.5,1.8])for(const H of [.4,1,3])for(let i=0;i<3;i++){const expected=W>=.5?[[.55,Math.min(.25*H,.5),.15][i],0,[.05,0,0][i],[.5,.25,.1][i]]:[[H,.5*H,.25*H][i],0,0,[.2,.15,.1][i]];assert.deepEqual(Array.from(ctx.rule('chip',i,W,H,0)).slice(0,4),expected);coefficientCases++}
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://resistor-audit.test/tool.html',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
function set(id,v){const e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
function row(name){return [...d.querySelectorAll('#res tr')].find(r=>r.cells[0].textContent===name)?.cells[1].textContent}
function csv(){return d.getElementById('pads').value.trim().split('\n').slice(1).map(s=>s.split(','))}
function chip(){set('component','resistor');set('package','chip');set('smp','chip');set('lv','B');set('man',false)}
const samples=[];for(const level of ['A','B','C']){chip();set('lv',level);samples.push({level,Z:row('Z (طول کل پدها)'),G:row('G (فاصلهٔ داخلی)'),X:row('X (عرض پد)'),pad:csv()[0],courtyard:row('Courtyard'),name:row('نام پیشنهادی')})}
for(const [i,s]of samples.entries()){const expected=[[1.3,1.9],[1,1.8],[.9,1.8]][i];assert.equal(+s.pad[3],expected[0]);assert.equal(+s.pad[4],expected[1])}
chip();for(const [k,v]of Object.entries({Lmin:.95,Lmax:1.031,Smax:.51,W:.5134,H:.24,P:.5}))set(k,v);const ordinary=csv()[0];set('P',.3);const lowPitch=csv()[0];assert.equal(+ordinary[4],.51);assert.equal(+lowPitch[4],.513);assert.notEqual(+ordinary[3],+lowPitch[3]);
const rounding={inputs:{Lmax:1.031,Smax:.51,W:.5134,H:.24,level:'B'},JT:.06,expected_table_3_3:{Z:1.15,G:.51,X:.51,padLength:.32},P_0_5_pad:ordinary,P_0_3_pad:lowPitch};
chip();for(const[k,v]of Object.entries({W:.321,H:.2,P:.5,Lmin:.9,Lmax:1.1,Smax:.6}))set(k,v);const small={pad:csv()[0],Z:row('Z (طول کل پدها)'),G:row('G (فاصلهٔ داخلی)'),X:row('X (عرض پد)')};assert.equal(+small.pad[4],.321);
const rms=ctx.smax(5.8,6.2,.4,1.27);assert(Math.abs(rms-(5.4-(2.14-Math.sqrt(.4**2+2*.87**2))/2))<1e-12);
// Standard nominal THT case, using the actual resistor manufacturer's example entry.
set('component','resistor');set('package','axial');set('tExample','cfr25');const axial={hole:row('سوراخ نهایی'),pad:row('پد'),pads:csv(),name:row('نام پیشنهادی Land Pattern'),pitch:d.getElementById('tP').value,warning:d.getElementById('warn').textContent};
const thickness=[];for(const t of [.7,.8,1,2.35,3,4,4.5]){set('tB',t);thickness.push({board_mm:t,hole:row('سوراخ نهایی'),pad:row('پد')})}
set('tB',1.6);set('tPr','0');const finite={hole:row('سوراخ نهایی'),pad:row('پد')};
set('tPr','1');set('tB',1.6);set('tS','1');set('tW',.6);const square={hole:row('سوراخ نهایی'),pad:row('پد'),diagonal:Math.SQRT2*.6};
set('tS','2');set('tW',.6);set('tW2',.3);const rectangle={hole:row('سوراخ نهایی'),pad:row('پد'),diagonal:Math.hypot(.6,.3)};
const refs=JSON.parse(d.getElementById('referenceFootprintData').textContent),references={};for(const key of ['chip','array-conc','array-convex','axial']){const ref=refs[key];references[key]={name:ref.name,path:ref.path,description:ref.description,pads:ref.pads.length}}
assert(axial.hole.includes('1.00'));assert(axial.pad.includes('1.50'));assert(finite.hole.includes('0.75'));assert(finite.pad.includes('1.25'));assert(square.hole.includes('1.25'));assert(rectangle.hole.includes('1.02'));
const result={standard:'IPC-7352 May 2023',coefficientCases,rms,samples,rounding,small,axial,thickness,finite,square,rectangle,references,scope_resistor_packages:['chip','array-conc','array-convex','array-flat','axial']};console.log(JSON.stringify(result,null,2));w.close();
