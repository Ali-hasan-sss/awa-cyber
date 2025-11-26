"use client";

import {
  Command,
  Terminal,
  Globe,
  Shield,
  Radar,
  Signal,
  AlertTriangle,
  Code,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Tool = {
  name: string;
  description: string;
  category?: string;
  icon?: string;
};

type Stat = {
  value: string;
  label: string;
};

type SectionContent = {
  eyebrow?: string;
  title?: {
    line1?: string;
    highlight?: string;
  };
  description?: string;
  toolsTitle?: string;
  toolsSubtitle?: string;
  tools?: Tool[];
  stats?: Stat[];
};

const iconMap: Record<string, LucideIcon> = {
  Command,
  Terminal,
  Globe,
  Shield,
  Radar,
  Signal,
  AlertTriangle,
  Code,
};

const fallbackContent: SectionContent = {
  eyebrow: "ADVANCED TOOLS",
  title: {
    line1: "Advanced",
    highlight: "Security Technologies",
  },
  description:
    "We leverage industry-leading tools and technologies to deliver comprehensive security solutions.",
  toolsTitle: "Security Testing & Penetration Tools",
  toolsSubtitle: "Advanced tools for comprehensive security assessments",
  tools: [
    {
      name: "Kali Linux",
      description: "Top testing OS",
      category: "Testing Suite",
      icon: "Command",
    },
    {
      name: "Metasploit",
      description: "Exploit framework",
      category: "Exploit Framework",
      icon: "Terminal",
    },
    {
      name: "Burp Suite",
      description: "Web security",
      category: "Web Security",
      icon: "Globe",
    },
    {
      name: "OWASP ZAP",
      description: "Security scanner",
      category: "Security Scanner",
      icon: "Shield",
    },
    {
      name: "Nmap",
      description: "Network scanner",
      category: "Network Scanner",
      icon: "Radar",
    },
    {
      name: "Wireshark",
      description: "Network analysis",
      category: "Network Analysis",
      icon: "Signal",
    },
    {
      name: "Nessus",
      description: "Vulnerability",
      category: "Vulnerability",
      icon: "AlertTriangle",
    },
    {
      name: "Python",
      description: "Scripting",
      category: "Scripting",
      icon: "Code",
    },
  ],
  stats: [
    { value: "500+", label: "Projects Completed" },
    { value: "10+", label: "Years Experience" },
    { value: "100%", label: "Client Satisfaction" },
    { value: "24/7", label: "Security Monitoring" },
  ],
};

export default function SecurityTechnologies() {
  const { messages } = useLanguage();
  const section: SectionContent = {
    ...fallbackContent,
    ...(messages?.technologiesSection ?? {}),
  };

  const tools = section.tools ?? fallbackContent.tools!;
  const stats = section.stats ?? fallbackContent.stats!;

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {section.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {section.eyebrow}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {section.title?.line1}{" "}
            <span className="text-primary">{section.title?.highlight}</span>
          </h2>
          {section.description && (
            <p className="text-base md:text-lg text-muted-foreground">
              {section.description}
            </p>
          )}
        </div>

        <div className="mt-12 bg-gradient-to-b from-primary/20 via-white to-white rounded-[36px] p-6 md:p-8 shadow-lg border border-primary/10">
          <div className="text-center space-y-2 mb-8">
            {section.toolsTitle && (
              <h3 className="text-2xl font-semibold text-foreground">
                {section.toolsTitle}
              </h3>
            )}
            {section.toolsSubtitle && (
              <p className="text-sm text-muted-foreground">
                {section.toolsSubtitle}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, idx) => {
              const Icon = iconMap[tool.icon ?? "Shield"] ?? Shield;
              return (
                <div
                  key={`${tool.name}-${idx}`}
                  className="rounded-2xl border border-white/60 bg-white/80 p-5 text-center shadow-sm hover:-translate-y-1 transition-transform"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {tool.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                  {tool.category && (
                    <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {tool.category}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 rounded-full bg-white shadow-lg border border-border/60 px-6 py-6 md:px-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-center">
          {stats.map((stat, idx) => (
            <div key={`${stat.label}-${idx}`} className="space-y-1">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
