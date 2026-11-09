# آزمون خودکار

```bash
npm i jsdom        # یک‌بار
node tests/run-tests.js
```

- فایل‌های `IPC-7352/*.html` را در jsdom با `runScripts: dangerously` باز می‌کند (شبیه باز کردن آفلاین در مرورگر).
- ۱۴۷ بررسی دارد: ایرادهای `Problem.md`، اندازه‌گذاری روی نقشه، سازگاری اعداد با هندسهٔ پدها، داینامیک بودن پنل، جابه‌جایی/بزرگ‌نمایی (تا ۲۰×) و جا شدن برچسب‌ها در کادرشان.
- جای اجرای واقعی Altium، Chromium یا آزمون لایه‌های PCB را نمی‌گیرد.

### آزمون مرورگر واقعی (اختیاری)
`tests/browser-preview.cjs` با `playwright-core` و `@sparticuz/chromium`، سرور فعال پورت 8080 را تست می‌کند: چهار نمونه، ابعاد SVG، بازیابی ذخیرهٔ خراب، خطای ورودی و دکمهٔ بازیابی. اجرا: `node tests/browser-preview.cjs`. بستهٔ Chromium به کتابخانه‌های سیستمی NSS/NSPR نیاز دارد. در sandbox فعلی با `LD_LIBRARY_PATH=/tmp/chromlibs/lib` اجرا شد. تصاویر آزمایشی فقط در `/tmp/ipc-*.png` ذخیره می‌شوند.
