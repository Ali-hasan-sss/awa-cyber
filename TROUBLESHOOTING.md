# دليل حل المشاكل - AWA CYBER

## مشكلة: خطأ ECONNRESET عند التثبيت

إذا واجهت خطأ `ECONNRESET` أثناء تثبيت الحزم، جرب الحلول التالية:

### الحل 1: إعادة التثبيت
```bash
npm cache clean --force
npm install
```

### الحل 2: استخدام yarn بدلاً من npm
```bash
npm install -g yarn
yarn install
```

### الحل 3: تثبيت الحزم بشكل منفصل
```bash
npm install next react react-dom --save
npm install next-intl --save
npm install tailwindcss postcss autoprefixer --save-dev
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot --save
```

### الحل 4: استخدام registry بديل
```bash
npm install --registry=https://registry.npmjs.org/
```

### الحل 5: تحديث npm
```bash
npm install -g npm@latest
npm install
```

### الحل 6: تعطيل Antivirus مؤقتاً
بعض برامج الحماية قد تمنع npm من الوصول للشبكة. جرب تعطيلها مؤقتاً أثناء التثبيت.

### الحل 7: استخدام VPN
إذا كنت خلف firewall أو proxy قوي، قد تحتاج لاستخدام VPN.

## مشكلة: EPERM (Permission Denied)

إذا واجهت خطأ EPERM:

### الحل 1: تشغيل PowerShell كمسؤول
1. انقر بزر الماوس الأيمن على PowerShell
2. اختر "Run as Administrator"
3. انتقل لمجلد المشروع
4. شغل `npm install`

### الحل 2: إغلاق التطبيقات التي قد تستخدم الملفات
- VS Code
- أي محرر نصوص آخر
- أي متصفح يعرض المشروع
- أي عملية Node.js تعمل

### الحل 3: حذف node_modules يدوياً
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## تحذيرات Deprecation

التحذيرات عن الحزم القديمة (deprecated) ليست خطيرة ويمكن تجاهلها. الحزم المحدثة في package.json ستحل معظم هذه المشاكل بعد التثبيت.

## التحقق من التثبيت

بعد التثبيت الناجح، تحقق من:
```bash
npm run dev
```

إذا شغل المشروع على `http://localhost:3000`، فكل شيء يعمل بشكل صحيح!
