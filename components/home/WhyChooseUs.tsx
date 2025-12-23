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
import { useState, useEffect, useMemo } from "react";
import { getSectionsByPage } from "@/lib/api/sections";
import { normalizeImageUrl } from "@/lib/utils";
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
  ...serviceIconComponents,
  Award,
  ShieldCheck,
  Headphones,
  Layers,
};

const fallbackContent: SectionContent = {
  eyebrow: "WHY CHOOSE US",
  title: {
    line1: "Your Trusted",
    highlight: "Digital Partner",
  },
  description:
    "We deliver cutting-edge app development and digital marketing solutions backed by expertise, proven methodologies, and commitment to excellence.",
  cta: "Learn More About Us",
  badge: {
    label: "Expert",
    value: "Certified",
  },
  experience: {
    value: "10+",
    label: "Years Experience",
  },
  features: [
    {
      title: "Professional Team",
      description:
        "Our team has extensive experience in app development and digital marketing using the latest technologies.",
      icon: "Award",
    },
    {
      title: "Proven Track Record",
      description:
        "500+ successful projects across diverse industries with 100% satisfaction rate.",
      icon: "ShieldCheck",
    },
    {
      title: "Ongoing Support",
      description:
        "Continuous technical support and follow-up after delivery to ensure your project's success.",
      icon: "Headphones",
    },
    {
      title: "Tailored Solutions",
      description:
        "Solutions designed specifically for your business needs and marketing goals.",
      icon: "Layers",
    },
  ],
  image: "/images/cyberhand.jpg",
  imageAlt: "Development team working on a digital project",
};

export default function WhyChooseUs({
  sections: sectionsProp,
}: {
  sections?: any[];
}) {
  const { locale, messages } = useLanguage();
  const fallbackSection = messages?.whyChooseSection ?? {};
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

  // Get sixth section (index 5) or fallback
  const whyChooseSection = useMemo(() => {
    if (sections.length < 6) return null;
    return sections[5]; // Sixth section
  }, [sections]);

  // Get section title
  const sectionTitle = useMemo(() => {
    if (whyChooseSection?.title) {
      // API returns title as string (already localized) or as object with locale keys
      const title =
        typeof whyChooseSection.title === "string"
          ? whyChooseSection.title
          : whyChooseSection.title[locale] || whyChooseSection.title.en || "";
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
  }, [whyChooseSection, locale]);

  // Get section description (convert HTML to text)
  const sectionDescription = useMemo(() => {
    if (whyChooseSection?.description) {
      // API returns description as string (already localized) or as object with locale keys
      const desc =
        typeof whyChooseSection.description === "string"
          ? whyChooseSection.description
          : whyChooseSection.description[locale] ||
            whyChooseSection.description.en ||
            "";
      return stripHtml(desc);
    }
    return null;
  }, [whyChooseSection, locale]);

  // Get features and split them
  const allFeatures = useMemo(() => {
    if (whyChooseSection?.features && whyChooseSection.features.length > 0) {
      return whyChooseSection.features
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((feature: any) => ({
          title:
            typeof feature.name === "string"
              ? feature.name
              : feature.name?.[locale] || feature.name?.en || "",
          description:
            typeof feature.description === "string"
              ? feature.description
              : feature.description?.[locale] || feature.description?.en || "",
          icon: feature.icon || "ShieldCheck",
        }));
    }
    return [];
  }, [whyChooseSection, locale]);

  // First two features are for badges, rest for side display
  const badgeFeature = allFeatures.length > 0 ? allFeatures[0] : null;
  const experienceFeature = allFeatures.length > 1 ? allFeatures[1] : null;
  const sideFeatures = allFeatures.length > 2 ? allFeatures.slice(2) : [];

  // Build section content
  const section: SectionContent = useMemo(() => {
    const content: SectionContent = {
      ...fallbackContent,
      ...fallbackSection,
    };

    // Use section title if available
    if (sectionTitle) {
      content.title = sectionTitle;
    }

    // Use section description if available
    if (sectionDescription) {
      content.description = sectionDescription;
    }

    // Use badge from first feature
    if (badgeFeature) {
      content.badge = {
        label:
          badgeFeature.title.split(" ").slice(0, 2).join(" ") || "Certified",
        value: badgeFeature.description || badgeFeature.title,
      };
    }

    // Use experience from second feature
    if (experienceFeature) {
      content.experience = {
        value: experienceFeature.title,
        label: experienceFeature.description || experienceFeature.title,
      };
    }

    // Use remaining features for side display
    if (sideFeatures.length > 0) {
      content.features = sideFeatures;
    } else if (fallbackSection.features) {
      content.features = fallbackSection.features;
    }

    // Use section image if available
    if (whyChooseSection?.images && whyChooseSection.images.length > 0) {
      content.image = whyChooseSection.images[0];
    }

    return content;
  }, [
    sectionTitle,
    sectionDescription,
    badgeFeature,
    experienceFeature,
    sideFeatures,
    whyChooseSection,
    fallbackSection,
  ]);

  const features = section.features ?? fallbackContent.features!;

  return (
    <section className="relative bg-gradient-to-b from-black to-gray-900 py-20 md:py-28 text-white overflow-hidden">
      {/* Yellow light spots - top left and bottom right */}
      <div className="absolute top-0 ltr:left-0 rtl:right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="relative shadow-2xl border border-white/10">
              <Image
                src={normalizeImageUrl(section.image) ?? fallbackContent.image!}
                alt={section.imageAlt ?? fallbackContent.imageAlt!}
                width={640}
                height={480}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 640px"
              />
              {section.badge && (
                <div className="absolute -top-4 ltr:-left-4 rtl:-right-4 flex items-center gap-3 bg-white px-4 py-2 text-sm font-semibold text-black shadow-xl z-50">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary/20 text-primary">
                    {(() => {
                      const BadgeIcon =
                        badgeFeature?.icon && iconMap[badgeFeature.icon]
                          ? iconMap[badgeFeature.icon]
                          : Award;
                      return <BadgeIcon className="h-5 w-5" />;
                    })()}
                  </div>
                  <div>
                    {section.badge.label && (
                      <p className="text-xs uppercase tracking-wide">
                        {section.badge.label}
                      </p>
                    )}
                    <p className="text-base font-bold">{section.badge.value}</p>
                  </div>
                </div>
              )}
              {section.experience && (
                <div className="absolute -bottom-6 ltr:-right-6 rtl:-left-6 bg-primary text-black px-6 py-4 text-center shadow-xl z-20">
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
            {section.title && (
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                {typeof section.title === "object" &&
                "line1" in section.title ? (
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
            )}
            {section.description && (
              <p className="text-base md:text-lg text-white/80 leading-relaxed">
                {section.description}
              </p>
            )}

            <div className="grid gap-5">
              {features.map((feature, idx) => {
                const Icon =
                  iconMap[feature.icon ?? "ShieldCheck"] ?? ShieldCheck;
                return (
                  <div
                    key={`${feature.title}-${idx}`}
                    className="flex gap-4 border border-white/10 bg-white/5 p-4 sm:p-5"
                  >
                    <span className="flex h-12 w-12 items-center justify-center bg-primary/15 text-primary">
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
              <Button
                className="mt-4 inline-flex items-center gap-2 bg-primary text-black px-6 py-3 text-sm font-semibold hover:bg-primary/90"
                asChild
              >
                <Link href="/about">
                  {section.cta}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
