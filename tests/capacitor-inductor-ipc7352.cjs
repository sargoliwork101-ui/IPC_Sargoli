/* IPC-7352 May 2023: independently transcribed expectations, not calls to rule()/smax(). */
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('IPC-7352/tool.html','utf8'),dom=new JSDOM(html,{runScripts:'dangerously',url:'https://cap-ind-audit.test/tool.html',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
const round2=v=>Number(v.toFixed(2));
let count=0,maxError=0;const details=[];
function set(id,v){const e=d.getElementById(id);assert(e,id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
function pads(){const s=d.getElementById('pads').value;assert(s,d.getElementById('emptyReason').textContent);return s.trim().split('\n').slice(1).map(r=>r.split(','))}
function near(a,b,label){const e=Math.abs(a-b);maxError=Math.max(e,maxError);assert(e<1e-11*Math.max(1,Math.abs(b)),`${label}: ${a} != ${b}`)}
function row(label){return [...d.querySelectorAll('#res tr')].find(r=>r.cells[0].textContent===label)?.cells[1].textContent}
function check(label){count++;if(label)details.push(label)}
function chip(component){set('component',component);set('package','chip');set('smp','chip');set('man',false);set('autoS',false)}
for(const component of ['capacitor','inductor']){
 chip(component);
 for(const width of [.2,.499999,.5,.500001,1.25])for(const height of [.1,1.999999,2,2.000001])for(let i=0;i<3;i++){
  for(const[k,v]of Object.entries({lv:['A','B','C'][i],Lmin:2,Lmax:2.34567,Smax:.789123,W:width,H:height,nameBodyL:2,nameBodyW:1.25}))set(k,v);
  const jt=width<.5?[height,height/2,height/4][i]:[.55,Math.min(height/4,.5),.15][i],js=width>=.5&&i===0?.05:0,p=pads();assert.equal(p.length,2);const z=round2(2.34567+2*jt),g=width<.5?.789123:round2(.789123),x=width<.5?width:round2(width+2*js);near(+p[0][3],(z-g)/2,'chip length');near(+p[0][4],x,'chip width');near(+p[1][1],-Number(p[0][1]),'symmetry');assert.equal(row('نام پیشنهادی'),(component==='capacitor'?'CAPC':'INDC')+'2013X'+Math.round(height*100)+['M','N','L'][i]);check();
 }
 // Three educational sizes × levels; unit conversion and display-only precision.
 for(const sample of ['chip','chip0805','chip0603'])for(const level of ['A','B','C']){
  set('smp',sample);set('lv',level);const baseline=pads().map(p=>p.slice(1).map(Number)),raw=d.getElementById('pads').value;
  for(const unit of ['mil','in','mm']){set('unit',unit);const f={mm:1,mil:.0254,in:25.4}[unit];pads().forEach((p,j)=>p.slice(1).forEach((v,k)=>near(Number(v)*f,baseline[j][k],'unit')));check()}
  for(const dec of [0,3,8]){set('pDec',dec);assert.equal(d.getElementById('pads').value,raw);check()}
 }
 set('unit','mm');set('smp','chip');d.getElementById('mkA').click();assert(d.getElementById('alt').value.includes(component==='capacitor'?'CAPC':'INDC'));assert(d.getElementById('alt').value.includes(String(Number(pads()[0][3]))));check(component+' Altium name and copper');
 set('pDec',3);set('smp','chip');set('lv','B');for(const[k,v]of Object.entries({autoS:true,Lmin:5.8,Lmax:6.2,Tmin:.4,Tmax:1.27,W:.8,H:1}))set(k,v);
 const s=(3.26+5.4+Math.hypot(.4,Math.SQRT2*.87))/2;near(+pads()[0][3],(6.7-round2(s))/2,'RMS');check(component+' RMS');
}
// Entire table 3-14: below/at/above height 10, all density levels.
set('component','capacitor');set('package','electrolytic');d.getElementById('leaveReference').click();d.getElementById('previewPackage').click();assert.equal(pads().length,2,'electrolytic demo must have two terminals, not eight');check('electrolytic two-pad demo');
for(const h of [9.999999,10,10.000001])for(let i=0;i<3;i++){
 for(const[k,v]of Object.entries({lv:['A','B','C'][i],Lmin:6,Lmax:6.3,Smax:3.8,W:.6,H:h,BW:6.6,bodyLength:6.6,nameBase:6.6}))set(k,v);
 const jt=(h<10?[.7,.5,.3]:[1,.7,.4])[i],js=(h<10?[.5,.4,.3]:[.6,.5,.4])[i],ce=[1,.5,.25][i],p=pads()[0],z=6.3+2*jt;near(+p[3],(z-3.8)/2,'alc length');near(+p[4],.6+2*js,'alc width');assert.equal(row('Courtyard'),(Math.max(z,6.6)+2*ce).toFixed(3)+' mm × '+(6.6+2*ce).toFixed(3)+' mm');assert.equal(row('نام پیشنهادی'),'CAPAE660X'+Math.round(h*100)+['M','N','L'][i]);check({case:'table 3-14',H:h,level:['A','B','C'][i],Z:z,G:3.8,X:.6+2*js,CE:ce});
}
d.getElementById('mkA').click();assert(d.getElementById('alt').value.includes('CAPAE660X1000L'));check('electrolytic Altium CAPAE name');
let raw=d.getElementById('pads').value;set('nameBase',7.3);assert.equal(d.getElementById('pads').value,raw);assert(row('نام پیشنهادی').startsWith('CAPAE730'));check('name input never changes copper');
set('nameBase',0);assert.equal(row('نام پیشنهادی'),'—');check('unknown base never guessed for CAPAE');
set('n',2);assert.equal(d.getElementById('pads').value,'');set('n',1);assert.equal(pads().length,2);check('multi-terminal alc rejected');
// Capacitor THT radial routes, all body shapes, both polarities, all pin cross-sections/processes.
set('component','capacitor');set('package','radial');d.getElementById('leaveReference').click();d.getElementById('previewPackage').click();set('tB',1.6);set('man',false);
for(const model of ['radial-d','radial-r','radial-disc'])for(const polar of ['no','yes'])for(const shape of [0,1,2])for(const process of [0,1]){
 for(const[k,v]of Object.entries({tModel:model,tPolar:polar,tS:shape,tPr:process,tP:2,tW:.6,tW2:.3,tBodyL:5,tBodyD:4,tBodyH:6}))set(k,v);
 const lead=shape===0?.6:shape===1?Math.hypot(.6,.6):Math.hypot(.6,.3),hole=lead+[[.15,.4],[.15,.4],[.1,.35]][shape][process],extra=hole<=1?.5:hole<=1.25?.75:hole<=1.75?1:hole<=2.25?1.25:1.5,p=pads()[0];near(+p[4],hole,'radial hole');near(+p[3],hole+extra,'radial pad');near(+p[1],-1,'pitch');
 const expected=model==='radial-d'?(polar==='yes'?'CAPPRD':'CAPRD')+'200W60D400H600B':polar==='yes'?'CUSTOM_'+model+'_200':(model==='radial-r'?'CAPRR':'CAPRB')+'200W60L500T400H600B';assert.equal(row('نام پیشنهادی Land Pattern'),expected);check();
}
// Inclusive pad tiers with optional override blank in capacitor route.
set('tModel','radial-d');set('man',true);set('pPadd','');for(const edge of [1,1.25,1.75,2.25])for(const delta of [-1e-10,0,1e-10]){
 const hole=edge+delta;set('pHole',hole);const extra=hole<=1?.5:hole<=1.25?.75:hole<=1.75?1:hole<=2.25?1.25:1.5;near(+pads()[0][3],hole+extra,'tier');check();
}
set('man',false);
// Every reference pad: compare imported fields to the actual committed KiCad S-expression.
function sexp(text){let tokens=text.match(/"(?:\\.|[^"\\])*"|\(|\)|[^\s()]+/g),i=0;function parse(){let t=tokens[i++];if(t==='('){let a=[];while(tokens[i]!==')')a.push(parse());i++;return a}return t.startsWith('"')?JSON.parse(t):t}return parse()}
const refs=JSON.parse(d.getElementById('referenceFootprintData').textContent),inventory=[];
for(const component of ['capacitor','inductor']){
 set('component',component);const packages=[...d.getElementById('package').options].map(o=>o.value);
 for(const pk of packages){set('package',pk);const opts=[...d.getElementById('smp').options].filter(o=>o.value.startsWith('lib-')&&refs[o.value.slice(4)]&&!refs[o.value.slice(4)].direct);
  inventory.push({component,package:pk,referenceModels:opts.map(o=>o.value),mode:pk==='chip'?'IPC tables 3-3/3-4':pk==='electrolytic'?'reference plus configurable IPC table 3-14':pk==='radial'?'reference plus configurable section 4':pk==='dfn-polar'?'direct geometry only':'reference geometry only'});
  for(const opt of opts){set('smp',opt.value);const ref=refs[pk],tree=sexp(fs.readFileSync('IPC-7352/reference-footprints/'+pk+'.kicad_mod','utf8')),source=tree.filter(a=>Array.isArray(a)&&a[0]==='pad'),p=pads();assert.equal(p.length,source.length);assert.equal(p.length,ref.pads.length);
   source.forEach((sp,j)=>{const at=sp.find(a=>Array.isArray(a)&&a[0]==='at'),size=sp.find(a=>Array.isArray(a)&&a[0]==='size'),ip=ref.pads[j];assert.equal(ip.n,String(sp[1]));near(ip.x,Number(at[1]),'source x');near(ip.y,-Number(at[2]),'source y');near(ip.w,Number(size[1]),'source width');near(ip.h,Number(size[2]),'source height');const drill=sp.find(a=>Array.isArray(a)&&a[0]==='drill');near(ip.hole,drill?Number(drill[1]):0,'source hole');near(ip.rotation,Number(at[3]||0),'source rotation');assert.equal(ip.sh,{rect:'r',circle:'c',roundrect:'rr',oval:'o'}[sp[3]]);if(ip.sh==='rr'){const ratio=sp.find(a=>Array.isArray(a)&&a[0]==='roundrect_rratio');near(ip.radius,Math.min(Number(size[1]),Number(size[2]))*Number(ratio[1]),'corner radius')}near(+p[j][1],ip.x,'CSV x');near(+p[j][2],ip.y,'CSV y');near(+p[j][3],ip.w,'CSV width');near(+p[j][4],ip.h,'CSV height')});check('all pads of '+component+'/'+pk);
   const before=d.getElementById('pads').value;set('lv','A');set('lv','C');assert.equal(d.getElementById('pads').value,before,'reference is not an IPC density solver');check();
  }
 }
}
// Direct polar DFN: explicit final dimensions, not a claimed table-3-10 calculation.
set('component','capacitor');set('package','dfn-polar');for(const[k,v]of Object.entries({dmName:'audit CAPPDFN geometry',dmCount:1,dmPitch:1,dmSpan:3,dmPadW:.7,dmPadH:.9,dmBodyW:2,dmBodyH:2,dmHole:0}))set(k,v);d.getElementById('buildDirectModel').click();assert.equal(pads().length,2);near(+pads()[0][3],.7,'direct width');near(+pads()[0][4],.9,'direct height');check('CAPPDFN direct geometry, no IPC claim');
const result={standard:'IPC-7352 May 2023',cases:count,maxNumericalError_mm:maxError,result:'PASS',scope:inventory,details};console.log(JSON.stringify(result,null,2));w.close();
