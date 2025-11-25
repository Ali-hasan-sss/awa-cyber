# دليل التثبيت السريع

## المشكلة: ECONNRESET

هذه مشكلة في الاتصال بالشبكة. جرب الحلول التالية بالترتيب:

### ✅ الحل 1: التثبيت مرة أخرى (بعد التحديثات)
```powershell
npm install
```

### ✅ الحل 2: إذا فشل الحل 1 - استخدم timeout أطول
```powershell
npm install --fetch-timeout=300000 --fetch-retries=5
```

### ✅ الحل 3: استخدام yarn (أكثر استقراراً)
```powershell
# تثبيت yarn أولاً
npm install -g yarn

# ثم تثبيت الحزم
yarn install
```

### ✅ الحل 4: التثبيت على دفعات
```powershell
# تثبيت الحزم الأساسية أولاً
npm install next react react-dom

# ثم باقي الحزم
npm install next-intl tailwindcss postcss autoprefixer

# ثم الحزم المساعدة
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot

# وأخيراً الحزم التطويرية
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next
```

### ✅ الحل 5: استخدام registry آخر
```powershell
npm install --registry https://registry.npmmirror.com/
```

## بعد التثبيت الناجح

```powershell
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

## ملاحظة مهمة

إذا استمرت المشكلة، قد يكون السبب:
- Firewall أو Antivirus يمنع الاتصال
- Proxy settings خاطئة
- مشكلة في الاتصال بالإنترنت

في هذه الحالة، جرب:
1. تعطيل Antivirus مؤقتاً
2. استخدام VPN
3. التحقق من إعدادات Proxy في npm: `npm config get proxy`
