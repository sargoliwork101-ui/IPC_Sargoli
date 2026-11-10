/* Second independent sweep: no use of the application's rule()/smax() functions. */
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM,VirtualConsole}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('IPC-7352/tool.html','utf8'),{runScripts:'dangerously',url:'https://second-resistor.test/tool.html',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
function set(id,v){const e=d.getElementById(id);assert(e,id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
function pads(){const s=d.getElementById('pads').value;assert(s,d.getElementById('emptyReason').textContent);return s.trim().split('\n').slice(1).map(p=>p.split(','))}
let count=0,maxError=0;function near(a,b,msg){const diff=Math.abs(a-b);maxError=Math.max(maxError,diff);assert(diff<1e-11*Math.max(1,Math.abs(b)),`${msg}: ${a} != ${b}`)}
set('component','resistor');set('package','chip');set('smp','chip');set('man',false);set('autoS',false);
// Boundary ±0.000001 at the table switch; height at and around the B toe cap.
for(const W of [.19991,.499999,.5,.500001,1.234567])for(const H of [.09991,1.999999,2,2.000001])for(let i=0;i<3;i++){
 const L=2.34567,S=.789123;for(const[k,v]of Object.entries({lv:['A','B','C'][i],Lmin:2,Lmax:L,Smax:S,W,H}))set(k,v);
 const JT=W<.5?[H,H/2,H/4][i]:[.55,Math.min(H/4,.5),.15][i],JS=W>=.5&&i===0?.05:0,p=pads();assert.equal(p.length,2);near(+p[0][3],(L+2*JT-S)/2,'length');near(+p[0][4],W+2*JS,'width');near(+p[0][1],-(L+2*JT+S)/4,'left centre');near(+p[1][1],-Number(p[0][1]),'symmetry');count++;
}
// Each shipped resistor chip preset, density, unit and display-precision route.
const presets={chip:{L:3.4,S:1.9,W:1.8,H:1},chip0805:{L:2.2,S:1,W:1.45,H:.6},chip0603:{L:1.75,S:.75,W:.95,H:.5}};
for(const [sample,v]of Object.entries(presets))for(let i=0;i<3;i++){
 set('smp',sample);set('lv',['A','B','C'][i]);const jt=[.55,v.H/4,.15][i],expected=[(v.L+2*jt-v.S)/2,v.W+(i===0?.1:0)];
 for(const unit of ['mm','mil','in','mm']){set('unit',unit);const f={mm:1,mil:.0254,in:25.4}[unit],p=pads()[0];near(+p[3]*f,expected[0],'preset length');near(+p[4]*f,expected[1],'preset width');count++}
 const saved=d.getElementById('pads').value;for(const dec of [0,3,8]){set('pDec',dec);assert.equal(d.getElementById('pads').value,saved);count++}
}
set('pDec',3);set('package','axial');set('tExample','cfr25');set('tHT','P');set('man',false);
for(const shape of [0,1,2])for(const process of [0,1])for(const thickness of [.7,.8,.999999,1,2.35,2.350001,4,4.000001]){
 for(const[k,v]of Object.entries({tW:.73127,tW2:.29173,tS:shape,tPr:process,tB:thickness}))set(k,v);
 const lead=shape===0?.73127:shape===1?Math.hypot(.73127,.73127):Math.hypot(.73127,.29173),adj=process===0?0:thickness<.8?-.2:thickness<1?-.1:thickness<=2.35?0:thickness<=4?.1:.2,hole=lead+[[.15,.4],[.15,.4],[.1,.35]][shape][process]+adj,extra=hole<=1?.5:hole<=1.25?.75:hole<=1.75?1:hole<=2.25?1.25:1.5,p=pads()[0];near(+p[4],hole,'hole');near(+p[3],hole+extra,'pad');near(+p[1],-5.08,'pitch centre');count++;
}
// Optional table-based overrides, disabled overrides and package restoration.
set('tS',0);set('tW',.6);set('tPr',1);set('tB',1.6);set('man',true);for(const id of ['pHadd','pHadj','pPadd','pHole'])set(id,'');near(+pads()[0][4],1,'empty hole overrides');near(+pads()[0][3],1.5,'empty pad override');count++;
set('pHole',1.234567);set('pPadd',.456789);near(+pads()[0][4],1.234567,'manual hole');near(+pads()[0][3],1.691356,'manual pad');count++;
set('man',false);near(+pads()[0][4],1,'disabled hole');near(+pads()[0][3],1.5,'disabled pad');count++;
set('package','chip');set('smp','chip0805');set('Lmax',2.123456);const before=d.getElementById('pads').value;set('package','axial');set('package','chip');assert.equal(d.getElementById('pads').value,before,'chip draft restoration must preserve geometry');count++;
// Invalid required inputs cannot leave a stale valid footprint.
set('Lmax','');assert.equal(d.getElementById('pads').value,'');set('Lmax',2.123456);assert(pads().length===2);count++;
const result={standard:'IPC-7352 May 2023',references:['3.1.1 equations 3-1 to 3-3','3.1.4 equations 3-5 to 3-7, JH=0 for chip','Tables 3-3/3-4','Tables 4-1/4-2/4-3/4-4'],policy:'No intermediate rounding, per user instruction; thickness extreme adjustment uses disclosed maximum.',cases:count,maxNumericalError_mm:maxError,result:'PASS',new_defects:[]};console.log(JSON.stringify(result,null,2));w.close();
