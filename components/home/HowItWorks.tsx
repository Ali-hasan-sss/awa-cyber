"use client";

import {
  MessageCircle,
  Search,
  Settings,
  Activity,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = {
  number: string;
  title: string;
  description: string;
  icon?: string;
};

type SectionContent = {
  eyebrow?: string;
  title?: {
    line1?: string;
    highlight?: string;
    line2?: string;
  };
  description?: string;
  steps?: Step[];
  cta?: string;
};

const iconMap: Record<string, LucideIcon> = {
  MessageCircle,
  Search,
  Settings,
  Activity,
};

const fallbackContent: SectionContent = {
  eyebrow: "OUR PROCESS",
  title: {
    line1: "How",
    highlight: "AWA Cyber",
    line2: "Works",
  },
  description:
    "A proven methodology that delivers comprehensive security solutions",
  steps: [
    {
      number: "1",
      title: "Consultation",
      description:
        "We discuss your security needs, current infrastructure, and business goals to understand your unique requirements.",
      icon: "MessageCircle",
    },
    {
      number: "2",
      title: "Assessment",
      description:
        "Comprehensive analysis of your systems, networks, and applications to identify vulnerabilities and security gaps.",
      icon: "Search",
    },
    {
      number: "3",
      title: "Implementation",
      description:
        "Deploy security solutions, fix vulnerabilities, and implement best practices tailored to your environment.",
      icon: "Settings",
    },
    {
      number: "4",
      title: "Monitoring",
      description:
        "Continuous 24/7 monitoring, regular updates, and ongoing support to maintain your security posture.",
      icon: "Activity",
    },
  ],
  cta: "Start Your Security Journey",
};

export default function HowItWorks() {
  const { messages } = useLanguage();
  const section: SectionContent = {
    ...fallbackContent,
    ...(messages?.howItWorksSection ?? {}),
  };

  const steps = section.steps ?? fallbackContent.steps!;

  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-black py-20 md:py-28 text-white overflow-hidden">
      {/* Yellow light spots - top right and bottom left */}
      <div className="absolute top-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          {section.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {section.eyebrow}
            </p>
          )}

          {section.title ? (
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              {section.title.line1}{" "}
              <span className="text-primary">{section.title.highlight}</span>{" "}
              {section.title.line2}
            </h2>
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              How <span className="text-primary">AWA Cyber</span> Works
            </h2>
          )}

          {section.description && (
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              {section.description}
            </p>
          )}
        </div>

        {/* Steps Grid */}
        <div className="relative">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => {
              const Icon =
                iconMap[step.icon ?? "MessageCircle"] ?? MessageCircle;
              const isLast = idx === steps.length - 1;

              return (
                <div key={`${step.number}-${idx}`} className="relative">
                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-12 ltr:left-full rtl:right-full w-full h-0.5 bg-primary/30 z-0">
                      <div className="absolute top-1/2 ltr:right-0 rtl:left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-primary" />
                    </div>
                  )}

                  {/* Step Card */}
                  <div className="relative rounded-3xl border border-white/10 bg-gray-800/50 p-6 md:p-8 h-full backdrop-blur-sm hover:border-primary/30 transition-colors">
                    {/* Number Badge */}
                    <div className="absolute -top-4 ltr:-left-4 rtl:-right-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-black font-bold text-lg shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Icon className="h-8 w-8" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        {section.cta && (
          <div className="mt-12 flex justify-center">
            <Button className="inline-flex items-center gap-2 rounded-full bg-primary text-black px-8 py-4 text-sm font-semibold hover:bg-primary/90 shadow-lg">
              {section.cta}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
