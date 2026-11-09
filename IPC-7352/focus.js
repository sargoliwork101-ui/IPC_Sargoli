/* Focused IPC-7352 starting-point calculator. Dimensions are in millimetres. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const ids = ['fpLmin','fpLmax','fpTmin','fpTmax','fpW','fpH','fpBodyX','fpBodyY','fpPitch','fpS','fpGap'];
  const samples = {
    sot: {fpLmin:2.8, fpLmax:3.0, fpTmin:0.3, fpTmax:0.5, fpW:0.5, fpH:1.1, fpBodyX:3.0, fpBodyY:1.5, fpPitch:0.95},
    res: {fpLmin:1.5, fpLmax:1.7, fpTmin:0.15, fpTmax:0.45, fpW:0.85, fpH:0.45, fpBodyX:1.7, fpBodyY:0.85, fpPitch:0.95}
  };
  const ns = 'http://www.w3.org/2000/svg';
  const fmt = x => Number(x).toFixed(4);
  const round = (x, decimals) => Number(x.toFixed(decimals));
  function clear(message) {
    $('fpError').textContent = message;
    $('fpOutput').hidden = true;
    $('fpResults').replaceChildren();
    $('fpCsv').value = '';
    $('fpSvg').replaceChildren();
    $('fpCopyStatus').textContent = '';
  }
  function val(id) {
    const v = $(id).value.trim();
    return v === '' ? NaN : Number(v);
  }
  function example() {
    const kind = $('fpKind').value;
    for (const [id, value] of Object.entries(samples[kind])) $(id).value = value;
    $('fpS').value = '';
    $('fpStyleBox').hidden = kind !== 'sot';
    $('fpPitchBox').hidden = kind !== 'sot';
    calculate();
  }
  function draw(pads, cx, cy, bodyX, bodyY) {
    const svg = $('fpSvg');
    svg.replaceChildren();
    const scale = Math.min(480 / cx, 230 / cy);
    const x = n => 300 + n * scale, y = n => 160 - n * scale;
    function add(tag, attributes, text) {
      const e = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attributes)) e.setAttribute(key, value);
      if (text != null) e.textContent = text;
      svg.appendChild(e);
    }
    add('rect', {x:x(-cx/2), y:y(cy/2), width:cx*scale, height:cy*scale, fill:'none', stroke:'#c0392b', 'stroke-width':2, 'stroke-dasharray':'6 4'});
    add('rect', {x:x(-bodyX/2), y:y(bodyY/2), width:bodyX*scale, height:bodyY*scale, fill:'#8e9aa3', 'fill-opacity':0.35, stroke:'#555'});
    for (const p of pads) {
      add('rect', {x:x(p.x-p.w/2), y:y(p.y+p.h/2), width:p.w*scale, height:p.h*scale, rx:Math.min(p.w,p.h)*scale/2, fill:'#d4a017', stroke:'#735900'});
      add('text', {x:x(p.x), y:y(p.y)+4, 'text-anchor':'middle', fill:'#101010', 'font-size':14}, p.n);
    }
  }
  function calculate() {
    clear('');
    const kind = $('fpKind').value, sot = kind === 'sot';
    const Lmin=val('fpLmin'), Lmax=val('fpLmax'), Tmin=val('fpTmin'), Tmax=val('fpTmax');
    const W=val('fpW'), H=val('fpH'), bx=val('fpBodyX'), by=val('fpBodyY'), pitch=val('fpPitch'), gap=val('fpGap');
    const values=[Lmin,Lmax,Tmin,Tmax,W,H,bx,by];
    if (values.some(v=>!Number.isFinite(v)||v<=0) || !Number.isFinite(gap) || gap<0 || (sot && (!Number.isFinite(pitch)||pitch<=0))) {
      clear('همهٔ ابعاد لازم باید مثبت و فاصلهٔ مس باید صفر یا مثبت باشد.'); return;
    }
    if (Lmin>Lmax || Tmin>Tmax || Lmin<=2*Tmax) {
      clear('ترتیب حداقل و حداکثر یا طول تماس پایه معتبر نیست؛ مقادیر دیتاشیت را بررسی کنید.'); return;
    }
    const worstMin=Lmin-2*Tmax, worstMax=Lmax-2*Tmin;
    const inputS=$('fpS').value.trim();
    const rms=Math.sqrt((Lmax-Lmin)**2+2*(Tmax-Tmin)**2);
    const S=inputS==='' ? (worstMin+worstMax+rms)/2 : val('fpS');
    if (!Number.isFinite(S)||S<=0||S<worstMin-1e-9||S>worstMax+1e-9) {
      clear('Smax باید مثبت و در بازهٔ هندسی قابل قبول داده‌های L و T باشد؛ دیتاشیت را بررسی کنید.'); return;
    }
    const i={A:0,B:1,C:2}[$('fpLevel').value];
    let jt,jh,js,ce,table,description;
    if (sot && $('fpStyle').value==='gull') {
      jt=[.55,.35,.15][i]; jh=[.45,.35,.25][i]; js=[.05,.03,0][i]; ce=[.5,.25,.1][i]; table='3-1';
      if (S<=by) jh=[.25,.15,.05][i];
      description='Gull-wing';
    } else if (sot) {
      jt=[.30,.20,.10][i]; jh=0; js=[.05,0,0][i]; ce=[.20,.15,.10][i]; table='3-15'; description='پایه تخت';
    } else if (W>=.5) {
      jt=[.55,Math.min(.25*H,.5),.15][i]; jh=0; js=[.05,0,0][i]; ce=[.50,.25,.10][i]; table='3-3'; description='چیپ، عرض پایه حداقل ۰٫۵';
    } else {
      jt=[1,.5,.25][i]*H; jh=0; js=0; ce=[.20,.15,.10][i]; table='3-4'; description='چیپ، عرض پایه کمتر از ۰٫۵';
    }
    // Table 3-4 specifies rounding for the toe calculation only.
    if (table==='3-4') jt=round(jt,2);
    const decimals=sot && table==='3-1' && pitch<.4 ? 3 : 2;
    const Z=table==='3-4' ? Lmax+2*jt : round(Lmax+2*jt,decimals);
    const G=table==='3-4' ? S-2*jh : round(S-2*jh,decimals);
    const X=table==='3-4' ? W+2*js : round(W+2*js,decimals);
    if (G<=0 || Z<=G || X<=0) { clear('ابعاد پد یا فاصلهٔ داخلی معتبر نیست؛ داده‌ها و سطح انتخابی را بررسی کنید.'); return; }
    const length=(Z-G)/2, center=(Z+G)/4;
    const pads=sot ? [
      {n:'1',x:-pitch/2,y:-center,w:X,h:length},
      {n:'2',x:pitch/2,y:-center,w:X,h:length},
      {n:'3',x:0,y:center,w:X,h:length}
    ] : [
      {n:'1',x:-center,y:0,w:length,h:X},
      {n:'2',x:center,y:0,w:length,h:X}
    ];
    // Bounding-box distance is conservative for oblong pads; do not silently accept an overlap.
    for (let a=0;a<pads.length;a++) for (let b=a+1;b<pads.length;b++) {
      const dx=Math.max(0,Math.abs(pads[a].x-pads[b].x)-(pads[a].w+pads[b].w)/2);
      const dy=Math.max(0,Math.abs(pads[a].y-pads[b].y)-(pads[a].h+pads[b].h)/2);
      if (Math.hypot(dx,dy)<gap-1e-9 || (dx===0 && dy===0)) {
        clear('فاصلهٔ پدهای '+pads[a].n+' و '+pads[b].n+' کمتر از حد انتخابی است یا پدها هم‌پوشانی دارند. ابعاد، سطح و توان ساخت را بررسی کنید.'); return;
      }
    }
    let halfX=bx/2, halfY=by/2;
    for (const p of pads) { halfX=Math.max(halfX,Math.abs(p.x)+p.w/2); halfY=Math.max(halfY,Math.abs(p.y)+p.h/2); }
    const cx=2*(halfX+ce), cy=2*(halfY+ce);
    const rows=[['خانواده و مرجع',description+'، جدول '+table+'، سطح '+$('fpLevel').value],
      ['Smax',fmt(S)+' mm — '+(inputS===''?'تخمین RMS':'مستقیم از ورودی دیتاشیت')],
      ['Z / G / X',fmt(Z)+' / '+fmt(G)+' / '+fmt(X)+' mm'],
      ['طول × عرض هر پد',fmt(length)+' × '+fmt(X)+' mm'],
      ['Courtyard (X × Y)',fmt(cx)+' × '+fmt(cy)+' mm'],
      ['J پنجه / پاشنه / کناره',fmt(jt)+' / '+fmt(jh)+' / '+fmt(js)+' mm'],
      ['فرض علامت G','G = Smax − 2 × JH؛ فرمول چاپی و متن IPC-7352 در این مورد متناقض‌اند.']];
    const tbody=$('fpResults');
    for (const [key,value] of rows) { const tr=document.createElement('tr'); for(const text of [key,value]) { const td=document.createElement('td');td.textContent=text;tr.appendChild(td); } tbody.appendChild(tr); }
    $('fpCsv').value='Pad,X(mm),Y(mm),SizeX(mm),SizeY(mm),Shape\n'+pads.map(p=>[p.n,fmt(p.x),fmt(p.y),fmt(p.w),fmt(p.h),'oblong'].join(',')).join('\n');
    draw(pads,cx,cy,bx,by);
    $('fpOutput').hidden=false;
  }
  $('fpKind').addEventListener('change',example);
  for (const id of [...ids,'fpLevel','fpStyle']) $(id).addEventListener('input',calculate);
  $('fpCopy').addEventListener('click',async function () {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText($('fpCsv').value);
      $('fpCopyStatus').textContent=' کپی شد.';
    } catch (_) {
      $('fpCsv').focus(); $('fpCsv').select();
      $('fpCopyStatus').textContent='متن انتخاب شد؛ با Ctrl+C کپی کنید.';
    }
  });
  example();
})();
