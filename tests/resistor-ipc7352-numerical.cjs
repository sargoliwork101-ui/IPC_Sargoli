/* Independent expectations transcribed from IPC-7352:2023 pp6–10,13,20–22.
 * IPC rounding of final SMD dimensions; no intermediate RSS rounding or invented TH rounding. */
const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('IPC-7352/tool.html','utf8'),{runScripts:'dangerously',url:'https://resistor-numerical.test/tool.html',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
const round2=v=>Number(v.toFixed(2));
let count=0;const observations=[];
function set(id,v){const e=d.getElementById(id);assert(e,id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
function pad(){const text=d.getElementById('pads').value;assert(text,d.getElementById('emptyReason').textContent);return text.trim().split('\n')[1].split(',')}
function near(a,b,label){assert(Math.abs(a-b)<1e-12,`${label}: ${a} vs ${b}`)}
function row(label){return [...d.querySelectorAll('#res tr')].find(r=>r.cells[0].textContent===label)?.cells[1].textContent}
function record(label,expected){count++;observations.push({case:label,expected,actual:pad().map((v,i)=>i===0?v:Number(v)||v)})}
set('component','resistor');set('package','chip');set('smp','chip');set('man',false);set('autoS',false);set('BW',0);set('bodyLength',0);
// Includes width boundary, small parts and height-limited vs capped nominal toe.
for(const v of [{L:3.4,S:1.9,W:1.8,H:1},{L:1.031,S:.51017,W:.5134,H:.24},{L:1.1,S:.6,W:.321,H:.2},{L:2,S:1,W:.5,H:3},{L:.6,S:.2,W:.2,H:.1}])for(let i=0;i<3;i++){
 set('lv',['A','B','C'][i]);for(const[k,x]of Object.entries({Lmin:v.L*.9,Lmax:v.L,Smax:v.S,W:v.W,H:v.H}))set(k,x);
 const jt=v.W>=.5?[.55,Math.min(v.H/4,.5),.15][i]:[v.H,v.H/2,v.H/4][i],js=v.W>=.5?[.05,0,0][i]:0,z=round2(v.L+2*jt),g=v.W<.5?v.S:round2(v.S),x=v.W<.5?v.W+2*js:round2(v.W+2*js),p=pad();
 near(+p[3],(z-g)/2,'chip length');near(+p[4],x,'chip width');near(+p[1],-(z+g)/4,'chip centre');record(`chip W=${v.W}, H=${v.H}, level ${i}`,{Z:z,G:g,X:x});
}
// Independent RSS example of section 3.1.1; no rounded intermediate values.
set('lv','B');for(const[k,v]of Object.entries({Lmin:5.8,Lmax:6.2,Tmin:.4,Tmax:1.27,W:.8,H:1,autoS:true}))set(k,v);
const S=(3.26+5.4+Math.hypot(.4,Math.SQRT2*.87))/2;near(+pad()[3],(6.7-round2(S))/2,'RMS chip');record('RMS 5.8/6.2 and .4/1.27',{S});
// Component envelope must still be enclosed when direct copper is smaller.
set('autoS',false);for(const[k,v]of Object.entries({Lmin:3,Lmax:3.4,Smax:1.9,W:1.8,H:1,BW:2.2,bodyLength:0,padBasis:'manufacturer',mfrL:.2,mfrW:.4,mfrSpan:2}))set(k,v);
assert.equal(row('Courtyard'),'3.900 mm × 2.700 mm','3.3: enclose max component as well as copper');record('chip direct small copper, max envelope 3.4×2.2',{courtyard:[3.9,2.7]});
set('component','resistor');set('package','axial');set('tExample','cfr25');set('tB',1.6);set('tHT','P');set('man',false);
for(const shape of [0,1,2])for(const process of [0,1]){
 for(const[k,v]of Object.entries({tS:shape,tW:.6,tW2:.3,tPr:process}))set(k,v);
 const effective=shape===0?.6:shape===1?Math.hypot(.6,.6):Math.hypot(.6,.3),hole=effective+[[.15,.4],[.15,.4],[.1,.35]][shape][process],extra=hole<=1?.5:hole<=1.25?.75:hole<=1.75?1:hole<=2.25?1.25:1.5;
 near(+pad()[4],hole,'TH hole');near(+pad()[3],hole+extra,'TH pad');record(`TH shape ${shape}, process ${process}`,{hole,pad:hole+extra});
}
// Table 4-4 exact thresholds, just below and just above: no thousandth pre-rounding.
set('man',true);set('pPadd','');for(const edge of [1,1.25,1.75,2.25])for(const delta of [-1e-10,0,1e-10]){
 const hole=edge+delta;set('pHole',hole);const extra=hole<=1?.5:hole<=1.25?.75:hole<=1.75?1:hole<=2.25?1.25:1.5;
 near(+pad()[3],hole+extra,'pad tier boundary');record(`TH tier ${edge}, delta ${delta}`,{hole,pad:hole+extra});
}
// IEEE-754 artifacts must not move exact decimal inputs into the next pad tier.
set('man',false);set('tS',0);set('tPr',1);set('tB',.7);
for(const [lead,hole,extra]of [[.8,1,.5],[1.05,1.25,.75],[1.55,1.75,1]]){
 set('tW',lead);near(+pad()[4],hole,'exact decimal hole');near(+pad()[3],hole+extra,'floating-point tier');record(`decimal boundary lead ${lead}, clearance .4-.2`,{hole,pad:hole+extra});
}
// Table 4-5: only hole sizing asserted here, not copper chosen for NPTH.
set('tHT','N');set('tS',2);set('tW',.6);set('tW2',.3);near(+pad()[4],Math.hypot(.6,.3)+.4,'NPTH hole');record('NPTH rectangular maximum diagonal',{hole:Math.hypot(.6,.3)+.4});
console.log(JSON.stringify({standard:'IPC-7352 May 2023',policy:'IPC-table final-dimension rounding; independent display precision',cases:count,observations},null,2));w.close();
