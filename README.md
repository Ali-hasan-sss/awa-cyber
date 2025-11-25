# AWA CYBER - شركة البرمجيات والتكنولوجيا

موقع شركة AWA CYBER ثنائي اللغة (العربية والإنجليزية) مبني باستخدام Next.js 14 و Tailwind CSS.

## المميزات

- ✅ Next.js 14 مع App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui components
- ✅ دعم ثنائي اللغة (العربية والإنجليزية) مع localStorage
- ✅ تصميم متجاوب (Responsive)
- ✅ ألوان مستخرجة من التصميم الأصلي
- ✅ تخزين اللغة في localStorage (بدون استخدام اللغات في الروابط)

## البدء

1. تثبيت المتطلبات:

```bash
npm install
```

2. تشغيل المشروع في وضع التطوير:

```bash
npm run dev
```

3. فتح المتصفح على:

```
http://localhost:3000
```

**ملاحظة**: اللغة يتم تخزينها في localStorage وتُطبق على جميع الصفحات بدون استخدام اللغات في الروابط.

## البنية

```
├── app/
│   ├── layout.tsx         # Layout الرئيسي
│   ├── page.tsx           # الصفحة الرئيسية
│   └── globals.css        # الأنماط العامة
├── components/
│   ├── ui/                # مكونات UI القابلة لإعادة الاستخدام
│   │   ├── button.tsx     # زر قابل للتخصيص
│   │   ├── card.tsx       # بطاقة
│   │   ├── badge.tsx      # شارة
│   │   ├── input.tsx      # حقل إدخال
│   │   ├── textarea.tsx   # منطقة نص
│   │   ├── separator.tsx  # فاصل
│   │   ├── container.tsx  # حاوية
│   │   └── index.ts       # تصدير جميع المكونات
│   ├── Navbar.tsx         # شريط التنقل
│   └── Hero.tsx           # قسم البطل
├── contexts/
│   └── LanguageContext.tsx # Context لإدارة اللغة
├── lib/
│   └── utils.ts           # أدوات مساعدة
└── messages/              # ملفات الترجمة
    ├── en.json
    └── ar.json
```

## الألوان

- **Primary (Yellow)**: #FFD700
- **Secondary (Brown)**: #8B6F47
- **Accent (Mustard)**: #F4D03F

## التطوير

- استخدم `npm run dev` لتشغيل المشروع
- استخدم `npm run build` لبناء المشروع للإنتاج
- استخدم `npm run lint` للتحقق من الأخطاء
