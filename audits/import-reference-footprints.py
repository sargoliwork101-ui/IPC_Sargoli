"""Regenerate the embedded, offline reference-pad data from attributed KiCad originals.
No network access or third-party Python dependency. Run from the repository root.
"""
import json,re,pathlib
manifest=json.loads(pathlib.Path('IPC-7352/reference-footprints/manifest.json').read_text())
def parse(text):
 tokens=re.findall(r'"(?:\\.|[^"\\])*"|[()]|[^\s()]+',text);stack=[];root=None
 for t in tokens:
  if t=='(':
   x=[]
   if stack:stack[-1].append(x)
   else:root=x
   stack.append(x)
  elif t==')':stack.pop()
  else:stack[-1].append(json.loads(t) if t.startswith('"') else t)
 return root
def field(n,key,default=None):return next((v[1:] for v in n if isinstance(v,list) and v[0]==key),default)
refs={}
for key,meta in manifest.items():
 node=parse(pathlib.Path(meta['file']).read_text());pads=[];lines=[];circles=[]
 for n in node:
  if not isinstance(n,list):continue
  if n[0]=='pad':
   layers=field(n,'layers',[])
   if not any('Cu' in v for v in layers):continue
   at=list(map(float,field(n,'at',[0,0])));size=list(map(float,field(n,'size')));drill=field(n,'drill',[]);shape={'rect':'r','roundrect':'rr','circle':'c','oval':'o','custom':'poly'}[n[3]]
   p={'n':str(n[1]),'x':at[0],'y':-at[1],'w':size[0],'h':size[1],'sh':shape,'rotation':at[2] if len(at)>2 else 0,'hole':0,'pl':n[2]!='np_thru_hole'}
   if shape=='rr':p['radius']=float(field(n,'roundrect_rratio',[.25])[0])*min(size)
   if shape=='poly':
    prim=field(n,'primitives',[]);polys=[a for a in prim if isinstance(a,list) and a[0]=='gr_poly'];assert len(polys)==1
    p['polygon']=[[float(x[1]),-float(x[2])] for x in field(polys[0],'pts')]
   if drill:
    if drill[0]=='oval':p.update(holeType='slot',holeL=float(drill[1]),holeW=float(drill[2]),hole=min(float(drill[1]),float(drill[2])))
    else:p['hole']=float(drill[0])
   pads.append(p)
  elif n[0]=='fp_line' and field(n,'layer',[''])[0]=='F.Fab':
   a=list(map(float,field(n,'start')));b=list(map(float,field(n,'end')));lines.append([a[0],-a[1],b[0],-b[1]])
  elif n[0]=='fp_circle' and field(n,'layer',[''])[0]=='F.Fab':
   a=list(map(float,field(n,'center')));b=list(map(float,field(n,'end')));circles.append([a[0],-a[1],((b[0]-a[0])**2+(b[1]-a[1])**2)**.5])
 refs[key]={'name':node[1],'path':meta['path'],'sha':meta['sha'],'description':field(node,'descr',[''])[0],'pads':pads,'lines':lines,'circles':circles}
assert refs
page=pathlib.Path('IPC-7352/tool.html')
html=page.read_text()
data=json.dumps(refs,separators=(',',':'),ensure_ascii=False).replace('</','<\\/')
html,count=re.subn(r'(<script id="referenceFootprintData" type="application/json">).*?(</script>)',lambda m:m[1]+data+m[2],html,count=1,flags=re.S)
assert count==1
page.write_text(html)
print('Embedded',len(refs),'references;',sum(len(r['pads']) for r in refs.values()),'pads')
