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
import { useState, useEffect, useMemo } from "react";
import { getSectionsByPage } from "@/lib/api/sections";
import { serviceIconComponents } from "@/lib/serviceIconOptions";
import Link from "next/link";

// Helper function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // Server-side: simple regex approach
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }
  // Client-side: use DOM
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

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
  ...serviceIconComponents,
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

export default function HowItWorks({
  sections: sectionsProp,
}: {
  sections?: any[];
}) {
  const { locale, messages } = useLanguage();
  const fallbackSection = messages?.howItWorksSection ?? {};
  const [sections, setSections] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  // Use provided sections or load them
  useEffect(() => {
    if (sectionsProp && sectionsProp.length > 0) {
      setSections(sectionsProp);
      setSectionsLoading(false);
    } else {
      loadSections();
    }
  }, [sectionsProp, locale]);

  const loadSections = async () => {
    try {
      setSectionsLoading(true);
      const data = await getSectionsByPage("home", locale);
      setSections(data);
    } catch (error) {
      console.error("Error loading sections:", error);
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  // Get seventh section (index 6) or fallback
  const howItWorksSection = useMemo(() => {
    if (sections.length < 7) return null;
    return sections[6]; // Seventh section
  }, [sections]);

  // Get section title
  const sectionTitle = useMemo(() => {
    if (howItWorksSection?.title) {
      // API returns title as string (already localized) or as object with locale keys
      const title =
        typeof howItWorksSection.title === "string"
          ? howItWorksSection.title
          : howItWorksSection.title[locale] || howItWorksSection.title.en || "";
      // Try to split title for highlight if it contains common patterns
      const parts = title.split(/(\s+)/);
      if (parts.length > 2) {
        // Take first part as line1, middle as highlight, last as line2
        const line1 = parts.slice(0, -2).join("");
        const highlight = parts.slice(-2, -1).join("").trim();
        const line2 = parts.slice(-1).join("").trim();
        return { line1, highlight, line2 };
      }
      return { line1: title, highlight: "", line2: "" };
    }
    return null;
  }, [howItWorksSection, locale]);

  // Get section description (convert HTML to text)
  const sectionDescription = useMemo(() => {
    if (howItWorksSection?.description) {
      // API returns description as string (already localized) or as object with locale keys
      const desc =
        typeof howItWorksSection.description === "string"
          ? howItWorksSection.description
          : howItWorksSection.description[locale] ||
            howItWorksSection.description.en ||
            "";
      return stripHtml(desc);
    }
    return null;
  }, [howItWorksSection, locale]);

  // Get features as steps
  const steps = useMemo(() => {
    if (howItWorksSection?.features && howItWorksSection.features.length > 0) {
      return howItWorksSection.features
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((feature: any, index: number) => ({
          number: String(feature.order || index + 1),
          title:
            typeof feature.name === "string"
              ? feature.name
              : feature.name?.[locale] || feature.name?.en || "",
          description:
            typeof feature.description === "string"
              ? feature.description
              : feature.description?.[locale] || feature.description?.en || "",
          icon: feature.icon || "MessageCircle",
        }));
    }
    return fallbackContent.steps || [];
  }, [howItWorksSection, locale]);

  // Build section content
  const section: SectionContent = useMemo(() => {
    const content: SectionContent = {
      ...fallbackContent,
      ...fallbackSection,
    };

    // Use section title if available
    if (sectionTitle) {
      content.title = sectionTitle;
    } else if (fallbackSection.title) {
      content.title = fallbackSection.title;
    }

    // Use section description if available
    if (sectionDescription) {
      content.description = sectionDescription;
    } else if (fallbackSection.description) {
      content.description = fallbackSection.description;
    }

    // Use steps from features
    if (steps.length > 0) {
      content.steps = steps;
    }

    return content;
  }, [sectionTitle, sectionDescription, steps, fallbackSection]);

  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-black py-20 md:py-28 text-white overflow-hidden">
      {/* Yellow light spots - top right and bottom left */}
      <div className="absolute top-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          {section.title ? (
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              {typeof section.title === "object" && "line1" in section.title ? (
                <>
                  {section.title.line1}{" "}
                  {section.title.highlight && (
                    <span className="text-primary">
                      {section.title.highlight}
                    </span>
                  )}{" "}
                  {section.title.line2}
                </>
              ) : typeof section.title === "string" ? (
                section.title
              ) : (
                fallbackContent.title?.line1 +
                " " +
                fallbackContent.title?.highlight +
                " " +
                fallbackContent.title?.line2
              )}
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
            {steps.map((step: Step, idx: number) => {
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
                  <div className="relative border border-white/10 bg-gray-800/50 p-6 md:p-8 h-full backdrop-blur-sm hover:border-primary/30 transition-colors">
                    {/* Number Badge */}
                    <div className="absolute -top-4 ltr:-left-4 rtl:-right-4 flex h-10 w-10 items-center justify-center bg-primary text-black font-bold text-lg shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="mb-6 flex h-16 w-16 items-center justify-center bg-primary/15 text-primary">
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
        {fallbackSection.cta && (
          <div className="mt-12 flex justify-center">
            <Button
              className="inline-flex items-center gap-2 rounded-full bg-primary text-black px-8 py-4 text-sm font-semibold hover:bg-primary/90 shadow-lg"
              asChild
            >
              <Link href="/quote">
                {fallbackSection.cta}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
