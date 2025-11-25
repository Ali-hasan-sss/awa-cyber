# البدء السريع - AWA CYBER

## 🚀 خطوات التثبيت

### الطريقة الموصى بها (بعد تحديث package.json):

```powershell
npm install
```

### إذا واجهت مشكلة ECONNRESET:

#### الخيار 1: استخدام timeout أطول
```powershell
npm install --fetch-timeout=300000
```

#### الخيار 2: استخدام yarn (موصى به)
```powershell
npm install -g yarn
yarn install
```

#### الخيار 3: التثبيت على دفعات
قم بتشغيل هذه الأوامر واحداً تلو الآخر:

```powershell
npm install next react react-dom next-intl
npm install tailwindcss postcss autoprefixer -D
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot
npm install typescript @types/node @types/react @types/react-dom -D
npm install eslint eslint-config-next -D
```

## ✅ بعد التثبيت الناجح

```powershell
npm run dev
```

افتح المتصفح على:
- **الإنجليزية**: http://localhost:3000
- **العربية**: http://localhost:3000/ar

## 📝 ملاحظات

- تم تحديث جميع الحزم لإصدارات أحدث وأكثر استقراراً
- تم إضافة ملف `.npmrc` لتحسين الأداء
- إذا استمرت المشاكل، راجع `TROUBLESHOOTING.md`

## 🎨 المكونات الجاهزة

- ✅ Navbar مع تبديل اللغة
- ✅ Hero Section كامل
- ✅ مكتبة UI components (Button, Card, Badge, Input, etc.)
- ✅ نظام ترجمة كامل (عربي/إنجليزي)
