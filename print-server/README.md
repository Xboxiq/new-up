# خادم تدفّق الخير — تحويل الـ docx إلى PDF للطباعة

خادم صغير (سكربت Node واحد، بدون أي مكتبة خارجية) ينصب **مرّة واحدة على جهاز واحد**،
ويستخدمه كل موظفي المركز للطباعة **بدون أي تثبيت على أجهزتهم**.

## الفكرة باختصار

```
        موظف يفتح التطبيق على متصفّحه
                     │
                     ▼ يضغط «طباعة»
        التطبيق يولّد ملف docx (في المتصفّح)
                     │
                     ▼  POST /convert
   ┌─────────────────────────────────────────────────┐
   │   الخادم المركزي (هذا السكربت)                  │
   │      docx ─→ LibreOffice ─→ PDF                  │
   └─────────────────────────────────────────────────┘
                     │
                     ▼  يُعيد PDF
        المتصفّح يعرض نافذة الطباعة الخاصّة به
                     │
                     ▼  الموظف يضغط «طباعة»
              طابعة الموظف المحلّية
```

**النتيجة:**
- ✅ صفر تثبيت عند الموظف
- ✅ كل موظف يطبع على طابعته الخاصّة (ليست طابعة الخادم)
- ✅ ملف PDF مطابق ١٠٠٪ لملف Word الأصلي
- ✅ يعمل على Chrome/Edge/Firefox/Safari، Windows/Mac/Linux، حتى التابلت

## المتطلّبات

على جهاز الخادم فقط:

| الحاجة | لماذا |
|--------|------|
| [Node.js >= 18](https://nodejs.org/) | لتشغيل السكربت |
| [LibreOffice](https://www.libreoffice.org/download/) | للتحويل من docx إلى PDF |

أجهزة الموظفين: **لا شيء** — متصفّح فقط.

## التشغيل

```bash
cd print-server
node server.js
```

سيظهر:
```
╔════════════════════════════════════════════════════╗
║          📠  Tadfuq Print Server                   ║
╠════════════════════════════════════════════════════╣
║  http://localhost:9876                              ║
║  platform : linux                                   ║
║  printer  : (system default)                        ║
╚════════════════════════════════════════════════════╝
  Health  : GET  http://localhost:9876/ping
  Convert : POST http://localhost:9876/convert?name=<n>   → returns PDF
  Print   : POST http://localhost:9876/print?name=<n>     → silent print on this machine
```

اتركه شغّالاً. خلاص — التطبيق سيستخدمه تلقائياً.

### تشغيل تلقائي عند الإقلاع

**Windows:**
- `Win + R` ← اكتب `shell:startup` ← ضع `start.bat`

**Linux (systemd):**
```bash
sudo tee /etc/systemd/system/tadfuq-print.service <<EOF
[Unit]
Description=Tadfuq Print Server
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/tadfuq/print-server/server.js
Restart=always
User=$USER

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable --now tadfuq-print
```

## ربط التطبيق بالخادم

من **لوحة الأدمن → إعدادات المركز**، ضع عنوان الخادم في حقل **«عنوان خادم الطباعة»**:

```
http://192.168.1.10:9876
```

(استبدل `192.168.1.10` بـ IP جهاز الخادم على الشبكة المحلّية.)

هذا الإعداد يُحفظ في قاعدة البيانات المشتركة، فيستفيد منه **كل** الموظفين تلقائياً.

## أين أنشر الخادم؟

| الموقع | متى تختاره |
|--------|------------|
| **جهازك الشخصي** | إذا كان دائماً شغّالاً وعلى نفس الشبكة |
| **PC في المركز** | الأبسط — جهاز قديم أو Raspberry Pi |
| **استضافة مجانية** (Render / Fly.io / Hugging Face Spaces) | إذا كنت تريد الوصول من خارج الشبكة |
| **سيرفر سحابي** | للنشر الإنتاجي الكامل |

## الـ Endpoints

### `GET /ping`
فحص أن الخادم شغّال.
```json
{
  "ok": true,
  "service": "tadfuq-print",
  "version": "1.0.0",
  "platform": "linux",
  "printer": "(system default)"
}
```

### `POST /convert?name=<filename>`
**(الموصى به)** يقبل ملف docx في الـ body، يُعيد PDF.
الـ Content-Type المطلوب:
`application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### `POST /print?name=<filename>`
طباعة صامتة على طابعة الخادم نفسه (لا طابعة الموظف).
استخدمه فقط في حال نشر الخادم على نفس جهاز الموظف.

## متغيّرات البيئة

| المتغيّر | الافتراضي | الوصف |
|---------|-----------|--------|
| `PRINT_PORT` | `9876` | منفذ HTTP |
| `PRINTER` | (افتراضي النظام) | اسم طابعة محدّدة لمسار `/print` فقط |

## الأمان

- يستمع على كل واجهات الشبكة (`0.0.0.0`) — إذا أردت تقييده على الشبكة المحلّية فقط، ضع جداراً نارياً.
- لا يحفظ أي ملفات — كل شيء مؤقّت ويُحذف بعد ٥-٦٠ ثانية.
- لا قاعدة بيانات، لا logs دائمة، لا تخزين.

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `EADDRINUSE` | المنفذ مستخدم — `PRINT_PORT=7000 node server.js` |
| `convert failed: ENOENT` | LibreOffice غير مثبّت |
| الموظفون لا يستطيعون الوصول | تأكّد أن الـ firewall يسمح بمنفذ 9876 |
| تظهر نافذة طباعة فارغة | تأكّد من تحديث المتصفّح؛ بعض النسخ القديمة من Safari لا تدعم طباعة PDF داخل iframe |
