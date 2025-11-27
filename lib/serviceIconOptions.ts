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
];
