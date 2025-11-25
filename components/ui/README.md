# UI Components

هذا المجلد يحتوي على مكونات UI القابلة لإعادة الاستخدام المستندة إلى shadcn/ui ومصممة خصيصاً لموقع AWA CYBER.

## المكونات المتاحة

### Button (`button.tsx`)

زر قابل للتخصيص مع عدة variants:

- `default`: اللون الأصفر الأساسي للعلامة التجارية
- `secondary`: لون بني ثانوي
- `outline`: إطار فقط
- `ghost`: شفاف
- `link`: نمط الرابط

### Card (`card.tsx`)

مكون بطاقة يتضمن:

- `Card`: الحاوية الرئيسية
- `CardHeader`: رأس البطاقة
- `CardTitle`: عنوان البطاقة
- `CardDescription`: وصف البطاقة
- `CardContent`: محتوى البطاقة
- `CardFooter`: تذييل البطاقة

### Badge (`badge.tsx`)

شارة لعرض التصنيفات والحالات:

- `default`: الأصفر الأساسي
- `secondary`: البني الثانوي
- `outline`: إطار فقط

### Input (`input.tsx`)

حقل إدخال نصي قياسي مع تصميم متناسق.

### Textarea (`textarea.tsx`)

منطقة نص متعددة الأسطر.

### Separator (`separator.tsx`)

فاصل أفقي أو عمودي.

### Container (`container.tsx`)

حاوية متجاوبة بأحجام مختلفة:

- `sm`: 3xl
- `md`: 5xl
- `lg`: 6xl
- `xl`: 7xl (افتراضي)
- `full`: كامل العرض

## الاستخدام

```tsx
import { Button, Card, Badge } from "@/components/ui";

// أو استيراد مكون واحد
import { Button } from "@/components/ui/button";
```

## التخصيص

جميع المكونات تستخدم ألوان العلامة التجارية AWA CYBER المحددة في `tailwind.config.ts`:

- Primary: #FFD700 (أصفر)
- Secondary: #8B6F47 (بني)
- Accent: #F4D03F (خردلي)
