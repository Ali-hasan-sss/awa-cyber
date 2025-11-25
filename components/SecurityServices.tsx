"use client";

import {
  Target,
  ShieldCheck,
  Globe,
  Wifi,
  Cloud,
  GraduationCap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type ServiceCard = {
  title: string;
  description: string;
  icon?: string;
  linkLabel?: string;
};

const iconMap: Record<string, LucideIcon> = {
  Target,
  ShieldCheck,
  Globe,
  Wifi,
  Cloud,
  GraduationCap,
};

export default function SecurityServices() {
  const { messages } = useLanguage();
  const section = messages?.servicesSection ?? {};
  const cards: ServiceCard[] = Array.isArray(section.cards)
    ? section.cards
    : defaultCards;

  return (
    <section className="relative bg-gradient-to-b from-primary/5 via-white to-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 rtl:text-center">
          {section.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {section.eyebrow}
            </p>
          )}
          {section.title ? (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {section.title.line1}{" "}
              <span className="text-primary">{section.title.highlight}</span>
            </h2>
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Comprehensive Security{" "}
              <span className="text-primary">Solutions</span>
            </h2>
          )}

          {section.description && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {section.description}
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card: ServiceCard, idx: number) => {
            const Icon = iconMap[card.icon ?? "ShieldCheck"] ?? ShieldCheck;
            return (
              <div
                key={`${card.title}-${idx}`}
                className="rounded-3xl border border-border/60 bg-white shadow-sm p-6 md:p-8 h-full relative overflow-hidden"
              >
                <span className="absolute top-4 ltr:right-4 rtl:left-4 h-10 w-10 rounded-full bg-primary/10" />
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  {card.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  {card.description}
                </p>
                {card.linkLabel && (
                  <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    {card.linkLabel}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {section.cta && (
          <div className="mt-12 flex justify-center">
            <button className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-foreground/90">
              {section.cta}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

const defaultCards: ServiceCard[] = [
  {
    title: "Penetration Testing",
    description:
      "Identify vulnerabilities before attackers do with comprehensive ethical hacking assessments.",
    icon: "Target",
    linkLabel: "Learn More",
  },
  {
    title: "Security Audits",
    description:
      "Complete evaluation of your security posture with prioritized recommendations for improvement.",
    icon: "ShieldCheck",
    linkLabel: "Learn More",
  },
  {
    title: "Web Security",
    description:
      "Protect critical web applications from OWASP Top 10 vulnerabilities using advanced testing.",
    icon: "Globe",
    linkLabel: "Learn More",
  },
  {
    title: "Network Security",
    description:
      "Secure your network with continuous monitoring, firewalls, and intrusion detection systems.",
    icon: "Wifi",
    linkLabel: "Learn More",
  },
  {
    title: "Cloud Security",
    description:
      "Safeguard AWS, Azure, or GCP environments with best practices, compliance, and 24/7 monitoring.",
    icon: "Cloud",
    linkLabel: "Learn More",
  },
  {
    title: "Security Training",
    description:
      "Empower teams with awareness programs and hands-on cyber defense simulations.",
    icon: "GraduationCap",
    linkLabel: "Learn More",
  },
];
