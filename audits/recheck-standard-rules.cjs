/* Independent table-value checks for the current implementation, not certification.
 * Source: IPC-7352 May 2023, Tables 3-1...3-10, 3-12, 3-14, 3-15.
 * Run: node audits/recheck-standard-rules.cjs
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('IPC-7352/tool.html','utf8');
const code=html.slice(html.indexOf('function smax('),html.indexOf('function kit('));
const {rule,smax}=new Function(code+';return {rule,smax}')();
const cases=[
 ['gull',.6,1,.2,[[.55,.45,.05,.5],[.35,.35,.03,.25],[.15,.25,0,.1]]],
 ['jlead',.6,1,.2,[[.55,.1,.05,.5],[.35,0,.03,.25],[.15,0,.01,.1]]],
 ['chip',.6,1,.2,[[.55,0,.05,.5],[.25,0,0,.25],[.15,0,0,.1]]],
 ['chip',.4,1,.2,[[1,0,0,.2],[.5,0,0,.15],[.25,0,0,.1]]],
 ['melf',2,1,.2,[[1,.2,.55,.5],[.4,.1,.35,.25],[.2,.02,.15,.1]]],
 ['conc',.6,1,.2,[[.65,.25,.05,.5],[.45,.15,0,.25],[.45,.05,0,.1]]],
 ['butt',.6,1,.2,[[1,1,1,1.5],[.8,.8,.8,.8],[.6,.6,.6,.2]]],
 ['inl',.6,1,.2,[[.8,.25,.01,.5],[.5,.15,0,.25],[.2,.07,0,.1]]],
 ['lug',.6,1,.2,[[.05,.05,.05,.5],[.03,.03,.03,.25],[.01,.01,.01,.1]]],
 ['qfn',.6,1,.2,[[.24,0,0,.5],[.22,0,0,.25],[.2,0,0,.1]]],
 ['pull',.6,1,.2,[[.05,.05,.05,.5],[0,0,0,.25],[0,0,0,.1]]],
 ['alc',.6,9,.2,[[.7,0,.5,1],[.5,0,.4,.5],[.3,0,.3,.25]]],
 ['alc',.6,10,.2,[[1,0,.6,1],[.7,0,.5,.5],[.4,0,.4,.25]]],
 ['sof',.6,1,.2,[[.3,0,.05,.2],[.2,0,0,.15],[.1,0,0,.1]]]
];
let count=0;
for(const [family,width,height,leadHeight,expected] of cases)for(let i=0;i<3;i++){
 const actual=rule(family,i,width,height,leadHeight);
 for(let j=0;j<4;j++)assert(Math.abs(actual[j]-expected[i][j])<1e-10,`${family}/${i}/${j}: ${actual[j]} vs ${expected[i][j]}`);
 count++;
}
// RMS is checked through the separate end-to-end observations; this isolates table lookups.
console.log(`${count} table/condition/density cases PASS (4 coefficients each); not a conformity certificate.`);
