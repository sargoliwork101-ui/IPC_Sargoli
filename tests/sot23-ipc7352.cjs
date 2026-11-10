/* Formula-only independent SOT-23 audit: IPC-7352 3.1, table 3-1, notes 3/4/5, section 3.3.
 * The PDF's conflicting printed G sign is not an official erratum: inner-minus follows its prose. */
const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('IPC-7352/tool.html','utf8'),{runScripts:'dangerously',url:'https://sot-audit.test/tool.html',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
function set(id,v){let e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
function pads(){let s=d.getElementById('pads').value;assert(s,d.getElementById('emptyReason').textContent);return s.trim().split('\n').slice(1).map(s=>s.split(','))}
function near(a,b){assert(Math.abs(a-b)<1e-11,`${a} != ${b}`)}
function row(k){return [...d.querySelectorAll('#res tr')].find(r=>r.cells[0].textContent===k)?.cells[1].textContent}
let count=0;const examples=[];
const layouts=[['sot23','sot23',3],['sot23-5','ti-db5',5],['sot23-6','ti-db6',6]];
for(const [pkg,sample,n]of layouts){
 set('component',n===3?'transistor':'ic');set('package',pkg);set('smp',sample);set('padBasis','ipc');set('man',false);set('autoS',false);
 for(const pitch of [.399,.4,.401,.95])for(const conditional of [false,true])for(let i=0;i<3;i++){
  const S=1.80317,L=3.00317,W=.47317,jt=[.55,.35,.15][i],jh=(conditional?[.25,.15,.05]:[.45,.35,.25])[i],js=[.05,.03,0][i],digits=pitch<.4?3:2;
  for(const[k,v]of Object.entries({lv:['A','B','C'][i],P:pitch,Lmin:2.8,Lmax:L,Smax:S,W,H:1.13,Amax:conditional?S:1.7,BW:1.7,bodyLength:3.1}))set(k,v);
  const round=v=>Number(v.toFixed(digits)),Z=round(L+2*jt),G=round(S-2*jh),X=round(W+2*js),pl=(Z-G)/2,c=(Z+G)/4,p=pads();assert.equal(p.length,n);p.forEach(q=>{near(+q[3],pl);near(+q[4],X)});
  const y=n===3?[pitch/2,-pitch/2,0]:n===5?[pitch,0,-pitch,-pitch,pitch]:[pitch,0,-pitch,-pitch,0,pitch];p.forEach((q,j)=>{assert.equal(+q[0],j+1);near(+q[1],j<(n===3?2:3)?-c:c);near(+q[2],y[j])});
  assert(d.getElementById('res').textContent.includes('جدول 3-1'));assert(!d.getElementById('res').textContent.includes('undefined'));count++;
  if(pitch===.4&&i===1)examples.push({pins:n,pitch,conditional,Z,G,X,padLength:pl});
 }
 // RSS check independent of solver's smax function.
 set('P',.95);set('lv','B');set('Amax',1.3);for(const[k,v]of Object.entries({autoS:true,Lmin:2.6,Lmax:3,Tmin:.3,Tmax:.6,W:.5}))set(k,v);
 const S=(1.4+2.4+Math.hypot(.4,Math.SQRT2*.3))/2,G=Number((S-.7).toFixed(2));near(+pads()[0][3],(3.7-G)/2);count++;
 for(const unit of ['mil','in','mm']){const before=pads();set('unit',unit);const factor={mil:.0254,in:25.4,mm:1}[unit];near(+pads()[0][3]*factor,(3.7-G)/2);count++}
 const csv=d.getElementById('pads').value;for(const dec of [0,3,8]){set('pDec',dec);assert.equal(d.getElementById('pads').value,csv);count++}
 d.getElementById('mkA').click();const lines=d.getElementById('alt').value.split('\n').filter(l=>l.trim().startsWith('AddPad('));assert.equal(lines.length,n);count++;
}
// Known diagonal-spacing bug: compare real copper boundaries, not L-infinity box distance.
set('component','transistor');set('package','sot23');set('smp','sot23');for(const[k,v]of Object.entries({autoS:false,lv:'B',Lmax:3,Smax:1.8,W:.5,H:1,P:1.9,Amax:1.7,pShape:'r',pDec:3}))set(k,v);
let actual=Number(row('گام / کمینه فاصلهٔ خالی واقعی پدها').split('/')[1]);near(actual,Number(Math.hypot(1.1,.39).toFixed(3)));count++;
set('pShape','o');actual=Number(row('گام / کمینه فاصلهٔ خالی واقعی پدها').split('/')[1]);near(actual,1.34);count++;
set('lv','A');set('Smax',.2);assert.equal(d.getElementById('pads').value,'');assert(d.getElementById('emptyReason').textContent.includes('G'));count++;
// Frozen nominal direct geometry is not silently turned into an IPC result.
set('component','ic');set('package','sot23-5');set('smp','ti-db5');set('mfrL',1.10317);set('mfrW',.61317);near(+pads()[0][3],1.10317);near(+pads()[0][4],.61317);count++;
console.log(JSON.stringify({standard:'IPC-7352 May 2023',cases:count,result:'PASS',examples,notes:['G minus follows the explicit inner-dimension prose; PDF printed plus remains contradictory','pin topology checked against selected 3/5/6 layout, not a universal manufacturer pinout','P in three-pin layout is spacing of the left pair; P in 5/6 is adjacent pitch']},null,2));w.close();
