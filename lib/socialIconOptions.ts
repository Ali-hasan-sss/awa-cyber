import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Mail,
  LucideIcon,
} from "lucide-react";

export const socialIconComponents = {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Mail,
};

export type SocialIconKey = keyof typeof socialIconComponents;

export const socialIconOptions: Array<{
  value: SocialIconKey;
  Icon: LucideIcon;
  label: { en: string; ar: string };
}> = [
  {
    value: "Facebook",
    Icon: Facebook,
    label: { en: "Facebook", ar: "فيسبوك" },
  },
  {
    value: "Twitter",
    Icon: Twitter,
    label: { en: "Twitter", ar: "تويتر" },
  },
  {
    value: "Instagram",
    Icon: Instagram,
    label: { en: "Instagram", ar: "إنستغرام" },
  },
  {
    value: "Linkedin",
    Icon: Linkedin,
    label: { en: "LinkedIn", ar: "لينكد إن" },
  },
  {
    value: "Youtube",
    Icon: Youtube,
    label: { en: "YouTube", ar: "يوتيوب" },
  },
  {
    value: "Github",
    Icon: Github,
    label: { en: "GitHub", ar: "جيت هاب" },
  },
  {
    value: "Mail",
    Icon: Mail,
    label: { en: "Email", ar: "البريد الإلكتروني" },
  },
];
