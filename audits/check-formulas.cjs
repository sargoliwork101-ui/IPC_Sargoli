/* Read-only audit of baseline calculator, not a conformity certificate.
 * Run: node audits/check-formulas.cjs
 * Reference: IPC-7352 May 2023, user-supplied PDF, printed pp. 7–13,19–22.
 * Observations intentionally report known defects instead of changing the tool.
 */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'../IPC-7352/tool.html'),'utf8');
const a=html.indexOf('function smax('),b=html.indexOf('function kit(',a);
if(a<0||b<0)throw Error('Formula anchors not found');
const ctx={};vm.createContext(ctx);vm.runInContext(html.slice(a,b),ctx);
console.log('7352 example Smax RMS:',ctx.smax(5.8,6.2,.4,1.27));
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ipc-audit.test/tool.html'}),w=dom.window,d=w.document;
function set(id,v){let e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}))}
function sample(v){d.getElementById('smp').value=v;d.getElementById('smp').onchange()}
function row(name){let tr=[...d.querySelectorAll('#res tr')].find(tr=>tr.cells[0].textContent===name);return tr?.cells[1].textContent}
const observations=[];
sample('dip');set('tS','1');set('tW',.5);set('tPr','0');observations.push({case:'square pin, side .5 finite',actual:row('سوراخ نهایی'),expected_mm:Math.round((Math.SQRT2*.5+.15)*100)/100});
sample('dip');set('tS','2');set('tW',.5);set('tW2',.3);set('tPr','0');observations.push({case:'rectangle .5 × .3 finite',actual:row('سوراخ نهایی'),expected_mm:Math.round((Math.hypot(.5,.3)+.1)*100)/100});
const first=row('سوراخ نهایی');set('tW2',.8);observations.push({case:'change rectangle second side .3 → .8',before:first,after:row('سوراخ نهایی'),expected_mm:Math.round((Math.hypot(.5,.8)+.1)*100)/100});
sample('dip');set('man',true);set('pHole',1.2);set('man',false);observations.push({case:'hole override switched off',actual:row('سوراخ نهایی'),expected_current_automatic_mm:.87,note:'Even before fixing the missing rectangle diagonal, current automatic branch should produce .52+.35=.87, not retained 1.2.'});
sample('soic');set('fam','melf');set('autoS',false);set('Smax',3);set('W',2);observations.push({case:'MELF assumed zero foot width, diameter 2, level B',actual:row('X (عرض پد)'),expected_apex_based_mm:.7,note:'Table 3-5 note 1. Separate effective foot width from diameter.'});
sample('chip');set('W',.321);set('P',.5);observations.push({case:'Table 3-4 toe-only rounding; W=.321, pitch=.5',actual:row('X (عرض پد)'),csv_width:d.getElementById('pads').value.split('\n')[1]?.split(',')[4],expected_width_mm:.321});
// Independent geometry check; this is the exact expression currently used for round BGA pads.
observations.push({case:'two diagonal BGA balls dx=dy=.8, diameter=.4',current_clearance_mm:Math.max(.8-.4,.8-.4),geometric_clearance_mm:Math.hypot(.8,.8)-.4});
console.log(JSON.stringify(observations,null,2));w.close();
