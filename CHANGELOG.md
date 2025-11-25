# سجل التغييرات

## التحديثات الأخيرة

### نظام اللغة الجديد (بدون روابط)

تم تحديث نظام إدارة اللغة لاستخدام localStorage بدلاً من الروابط:

#### التغييرات:

- ✅ إزالة نظام `[locale]` من الروابط
- ✅ استخدام Context API لإدارة اللغة
- ✅ تخزين اللغة في localStorage
- ✅ تبديل سلس بين اللغات بدون تغيير الروابط
- ✅ كشف تلقائي للغة المتصفح عند الزيارة الأولى

#### الملفات المحدثة:

- `contexts/LanguageContext.tsx` - Context جديد لإدارة اللغة
- `app/layout.tsx` - Layout مبسط بدون locale routing
- `app/page.tsx` - صفحة رئيسية مباشرة
- `components/Navbar.tsx` - استخدام LanguageContext
- `components/Hero.tsx` - استخدام LanguageContext
- `next.config.js` - إزالة إعدادات next-intl

#### الملفات المحذوفة:

- `middleware.ts`
- `app/[locale]/layout.tsx`
- `app/[locale]/page.tsx`
- `app/[locale]/globals.css`
- `i18n/request.ts`
- `i18n/routing.ts`

#### الاستخدام:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";

function MyComponent() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div>
      <p>{t("nav.services")}</p>
      <button onClick={() => setLocale("ar")}>العربية</button>
    </div>
  );
}
```
