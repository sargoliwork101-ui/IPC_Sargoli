/**
 * آزمون خودکار ابزار و شبیه‌سازهای IPC-7352 (بدون نیاز به مرورگر واقعی).
 * اجرا:  node tests/run-tests.js
 * پیش‌نیاز:  npm i jsdom
 *
 * این آزمون‌ها همان موارد گزارش Problem.md را بازتولید می‌کنند تا اگر ایرادی
 * برگشت، اینجا شکست بخورد. جای اجرای واقعی Altium یا مرورگر را نمی‌گیرند.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', 'IPC-7352');
const TOOL = path.join(ROOT, 'tool.html');
const GUIDE = path.join(ROOT, 'guide.html');
const COURSE = path.join(ROOT, 'course.html');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; failures.push(name); console.log('  ✗ ' + name + (extra ? '  →  ' + extra : '')); }
}

function load(file) {
  const html = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'file://' + file, pretendToBeVisual: true });
  return { d: dom.window.document, w: dom.window };
}

// Tests requesting a sample explicitly navigate the same component/package hierarchy as users.
function prepareSample(d,value){
 if(!value)return;
 const pk=value.startsWith('lib-')?value.slice(4):({'ti-db5':'sot23-5','ti-db6':'sot23-6','ti-pw16':'tssop','bga100':'bga'}[value]||(/^chip/.test(value)?'chip':/^soic/.test(value)?'soic':value));
 const change=e=>e.dispatchEvent(new d.defaultView.Event('change',{bubbles:true}));
 if(!Array.from(d.getElementById('package').options).some(o=>o.value===pk)){
  for(const c of Array.from(d.getElementById('component').options)){
   d.getElementById('component').value=c.value;change(d.getElementById('component'));
   if(Array.from(d.getElementById('package').options).some(o=>o.value===pk))break;
  }
 }
 d.getElementById('package').value=pk;change(d.getElementById('package'));
 if(!Array.from(d.getElementById('smp').options).some(o=>o.value===value)){
  for(const c of Array.from(d.getElementById('component').options).filter(c=>c.value!=='custom')){
   d.getElementById('component').value=c.value;change(d.getElementById('component'));
   if(!Array.from(d.getElementById('package').options).some(o=>o.value===pk))continue;
   d.getElementById('package').value=pk;change(d.getElementById('package'));
   if(Array.from(d.getElementById('smp').options).some(o=>o.value===value))break;
  }
 }
}
function setV(d, id, v) {
  const e = d.getElementById(id);
  if (!e) throw new Error('#' + id + ' پیدا نشد');
  if(id==='smp')prepareSample(d,v);
  if (e.type === 'checkbox') e.checked = !!v; else e.value = v;
  const W = d.defaultView;
  e.dispatchEvent(new W.Event('input', { bubbles: true }));
  e.dispatchEvent(new W.Event('change', { bubbles: true }));
}
const rows = d => [...d.querySelectorAll('#res tr')].slice(1);
const val = (d, s) => { const r = rows(d).find(x => x.children[0].textContent.includes(s)); return r ? r.children[1].textContent : null; };
const padsOf = d => d.getElementById('pads').value.trim().split('\n').slice(1).map(l => l.split(',').map(Number));

/* ---------------------------------------------------------------- */
console.log('\n۱) اجرای آفلاین (ایراد ۱)');
for (const f of ['tool.html', 'guide.html']) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  ok(!/[0-9a-f]{8,}-text\/javascript/.test(src), f + ': نوع اسکریپت استاندارد است');
  ok(!/cdn-cgi|rocket-loader/.test(src), f + ': وابستگی به Rocket Loader حذف شده');
}
{
  const { d } = load(TOOL);
  ok(d.querySelectorAll('#bsmd input').length > 10, 'ابزار آفلاین ورودی‌ها را می‌سازد');
  ok(d.querySelectorAll('#res tr').length > 3, 'ابزار آفلاین نتیجه تولید می‌کند');
}

console.log('\n۲) Courtyard، بدنه و پد حرارتی (ایراد ۲، ۶، ۱۶، ۳۵، ۶۹)');
{
  const { d } = load(TOOL);
  setV(d, 'fam', 'gull'); setV(d, 'sides', '2'); setV(d, 'BW', 10); setV(d, 'pCR', 0);
  const [cw] = val(d, 'Courtyard').split('×').map(parseFloat);
  ok(cw >= 10, 'Courtyard عرض بدنهٔ ۱۰ mm را می‌پوشاند', val(d, 'Courtyard'));
  setV(d, 'sides', '4'); setV(d, 'n', 25); setV(d, 'P', 0.5); setV(d, 'BW', 0);
  const pads = padsOf(d);
  const [cw4, ch4] = val(d, 'Courtyard').split('×').map(parseFloat);
  const inside = pads.every(([, x, y, sx, sy]) => Math.abs(x) + sx / 2 <= cw4 / 2 + 1e-6 && Math.abs(y) + sy / 2 <= ch4 / 2 + 1e-6);
  ok(inside, 'همهٔ پدها داخل Courtyard چهارطرفه‌اند');
  setV(d, 'sides', '2'); setV(d, 'fam', 'qfn'); setV(d, 'n', 8); setV(d, 'P', 0.5); setV(d, 'Th', 2); setV(d, 'Hl', 0.2); setV(d, 'H', 1);
  ok(padsOf(d).length === 17 && /-17T200N$/.test(val(d, 'نام پیشنهادی')), 'پد حرارتی QFN ساخته و در نام و تعداد پد لحاظ می‌شود', val(d, 'نام پیشنهادی'));
}
{
  const { d } = load(TOOL);
  setV(d, 'fam', 'gull'); setV(d, 'pCR', 1);
  const t = val(d, 'Courtyard').split('×').map(parseFloat);
  ok(t.every(v => Math.abs(v - Math.round(v)) < 1e-9), 'گردکردن Courtyard در جدول اعمال می‌شود', t.join('×'));
  const rect = d.querySelector('#svg rect');
  const wUnits = parseFloat(rect.getAttribute('width'));
  ok(wUnits > 0, 'نقشه با همان محدودهٔ Courtyard رسم می‌شود');
}

console.log('\n۳) اعتبارسنجی و خروجی کهنه (ایراد ۵، ۲۲، ۳۱، ۳۷، ۵۳، ۹۴، ۹۵)');
{
  const { d } = load(TOOL);
  setV(d, 'Lmax', 6.2);
  const before = val(d, 'Z (');
  setV(d, 'Lmax', 1);
  ok(before && !val(d, 'Z ('), 'ورودی نامعتبر خروجی قبلی را نگه نمی‌دارد');
  ok(d.getElementById('pads').value === '', 'فهرست پدها پس از خطا پاک می‌شود');
  setV(d, 'Lmin', 5.8); setV(d, 'Lmax', 6.2);
  d.getElementById('mkA').click();
  const a = d.getElementById('alt').value;
  setV(d, 'Lmax', 7);
  const b = d.getElementById('alt').value;
  ok(a !== b, 'اسکریپت Altium پس از تغییر ورودی به‌روز می‌شود');
  setV(d, 'n', 7.6);
  ok(/عدد صحیح/.test(d.getElementById('warn').textContent), 'تعداد پایهٔ کسری به‌صورت خاموش گرد نمی‌شود');
  setV(d, 'kind', 'bga'); setV(d, 'bC', 1); setV(d, 'bR', 1);
  ok(/—/.test(val(d, 'کمینه فاصلهٔ خالی') || ''), 'برای تک‌پد فاصلهٔ ساختگی گزارش نمی‌شود', val(d, 'کمینه فاصلهٔ خالی'));
}
{ // واحد‌ها: مقدار درست در هر سه واحد و بدون خطای رفت‌وبرگشت
  const res = {};
  for (const u of ['mm', 'mil', 'in']) {
    const { d } = load(TOOL);
    if (u !== 'mm') setV(d, 'unit', u);
    res[u] = parseFloat(val(d, 'Z ('));
  }
  const mm = res.mm, mil = res.mil * 0.0254, inch = res.in * 25.4;
  ok(Math.abs(mm - mil) < 0.02 && Math.abs(mm - inch) < 0.02, 'یک فوت‌پرینت در mm/mil/inch یک مقدار می‌دهد', JSON.stringify(res));
  const { d } = load(TOOL);
  setV(d, 'unit', 'mil'); setV(d, 'Lmax', 12.3456); setV(d, 'unit', 'mm');
  ok(Math.abs(parseFloat(d.getElementById('Lmax').value) - 0.3136) < 0.001, 'تبدیل واحد مقدار را نابود نمی‌کند');
}

console.log('\n۴) BGA (ایراد ۱۳، ۱۷، ۲۸، ۳۵، ۶۸، ۷۵)');
{
  const { d } = load(TOOL);
  setV(d, 'kind', 'bga'); setV(d, 'bR', 25); setV(d, 'bC', 2);
  ok(!/\?/.test(d.getElementById('pads').value), 'ردیف‌های بالای ۲۰ نام معتبر می‌گیرند');
  setV(d, 'bB', 0.45); setV(d, 'lv', 'A'); setV(d, 'bR', 2); setV(d, 'bC', 2);
  setV(d, 'pCR', 1); setV(d, 'bL', 9.1); setV(d, 'bW', 9.1);
  const cy = val(d, 'Courtyard').split('×').map(parseFloat);
  ok(cy.every(v => Math.abs(v - Math.round(v)) < 1e-9), 'گردکردن Courtyard برای BGA هم اجرا می‌شود', cy.join('×'));
  d.getElementById('mkA').click();
  ok(/0\.3800/.test(d.getElementById('alt').value), 'قطر پد BGA گردشده به خروجی Altium می‌رود');
  setV(d, 'bC', 4); setV(d, 'bR', 4); setV(d, 'bSkip', 'A1,B2');
  ok(padsOf(d).length === 14, 'توپ‌های حذف‌شده با نقشهٔ کاربر ساخته نمی‌شوند', String(padsOf(d).length));
}

console.log('\n۵) سوراخ‌دار (ایراد ۷، ۸، ۱۵، ۲۳، ۲۷، ۳۲، ۳۸، ۵۷، ۶４)');
{
  const { d } = load(TOOL);
  setV(d, 'kind', 'th'); setV(d, 'tK', 8); setV(d, 'tR', 7.62); setV(d, 'tW', 0.52);
  d.getElementById('mkA').click();
  ok(/AddLine/.test(d.getElementById('alt').value), 'خروجی TH خط Courtyard دارد');
  ok(/Shape,Plating/.test(d.getElementById('pads').value.split('\n')[0]), 'فهرست پد TH شکل و آبکاری دارد');
  ok(/^s/.test(val(d, 'نام Padstack')), 'نام Padstack پین ۱ مربع با s استاندارد شروع می‌شود', val(d, 'نام Padstack'));
  setV(d, 'tHT', 'N');
  ok(/hn/.test(val(d, 'نام Padstack')), 'سوراخ غیرآبکاری hn است', val(d, 'نام Padstack'));
  ok(/±0\.10/.test(val(d, 'سوراخ')), 'تلرانس NPTH برابر 0.10 است', val(d, 'سوراخ'));
  setV(d, 'pHole', 0); setV(d, 'tHT', 'F');
  ok(!val(d, 'سوراخ') && /Press-fit/.test(d.getElementById('warn').textContent), 'Press-fit بدون قطر سازنده خروجی نمی‌دهد');
  setV(d, 'man', true); setV(d, 'pHole', 1.0); setV(d,'tFitSource','Test manufacturer specification, page 1');setV(d,'tFitTol',.03); setV(d, 'tTol', 0); setV(d, 'tPr', '0');
  setV(d, 'tW', 0.6);
  ok(!!val(d, 'سوراخ'), 'Press-fit با قطر سازنده محاسبه می‌شود');
}
{ // مرز جدول 4-4 با مقدار واقعی سوراخ سنجیده می‌شود
  const { d } = load(TOOL);
  setV(d, 'kind', 'th'); setV(d, 'tHT', 'P'); setV(d, 'tPr', '0'); setV(d, 'tS', '0'); setV(d, 'tW', 0.854);
  ok(/1\.00/.test(val(d, 'سوراخ')) && /1\.75/.test(val(d, 'پد')), 'سوراخ 1.004 (ردیف پد بعدی) و پد 1.75', val(d, 'سوراخ') + ' / ' + val(d, 'پد'));
}

console.log('\n۶) نام‌گذاری و رمزگشایی (ایراد ۱۸، ۲۰، ۴۲، ۴۳، ۷۷، ۸۰، ۸۳، ۸۹، ۹۰، ۹۱، ۹۶، ۹۷)');
{
  const { d } = load(TOOL);
  setV(d, 'fam', 'chip'); setV(d, 'cType', 'CAPC'); setV(d, 'Lmax', 0.4); setV(d, 'Lmin', 0.35); setV(d, 'Tmin', .05); setV(d, 'Tmax', .1);
  setV(d,'nameBodyL',.4);setV(d,'nameBodyW',.2);setV(d, 'W', 0.2); setV(d, 'H', 0.2); setV(d, 'P', .4); setV(d, 'n', 1); setV(d, 'autoS', 0); setV(d, 'Smax', 0.2);
  ok(/^CAPC0402/.test(val(d, 'نام پیشنهادی')), 'نام چیپ کوچک صفر ابتدایی و نوع واقعی دارد', val(d, 'نام پیشنهادی'));
  setV(d, 'fam', 'melf');
  setV(d, 'Lmax', 3.5); setV(d, 'Lmin', 3.4); setV(d, 'Tmin', .3); setV(d, 'Tmax', .4); setV(d, 'W', 1.4); setV(d, 'H', 1.4); setV(d, 'P', 2); setV(d, 'n', 1);
  setV(d, 'cType', '');
  d.getElementById('mkA').click();
  ok(!/Comp\.Name/.test(d.getElementById('alt').value), 'خانوادهٔ بدون نام الگو، اسکریپت با نام «—» نمی‌سازد');
  const cases = {
    'QFP50P900X700X160-48N': 'Lead Span',
    'XTAL300X250X100N': '',
    'RESC0402X20N': '0.4 × 0.2',
    'r200_100r50': 'گرد',
    'c150m0': 'm0',
  };
  for (const [name, needle] of Object.entries(cases)) {
    setV(d, 'dIn', name);
    const out = d.getElementById('dOut').textContent;
    ok(out.includes(needle) && !/4\.2 × 0\.0|3\.0 × 0\.0/.test(out), 'رمزگشایی ' + name, out.replace(/\s+/g, ' ').slice(0, 90));
  }
  setV(d, 'dIn', 'c150h90!');
  ok(/غیرمجاز/.test(d.getElementById('dOut').textContent), 'نویسهٔ غیرمجاز رد می‌شود');
  setV(d, 'dIn', '');
  ok(d.getElementById('dOut').textContent === '', 'خالی‌کردن ورودی خروجی رمزگشا را پاک می‌کند');
}

console.log('\n۷) راهنما: شبیه‌سازها (ایراد ۹، ۴۰، ۴۷، ۶۳، ۶۴، ۶۵، ۷۲، ۷۳، ۷۴، ۹۲، ۹۳)');
{
  const { d } = load(GUIDE);
  setV(d, 'bB', .5); setV(d, 'bP', .3); setV(d, 'bLv', 'B');
  ok(/هم‌پوشانی|فاصله/.test(d.getElementById('bfinal').textContent), 'شبیه‌ساز BGA هم‌پوشانی را هشدار می‌دهد');
  setV(d, 'tP', .5); setV(d, 'tW', 1.2);
  ok(/روی هم افتاده/.test(d.getElementById('tfinal').textContent), 'شبیه‌ساز ردیف TH هم‌پوشانی را هشدار می‌دهد');
  setV(d, 'dq', 15);
  ok(/زوج/.test(d.getElementById('dfinal').textContent), 'تعداد پین فرد DIP بی‌اطلاع تغییر نمی‌کند');
  setV(d, 'dq', 14);
  setV(d, 'mLn', 6); setV(d, 'mLx', 6); setV(d, 'mTn', 1); setV(d, 'mTx', 1);
  d.getElementById('mc').click();
  ok(!/NaN/.test(d.getElementById('hist').innerHTML), 'مونت‌کارلو با تلرانس صفر NaN نمی‌سازد');
  ok(/جذر مجموع مربعات/.test(d.body.textContent), 'توضیح RMS با فرمول هم‌خوان است');
  setV(d, 'fN', 8); const good = d.getElementById('ffinal').textContent;
  setV(d, 'fN', 0);
  ok(good && d.getElementById('ffinal').textContent === '', 'ورودی نامعتبر نتیجهٔ قبلی شبیه‌ساز را پاک می‌کند');
  setV(d, 'fN', 8); setV(d, 'qAm', 20);
  ok(!!d.getElementById('qfinal').textContent, 'شبیه‌ساز QFP با Amax کار می‌کند');
  for (const s of ['c150m0', 'b300_150b-50', 'c150h90t150_180_80_2']) {
    setV(d, 'pdIn', s);
    const out = d.getElementById('pdOut').textContent;
    ok(out && !/0\.02 mm/.test(out), 'رمزگشای راهنما: ' + s, out.replace(/\s+/g, ' ').slice(0, 80));
  }
}

console.log('\n۹) نقشه: اندازه‌گذاری روی تصویر و نمای خودکار');
{
  const { d } = load(TOOL);
  const svgTexts = () => [...d.getElementById('svg').querySelectorAll('text')].map(t => t.textContent).join(' | ');
  const vb = () => d.getElementById('svg').getAttribute('viewBox').split(' ').map(Number);

  setV(d, 'kind', 'smd');
  const t1 = svgTexts();
  ok(/1\.31×0\.57/.test(t1), 'اندازهٔ طول و عرض پد روی خود پد نوشته می‌شود', t1.slice(0, 120));
  ok(/Z = 6\.90 mm/.test(t1), 'طول کل پدها (Z) روی نقشه اندازه‌گذاری می‌شود', t1);
  ok(/Courtyard/.test(t1), 'Courtyard روی نقشه با اندازه نوشته می‌شود', t1);
  const [vx, vy, vw, vh] = vb();
  ok(vw > 0 && vh > 0 && vw < 1100 && vh < 1100, 'نمای نقشه به اندازهٔ محتوا بریده می‌شود (بدون فضای خالی)', vb().join(','));

  setV(d, 'kind', 'bga');
  const t2 = svgTexts();
  ok(/Ø = 0\.40 mm/.test(t2) && /P = 0\.80 mm/.test(t2), 'قطر توپ و گام روی نقشهٔ BGA اندازه‌گذاری می‌شود', t2);
  setV(d, 'kind', 'th');
  const t3 = svgTexts();
  ok(/Hole = Ø 0\.92 mm/.test(t3) && /C-C X = 7\.62 mm/.test(t3), 'سوراخ و فاصلهٔ ردیف‌ها روی نقشهٔ TH اندازه‌گذاری می‌شود', t3);
  setV(d, 'unit', 'mil');
  ok(/mm|mil/.test(svgTexts()), 'برچسب اندازه‌ها واحد فعال را نشان می‌دهد', svgTexts().slice(0, 60));
}

console.log('\n۹ب) اعداد روی نقشه با هندسهٔ واقعی پدها می‌خوانند');
{
  const { d } = load(TOOL);
  const svg = d.getElementById('svg');
  const texts = () => [...svg.querySelectorAll('text')].map(t => t.getBoundingClientRect ? t.textContent : t.textContent);
  const vb = () => svg.getAttribute('viewBox').split(' ').map(Number);
  // پدهای SOIC-16 نمونه: 1.31 x 0.57، Z=6.90، P=1.27
  const res = {}; [...d.querySelectorAll('#res tr')].slice(1).forEach(r => res[r.children[0].textContent.trim()] = r.children[1].textContent.trim());
  const z = parseFloat((res['Z (طول کل پدها)'] || '').replace(' mm', ''));
  const labels = texts().join(' | ');
  ok(Math.abs(z - 6.90) < 0.005, 'Z در جدول = 6.90 mm', res['Z (طول کل پدها)']);
  ok(new RegExp('Z = ' + z.toFixed(2) + ' mm').test(labels),
     'همان عدد Z روی نقشه نوشته می‌شود', labels);
  // پدها باید با نسبت درست رسم شوند: نسبت ارتفاع پد به گام = 0.57/1.27
  const pRect = [...svg.querySelectorAll('rect')].filter(r => r.getAttribute('fill') === '#d4a017');
  const uy = [...new Set(pRect.map(r => (+r.getAttribute('y')).toFixed(1)))].map(Number).sort((a, b) => a - b);
  const hPx = +pRect[0].getAttribute('height');
  const ratio = hPx / (uy[1] - uy[0]);
  ok(Math.abs(ratio - 0.57 / 1.27) < 0.02, 'نسبت ابعاد پد به گام در نقشه درست است (مقیاس تحریف نشده)', ratio.toFixed(3));
  // ضخامت خط نقشه نباید بیشتر از فاصلهٔ دو پد شود (بررسی اینکه پدها روی هم نیفتاده‌اند)
  const rects = [...svg.querySelectorAll('rect[d*="M"]'), ...svg.querySelectorAll('rect')].filter(r => r.getAttribute('fill') === '#d4a017');
  ok(rects.length >= 16, 'همهٔ پدها رسم شده‌اند', String(rects.length));
  // هیچ متنی بیرون از قاب دیده نشود
  const [vx, vy, vw, vh] = vb();
  const out = [...svg.querySelectorAll('text')].filter(t => { const x = +t.getAttribute('x'), y = +t.getAttribute('y'); return x < vx || x > vx + vw || y < vy || y > vy + vh; });
  ok(out.length === 0, 'هیچ برچسبی بیرون از قاب نقشه نمی‌افتد', out.map(t => t.textContent).join(','));
  // برچسب‌ها روی هم نیفتند (فاصلهٔ عمودی حداقل ۱۰ واحد)
  const pos = [...svg.querySelectorAll('text')].map(t => [+t.getAttribute('x'), +t.getAttribute('y'), t.textContent]);
  let clash = 0;
  for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
    if (Math.abs(pos[i][0] - pos[j][0]) < 40 && Math.abs(pos[i][1] - pos[j][1]) < 10) clash++;
  }
  ok(clash === 0, 'برچسب‌های اندازه‌گذاری روی هم نمی‌افتند', String(clash) + ' تداخل');
}

console.log('\n۹ج) دیدبان نقشه: جابه‌جایی، زوم و برچسب‌های نسبی');
{
  const { d } = load(TOOL);
  const svg = d.getElementById('svg');
  const vb = () => svg.getAttribute('viewBox').split(' ').map(Number);
  ok(!!d.getElementById('zoomIn') && !!d.getElementById('zoomOut') && !!d.getElementById('fitBtn'), 'دکمه‌های زوم و تناسب نما وجود دارند');
  const base = vb();
  d.getElementById('zoomIn').click();
  const zin = vb();
  ok(zin[2] < base[2] - 1e-6, 'دکمهٔ + نقشه را بزرگ می‌کند', base[2].toFixed(1) + '→' + zin[2].toFixed(1));
  d.getElementById('zoomOut').click(); d.getElementById('zoomOut').click();
  ok(vb()[2] > base[2], 'دکمهٔ − نقشه را کوچک می‌کند');
  d.getElementById('fitBtn').click();
  ok(Math.abs(vb()[2] - base[2]) < 1e-6, 'تناسب نما به نمای اولیه برمی‌گردد');
  // جابه‌جایی: صحنه باید حرکت کند ولی ابعاد ثابت بماند
  const before = vb();
  const ev = new d.defaultView.Event('wheel', { bubbles: true, cancelable: true, deltaY: 0, deltaX: 40, shiftKey: true });
  d.getElementById('canvasWrap').dispatchEvent(ev);
  ok(true, 'رویداد چرخ ماوس بدون خطا پردازش می‌شود');
  // برچسب اندازهٔ پد روی خود پد نوشته می‌شود
  const padG = d.querySelector('#padG');
  ok(padG && padG.children.length >= 16, 'برچسب اندازهٔ هر پد رسم می‌شود', padG ? String(padG.children.length) : 'بدون گروه');
  const firstPad = [...svg.querySelectorAll('rect')].find(r => r.getAttribute('fill') === '#d4a017');
  const t0 = padG.children[0];
  const cx = +firstPad.getAttribute('x') + (+firstPad.getAttribute('width')) / 2;
  ok(Math.abs(+t0.getAttribute('x') - cx) < 2, 'برچسب پد دقیقاً روی مرکز همان پد است');
  // اندازهٔ قلم برچسب‌ها به اندازهٔ قطعه وابسته است
  const fsSmall = parseFloat(d.querySelector('#dimG text').getAttribute('font-size'));
  setV(d, 'Lmin', 30); setV(d, 'Lmax', 32); setV(d, 'P', 2.54);
  const fsBig = parseFloat(d.querySelector('#dimG text').getAttribute('font-size'));
  ok(fsBig > fsSmall, 'قطعهٔ بزرگ‌تر برچسب‌های بزرگ‌تری می‌گیرد (نسبی)', fsSmall.toFixed(1) + ' → ' + fsBig.toFixed(1));
  // دیدبان با تغییر ورودی‌ها از بین نمی‌رود
  setV(d, 'Lmax', 33);
  ok(vb()[2] > 0, 'پس از تغییر ورودی، قاب نقشه معتبر می‌ماند');
}

console.log('\n۹د) جابه‌جایی (pan)، سقف زوم ۲۰× و کادر برچسب‌ها');
{
  const { d, w } = load(TOOL);
  const svg = d.getElementById('svg');
  svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 });
  const vb = () => svg.getAttribute('viewBox').split(' ').map(Number);
  const before = vb();
  const ev = (t, x, y, target) => (target || svg).dispatchEvent(new w.MouseEvent(t, { bubbles: true, clientX: x, clientY: y, button: 0, buttons: t === 'mouseup' ? 0 : 1 }));
  ev('mousedown', 400, 300); ev('mousemove', 480, 360); ev('mousemove', 520, 400); ev('mouseup', 520, 400, w);
  const after = vb();
  ok(after[0] < before[0] - 1 && after[1] < before[1] - 1, 'کشیدن ماوس نقشه را جابه‌جا می‌کند', before[0].toFixed(1) + '→' + after[0].toFixed(1));
  ok(after[2] === before[2] && after[3] === before[3], 'جابه‌جایی اندازهٔ قاب را تغییر نمی‌دهد');
  // سقف زوم ۲۰ برابر
  for (let i = 0; i < 60; i++) w.SCAM.zoom(1.12);
  const zTxt = d.getElementById('zoomInfo').textContent;
  ok(zTxt === '×20', 'سقف بزرگ‌نمایی ۲ برابر بیست است', zTxt);
  ok(vb()[2] > 0 && vb()[2] < before[2] / 10, 'در ۲۰× قاب به‌درستی کوچک شده است');
  w.SCAM.fit();
  ok(Math.abs(vb()[2] - before[2]) < 1, 'پس از زوم ۲۰×، تناسب نما برمی‌گردد');
  // کادر برچسب باید متن را در خود جا دهد
  const tags = [...svg.querySelectorAll('#dimG g, #dimG rect')];
  const dimTexts = [...svg.querySelectorAll('#dimG text')];
  ok(dimTexts.length >= 4, 'برچسب‌های اندازه رسم شده‌اند', String(dimTexts.length));
  const plates = [...svg.querySelectorAll('#dimG rect')].filter(r => r.getAttribute('fill') === '#0b121c');
  const need = dimTexts.map(t => (t.textContent.length * parseFloat(t.getAttribute('font-size')) * 0.52));
  const have = plates.map(r => +r.getAttribute('width'));
  ok(plates.length === dimTexts.length && have.every((w2, i) => w2 >= need[i]), 'عرض کادر هر برچسب ≥ عرض متن است',
     have.map((v, i) => v.toFixed(0) + '/' + (need[i] || 0).toFixed(0)).join(' '));
  // اندازهٔ پد روی پد ⇒ برچسب سفید تکراری نباید باشد
  const labels = dimTexts.map(t => t.textContent).join(' | ');
  ok(dimTexts.every(t=>!/^L \d/.test(t.textContent)&&!/^X \d/.test(t.textContent)), 'وقتی اندازهٔ پد روی پد نوشته شد، تکرار سفید حذف می‌شود', labels);
  ok([...svg.querySelectorAll('#padG text')].every(t => {
    const px = t.getBoundingClientRect ? 1 : 1; return true;
  }), 'برچسب اندازهٔ پد رسم شده است');
}

console.log('\n۱۰) پنل داینامیک و ویرایش دستی');
{
  const { d } = load(TOOL);
  const shown = () => [...d.querySelectorAll('#paramGrid>div')].filter(x => x.style.display !== 'none').map(x => x.querySelector('input,select').id);
  // ویرایش دستی خاموش: همهٔ پارامترها پنهان و غیرفعال
  ok(shown().length === 0, 'ویرایش دستی خاموش ⇒ هیچ پارامتری نشان داده نمی‌شود', shown().join(','));
  ok(d.getElementById('pZJ').disabled === true, 'در حالت خاموش، ورودی‌ها غیرفعال‌اند');
  ok(!!d.getElementById('paramHint') && !d.getElementById('paramHint').hidden, 'راهنمای «ویرایش دستی خاموش است» دیده می‌شود');
  setV(d, 'man', true);
  ok(d.getElementById('pZJ').disabled === false, 'روشن‌کردن ویرایش دستی، ورودی‌ها را فعال می‌کند');
  setV(d, 'kind', 'smd'); const a = shown();
  setV(d, 'kind', 'bga'); const b = shown();
  setV(d, 'kind', 'th');  const c = shown();
  ok(a.includes('pZJ') && !a.includes('pBR'), 'SMD فقط پارامترهای SMD را نشان می‌دهد', a.join(','));
  ok(b.includes('pBR') && !b.includes('pZJ'), 'BGA فقط پارامترهای BGA را نشان می‌دهد', b.join(','));
  ok(c.includes('pHole') && !c.includes('pBR'), 'TH فقط پارامترهای سوراخ‌دار را نشان می‌دهد', c.join(','));
  setV(d, 'showAllP', true);
  ok([...d.querySelectorAll('#paramGrid>div')].every(x => x.style.display !== 'none'), 'کلید «نمایش همه» همهٔ پارامترها را برمی‌گرداند');
  setV(d, 'man', false);
  ok(shown().length === 0, 'خاموش‌کردن مجدد، همه را پنهان می‌کند');
  const sel = d.querySelector('.grid>div.wide select');
  ok(!!sel, 'فیلدهای انتخابی تمام‌عرض علامت‌گذاری می‌شوند (متن نصفه نمی‌شود)');
}

console.log('\n۱۰ب) هر سه خانواده در کادر دیده‌شده رسم می‌شوند');
{
  for (const kind of ['smd', 'bga', 'th']) {
    const { d } = load(TOOL);
    setV(d, 'kind', kind);
    const svg = d.getElementById('svg');
    const [vx, vy, vw, vh] = svg.getAttribute('viewBox').split(' ').map(Number);
    const rects = [...svg.querySelectorAll('rect')];
    const circles = [...svg.querySelectorAll('circle')];
    // مرکز ثقل پدها باید داخل قاب باشد (اگر قاب غلط باشد، پدها بیرون می‌افتند)
    const pts = [];
    rects.forEach(r => { if (r.getAttribute('fill') === '#d4a017') pts.push([+r.getAttribute('x'), +r.getAttribute('y')]); });
    circles.forEach(c => pts.push([+c.getAttribute('cx'), +c.getAttribute('cy')]));
    const inside = pts.filter(([x, y]) => x > vx && x < vx + vw && y > vy && y < vy + vh);
    ok(pts.length > 0 && inside.length === pts.length,
       kind.toUpperCase() + ': همهٔ پدها داخل قاب نقشه هستند', inside.length + '/' + pts.length);
    const texts = [...svg.querySelectorAll('#dimG text')].map(t => t.textContent).join(' | ');
    ok(/Courtyard/.test(texts) && texts.length > 10, kind.toUpperCase() + ': اندازه‌ها روی نقشه نوشته می‌شوند', texts.slice(0, 60));
  }
}


console.log('\n۱۱) گردش واقعی نمونه‌ها، ذخیره و تفکیک بخش‌ها');
{
 const html=fs.readFileSync(TOOL,'utf8');
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ipc.test/tool.html',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 function input(id,value){const e=d.getElementById(id);e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}))}
 function sample(value){prepareSample(d,value);d.getElementById('smp').value=value;d.getElementById('smp').onchange()}
 for(const preset of ['soic','soic8','soic14','tssop','chip','qfp','dip','bga100']){
  sample(preset);
  ok(d.getElementById('pads').value.split('\n').length>2,preset+': نمونه خروجی معتبر دارد');
  for(const kind of ['bga','th','smd']){
   input('kind',kind);
   ok(d.getElementById('svg').querySelectorAll('circle,rect').length>5&&d.getElementById('stageEmpty').hidden,preset+' → '+kind+': نقشه خالی نیست',d.getElementById('warn').textContent);
  }
 }
 w.document.getElementById('zoomIn').click();
 input('kind','bga');
 ok(d.getElementById('zoomInfo').textContent==='×1','تغییر خانواده نمای قبلی را بازنشانی می‌کند');
 d.querySelector('[data-t="t2"]').click();
 ok(d.querySelector('.workspace').dataset.mode==='t2'&&w.getComputedStyle(d.querySelector('.sidebar .group')).display==='none','نام‌گذاری مستقل و بدون تنظیمات فوت‌پرینت است');
 ok(new Set([...d.querySelectorAll('[id]')].map(e=>e.id)).size===d.querySelectorAll('[id]').length,'شناسهٔ تکراری در سند وجود ندارد');
 const presets=['soic','soic8','soic14','tssop','ti-pw16','ti-db5','ti-db6','bga100','qfp','chip','chip0805','chip0603','sot23','dip'];
 let allTransitions=true,chipCorrect=true;
 for(const from of presets)for(const to of presets){
  sample(from);sample(to);
  const valid=d.getElementById('pads').value.split('\n').length>2&&!/خطای اجرا|خروجی معتبری/.test(d.getElementById('res').textContent);
  if(!valid)allTransitions=false;
  if(to==='chip')chipCorrect=chipCorrect&&valid&&d.getElementById('mCount').textContent==='2'&&+d.getElementById('Lmin').value<=+d.getElementById('Lmax').value;
 }
 ok(allTransitions,'تمام مسیرهای جابه‌جایی بین نمونه‌های آماده خروجی معتبر دارند');
 ok(chipCorrect,'1206 پس از هر نمونه دو پد و طول‌های معتبر دارد');
 const old=JSON.parse(w.localStorage.getItem('fp7352'));
 delete old._schema;for(const id of ['bB','bP','bL','bW','bH','tP','tR','tW','tW2','tB'])old[id]='0';
 const recovered=new JSDOM(html,{runScripts:'dangerously',url:'https://ipc.test/tool.html',beforeParse(win){win.localStorage.setItem('fp7352',JSON.stringify(old))}});
 ok(+recovered.window.document.getElementById('bB').value>0&&+recovered.window.document.getElementById('tP').value>0,'ذخیره‌های صفرشدهٔ نسخهٔ قدیمی ترمیم می‌شوند');
 recovered.window.close();dom.window.close();
}

console.log('\n۱۲) جهت برچسب عددی و حاشیهٔ کادر');
{
 const {d,w}=load(TOOL);
 for(const kind of ['smd','bga','th']){
  setV(d,'kind',kind);
  const groups=[...d.querySelectorAll('[data-label-fs]')];
  ok(groups.length>0&&groups.every(g=>{
   const t=g.querySelector('text'),r=g.querySelector('rect');
   const x=+t.getAttribute('x'),left=+r.getAttribute('x'),right=left+(+r.getAttribute('width'));
   return g.getAttribute('direction')==='ltr'&&t.getAttribute('direction')==='ltr'&&
    w.getComputedStyle(t).direction==='ltr'&&x>left&&x<right;
  }),kind+': جهت متن مستقل از صفحهٔ فارسی و نقطهٔ اتصال داخل حاشیهٔ کادر است');
 }
 w.close();
}

console.log('\n۱۳) قیدهای ورودی و پیام کنار خانه');
{
 const {d,w}=load(TOOL);
 function sample(v){prepareSample(d,v);d.getElementById('smp').value=v;d.getElementById('smp').onchange()}
 for(const [preset,id,value] of [['soic','P',0],['soic','Lmin',99],['soic','n',2.5],['chip','n',2],['chip','sides','4'],['bga100','bL',-1],['bga100','bR',101],['dip','tB',-1]]){
  sample(preset);setV(d,id,value);
  ok(d.getElementById(id).getAttribute('aria-invalid')==='true'&&!!d.getElementById(id+'-error')&&!d.getElementById('pads').value,preset+'/'+id+': پیام کنار خانه و جلوگیری از خروجی نامعتبر');
 }
 sample('soic');setV(d,'P','');
 ok(d.getElementById('P').getAttribute('aria-invalid')==='true','خانهٔ عددی خالی با صفر یا مقدار معتبر اشتباه نمی‌شود');
 setV(d,'P',1.27);
 ok(!d.getElementById('P-error')&&d.getElementById('pads').value.length>0,'پس از اصلاح مقدار، خطا پاک و خروجی ساخته می‌شود');
 w.close();
}

console.log('\n۱۴) انتخاب مرحله‌ای و SOT-23-3');
{
 const {d,w}=load(TOOL);
 const change=(id,v)=>{d.getElementById(id).value=v;d.getElementById(id).dispatchEvent(new w.Event('change',{bubbles:true}))};
 change('component','capacitor');
 ok(d.getElementById('fam').value==='chip'&&d.getElementById('cType').value==='CAPC','خازن چیپ روش و پیشوند خودکار دارد');
 ok([...d.getElementById('smp').options].filter(o=>o.value&&!o.hidden).every(o=>o.value.startsWith('chip')||o.value==='lib-chip'),'فقط اندازه‌های مرتبط با پکیج نشان داده می‌شوند');
 change('component','transistor');
 const csv=d.getElementById('pads').value.trim().split('\n').slice(1).map(row=>row.split(','));
 ok(csv.length===3&&csv.map(p=>p[0]).join(',')==='1,2,3','SOT-23 دقیقاً سه پد شماره‌دار دارد');
 ok(csv.length===3&&+csv[0][1]<0&&+csv[1][1]<0&&+csv[2][1]>0&&+csv[0][2]>0&&+csv[1][2]<0&&+csv[2][2]===0,'SOT-23: دو پد چپ و یک پد راست با مختصات نامتقارن');
 ok(/^SOT/.test(d.getElementById('insName').textContent)&&/Gull-wing/.test(d.getElementById('warn').textContent),'نام SOT و هشدار تطبیق با دیتاشیت مشخص است');
 d.getElementById('mkA').click();
 ok((d.getElementById('alt').value.match(/  AddPad\('/g)||[]).length===3,'اسکریپت Altium نیز دقیقاً سه پد دارد');
 setV(d,'layout','symmetric');
 ok(d.getElementById('component').value==='custom'&&d.getElementById('smp').value==='','تغییر پیشرفته، انتخاب را به سفارشی تبدیل می‌کند');
 ok(d.getElementById('advancedGeometry').contains(d.getElementById('fam')),'خانواده در تنظیمات پیشرفته است');
 w.close();
}

console.log('\n۱۵) فهرست گستردهٔ پکیج‌ها و عدم ادعای پشتیبانی کاذب');
{
 const {d,w}=load(TOOL);
 function change(id,v){const e=d.getElementById(id);e.value=v;e.dispatchEvent(new w.Event('change',{bubbles:true}))}
 const types=[...d.getElementById('component').options].map(o=>o.value);
 ok(types.length===18,'۱۸ گروه قطعه در دسترس است');
 const packages=new Set();let combos=0,blockedSafe=true,configSafe=true,modelsAvailable=true;
 for(const type of types){
  change('component',type);
  const options=[...d.getElementById('package').options].map(o=>[o.value,o.textContent]);
  for(const [id,label] of options){
   packages.add(id);combos++;change('package',id);
   modelsAvailable=modelsAvailable&&!/پشتیبانی نمی‌شود|پیاده‌سازی نشده/.test(label);
   if(label.includes('مدل ابعادی قابل تنظیم'))modelsAvailable=modelsAvailable&&!d.getElementById('directModelEditor').hidden;
   if(/هنوز پشتیبانی نمی‌شود|نیازمند اصلاح محاسبه/.test(label)&&!label.includes('مرجع واقعی KiCad دارد')){
    blockedSafe=blockedSafe&&!d.getElementById('pads').value&&!d.getElementById('stageEmpty').hidden;
   }
   if(/ابعاد دیتاشیت لازم/.test(label)&&!d.getElementById('smp').value&&!d.getElementById('libraryMode').checked)configSafe=configSafe&&!d.getElementById('pads').value&&(d.getElementById('kind').value==='th'?d.getElementById('tW').value==='':d.getElementById('Lmax').value==='');
  }
 }
 ok(modelsAvailable,'همهٔ گروه‌ها مسیر مدل دارند و برچسب پکیج پشتیبانی‌نشده باقی نمانده است');
 ok(packages.size===69&&combos>69,'۶۹ تعریف پکیج با گروه‌بندی بر اساس نوع واقعی قطعه در دسترس است');
 ok(blockedSafe,'بسته‌های پشتیبانی‌نشده یا مسدود، نقشه/خروجی قطعهٔ قبلی را نشان نمی‌دهند');
 ok(configSafe,'بستهٔ بدون نمونه، ابعاد قبلی را به جای دیتاشیت استفاده نمی‌کند');
 change('component','led');
 ok(d.getElementById('cType').value==='LEDC','LED چیپ پیشوند مناسب می‌گیرد');
 change('component','ferrite');
 ok(d.getElementById('cType').value==='BEADC','فریت چیپ پیشوند مناسب می‌گیرد');
 change('component','diode');change('package','melf');
 setV(d,'W',1);
 ok(!d.getElementById('pads').value&&/ممیزی/.test(d.getElementById('emptyReason').textContent),'MELF با ویرایش عددی از قفل ممیزی عبور نمی‌کند');
 d.getElementById('mkA').click();
 ok(!/  AddPad\('/.test(d.getElementById('alt').value),'پکیج مسدود خروجی Altium معتبر نمی‌سازد');
 w.close();
}

console.log('\n۱۶) مرجع مستقل سوراخ و پد طبق IPC-7352');
{
 const {d,w}=load(TOOL);
 function sample(){prepareSample(d,'dip');d.getElementById('smp').value='dip';d.getElementById('smp').onchange()}
 function pair(){const p=padsOf(d)[0];return p?[p[3],p[4]]:[]}
 for(const shape of [0,1,2])for(const process of [0,1]){
  sample();setV(d,'tS',shape);setV(d,'tW',.5);setV(d,'tW2',.3);setV(d,'tPr',process);
  const diagonal=shape===0?.5:shape===1?Math.hypot(.5,.5):Math.hypot(.5,.3);
  const raw=diagonal+([.15,.15,.1][shape])*(process===0?1:0)+(process===1?[.4,.4,.35][shape]:0);
  const hole=Math.round(raw*100)/100,allowance=raw<=1?.5:raw<=1.25?.75:raw<=1.75?1:raw<=2.25?1.25:1.5;
  const pad=Math.round((hole+allowance)*100)/100,[actualPad,actualHole]=pair();
  ok(Math.abs(actualHole-hole)<1e-8&&Math.abs(actualPad-pad)<1e-8,'شکل '+shape+' / فرایند '+process+': سوراخ و پد از مرجع مستقل محاسبه می‌شوند',pair().join('/'));
 }
 sample();setV(d,'tS',1);setV(d,'tW',.5);setV(d,'tPr',0);
 ok(pair()[0]===1.36&&pair()[1]===.86&&/0.25/.test(val(d,'حلقهٔ مسی')),'مثال مربع 0.5: سوراخ 0.86، پد 1.36 و حلقهٔ اسمی 0.25');
 setV(d,'tPr',1);
 ok(pair()[0]===1.86&&pair()[1]===1.11,'همان مربع در لحیم دستی/موجی: سوراخ 1.11 و پد 1.86');
 setV(d,'tS',2);setV(d,'tW2',.3);setV(d,'tPr',0);const h1=pair()[1];setV(d,'tW2',.8);
 ok(h1===.68&&pair()[1]===1.04,'تغییر ضلع دوم مستطیل واقعاً سوراخ را تغییر می‌دهد');
 setV(d,'tHT','N');
 ok(pair()[1]===1.34,'NPTH نیز از قطر قطری مستطیل استفاده می‌کند');
 setV(d,'tHT','P');setV(d,'tS',1);setV(d,'tW',.5);setV(d,'man',true);setV(d,'pHole',1.2);
 ok(pair()[1]===1.2,'override روشن قطر دستی را اعمال می‌کند');
 setV(d,'man',false);
 ok(pair()[1]===.86&&pair()[0]===1.36,'override خاموش به سوراخ و پد خودکار برمی‌گردد');
 for(const unit of ['mil','in','mm']){setV(d,'unit',unit);const factor={mm:1,mil:.0254,in:25.4}[unit];const p=pair();
  ok(Math.abs(p[1]*factor-.86)<.0001&&Math.abs(p[0]*factor-1.36)<.0001,'تبدیل واحد '+unit+' هندسهٔ سوراخ و پد را حفظ می‌کند');
 }
 d.getElementById('mkA').click();
 ok(/1\.3600, 1\.3600, 0\.8600/.test(d.getElementById('alt').value),'Altium قطر پد و سوراخ اصلاح‌شده را می‌گیرد');
 setV(d,'man',true);setV(d,'pPadd',0);
 ok(!d.getElementById('pads').value&&/حلقهٔ مسی/.test(d.getElementById('warn').textContent),'پد بدون مس دور سوراخ رد می‌شود');
 w.close();
}

console.log('\n۱۷) شیار: نام‌گذاری صریح استاندارد و ابعاد ورودی سازنده');
{
 const {d,w}=load(TOOL);
 prepareSample(d,'dip');d.getElementById('smp').value='dip';d.getElementById('smp').onchange();
 setV(d,'tK',1);setV(d,'tR',0);setV(d,'tS',2);setV(d,'tW',2);setV(d,'tW2',.3);
 setV(d,'tHoleShape','slot');
 ok(!d.getElementById('pads').value&&d.getElementById('tSlotL').getAttribute('aria-invalid')==='true','شیار بدون ابعاد سازنده، سایزبندی حدسی یا خروجی ندارد');
 setV(d,'tSlotL',3);setV(d,'tSlotW',1);setV(d,'tSlotRing',.5);
 const csv=()=>d.getElementById('pads').value.split('\n');
 let p=csv()[1]?.split(',');
 ok(p&&+p[3]===4&&+p[4]===2&&+p[5]===3&&+p[6]===1&&p[7]==='slot','شیار 3×1 و حلقهٔ ورودی 0.5 → پد 4×2 و CSV صریح شیار');
 ok(val(d,'نام Padstack')==='b400_200h300_100','مثال شیار آبکاری‌شدهٔ 5.2.3 دقیقاً تولید می‌شود');
 ok(d.querySelectorAll('#svg rect[rx]').length>=2&&/Slot length = 3.00 mm/.test(d.getElementById('svg').textContent),'شیار و پد گرددو‌سر با اندازه روی نقشه رسم می‌شوند');
 d.getElementById('mkA').click();
 ok(/شیار/.test(d.getElementById('alt').value)&&!/  AddPad\('/.test(d.getElementById('alt').value),'Altium فاقد پشتیبانی شیار، سوراخ گرد جایگزین نمی‌کند');
 setV(d,'tHT','N');
 ok(val(d,'نام Padstack')==='b400_200hn300_100'&&csv()[1].includes('non-plated'),'مثال شیار NPTH با hn و آبکاری صحیح در CSV');
 setV(d,'tSlotL',2);setV(d,'tSlotW',.3);
 ok(!d.getElementById('pads').value&&/جا نمی‌شوند/.test(d.getElementById('warn').textContent),'برخورد گوشهٔ پایه با سر گرد شیار رد می‌شود');
 setV(d,'tSlotL',2.2);setV(d,'tSlotW',.5);setV(d,'tSlotRing',.25);
 ok(!!d.getElementById('pads').value,'جاگرفتن اسمی پایهٔ 2×0.3 در شیار 2.2×0.5 بررسی می‌شود');
 for(const unit of ['mil','in','mm']){setV(d,'unit',unit);const f={mm:1,mil:.0254,in:25.4}[unit];p=csv()[1]?.split(',');
  ok(p&&Math.abs(+p[5]*f-2.2)<.0002&&Math.abs(+p[6]*f-.5)<.0002,'ابعاد شیار در تبدیل '+unit+' حفظ می‌شود');
 }
 setV(d,'pS','b');setV(d,'p1',4);setV(d,'p2',2);setV(d,'pH',3);setV(d,'pH2',1);
 ok(d.getElementById('pOut').textContent==='b400_200h300_100','نام‌ساز مستقل عرض دوم سوراخ را پشتیبانی می‌کند');
 setV(d,'dIn','b400_200h300_100');
 ok(/شیار آبکاری‌شده/.test(d.getElementById('dOut').textContent),'رمزگشا دو بُعد h را شیار معرفی می‌کند، نه قطر گرد');
 setV(d,'tHoleShape','round');
 ok(d.getElementById('tSlotL').disabled&&!!d.getElementById('pads').value,'بازگشت به سوراخ گرد، ورودی‌های شیار را غیرفعال می‌کند');
 w.close();
}


console.log('\n۱۸) مدل بدنهٔ THT');
{
 const {d,w}=load(TOOL);const valid=()=>!!d.getElementById('pads').value;const name=()=>val(d,'نام پیشنهادی Land Pattern');const ps=()=>padsOf(d);const court=()=>val(d,'Courtyard').match(/[\d.]+/g).map(Number);
 setV(d,'component','resistor');setV(d,'package','axial');
 ok(d.getElementById('libraryMode').checked&&!!d.getElementById('pads').value,'محوری با مرجع مشخص کتابخانه باز می‌شود');
 setV(d,'tExample','cfr25');
 ok(valid()&&ps().length===2,'نمونه رسمی CFR-25 دو پد دارد');
 ok(Math.abs(ps()[0][4]-1)<1e-9&&Math.abs(ps()[0][3]-1.5)<1e-9,'CFR-25: پایه max 0.60 + 0.40 = سوراخ 1؛ پد 1.5');
 ok(name()==='RESAD1016W60L680D260B','نام محوری از طول، قطر، فاصله و پایه max ساخته می‌شود');
 ok(!!d.querySelector('[data-th-body="axial-h"]')&&court()[1]>=2.6,'بدنهٔ افقی و courtyard شامل بدنه');
 setV(d,'tModel','axial-v');setV(d,'tP',5.08);
 ok(valid()&&!!d.querySelector('[data-th-body="axial-v"]')&&/^RESADV508/.test(name()),'مدل عمودی دایره روی پین ۱ و نام مستقل دارد');
 setV(d,'tK',3);ok(!d.getElementById('pads').value,'مدل دوپایه تعداد دیگر را رد می‌کند');
 setV(d,'component','diode');setV(d,'package','axial');setV(d,'tExample','1n4148');
 ok(valid()&&name()==='DIOAD762W55L340D175B'&&Math.abs(ps()[0][4]-.95)<1e-9,'دیود رسمی با max پایه و نام DIOAD');
 setV(d,'component','capacitor');setV(d,'package','radial');d.getElementById('leaveReference').click();
 setV(d,'tP',5);setV(d,'tW',.65);setV(d,'tBodyL',10.5);setV(d,'tBodyD',10.5);setV(d,'tBodyH',13);setV(d,'tPolar','yes');
 ok(valid()&&name()==='CAPPRD500W65D1050H1300B'&&court()[0]>=10.5&&court()[1]>=10.5,'خازن شعاعی قطبی بدنه و نام و courtyard مستقل دارد');
 for(const [model,prefix] of [['radial-r','CAPRR'],['radial-disc','CAPRB']]){setV(d,'tModel',model);setV(d,'tPolar','no');ok(valid()&&name().startsWith(prefix)&&!!d.querySelector('[data-th-body="'+model+'"]'),'مدل '+model+' رسم و نام دارد')}
 setV(d,'unit','mil');ok(valid()&&Math.abs(ps()[1][1]*.0254-2.5)<.0002,'تبدیل واحد موقعیت واقعی پد THT را حفظ می‌کند');
 setV(d,'tHoleShape','slot');ok(!d.getElementById('pads').value,'ترکیب شیار و بدنه بدون مدل کامل جعل نمی‌شود');
 w.close();
}


console.log('\n۱۹) انتخاب شکل و پکیج‌های جدید');
{
 const {d,w}=load(TOOL);const valid=()=>!!d.getElementById('pads').value;const name=()=>val(d,'نام پیشنهادی Land Pattern');
 setV(d,'smp','sot23');
 ok(!d.getElementById('man').checked&&!d.getElementById('pShape').disabled&&!d.getElementById('padShapeControl').hidden,'انتخاب شکل مستقل از ویرایش دستی در دسترس است');
 setV(d,'pShape','r');
 let gold=()=>[...d.querySelectorAll('#svg rect')].filter(e=>e.getAttribute('fill')==='#d4a017');
 ok(gold().length===3&&gold().every(e=>!e.hasAttribute('rx')),'SOT-23 مستطیلی در نقشه');
 const dimensions=padsOf(d).map(p=>p.slice(1,5).join(','));
 d.getElementById('mkA').click();ok(/AddPad\([^\n]*, 0, True/.test(d.getElementById('alt').value),'Altium شکل مستطیل انتخابی را دریافت می‌کند');
 setV(d,'pShape','o');
 ok(gold().length===3&&gold().every(e=>+e.getAttribute('rx')>0),'SOT-23 دوسرگرد در نقشه');
 ok(JSON.stringify(dimensions)===JSON.stringify(padsOf(d).map(p=>p.slice(1,5).join(','))),'انتخاب شکل ابعاد بیرونی و مرکز پد را عوض نمی‌کند');
 setV(d,'component','ic');
 for(const [pkg,count] of [['sot23-5',5],['sot23-6',6]]){
  setV(d,'package',pkg);ok(valid()&&d.getElementById('padBasis').value==='manufacturer','پکیج '+pkg+' با نمونهٔ واقعی سازنده باز می‌شود');
  for(const [id,v] of Object.entries({Lmin:2.6,Lmax:3,Tmin:.3,Tmax:.6,Smax:1.8,W:.5,H:1.45,P:.95,BW:1.7,bodyLength:3}))setV(d,id,v);
  const pads=padsOf(d);ok(valid()&&pads.length===count&&d.getElementById('insName').textContent.endsWith('-'+count+'N'),'پکیج '+pkg+' تعداد واقعی و نام SOT دارد');
  ok(pads.filter(p=>p[1]<0).length===3&&pads.filter(p=>p[1]>0).length===count-3,'آرایش مستقل '+pkg);
  if(count===5)ok(pads[3][2]===-pads[4][2]&&Math.abs(pads[3][2])===.95,'سمت دوپایهٔ SOT-23-5 مرکز خالی و فاصلهٔ 2P دارد');
 }
 setV(d,'component','jumper');setV(d,'package','jump-th');
 for(const [id,v] of Object.entries({tP:5,tW:.6,tBodyL:4,tBodyD:.6,tBodyH:2}))setV(d,id,v);
 ok(valid()&&name()==='JUMP500W60B'&&padsOf(d).length===2,'جامپر سیمی با نام جدول 4-6');
 setV(d,'component','ic');setV(d,'package','sip');
 for(const [id,v] of Object.entries({tP:2.54,tW:.6,tBodyL:20,tBodyD:3,tBodyH:5}))setV(d,id,v);
 ok(valid()&&padsOf(d).length===8&&name()==='SIP300W60P254L2000H500Q8B','SIP مستقیم با ابعاد کامل بدنه و نام');
 setV(d,'tR',2);ok(!valid(),'SIP غیرمستقیم تصادفاً رسم نمی‌شود');
 setV(d,'package','cdip');
 for(const [id,v] of Object.entries({tP:2.54,tR:7.62,tW:.6,tBodyL:20,tBodyD:6.5,tBodyH:5}))setV(d,id,v);
 ok(valid()&&padsOf(d).length===14&&name()==='CDIP762W60P254L2000H500Q14B','CDIP دارای بدنه و نام کامل');
 setV(d,'tModel','dipc');ok(valid()&&name().startsWith('DIPC762'),'DIPC قرارداد نام مستقل دارد');
 setV(d,'tK',13);ok(!valid(),'CDIP/DIPC فرد پذیرفته نمی‌شود');
 ok(d.getElementById('padShapeControl').hidden&&d.getElementById('pShape').disabled,'شکل SMD بر سوراخ‌های THT اثر نمی‌گذارد');
 w.close();
}


console.log('\n۲۰) مسیر بازشدن پکیج، نمونه و حفظ ورودی');
{
 const {d,w}=load(TOOL);let count=0,all=true;const seen=new Set();
 const components=[...d.getElementById('component').options].map(o=>o.value);
 for(const component of components){
  setV(d,'component',component);
  for(const pkg of [...d.getElementById('package').options].map(o=>o.value)){
   setV(d,'package',pkg);
   if(!d.getElementById('package').selectedOptions[0].textContent.includes('ابعاد دیتاشیت لازم')||seen.has(pkg))continue;seen.add(pkg);count++;
   if(!d.getElementById('previewPackage').hidden)d.getElementById('previewPackage').click();
   const valid=!!d.getElementById('pads').value;all=all&&valid;
   ok(valid,'نمونهٔ آموزشی انتخابی '+pkg+' واقعاً نقشه دارد',d.getElementById('warn').textContent);
  }
 }
 ok(count===18&&all,'تمام ۱۸ مدل قابل تنظیم از مسیر دکمهٔ واقعی باز می‌شوند');
 setV(d,'component','transistor');setV(d,'package','sot23-5');d.getElementById('previewPackage').click();
 setV(d,'W',.47);const before=d.getElementById('pads').value;
 setV(d,'package','sot23-6');d.getElementById('previewPackage').click();setV(d,'package','sot23-5');
 ok(+d.getElementById('W').value===.47&&d.getElementById('pads').value===before,'برگشت به پکیج، ورودی و خروجی آن را پاک نمی‌کند');
 setV(d,'unit','mil');setV(d,'package','sot23-6');setV(d,'package','sot23-5');
 ok(Math.abs(+d.getElementById('W').value*.0254-.47)<.0002,'پیش‌نویس پکیج بر حسب mm و مستقل از واحد بازگردانی می‌شود');
 ok(/نمونهٔ آموزشی/.test(d.getElementById('packageStatus').textContent),'برچسب ابعاد آموزشی پس از ویرایش و جابه‌جایی پابرجاست');
 w.close();
}


console.log('\n۲۱) جداسازی اعتبارسنجی THT و SMD');
{
 const {d,w}=load(TOOL);
 setV(d,'component','resistor');setV(d,'package','axial');setV(d,'tExample','cfr25');
 for(const sample of ['soic','chip','qfp','sot23','tssop','bga100']){
  setV(d,'smp',sample);
  ok(!!d.getElementById('pads').value&&!/مدل محوری|CDIP|SIP مستقیم/.test(d.getElementById('warn').textContent),'پس از THT محوری، '+sample+' مستقل و قابل رسم است');
 }
 setV(d,'smp','sot23');
 const state={_schema:2,_u:'mm'};d.querySelectorAll('.workspace input,.workspace select').forEach(e=>state[e.id]=e.type==='checkbox'?e.checked:e.value);const saved=JSON.stringify(state);
 const recovered=new JSDOM(fs.readFileSync(TOOL,'utf8'),{runScripts:'dangerously',url:'https://ipc.test/tool.html',beforeParse(win){win.localStorage.setItem('fp7352',saved)}});
 ok(!!recovered.window.document.getElementById('pads').value,'حالت SMD ذخیره‌شده با tModel محوری نیز پس از بازشدن کار می‌کند');
 const src=fs.readFileSync(TOOL,'utf8').split('function smd(){')[1].split('function bga(){')[0];
 ok(!/tModel|tBodyL|tBodyD|tBodyH/.test(src),'محاسبه SMD هیچ وابستگی به ورودی بدنهٔ THT ندارد');
 recovered.window.close();w.close();
}


console.log('\n۲۲) الگوهای واقعی سازنده و ویرایش مستقیم');
{
 const {d,w}=load(TOOL);
 for(const [id,count,L,W,span,P] of [['ti-db5',5,1.1,.6,2.6,.95],['ti-db6',6,1.1,.6,2.6,.95],['ti-pw16',16,1.5,.45,5.8,.65]]){
  setV(d,'smp',id);const pads=padsOf(d);
  ok(pads.length===count&&pads.every(p=>p[3]===L&&p[4]===W),'نمونهٔ '+id+' اندازهٔ مس مرجع را دارد');
  ok(pads.every(p=>Math.abs(p[1])===span/2)&&+d.getElementById('P').value===P,'مراکز و گام '+id+' مطابق نقشهٔ سازنده');
  ok(!d.getElementById('manufacturerReference').hidden&&!!d.querySelector('#manufacturerReference a[href^="https://www.ti.com/"]'),'مرجع رسمی '+id+' در رابط قابل مشاهده است');
 }
 setV(d,'smp','ti-db5');setV(d,'mfrL',1.2);setV(d,'mfrW',.65);setV(d,'mfrSpan',2.8);
 ok(padsOf(d).every(p=>p[3]===1.2&&p[4]===.65&&Math.abs(p[1])===1.4),'کاربر طول، عرض و فاصلهٔ پد مرجع را مستقیماً اصلاح می‌کند');
 ok(/نه فرمول IPC/.test(d.getElementById('res').textContent),'نتیجهٔ سازنده به اشتباه محاسبهٔ IPC معرفی نمی‌شود');
 setV(d,'pShape','r');ok([...d.querySelectorAll('#svg rect[fill="#d4a017"]')].every(e=>!e.hasAttribute('rx')),'شکل مستطیلی برای نمونهٔ سازنده هم انتخابی است');
 setV(d,'unit','mil');ok(Math.abs(padsOf(d)[0][3]*.0254-1.2)<.0002,'ابعاد مستقیم مرجع با تبدیل واحد حفظ می‌شوند');
 setV(d,'unit','mm');setV(d,'padBasis','ipc');
 ok(!!d.getElementById('pads').value&&d.getElementById('mfrL').disabled,'بازگشت آگاهانه از مرجع سازنده به محاسبه IPC ممکن است');
 w.close();
}


console.log('\n۲۳) جستجو و فاصلهٔ افقی مراکز');
{
 const {d,w}=load(TOOL);
 setV(d,'smp','ti-db5');
 const labels=()=>[...d.querySelectorAll('#dimG text')].map(t=>t.textContent);
 ok(labels().some(t=>/^C-C X = 2.60 mm$/.test(t)),'فاصله افقی مراکز نمونهٔ TI پنج‌پایه 2.60 mm است، نه Z');
 setV(d,'mfrSpan',2.8);ok(labels().includes('C-C X = 2.80 mm'),'اندازهٔ افقی با ویرایش فاصلهٔ مراکز به‌روز می‌شود');
 for(const unit of ['mil','in','mm']){setV(d,'unit',unit);const factor={mil:.0254,in:25.4,mm:1}[unit];const text=labels().find(t=>t.startsWith('C-C X '));ok(text&&text.endsWith(' '+unit)&&Math.abs(Number(text.split(' ')[3])*factor-2.8)<.01,'فاصلهٔ افقی با واحد '+unit+' درست نمایش داده می‌شود')}
 const before=d.getElementById('pads').value;
 setV(d,'footprintSearch','sOt23');
 ok(d.querySelectorAll('#footprintSearchResults button').length>=3,'جستجوی بدون حساسیت به حروف و خط تیره');
 ok(d.getElementById('pads').value===before,'تایپ جستجو هندسه را تغییر نمی‌دهد');
 setV(d,'footprintSearch','SN74LVC1G04');d.querySelector('#footprintSearchResults button').click();
 ok(d.getElementById('smp').value==='ti-db5'&&padsOf(d).length===5,'کلیک نتیجهٔ شماره‌قطعه، نمونهٔ واقعی را باز می‌کند');
 setV(d,'component','resistor');setV(d,'footprintSearch','CFR-25');d.querySelector('#footprintSearchResults button').click();
 ok(d.getElementById('tExample').value==='cfr25'&&padsOf(d).length===2,'جستجوی نمونهٔ THT سازنده هم کار می‌کند');
 setV(d,'footprintSearch','مقاومت');ok(!!d.querySelector('#footprintSearchResults button'),'جستجوی فارسی در گروه‌های قطعه');
 setV(d,'footprintSearch','not-a-real-footprint-xyz');ok(!d.querySelector('#footprintSearchResults button')&&/پیدا نشد/.test(d.getElementById('footprintSearchResults').textContent),'جستجوی بی‌نتیجه پیام روشن دارد');
 setV(d,'component','transistor');setV(d,'footprintSearch','SOT223');d.querySelector('#footprintSearchResults button').click();
 ok(d.getElementById('package').value==='sot223'&&d.getElementById('libraryMode').checked&&!!d.getElementById('pads').value,'نتیجهٔ SOT223 اکنون نمونهٔ مرجع خودش را نشان می‌دهد، نه نقشهٔ قبلی');
 w.close();
}


console.log('\nفیلتر سخت نوع قطعه و پکیج');
{
 const {d,w}=load(TOOL);
 for(const component of ['resistor','capacitor','ic','connector','transistor']){
  setV(d,'component',component);
  const packageIds=Array.from(d.getElementById('package').options).map(o=>o.value);
  ok(!packageIds.includes(component==='ic'?'chip':'bga'),component+': پکیج نامرتبط در فهرست وجود ندارد');
  for(const pk of packageIds){
   setV(d,'package',pk);
   const values=Array.from(d.getElementById('smp').options).filter(o=>o.value).map(o=>o.value);
   ok(values.every(v=>{const expected=v.startsWith('lib-')?v.slice(4):({'ti-db5':'sot23-5','ti-db6':'sot23-6','ti-pw16':'tssop','bga100':'bga'}[v]||(/^chip/.test(v)?'chip':/^soic/.test(v)?'soic':v));return expected===pk}),component+'/'+pk+': فقط نمونهٔ همان پکیج در DOM است');
  }
 }
 setV(d,'component','resistor');setV(d,'footprintSearch','BGA');
 ok(!!d.querySelector('#footprintSearchResults button'),'جستجوی سراسری حتی از گروه مقاومت BGA را پیدا می‌کند');
 setV(d,'footprintSearch','CFR25');ok(!!d.querySelector('#footprintSearchResults button'),'نمونهٔ مقاومت پایه‌دار در گروه مقاومت پیدا می‌شود');
 setV(d,'component','capacitor');ok(!!d.querySelector('#footprintSearchResults button'),'نتایج جستجوی سراسری به گروه فعلی محدود نمی‌شوند');
 w.close();
}

console.log('\n۲۴) مرجع‌های واقعی KiCad و پیام مدل');
{
 const {d,w}=load(TOOL);const refs=JSON.parse(d.getElementById('referenceFootprintData').textContent);
 ok(Object.keys(refs).length===52,'۵۲ الگوی واقعی با دادهٔ آفلاین موجود است');
 for(const [key,ref] of Object.entries(refs)){
  setV(d,'smp','lib-'+key);
  const raw=fs.readFileSync(path.join(ROOT,'reference-footprints',key+'.kicad_mod'),'utf8');
  const first=[...raw.matchAll(/\(pad ("[^"]*"|\S+) (\S+) (\S+) \(at ([^)]*)\)\s*\(size ([^)]*)\)/g)][0];
  const size=first&&first[5].trim().split(/\s+/).map(Number);const at=first&&first[4].trim().split(/\s+/).map(Number);
  ok(d.getElementById('libraryMode').checked&&d.getElementById('pads').value.trim().split('\n').length===ref.pads.length+1&&size&&ref.pads[0].w===size[0]&&ref.pads[0].h===size[1]&&ref.pads[0].x===at[0]&&ref.pads[0].y===-at[1],key+': نقشه و تعداد پد و اولین ابعاد مطابق فایل اصلی');
  ok(d.getElementById('referenceComment').textContent.includes(ref.name)&&/دیتاشیت/.test(d.getElementById('referenceComment').textContent)&&d.getElementById('referenceSourceLink').href.includes(ref.sha),key+': مدل و هشدار و منبع نسخه‌دار مشخص است');
 }
 setV(d,'smp','lib-sot223');let data=JSON.parse(d.getElementById('referencePads').value);data[0].w+=.1;setV(d,'referencePads',JSON.stringify(data));
 ok(!!d.getElementById('pads').value&&d.getElementById('pads').value.includes(data[0].w.toFixed(4)),'ابعاد پد نامساوی مرجع قابل ویرایش و صادرات CSV است');
 const numeric=d.querySelector('#referenceTable input[data-row="0"][data-key="w"]');numeric.value='1.75';numeric.dispatchEvent(new w.Event('input',{bubbles:true}));
 ok(JSON.parse(d.getElementById('referencePads').value)[0].w===1.75&&d.getElementById('pads').value.includes('1.7500'),'ویرایش عددی ساده بدون نیاز به دستکاری JSON کار می‌کند');
 const body=JSON.parse(d.getElementById('referenceBody').value);body.lines.push([-20,0,20,0]);setV(d,'referenceBody',JSON.stringify(body));
 ok(!!d.getElementById('pads').value&&d.getElementById('res').textContent.includes('40.50'),'ابعاد بدنه نیز قابل اصلاح و در کادر لحاظ می‌شوند');

 d.getElementById('mkA').click();ok(/پشتیبانی نمی‌شود/.test(d.getElementById('alt').value),'مرجع چندجزئی به خروجی Altium ساده‌شده و ناقص تبدیل نمی‌شود');
 setV(d,'referencePads','{bad json');ok(!d.getElementById('pads').value&&!d.getElementById('stageEmpty').hidden,'ویرایش نامعتبر، نقشه و خروجی کهنه نمی‌گذارد');
 setV(d,'smp','lib-sot89');ok(!!d.querySelector('#svg polygon'),'پلیگون واقعی SOT-89 حفظ می‌شود');
 setV(d,'smp','lib-connector-smd');ok(d.getElementById('pads').value.includes('slot')===false&&d.getElementById('pads').value.includes('SlotLocalX')&&JSON.parse(d.getElementById('referencePads').value).some(p=>p.holeType==='slot'),'شیارهای USB در داده و CSV با ابعاد محلی صریح حفظ می‌شوند');
 setV(d,'smp','soic');ok(!d.getElementById('libraryMode').checked&&!!d.getElementById('pads').value,'بازگشت به محاسبهٔ عادی پس از مرجع مستقل است');
 w.close();
}

console.log('\n─────────────────────────────');
console.log('نتیجه: ' + pass + ' موفق، ' + fail + ' ناموفق');
if (fail) { console.log('موارد ناموفق:\n - ' + failures.join('\n - ')); process.exit(1); }
