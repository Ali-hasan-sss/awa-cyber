"use client";

import {
  Building2,
  ShieldCheck,
  Cloud,
  Server,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  ShieldCheck,
  Cloud,
  Server,
  Cpu,
};

export default function TrustedClients() {
  const { messages } = useLanguage();
  const section = messages?.clientsSection ?? {};

  const brands: { name: string; tagline?: string; icon?: string }[] =
    section.brands ?? [];

  return (
    <section className="relative bg-gradient-to-b from-white to-primary/5 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto rtl:text-right md:rtl:text-center">
          {section.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {section.eyebrow}
            </p>
          )}

          {section.title ? (
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {section.title.line1}{" "}
              <span className="text-primary">{section.title.highlight}</span>
            </h2>
          ) : (
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trusted by industry-leading{" "}
              <span className="text-primary">organizations</span>
            </h2>
          )}

          {section.description && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {section.description}
            </p>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(brands.length ? brands : defaultBrands).map((brand) => {
            const Icon = iconMap[brand.icon ?? "Building2"] ?? Building2;
            return (
              <div
                key={brand.name}
                className="rounded-2xl border border-border bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <p className="font-semibold text-lg text-foreground">
                  {brand.name}
                </p>
                {brand.tagline && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {brand.tagline}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const defaultBrands = [
  {
    name: "Enterprise Co.",
    tagline: "Global fintech leader",
    icon: "Building2",
  },
  {
    name: "SecureTech",
    tagline: "Critical infrastructure",
    icon: "ShieldCheck",
  },
  { name: "CloudXiq", tagline: "Multi-cloud platform", icon: "Cloud" },
  { name: "DataSolutions", tagline: "Healthcare analytics", icon: "Server" },
  { name: "TechLogy", tagline: "Autonomous systems", icon: "Cpu" },
];
