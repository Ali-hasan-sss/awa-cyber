import {
  ShieldCheck,
  Globe,
  Wifi,
  Cloud,
  Lock,
  Brush,
  Code2,
  Brain,
  Cpu,
  Database,
  Server,
  LaptopMinimal,
  Sparkles,
  Bot,
  Monitor,
  Layout,
  Webhook,
  FileCode,
  Smartphone,
  Phone,
  Tablet,
  Palette,
  PenTool,
  Image,
  Megaphone,
  TrendingUp,
  BarChart,
  Target,
  LucideIcon,
} from "lucide-react";

export const serviceIconComponents = {
  ShieldCheck,
  Globe,
  Wifi,
  Cloud,
  Lock,
  Brush,
  Code2,
  Brain,
  Cpu,
  Database,
  Server,
  LaptopMinimal,
  Sparkles,
  Bot,
  Monitor,
  Layout,
  Webhook,
  FileCode,
  Smartphone,
  Phone,
  Tablet,
  Palette,
  PenTool,
  Image,
  Megaphone,
  TrendingUp,
  BarChart,
  Target,
};

export type ServiceIconKey = keyof typeof serviceIconComponents;

export const serviceIconOptions: Array<{
  value: ServiceIconKey;
  Icon: LucideIcon;
  label: { en: string; ar: string };
}> = [
  {
    value: "ShieldCheck",
    Icon: ShieldCheck,
    label: { en: "Cybersecurity", ar: "الأمن السيبراني" },
  },
  {
    value: "Globe",
    Icon: Globe,
    label: { en: "Web Platforms", ar: "المنصات والمواقع" },
  },
  {
    value: "Wifi",
    Icon: Wifi,
    label: { en: "Networks", ar: "الشبكات" },
  },
  {
    value: "Cloud",
    Icon: Cloud,
    label: { en: "Cloud & DevOps", ar: "السحابة و DevOps" },
  },
  {
    value: "Lock",
    Icon: Lock,
    label: { en: "Compliance", ar: "الامتثال" },
  },
  {
    value: "Brush",
    Icon: Brush,
    label: { en: "UI/UX Design", ar: "تصميم واجهات وتجربة" },
  },
  {
    value: "Code2",
    Icon: Code2,
    label: { en: "Software Engineering", ar: "الهندسة البرمجية" },
  },
  {
    value: "Brain",
    Icon: Brain,
    label: { en: "AI & Automation", ar: "الذكاء الاصطناعي والأتمتة" },
  },
  {
    value: "Cpu",
    Icon: Cpu,
    label: { en: "Infrastructure", ar: "البنية التحتية" },
  },
  {
    value: "Database",
    Icon: Database,
    label: { en: "Data & Analytics", ar: "البيانات والتحليلات" },
  },
  {
    value: "Server",
    Icon: Server,
    label: { en: "Managed Hosting", ar: "الاستضافة المُدارة" },
  },
  {
    value: "LaptopMinimal",
    Icon: LaptopMinimal,
    label: { en: "Digital Workplace", ar: "بيئة العمل الرقمية" },
  },
  {
    value: "Sparkles",
    Icon: Sparkles,
    label: { en: "Innovation", ar: "الابتكار" },
  },
  {
    value: "Bot",
    Icon: Bot,
    label: { en: "Automation Bots", ar: "الروبوتات والمهام الآلية" },
  },
  // Web Development Icons
  {
    value: "Monitor",
    Icon: Monitor,
    label: { en: "Web Development", ar: "تطوير الويب" },
  },
  {
    value: "Layout",
    Icon: Layout,
    label: { en: "Web Design", ar: "تصميم الويب" },
  },
  {
    value: "Webhook",
    Icon: Webhook,
    label: { en: "Web Services", ar: "خدمات الويب" },
  },
  {
    value: "FileCode",
    Icon: FileCode,
    label: { en: "Frontend Development", ar: "تطوير الواجهات الأمامية" },
  },
  // Mobile Development Icons
  {
    value: "Smartphone",
    Icon: Smartphone,
    label: { en: "Mobile App Development", ar: "تطوير تطبيقات الموبايل" },
  },
  {
    value: "Phone",
    Icon: Phone,
    label: { en: "iOS Development", ar: "تطوير iOS" },
  },
  {
    value: "Tablet",
    Icon: Tablet,
    label: { en: "Android Development", ar: "تطوير أندرويد" },
  },
  // Design Icons
  {
    value: "Palette",
    Icon: Palette,
    label: { en: "Graphic Design", ar: "التصميم الجرافيكي" },
  },
  {
    value: "PenTool",
    Icon: PenTool,
    label: { en: "UI Design", ar: "تصميم واجهات المستخدم" },
  },
  {
    value: "Image",
    Icon: Image,
    label: { en: "Visual Design", ar: "التصميم البصري" },
  },
  // Marketing Icons
  {
    value: "Megaphone",
    Icon: Megaphone,
    label: { en: "Digital Marketing", ar: "التسويق الرقمي" },
  },
  {
    value: "TrendingUp",
    Icon: TrendingUp,
    label: { en: "Growth Marketing", ar: "تسويق النمو" },
  },
  {
    value: "BarChart",
    Icon: BarChart,
    label: { en: "Analytics & Marketing", ar: "التحليلات والتسويق" },
  },
  {
    value: "Target",
    Icon: Target,
    label: { en: "Marketing Strategy", ar: "استراتيجية التسويق" },
  },
];
