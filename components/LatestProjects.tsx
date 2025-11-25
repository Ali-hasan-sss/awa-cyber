"use client";

import Image from "next/image";
import {
  ShieldCheck,
  Target,
  Activity,
  Globe,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type ProjectHighlight = {
  icon?: string;
  text: string;
};

type ProjectContent = {
  badge: string;
  badgeIcon?: string;
  timeline: string;
  title: string;
  summary: string;
  highlights: ProjectHighlight[];
  linkLabel: string;
  image: string;
  imageAlt: string;
};

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Target,
  Activity,
  Globe,
};

const fallbackProject: ProjectContent = {
  badge: "Web Security",
  badgeIcon: "Globe",
  timeline: "Completed Q4 2024",
  title: "E-Commerce Platform Security",
  summary:
    "Comprehensive penetration testing and security hardening for a major e-commerce platform, protecting customer data and payment systems.",
  highlights: [
    { icon: "ShieldCheck", text: "50+ vulnerabilities fixed" },
    { icon: "Target", text: "PCI DSS compliance achieved" },
    { icon: "Activity", text: "24/7 monitoring implemented" },
  ],
  linkLabel: "View Case Study",
  image: "/images/skils.jpg",
  imageAlt: "Security specialists reviewing e-commerce dashboards",
};

export default function LatestProjects() {
  const { messages } = useLanguage();
  const section = messages?.projectsSection ?? {};

  const project: ProjectContent = {
    ...fallbackProject,
    ...(section.primaryProject ?? {}),
    highlights:
      section.primaryProject?.highlights ?? fallbackProject.highlights,
  };

  const highlights = project.highlights ?? fallbackProject.highlights;
  const BadgeIcon = iconMap[project.badgeIcon ?? "Globe"] ?? Globe;

  return (
    <section className="relative bg-gradient-to-b from-white to-primary/10 py-20 md:py-28">
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
              Latest Security <span className="text-primary">Projects</span>
            </h2>
          )}

          {section.description && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {section.description}
            </p>
          )}
        </div>

        <div className="mt-12 rounded-[32px] border border-border/40 bg-white shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="relative lg:w-1/2">
              <Image
                src={project.image || fallbackProject.image}
                alt={project.imageAlt || fallbackProject.imageAlt}
                width={640}
                height={420}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 640px"
              />
              <span className="absolute top-6 left-6 flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-foreground shadow">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <BadgeIcon className="h-4 w-4" />
                </span>
                {project.badge}
              </span>
            </div>

            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col gap-6 text-center md:text-left md:rtl:text-right">
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {project.timeline}
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-foreground">
                  {project.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {project.summary}
                </p>
              </div>
              <ul className="space-y-4">
                {highlights.map((item, idx) => {
                  const Icon =
                    iconMap[item.icon ?? "ShieldCheck"] ?? ShieldCheck;
                  return (
                    <li
                      key={`${item.text}-${idx}`}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground justify-center md:justify-start"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-base text-foreground">
                        {item.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {project.linkLabel && (
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary justify-center md:justify-start">
                  {project.linkLabel}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              )}
            </div>
          </div>
        </div>

        {section.cta && (
          <div className="mt-12 flex justify-center">
            <Button className="bg-muted text-foreground hover:bg-muted/90 px-8 py-6 text-base font-semibold rounded-full">
              {section.cta}
              <ArrowRight className="h-4 w-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
