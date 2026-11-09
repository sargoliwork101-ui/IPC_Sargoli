/* Read-only observations. IPC-7352:2023 is the sole normative baseline.
 * This script reports discrepancies; it does not patch formulas or certify a design.
 * Run: node audits/review-7352-current.cjs
 */
const fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'../IPC-7352/tool.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ipc-audit.test/tool.html'}),w=dom.window,d=w.document;
function set(id,v){const e=d.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}));}
function sample(id){
 const pk=/^chip/.test(id)?'chip':id==='bga100'?'bga':id;
 const comp=pk==='chip'?'resistor':'ic';
 if(d.getElementById('component').value!==comp)set('component',comp);
 set('package',pk);
d.getElementById('tHT').value='P';d.getElementById('tTol').value='0.08';d.getElementById('tPr').value='1';d.getElementById('smp').value=id;d.getElementById('smp').onchange();set('man',false);set('lv','B')}
function row(name){return [...d.querySelectorAll('#res tr')].find(tr=>tr.cells[0].textContent===name)?.cells[1].textContent}
function csv(){return d.getElementById('pads').value.trim().split('\n').slice(1).map(s=>s.split(','))}
const findings=[];
sample('chip');set('W',.321);set('P',.5);findings.push({id:'A1',topic:'Table 3-4 toe-only rounding',actual_width_mm:+csv()[0][4],reference_before_independent_fabrication_rounding_mm:.321,reference:'Table 3-4 note 1, printed p10/PDF20'});
sample('bga100');set('bC',2);set('bR',2);set('bSkip','A2,B1');findings.push({id:'A2',topic:'diagonal circular-pad clearance',centres:csv().map(p=>[p[0],+p[1],+p[2]]),actual:row('گام / کمینه فاصلهٔ خالی'),expected_mm:Math.hypot(.8,.8)-.4,reference:'Euclidean geometry; clearance warning is an application addition, not an IPC equation'});
sample('chip');findings.push({id:'A3a',topic:'chip name from maximum instead of separate body size',actual:row('نام پیشنهادی'),nominal_1206_body_mm:[3.2,1.6],expected_size_token:'3216',reference:'Table 3-16, RESC+Body Length+Body Width…; printed p15/PDF25'});
sample('soic');set('fam','qfn');set('sides','4');set('n',4);set('Hl',.2);set('BW',4);set('bodyLength',6);set('Th',0);set('Th2',0);findings.push({id:'A3b',topic:'independent QFN body length is ignored in name',body_mm:[6,4],actual:row('نام پیشنهادی'),reference:'Table 3-16, body length X body width; printed p16/PDF26'});
sample('bga100');set('lv','A');findings.push({id:'A3c',topic:'checked suspicion: BGA fixed density suffix is allowed by the explicit exception',density:'A',actual:row('نام پیشنهادی'),expected_density_suffix:'N',result:'NOT A DEFECT: 3.4.3 explicitly excludes BGA from the M/N/L density variation',reference:'3.4.3 note, printed p16/PDF26'});
sample('bga100');set('bPX',.8);set('bPY',.6);findings.push({id:'A3d',topic:'dual pitch still generates a single-pitch name',actual:row('نام پیشنهادی'),pitch_mm:[.8,.6],reference:'Table 3-16 BGA w/Dual Pitch printed p14/PDF24'});
sample('soic');set('fam','qfn');set('Hl',.2);set('Th',2);set('Th2',1);set('pShape','o');d.getElementById('mkA').click();const thermal=d.querySelector('#svg rect[fill="#2c7a5b"]');findings.push({id:'A4',topic:'thermal pad SVG/Altium shape mismatch',svg_has_corner_radius:thermal?.hasAttribute('rx'),last_Altium_pad:d.getElementById('alt').value.split('\n').filter(s=>s.trim().startsWith('AddPad(')).at(-1),reference:'Application export consistency; IPC-7352 5.3 thermal pad context, printed p29/PDF39'});
sample('dip');set('tHT','F');set('man',true);set('pHole',1);set('tTol',.08);findings.push({id:'A5',topic:'press-fit accepts generic PTH tolerance without manufacturer tolerance',actual:row('سوراخ نهایی'),reference:'4.5, printed p21/PDF31, hole sizes AND tolerances provided by component manufacturer'});
sample('soic');set('fam','melf');set('autoS',false);set('Smax',3);set('W',2);findings.push({id:'A6',topic:'MELF effective contact width not distinct from diameter, reachable via custom',actual:row('X (عرض پد)'),zero_foot_width_case_mm:.7,reference:'Table 3-5 note 1, printed p10/PDF20; do not zero the body diameter for toe calculations'});
sample('bga100');set('bC',1);set('bR',44);const names=csv().map(p=>p[0]);findings.push({id:'A7',topic:'invalid identifiers on tall arrays',bad_identifiers:names.filter(n=>n.includes('undefined')),reference:'Software string-index bug; no claim that the source PDF defines a universal row alphabet'});
sample('dip');set('tHT','N');set('tS','0');set('tW',.5);findings.push({id:'L1',topic:'NPTH copper pad still calculated from PTH table',actual_hole:row('سوراخ نهایی'),actual_pad:row('پد'),reference:'4.6 NPTH vs 4.4.2/table 4-4 PTH; extra copper needs an explicit design choice'});
sample('dip');set('tS','1');set('tW',.5);set('tPr','0');findings.push({id:'OK1',topic:'previous square-pin diagonal correction still works',actual:row('سوراخ نهایی'),expected_mm:.86});
sample('dip');set('man',true);set('pHole',1.2);set('man',false);findings.push({id:'OK2',topic:'disabled hole override still ineffective',actual:row('سوراخ نهایی'),must_not_equal_mm:1.2});
sample('dip');findings.push({id:'A8',topic:'square TH pin-1 padstack uses rectangular r instead of square s',actual:row('نام Padstack'),reference:'5.1 and 5.2.1, printed pp25-26/PDF35-36: square s150h90, rectangle r200_100'});
set('pS','c');set('p1',1.5);set('p2',0);set('pH',-.9);findings.push({id:'A9',topic:'negative hole dimension is silently omitted by independent padstack builder',actual:d.getElementById('pOut').textContent,expected:'input validation error, not c150',reference:'Software validation issue; section 5 encodes the intended padstack structure'});
const anchors=['function smax','function rule','function smd','function bga','function thSlot','function th()','function validateFootprint','function renderReference','function nm','function ps','function dec','function altium'];
const locations=Object.fromEntries(anchors.map(s=>[s,html.slice(0,html.indexOf(s)).split('\n').length]));
console.log(JSON.stringify({baseline:'IPC-7352 May 2023; user-supplied PDF',observations:findings,code_lines:locations},null,2));w.close();
