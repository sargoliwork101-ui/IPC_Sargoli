"""Build offline, labelled SVG input illustrations. Not a footprint generator or IPC rule."""
from pathlib import Path
import re,html
page=Path('IPC-7352/usage.html');s=page.read_text()
s=re.sub(r'<figure class="datasheet-figure".*?</figure>','',s,flags=re.S)
style='.datasheet-figure{margin:16px 0;padding:12px;background:#09121b;border:1px solid #35566c;border-radius:12px}.datasheet-figure svg{display:block;width:100%;height:auto;max-height:310px}.datasheet-figure figcaption{font-size:14px;line-height:1.9}.diagram-note{color:#f0b968}.datasheet-figure[hidden]{display:none!important}'
if '.datasheet-figure{' not in s:s=s.replace('</style>',style+'</style>')
def rect(x,y,w,h,fill='#354858',rx=0):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="#9cb2c3"/>'
def circ(x,y,r,fill='#cfac58'):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="#a8c6d6"/>'
def line(x1,y1,x2,y2,stroke='#5c819b',dash='3 4'):return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-dasharray="{dash}"/>'
def dim(a,b,label,vertical=False):
 x1,y1=a;x2,y2=b
 if vertical:
  x=530;out=line(x1,y1,x,y1)+line(x2,y2,x,y2);p=(x,y1,x,y2);tx,ty=x+15,(y1+y2)/2;transform=f' transform="rotate(90 {tx} {ty})"'
 else:
  y=55;out=line(x1,y1,x1,y)+line(x2,y2,x2,y);p=(x1,y,x2,y);tx,ty=(x1+x2)/2,35;transform=''
 out+=f'<line data-measurement="true" x1="{p[0]}" y1="{p[1]}" x2="{p[2]}" y2="{p[3]}" stroke="#65dfcf" stroke-width="3" marker-start="url(#input-arrow)" marker-end="url(#input-arrow)"/>'
 for x,y in [a,b]:out+=circ(x,y,4,'#ffad66')
 return out+f'<text x="{tx}" y="{ty}"{transform} text-anchor="middle" fill="#d7fff8" font-size="20">{html.escape(label)}</text>'
def figure(field,body,a,b,caption,family='all',view='نمای آموزشی؛ بدون مقیاس',vertical=False):
 marker='arrow-'+field+'-'+family.replace(' ','-')
 comparison='';height=280;viewY=260
 if field in ['Lmax','Lmin']:
  # Separate the physical component from an illustrative PCB copper envelope.
  lx,ly=a;rx,ry=b
  copper=rect(lx-35,ly-20,95,40,'#447c85')+rect(rx-60,ry-20,95,40,'#447c85')
  body=copper+body
  comparison=line(lx-35,ly,lx-35,245)+line(rx+35,ry,rx+35,245)+f'<line data-copper-measurement="true" x1="{lx-35}" y1="245" x2="{rx+35}" y2="245" stroke="#80cfff" stroke-width="3" marker-start="url(#{marker})" marker-end="url(#{marker})"/><text x="320" y="275" text-anchor="middle" fill="#80cfff" font-size="18">Z — PCB copper envelope (output)</text>'
  height=330;viewY=315
 return f'''<figure class="datasheet-figure" data-family-diagram="{family}" data-field-diagram="{field}"><svg viewBox="0 0 640 {height}" role="img" aria-label="{html.escape(caption,quote=True)}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="{marker}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M9 5L1 1L1 9Z" fill="#65dfcf"/></marker></defs><g direction="ltr" font-family="Tahoma, sans-serif">{body}{dim(a,b,field,vertical).replace("url(#input-arrow)","url(#"+marker+")")}{comparison}<text x="320" y="{viewY}" text-anchor="middle" fill="#a6bbcb" font-size="16">{html.escape(view)}</text></g></svg><figcaption>{html.escape(caption)} <span class="diagram-note">شکل آموزشی است؛ حروف و ابعاد واقعی را از دیتاشیت قطعهٔ دقیق بخوان. نقاط نارنجی دو سر اندازه‌اند، نه محل پد PCB.</span></figcaption></figure>'''
figs={}
def add(field,*args,**kw):figs.setdefault(field,[]).append(figure(field,*args,**kw))
for fam in ['gull','chip','qfn']:
 body=rect(220,95,200,130)
 if fam=='gull':
  for y in [112,153,194]:body+=rect(140,y,80,16,'#cfac58')+rect(420,y,80,16,'#cfac58')
  left,right,innerL,innerR=140,500,220,420
 elif fam=='chip':
  body+=rect(180,95,60,130,'#cfac58')+rect(400,95,60,130,'#cfac58');left,right,innerL,innerR=180,460,240,400
 else:
  body=rect(180,85,280,150)
  for y in [110,155,200]:body+=rect(180,y,70,15,'#cfac58')+rect(390,y,70,15,'#cfac58')
  left,right,innerL,innerR=180,460,250,390
 family='gull sof' if fam=='gull' else fam
 view={'gull':'Gull-wing / SOIC — top view','chip':'Chip — top view','qfn':'QFN / DFN — bottom view'}[fam]
 for field in ['Lmin','Lmax']:
  cap='Lmin/Lmax از خود قطعه و ترمینال‌های آن در نقشهٔ مکانیکی گرفته می‌شود، نه از مس روی برد. فلش بالایی بُعد قطعه است؛ فلش Z پایینی محدودهٔ مس PCB را نشان می‌دهد و خروجی طراحی است. مس آبی فقط برای مقایسه است، نه الگوی ساخت پیشنهادی.'
  cap+= ' تفکیک بُعد قطعه از land pattern برای SOIC در شکل 3-3 و بندهای 3.1.2 و 3.1.4 استاندارد IPC-7352 آمده است (چاپی 6 تا 8 / PDF 16 تا 18). در مسیر SOIC این برنامه، مثال Lmax=6.20 و افزودهٔ بیرونی 0.35 در هر سمت، Z=6.90 mm می‌دهد؛ اگر افزوده صفر باشد برابری عددی ممکن است، نه یکسانی تعریف. حرف L روی دیتاشیت ممکن است طول یک پایه باشد؛ حروف E/HE هم همگانی نیستند. مثال آموزشی: اگر بازه 5.8 تا 6.2 mm است، Lmax = 6.2 و Lmin = 5.8؛ این اعداد نمونهٔ عمومی برای همهٔ قطعات نیستند.'
  add(field,body,(left,120),(right,120),cap,family,view)
 for field in ['Tmin','Tmax']:
  add(field,body,(left,120),(innerL,120),'طول ناحیهٔ ترمینال یک سر، در امتداد محور طول؛ مقدار حداقل یا حداکثر همان ناحیه را از نقشهٔ مکانیکی بخوان. خم و ارتفاع پایه با این طول یکی نیست.',family,view)
 add('Smax',body,(innerL,120),(innerR,120),'فاصلهٔ داخلی بین انتهای داخلی دو ترمینال روبه‌رو. فقط در حالت ورود مستقیم S این مقدار را وارد کن؛ با فاصلهٔ مرکز پدهای PCB اشتباه نشود.',family,view)
 if fam=='chip':a,b=(210,95),(210,225)
 else:a,b=(left+20,110 if fam=='qfn' else 112),(left+20,125 if fam=='qfn' else 128)
 add('W',body,a,b,'پهنای یک ترمینال، عمود بر محور طول آن؛ اندازهٔ مس طراحی‌شدهٔ PCB نیست. مقدار موردنیاز برنامه حداکثر پهنای ترمینال است.',family,view,True)
 if fam!='chip':add('P',body,(left+30,120),(left+30,161 if fam=='gull' else 165),'گام مرکز تا مرکز دو پایهٔ مجاور است، نه فاصلهٔ خالی بین لبه‌های آن‌ها.',family,view,True)
body=rect(200,100,240,100)+rect(160,200,320,14,'#758494')
for field in ['H','bH']:add(field,body,(320,100),(320,200),'ارتفاع در نمای جانبی از صفحهٔ نشیمن قطعه تا بالاترین نقطهٔ بدنه اندازه‌گیری می‌شود. برای مدل محوری عمودی، تعریف طول بدنهٔ همان مدل را جدا بررسی کن.','all','Side view — seating plane',True)
add('Hl',rect(220,110,200,90)+rect(220,174,30,26,'#cfac58'),(230,174),(230,200),'ارتفاع سطح عمودیِ لحیم‌پذیر ترمینال QFN/DFN است؛ ارتفاع کامل بدنه یا طول مس زیر قطعه نیست.','qfn','QFN terminal — side view',True)
body=rect(200,110,240,80,rx=35)
add('tBodyL',body,(200,150),(440,150),'طول خود بدنه، بدون پایه‌ها. برای بدنهٔ محوری طول استوانه و برای شعاعی مستطیلی بُعد بدنه در X است.','all','Body only — leads excluded')
add('tBodyD',body,(320,110),(320,190),'قطر استوانه یا ضخامت بدنه در Y، مطابق مدل انتخابی؛ اندازهٔ پایه و سوراخ نیست.','all','Body diameter / thickness',True)
add('tBodyH',rect(240,90,160,130),(320,90),(320,220),'ارتفاع خود بدنه در مدل شعاعی؛ در مدل محوری عمودی طول بدنه در راستای Z است. طول پایهٔ بیرون بدنه را اضافه نکن.','all','Body height — leads excluded',True)
body=rect(180,90,280,140)
for field in ['BW','Amax','nameBodyL','nameBodyW','bL','bW','dmBodyW','dmBodyH']:
 vertical=field in ['nameBodyW','bW','dmBodyH'];a,b=((320,90),(320,230)) if vertical else ((180,160),(460,160))
 add(field,body,a,b,'بُعد خود بدنه بین دو لبهٔ بدنه؛ پایه‌های بیرون‌زده را حساب نکن. محور و حداقل/حداکثر یا اسمی‌بودن را مطابق عنوان ورودی و نقشهٔ همان قطعه انتخاب کن.','all','Body outline',vertical)
body=rect(180,90,280,140)
for x in [230,320,410]:
 for y in [125,190]:body+=circ(x,y,18)
add('bB',body,(212,125),(248,125),'قطر توپ لحیم در نقشهٔ پکیج BGA؛ قطر پد مسی محاسبه‌شدهٔ PCB نیست.','all','BGA balls — bottom view')
for field in ['bP','bPX','bPY']:
 vert=field=='bPY';a,b=((230,125),(230,190)) if vert else ((230,125),(320,125))
 add(field,body,a,b,'گام مرکز تا مرکز دو توپ مجاور در محور مشخص‌شده؛ برای گام‌های مستقل مقدار صفر یعنی استفاده از گام مشترک.','all','BGA centres',vert)
for sh in ['round','square','rect']:
 body=circ(320,160,50) if sh=='round' else rect(270,110,100,100 if sh=='square' else 70,'#cfac58')
 add('tW',body,(270,160),(370,160),'مقطع واقعی پایه: '+{'round':'قطر پایهٔ گرد','square':'ضلع مربع، نه قطر قطری','rect':'ضلع اول مستطیل، نه قطر قطری'}[sh]+' را وارد کن. برنامه برای مقطع غیرگرد قطر قطری را جدا محاسبه می‌کند؛ این عدد قطر سوراخ نیست.',sh,'Lead cross-section')
add('tW2',rect(270,110,100,70,'#cfac58'),(320,110),(320,180),'ضلع دوم مقطع پایهٔ مستطیلی را وارد کن؛ برای پایهٔ مربع و گرد استفاده نمی‌شود.','rect','Rectangular lead cross-section',True)
body=rect(190,95,260,125)
for x in [220,420]:
 for y in [125,185]:body+=circ(x,y,8)
add('tP',body,(220,125),(220,185),'فاصلهٔ مرکز دو پایهٔ مجاور در همان ردیف؛ اندازهٔ مرکز تا مرکز است نه فاصلهٔ بین لبه‌ها.','all','Through-hole lead centres',True)
add('tR',body,(220,125),(420,125),'فاصلهٔ مرکز دو ردیف پایهٔ روبه‌رو؛ برای تک‌ردیف مقدار صفر وارد می‌شود.','all','Through-hole row centres')
add('tB',rect(180,125,280,55,'#447a61'),(320,125),(320,180),'ضخامت نهایی برد از سطح بالایی تا سطح پایینی برد را از استک‌آپ سازنده بگیر، نه ضخامت بدنهٔ قطعه.','all','PCB cross-section',True)
body=rect(200,110,240,80,'#cfac58',40)+rect(220,130,200,40,'#101923',20)
for field in ['tSlotL','tSlotW','tSlotRing']:
 vertical=field=='tSlotW';a,b={'tSlotL':((220,150),(420,150)),'tSlotW':((320,130),(320,170)),'tSlotRing':((200,150),(220,150))}[field]
 add(field,body,a,b,{'tSlotL':'طول کل شیار شامل هر دو سر گرد؛ نه فاصلهٔ مرکز دو قوس.','tSlotW':'عرض نهایی شیار عمود بر طول آن.','tSlotRing':'فاصلهٔ اسمی از لبهٔ سوراخ تا لبهٔ بیرونی مس در هر طرف؛ حداقل ساخت را باید سازنده تأیید کند.'}[field],'all','Slot and surrounding copper',vertical)
body=rect(170,110,90,65,'#cfac58')+rect(380,110,90,65,'#cfac58')
for field in ['mfrL','mfrW','mfrSpan','dmPadW','dmPadH','dmSpan']:
 vertical=field in ['mfrW','dmPadH'];a,b=((215,110),(215,175)) if vertical else ((215,142),(425,142)) if field in ['mfrSpan','dmSpan'] else ((170,142),(260,142))
 add(field,body,a,b,'ابعاد نهایی پد یا فاصلهٔ مراکز آن را از نقشهٔ land pattern سازنده بخوان؛ اینجا اندازهٔ پایهٔ فلزی قطعه وارد نمی‌شود. محور و نوع فاصله مطابق عنوان ورودی است.','all','Manufacturer land pattern',vertical)
add('dmPitch',rect(280,95,60,45,'#cfac58')+rect(280,185,60,45,'#cfac58'),(310,117),(310,207),'گام مرکز تا مرکز دو پد مجاور در یک ردیف/ضلع است؛ فاصلهٔ دو ردیف روبه‌رو در ورودی span جدا وارد می‌شود.','all','Adjacent pad centres',True)
for field in ['Th','Th2']:
 body=rect(180,90,280,140)+rect(260,125,120,65,'#cfac58');vertical=field=='Th2';a,b=((320,125),(320,190)) if vertical else ((260,157),(380,157))
 add(field,body,a,b,'بُعد پد حرارتی مرکزی در محور مشخص‌شده؛ اگر پد حرارتی ندارد صفر وارد کن. مقدار صفرِ بُعد دوم یعنی استفاده از بُعد اول و پد مربع.','qfn','Thermal copper pad',vertical)
for field in ['dmHole','pHole']:
 add(field,circ(320,155,60)+circ(320,155,30,'#101923'),(290,155),(350,155),'قطر نهایی سوراخ گرد است، نه قطر مس اطراف آن. شرایط Press-fit و تلرانس باید از مرجع سازنده گرفته شوند.','all','Finished round hole')
count=0
for field,items in figs.items():
 pattern=r'(<section id="field-'+re.escape(field)+r'">.*?)(</section>)'
 s,n=re.subn(pattern,lambda m:m[1]+''.join(items)+m[2],s,count=1,flags=re.S);count+=n
page.write_text(s);print('Illustrated',count,'input sections')
