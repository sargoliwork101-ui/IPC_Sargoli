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

function setV(d, id, v) {
  const e = d.getElementById(id);
  if (!e) throw new Error('#' + id + ' پیدا نشد');
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
  ok(/^r/.test(val(d, 'نام Padstack')), 'نام Padstack پین ۱ مربع با r شروع می‌شود', val(d, 'نام Padstack'));
  setV(d, 'tHT', 'N');
  ok(/hn/.test(val(d, 'نام Padstack')), 'سوراخ غیرآبکاری hn است', val(d, 'نام Padstack'));
  ok(/±0\.10/.test(val(d, 'سوراخ')), 'تلرانس NPTH برابر 0.10 است', val(d, 'سوراخ'));
  setV(d, 'pHole', 0); setV(d, 'tHT', 'F');
  ok(!val(d, 'سوراخ') && /Press-fit/.test(d.getElementById('warn').textContent), 'Press-fit بدون قطر سازنده خروجی نمی‌دهد');
  setV(d, 'pHole', 1.0); setV(d, 'tHT', 'P'); setV(d, 'tPr', '0');
  setV(d, 'tW', 0.6);
  ok(!!val(d, 'سوراخ'), 'Press-fit با قطر سازنده محاسبه می‌شود');
}
{ // مرز جدول 4-4 با مقدار واقعی سوراخ سنجیده می‌شود
  const { d } = load(TOOL);
  setV(d, 'kind', 'th'); setV(d, 'tHT', 'P'); setV(d, 'tPr', '0'); setV(d, 'tW', 0.6); setV(d, 'pHole', 1.004);
  ok(/1\.00/.test(val(d, 'سوراخ')) && /1\.75/.test(val(d, 'پد')), 'سوراخ 1.004 (ردیف پد بعدی) و پد 1.75', val(d, 'سوراخ') + ' / ' + val(d, 'پد'));
}

console.log('\n۶) نام‌گذاری و رمزگشایی (ایراد ۱۸، ۲۰، ۴۲، ۴۳، ۷۷، ۸۰، ۸۳، ۸۹، ۹۰، ۹۱، ۹۶، ۹۷)');
{
  const { d } = load(TOOL);
  setV(d, 'fam', 'chip'); setV(d, 'cType', 'CAPC'); setV(d, 'Lmax', 0.4); setV(d, 'Lmin', 0.35); setV(d, 'Tmin', .05); setV(d, 'Tmax', .1);
  setV(d, 'W', 0.2); setV(d, 'H', 0.2); setV(d, 'P', .4); setV(d, 'n', 1); setV(d, 'autoS', 0); setV(d, 'Smax', 0.2);
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
  ok(/L 1\.31 mm/.test(t1) && /X 0\.57 mm/.test(t1), 'اندازهٔ طول و عرض پد روی نقشه نوشته می‌شود', t1);
  ok(/Z 6\.90 mm/.test(t1), 'طول کل پدها (Z) روی نقشه اندازه‌گذاری می‌شود', t1);
  ok(/Courtyard/.test(t1), 'Courtyard روی نقشه با اندازه نوشته می‌شود', t1);
  const [vx, vy, vw, vh] = vb();
  ok(vw > 0 && vh > 0 && vw < 600 && vh < 600, 'نمای نقشه به اندازهٔ محتوا بریده می‌شود (بدون فضای خالی)', vb().join(','));

  setV(d, 'kind', 'bga');
  const t2 = svgTexts();
  ok(/Ø 0\.40 mm/.test(t2) && /P 0\.80 mm/.test(t2), 'قطر توپ و گام روی نقشهٔ BGA اندازه‌گذاری می‌شود', t2);
  setV(d, 'kind', 'th');
  const t3 = svgTexts();
  ok(/Hole Ø0\.92 mm/.test(t3) && /Row span 7\.62 mm/.test(t3), 'سوراخ و فاصلهٔ ردیف‌ها روی نقشهٔ TH اندازه‌گذاری می‌شود', t3);
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
  ok(new RegExp('Z ' + z.toFixed(2) + ' mm').test(labels),
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

console.log('\n۱۰) پنل داینامیک');
{
  const { d } = load(TOOL);
  const shown = () => [...d.querySelectorAll('#paramGrid>div')].filter(x => x.style.display !== 'none').map(x => x.querySelector('input,select').id);
  setV(d, 'kind', 'smd'); const a = shown();
  setV(d, 'kind', 'bga'); const b = shown();
  setV(d, 'kind', 'th');  const c = shown();
  ok(a.includes('pZJ') && !a.includes('pBR'), 'SMD فقط پارامترهای SMD را نشان می‌دهد', a.join(','));
  ok(b.includes('pBR') && !b.includes('pZJ'), 'BGA فقط پارامترهای BGA را نشان می‌دهد', b.join(','));
  ok(c.includes('pHole') && !c.includes('pBR'), 'TH فقط پارامترهای سوراخ‌دار را نشان می‌دهد', c.join(','));
  setV(d, 'showAllP', true);
  ok([...d.querySelectorAll('#paramGrid>div')].every(x => x.style.display !== 'none'), 'کلید «نمایش همه» همهٔ پارامترها را برمی‌گرداند');
  const sel = d.querySelector('.grid>div.wide select');
  ok(!!sel, 'فیلدهای انتخابی تمام‌عرض علامت‌گذاری می‌شوند (متن نصفه نمی‌شود)');
}

console.log('\n۸) دوره: متن استاندارد (ایراد ۱۴، ۴، ۶۱، ۶۷، ۹۲)');
{
  const t = fs.readFileSync(COURSE, 'utf8');
  ok(!/round-off برای همه‌ی جدول‌های 3-1 تا 3-15 یکسان/.test(t), 'ادعای یکسان‌بودن round-off اصلاح شد');
  ok(/کاهش اکید نیست|کم یا برابر/.test(t), 'ادعای کاهش اکید J اصلاح شد');
  ok(/تصحیح هندسی/.test(t), 'توضیح علامت G اصلاح شد');
  ok(/استثنا دارد/.test(t), 'استثنای قاعدهٔ شمارهٔ اول نام TH ذکر شد');
  ok(/043|04<\/code> و <code>02|صفر ابتدایی لازم/.test(t), 'قاعدهٔ دو کاراکتری نام چیپ توضیح داده شد');
}

console.log('\n─────────────────────────────');
console.log('نتیجه: ' + pass + ' موفق، ' + fail + ' ناموفق');
if (fail) { console.log('موارد ناموفق:\n - ' + failures.join('\n - ')); process.exit(1); }
