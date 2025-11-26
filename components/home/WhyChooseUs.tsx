"use client";

import Image from "next/image";
import {
  Award,
  ShieldCheck,
  Headphones,
  Layers,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Feature = {
  title: string;
  description: string;
  icon?: string;
};

type SectionContent = {
  eyebrow?: string;
  title?: {
    line1?: string;
    highlight?: string;
  };
  description?: string;
  cta?: string;
  badge?: {
    label?: string;
    value?: string;
  };
  experience?: {
    value?: string;
    label?: string;
  };
  features?: Feature[];
  image?: string;
  imageAlt?: string;
};

const iconMap: Record<string, LucideIcon> = {
  Award,
  ShieldCheck,
  Headphones,
  Layers,
};

const fallbackContent: SectionContent = {
  eyebrow: "WHY CHOOSE US",
  title: {
    line1: "Your Trusted",
    highlight: "Security Partner",
  },
  description:
    "We deliver cutting-edge cybersecurity solutions backed by expertise, proven methodologies, and commitment to excellence.",
  cta: "Learn More About Us",
  badge: {
    label: "Certified",
    value: "ISO 27001",
  },
  experience: {
    value: "10+",
    label: "Years Experience",
  },
  features: [
    {
      title: "Certified Experts",
      description:
        "Our team holds CEH, OSCP, CISSP, and other industry-leading certifications.",
      icon: "Award",
    },
    {
      title: "Proven Track Record",
      description:
        "500+ successful projects across diverse industries with 100% satisfaction rate.",
      icon: "ShieldCheck",
    },
    {
      title: "24/7 Support",
      description:
        "Round-the-clock monitoring and rapid incident response when you need it most.",
      icon: "Headphones",
    },
    {
      title: "Tailored Solutions",
      description:
        "Custom strategies designed for your specific business needs and risk profile.",
      icon: "Layers",
    },
  ],
  image: "/images/cyberhand.jpg",
  imageAlt: "Cybersecurity professional holding a digital lock hologram",
};

export default function WhyChooseUs() {
  const { messages } = useLanguage();
  const section: SectionContent = {
    ...fallbackContent,
    ...(messages?.whyChooseSection ?? {}),
  };

  const features = section.features ?? fallbackContent.features!;

  return (
    <section className="relative bg-gradient-to-b from-black to-gray-900 py-20 md:py-28 text-white overflow-hidden">
      {/* Yellow light spots - top left and bottom right */}
      <div className="absolute top-0 ltr:left-0 rtl:right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="relative rounded-[32px]  shadow-2xl border border-white/10">
              <Image
                src={section.image ?? fallbackContent.image!}
                alt={section.imageAlt ?? fallbackContent.imageAlt!}
                width={640}
                height={480}
                className="h-full w-full rounded-2xl object-cover"
                sizes="(max-width: 1024px) 100vw, 640px"
              />
              {section.badge && (
                <div className="absolute -top-4 ltr:-left-4 rtl:-right-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-xl z-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide">
                      {section.badge.label}
                    </p>
                    <p className="text-base font-bold">{section.badge.value}</p>
                  </div>
                </div>
              )}
              {section.experience && (
                <div className="absolute -bottom-6 ltr:-right-6 rtl:-left-6 rounded-3xl bg-primary text-black px-6 py-4 text-center shadow-xl z-20">
                  <p className="text-3xl font-bold">
                    {section.experience.value}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    {section.experience.label}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 rtl:text-right">
            {section.eyebrow && (
              <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
                {section.eyebrow}
              </p>
            )}
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              {section.title?.line1}{" "}
              <span className="text-primary">{section.title?.highlight}</span>
            </h2>
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              {section.description}
            </p>

            <div className="grid gap-5">
              {features.map((feature, idx) => {
                const Icon =
                  iconMap[feature.icon ?? "ShieldCheck"] ?? ShieldCheck;
                return (
                  <div
                    key={`${feature.title}-${idx}`}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white">
                        {feature.title}
                      </p>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {section.cta && (
              <Button className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary text-black px-6 py-3 text-sm font-semibold hover:bg-primary/90">
                {section.cta}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
