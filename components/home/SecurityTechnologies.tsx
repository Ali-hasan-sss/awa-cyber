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
import { useState, useEffect, useMemo } from "react";
import { getSectionsByPage } from "@/lib/api/sections";
import { serviceIconComponents } from "@/lib/serviceIconOptions";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";

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

type Tool = {
  name: string;
  description: string;
  category?: string;
  icon?: string;
  image?: string;
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
  ...serviceIconComponents,
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

export default function SecurityTechnologies({
  sections: sectionsProp,
}: {
  sections?: any[];
}) {
  const { locale, messages } = useLanguage();
  const fallbackSection = messages?.technologiesSection ?? {};
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

  // Get second section (index 1) for stats
  const secondSection = useMemo(() => {
    if (sections.length < 2) return null;
    return sections[1]; // Second section
  }, [sections]);

  // Get eighth section (index 7) or fallback
  const technologiesSection = useMemo(() => {
    if (sections.length < 8) return null;
    return sections[7]; // Eighth section
  }, [sections]);

  // Get section title
  const sectionTitle = useMemo(() => {
    if (technologiesSection?.title) {
      // API returns title as string (already localized) or as object with locale keys
      const title =
        typeof technologiesSection.title === "string"
          ? technologiesSection.title
          : technologiesSection.title[locale] ||
            technologiesSection.title.en ||
            "";
      // Try to split title for highlight if it contains common patterns
      const parts = title.split(/(\s+)/);
      if (parts.length > 2) {
        // Take first part as line1, last part as highlight
        const line1 = parts.slice(0, -2).join("");
        const highlight = parts.slice(-2).join("").trim();
        return { line1, highlight };
      }
      return { line1: title, highlight: "" };
    }
    return null;
  }, [technologiesSection, locale]);

  // Get section description (convert HTML to text)
  const sectionDescription = useMemo(() => {
    if (technologiesSection?.description) {
      // API returns description as string (already localized) or as object with locale keys
      const desc =
        typeof technologiesSection.description === "string"
          ? technologiesSection.description
          : technologiesSection.description[locale] ||
            technologiesSection.description.en ||
            "";
      return stripHtml(desc);
    }
    return null;
  }, [technologiesSection, locale]);

  // Get features as tools
  const tools = useMemo(() => {
    if (
      technologiesSection?.features &&
      technologiesSection.features.length > 0
    ) {
      return technologiesSection.features
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((feature: any) => ({
          name:
            typeof feature.name === "string"
              ? feature.name
              : feature.name?.[locale] || feature.name?.en || "",
          description:
            typeof feature.description === "string"
              ? feature.description
              : feature.description?.[locale] || feature.description?.en || "",
          category: undefined, // No category from API
          icon: feature.icon || "",
        }));
    }
    return fallbackContent.tools || [];
  }, [technologiesSection, locale]);

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

    // Use tools from features
    if (tools.length > 0) {
      content.tools = tools;
    }

    return content;
  }, [sectionTitle, sectionDescription, tools, fallbackSection]);

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {section.title ? (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {typeof section.title === "object" && "line1" in section.title ? (
                <>
                  {section.title.line1}{" "}
                  {section.title.highlight && (
                    <span className="text-primary">
                      {section.title.highlight}
                    </span>
                  )}
                </>
              ) : typeof section.title === "string" ? (
                section.title
              ) : (
                fallbackContent.title?.line1 +
                " " +
                fallbackContent.title?.highlight
              )}
            </h2>
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {fallbackContent.title?.line1}{" "}
              <span className="text-primary">
                {fallbackContent.title?.highlight}
              </span>
            </h2>
          )}
          {section.description && (
            <p className="text-base md:text-lg text-muted-foreground">
              {section.description}
            </p>
          )}
        </div>

        <div className="mt-12 bg-gradient-to-b from-gray-100 to-white rounded-[36px] p-6 md:p-8 shadow-lg border border-gray-200">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool: Tool, idx: number) => {
              // Check if icon is a URL/image path (not an icon name)
              const isImageUrl =
                tool.icon &&
                (tool.icon.startsWith("http") ||
                  tool.icon.startsWith("/") ||
                  tool.icon.includes(".") ||
                  tool.icon.includes("72.60.208.192") ||
                  tool.icon.includes("awacyber.com"));
              const Icon = !isImageUrl && tool.icon ? iconMap[tool.icon] : null;
              const FallbackIcon = Icon || Shield;

              return (
                <div
                  key={`${tool.name}-${idx}`}
                  className="group rounded-2xl border border-white/60 bg-white/80 p-5 text-center shadow-sm hover:-translate-y-1 transition-transform"
                >
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    {isImageUrl ? (
                      <Image
                        src={normalizeImageUrl(tool.icon!)}
                        alt={tool.name}
                        width={80}
                        height={80}
                        className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <FallbackIcon className="h-6 w-6" />
                      </div>
                    )}
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
      </div>
    </section>
  );
}
