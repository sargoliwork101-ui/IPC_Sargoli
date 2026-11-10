const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('IPC-7352/tool.html','utf8'),ctx={};vm.createContext(ctx);vm.runInContext(html.slice(html.indexOf('function ipcRound('),html.indexOf('function kit(')),ctx);
let count=0;
for(let n=1;n<=15;n++)for(const pitch of [.399,.4,.95])for(const dimension of ['Z','G','X']){
 const table='3-'+n,value=1.234567,expected=n===4&&dimension!=='Z'?value:n===1&&pitch<.4?1.235:1.23;assert.equal(ctx.ipcDimension(table,dimension,value,pitch),expected);count++;
}
for(const table of ['4-1','4-2','4-4','4-5','direct','courtyard']){assert.equal(ctx.ipcDimension(table,'diameter',1.234567,.3),1.234567);count++}
assert.throws(()=>ctx.ipcDimension('unknown','Z',1.234),/policy missing/);count++;
for(const [value,places,expected]of [[1.005,2,1.01],[1.015,2,1.02],[1.0049,2,1],[.0005,3,.001],[1.2345,3,1.235]]){assert.equal(ctx.ipcRound(value,places),expected);count++}
for(const [v,p,e]of [[1.005,2,101],[.145,2,15],[1.25,1,13]]){assert.equal(ctx.ipcNameCode(v,p),e);count++}
assert.equal(ctx.axisAlignedPadGap({x:0,y:0,w:1,h:1},{x:2,y:2,w:1,h:1},0,0),Math.SQRT2);count++;
console.log(JSON.stringify({result:'PASS',cases:count,scope:'All 15 SMD table policies; explicit TH/direct/courtyard policies; missing policy rejection; decimal ties; independent naming codes; exact diagonal clearance'},null,2));
