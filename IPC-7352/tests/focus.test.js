// Run with: node IPC-7352/tests/focus.test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
class Element {
  constructor(value='') { this.value=String(value); this.hidden=false; this.textContent=''; this.children=[]; this.listeners={}; this.attrs={}; }
  set value(v) { this._value=String(v); }
  get value() { return this._value; }
  addEventListener(name,fn) { (this.listeners[name] ||= []).push(fn); }
  emit(name='input') { for (const fn of this.listeners[name] || []) fn(); }
  appendChild(node) { this.children.push(node); }
  replaceChildren() { this.children=[]; }
  setAttribute(k,v) { this.attrs[k]=String(v); }
  focus() {} select() {}
}
const defaults={fpKind:'sot',fpLevel:'B',fpStyle:'gull',fpGap:'0.15'};
const names=['fpKind','fpLevel','fpStyle','fpGap','fpLmin','fpLmax','fpTmin','fpTmax','fpW','fpH','fpBodyX','fpBodyY','fpPitch','fpS','fpStyleBox','fpPitchBox','fpError','fpOutput','fpResults','fpCsv','fpSvg','fpCopy','fpCopyStatus'];
const nodes=Object.fromEntries(names.map(name=>[name,new Element(defaults[name]||'')]));
const document={getElementById:id=>nodes[id],createElement:()=>new Element(),createElementNS:()=>new Element()};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../focus.js'),'utf8'),{document,navigator:{},console});
function input(id,value,event='input'){nodes[id].value=String(value);nodes[id].emit(event);}
function csv(){return nodes.fpCsv.value.trim().split('\n').slice(1).map(row=>row.split(','));}
function results(){return nodes.fpResults.children.map(row=>row.children.map(c=>c.textContent).join(' ')).join('\n');}
assert.equal(nodes.fpOutput.hidden,false);
let pads=csv();assert.equal(pads.length,3);assert.deepEqual(pads.map(p=>p[0]),['1','2','3']);
assert(+pads[0][1]<0 && +pads[1][1]>0 && +pads[2][1]===0 && +pads[0][2]<0 && +pads[2][2]>0);
assert(results().includes('جدول 3-1'));
assert(results().includes('3.7000 / 1.5700 / 0.5600'));
assert(results().includes('3.5000 × 4.2000'));
input('fpBodyY','2.5');assert(results().includes('0.3500 / 0.1500 / 0.0300'));
input('fpBodyY','1.5');
input('fpStyle','flat');assert(results().includes('جدول 3-15'));
input('fpPitch','0.2');assert.equal(nodes.fpOutput.hidden,true);assert.equal(nodes.fpCsv.value,'');
input('fpPitch','0.95');assert.equal(nodes.fpOutput.hidden,false);
input('fpLmin','');assert.equal(nodes.fpOutput.hidden,true);assert.equal(nodes.fpCsv.value,'');
input('fpLmin','2.8');input('fpS','9');assert.equal(nodes.fpOutput.hidden,true);
input('fpS','2');assert.equal(nodes.fpOutput.hidden,false);assert(results().includes('مستقیم'));
input('fpKind','res','change');pads=csv();assert.equal(pads.length,2);assert(+pads[0][1]<0 && +pads[1][1]>0);assert(results().includes('جدول 3-3'));
assert(results().includes('1.9300 / 1.2300 / 0.8500'));
input('fpW','0.499');assert(results().includes('جدول 3-4'));
input('fpW','0.5');assert(results().includes('جدول 3-3'));
input('fpW','0.4');assert(results().includes('جدول 3-4'));
input('fpBodyX','6');assert(results().includes('6.3000'));
input('fpTmin','0.8');assert.equal(nodes.fpOutput.hidden,true);assert.equal(nodes.fpCsv.value,'');
console.log('PASS focus: SOT-23 and 0603 geometry, rules, validation and stale-output clearing');
