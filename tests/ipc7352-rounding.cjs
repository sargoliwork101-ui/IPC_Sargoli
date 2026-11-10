/* Explicit independent numerical examples of IPC rounding, not imported models. */
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM,VirtualConsole}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('IPC-7352/tool.html','utf8'),{runScripts:'dangerously',url:'https://ipc-rounding.test/tool.html',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
function set(id,v){let e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))}
function p(){let text=d.getElementById('pads').value;assert(text,d.getElementById('emptyReason').textContent);return text.trim().split('\n')[1].split(',').map(Number)}
function near(a,b){assert(Math.abs(a-b)<1e-12,`${a} != ${b}`)}
const cases=[];
for(const component of ['resistor','capacitor','inductor']){
 set('component',component);set('package','chip');set('smp','chip');set('lv','B');set('man',false);for(let[k,v]of Object.entries({Lmin:.95,Lmax:1.031,Smax:.51017,W:.5134,H:.2412,P:.5}))set(k,v);
 near(p()[3],.32);near(p()[4],.51);const standard=d.getElementById('pads').value;set('P',.3);assert.equal(d.getElementById('pads').value,standard);for(const dec of [0,3,8]){set('pDec',dec);assert.equal(d.getElementById('pads').value,standard)}
 cases.push({component,table:'3-3',raw:{Z:1.1516,G:.51017,X:.5134},IPC:{Z:1.15,G:.51,X:.51},pad:[p()[3],p()[4]]});
 for(let[k,v]of Object.entries({Lmax:1.10327,Smax:.60123,W:.32147,H:.21347}))set(k,v);
 near(p()[3],.359385);near(p()[4],.32147);near(-p()[1],.4803075);cases.push({component,table:'3-4 note 1',raw:{Z:1.31674,G:.60123,X:.32147},IPC:{Z:1.32,G:.60123,X:.32147},pad:[p()[3],p()[4]]});
}
set('component','capacitor');set('package','electrolytic');d.getElementById('leaveReference').click();d.getElementById('previewPackage').click();for(let[k,v]of Object.entries({lv:'B',Lmin:6,Lmax:6.3037,Smax:3.8017,W:.6137,H:9.9999}))set(k,v);near(p()[3],1.75);near(p()[4],1.41);cases.push({component:'capacitor',table:'3-14 below 10',IPC:{Z:7.30,G:3.80,X:1.41},pad:[p()[3],p()[4]]});set('H',10);near(p()[3],1.95);near(p()[4],1.61);cases.push({component:'capacitor',table:'3-14 at 10',IPC:{Z:7.70,G:3.80,X:1.61},pad:[p()[3],p()[4]]});
// Show that the .001-pitch exception is confined to table 3-1.
set('component','ic');set('package','soic');set('smp','soic');set('autoS',false);for(let[k,v]of Object.entries({Lmin:5.8,Lmax:6.2034,Smax:4.9817,W:.5134,P:.3}))set(k,v);near(p()[3],1.3105);near(p()[4],.573);cases.push({component:'IC control',table:'3-1 note 4',IPC:{Z:6.903,G:4.282,X:.573}});
// Direct dimensions are not IPC-calculated dimensions and must not be quantized.
set('component','resistor');set('package','chip');set('smp','chip');for(let[k,v]of Object.entries({padBasis:'manufacturer',mfrL:.32147,mfrW:.51347,mfrSpan:1.23457}))set(k,v);near(p()[3],.32147);near(p()[4],.51347);
// Section 4 has no generic two-decimal round-off instruction.
set('package','axial');set('tExample','cfr25');set('tS',1);set('tW',.6);near(p()[4],Math.SQRT2*.6+.4);near(p()[3],Math.SQRT2*.6+.4+.75);
console.log(JSON.stringify({result:'PASS',cases,extraChecks:['display precision cannot change IPC geometry','table 3-1 exception not applied to chip','direct dimensions preserved','TH no invented generic rounding']},null,2));w.close();
