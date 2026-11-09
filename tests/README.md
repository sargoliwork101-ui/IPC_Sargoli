# آزمون خودکار

```bash
npm i jsdom        # یک‌بار
node tests/run-tests.js
```

- فایل‌های `IPC-7352/*.html` را در jsdom با `runScripts: dangerously` باز می‌کند (شبیه باز کردن آفلاین در مرورگر).
- ۵۴ بررسی دارد که هر کدام یکی از ایرادهای `Problem.md` را می‌سنجد.
- جای اجرای واقعی Altium، Chromium یا آزمون لایه‌های PCB را نمی‌گیرد.
