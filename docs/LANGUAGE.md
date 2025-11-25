# دليل استخدام نظام اللغة

## نظرة عامة

يستخدم المشروع نظام إدارة لغة مبني على React Context API مع تخزين في localStorage. اللغة **لا تظهر في الروابط** ويتم تخزينها محلياً في المتصفح.

## المميزات

- ✅ تخزين اللغة في localStorage
- ✅ كشف تلقائي للغة المتصفح عند الزيارة الأولى
- ✅ تبديل سلس بين اللغات بدون إعادة تحميل الصفحة
- ✅ تحديث تلقائي لاتجاه النص (RTL/LTR)
- ✅ لا توجد لغة في الروابط - جميع الروابط بسيطة

## الاستخدام

### في المكونات

```tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function MyComponent() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div>
      {/* استخدام دالة الترجمة */}
      <h1>{t("hero.title")}</h1>

      {/* عرض اللغة الحالية */}
      <p>Current language: {locale}</p>

      {/* تغيير اللغة */}
      <button onClick={() => setLocale("ar")}>العربية</button>
      <button onClick={() => setLocale("en")}>English</button>
    </div>
  );
}
```

### بنية مفاتيح الترجمة

المفاتيح تستخدم dot notation للوصول للقيم المتداخلة:

```json
{
  "nav": {
    "services": "Services",
    "portfolio": "Portfolio"
  },
  "hero": {
    "title": "Fortress",
    "description": "Enterprise-grade..."
  }
}
```

الاستخدام:

- `t("nav.services")` → "Services"
- `t("hero.title")` → "Fortress"

### إضافة ترجمة جديدة

1. افتح `messages/en.json` و `messages/ar.json`
2. أضف المفتاح في كلا الملفين:

**messages/en.json:**

```json
{
  "mySection": {
    "title": "My Title"
  }
}
```

**messages/ar.json:**

```json
{
  "mySection": {
    "title": "عنواني"
  }
}
```

3. استخدمه في المكون:

```tsx
<h1>{t("mySection.title")}</h1>
```

## اللغة الافتراضية

- عند الزيارة الأولى، يتم كشف لغة المتصفح تلقائياً
- إذا كانت اللغة العربية، يتم تعيين العربية
- خلاف ذلك، يتم تعيين الإنجليزية
- بعد الاختيار، يتم حفظه في localStorage

## كيفية عمل النظام

1. **LanguageProvider** يغلف التطبيق في `app/layout.tsx`
2. عند التحميل، يقرأ اللغة من localStorage
3. إذا لم توجد، يكشف لغة المتصفح
4. عند تغيير اللغة، يتم:
   - تحديث state
   - تحديث localStorage
   - تحديث HTML attributes (lang, dir, className)
   - إعادة رسم المكونات تلقائياً

## أمثلة عملية

### زر تبديل اللغة

```tsx
const { locale, setLocale } = useLanguage();

const toggleLanguage = () => {
  setLocale(locale === "en" ? "ar" : "en");
};

<button onClick={toggleLanguage}>{locale === "en" ? "عربي" : "EN"}</button>;
```

### نص مشروط حسب اللغة

```tsx
const { locale, t } = useLanguage();

<div dir={locale === "ar" ? "rtl" : "ltr"}>
  <p>{t("welcome.message")}</p>
</div>;
```

### استخدام في Link

```tsx
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const { t } = useLanguage();

<Link href="/services">{t("nav.services")}</Link>;
```

## ملاحظات مهمة

- جميع المكونات التي تستخدم `useLanguage` يجب أن تكون `"use client"`
- اللغة تُطبق على جميع الصفحات بدون تغيير الروابط
- التخزين في localStorage يعني أن اللغة تُحفظ حتى بعد إغلاق المتصفح
