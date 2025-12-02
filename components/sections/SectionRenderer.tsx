"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSectionsByPage, PageType } from "@/lib/api/sections";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

interface SectionData {
  _id: string;
  title: string | { en: string; ar: string };
  description: string | { en: string; ar: string };
  page: PageType;
  images: string[];
  features: Array<{
    name: string | { en: string; ar: string };
    description: string | { en: string; ar: string };
    icon: string;
    order: number;
  }>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface SectionRendererProps {
  page: PageType;
  className?: string;
}

export default function SectionRenderer({
  page,
  className = "",
}: SectionRendererProps) {
  const { locale } = useLanguage();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSections();
  }, [page, locale]);

  const loadSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSectionsByPage(page, locale);
      setSections(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sections");
      console.error("Error loading sections:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get sections from index 9 onwards (tenth section and above)
  const sectionsToRender = useMemo(() => {
    if (sections.length <= 9) return [];
    return sections.slice(9); // From index 9 onwards
  }, [sections]);

  const getIconComponent = (iconName: string) => {
    if (iconName in serviceIconComponents) {
      const Icon = serviceIconComponents[iconName as ServiceIconKey];
      return <Icon className="h-6 w-6" />;
    }
    return null;
  };

  const getLocalizedText = (
    text: string | { en: string; ar: string } | undefined,
    fallback: string = ""
  ): string => {
    if (!text) return fallback;
    if (typeof text === "string") return text;
    return text[locale] || text.en || fallback;
  };

  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center text-white/60">Loading sections...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center text-red-400">
          Error loading sections: {error}
        </div>
      </div>
    );
  }

  if (sectionsToRender.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {sectionsToRender.map((section, sectionIndex) => {
        const isEven = sectionIndex % 2 === 0;
        const isStyle1 = isEven; // Style 1 for even indices, Style 2 for odd indices

        const sectionTitle = getLocalizedText(section.title);
        const sectionDescription = getLocalizedText(section.description);
        const mainImage =
          section.images && section.images.length > 0
            ? section.images[0]
            : null;

        return (
          <section
            key={section._id}
            className={`py-20 md:py-28 ${
              isStyle1
                ? "bg-white text-foreground"
                : "bg-gradient-to-b from-gray-900 to-black text-white"
            }`}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`grid gap-12 lg:grid-cols-2 lg:items-center ${
                  isStyle1 ? "" : "lg:grid-flow-dense"
                }`}
              >
                {/* Image Section */}
                {mainImage && (
                  <div
                    className={`relative ${
                      isStyle1 ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/20">
                      <Image
                        src={mainImage}
                        alt={sectionTitle}
                        width={640}
                        height={480}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 1024px) 100vw, 640px"
                      />
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div
                  className={`space-y-8 ${
                    isStyle1 ? "lg:order-2" : "lg:order-1"
                  } ${isStyle1 ? "text-left" : "text-left rtl:text-right"}`}
                >
                  {/* Title */}
                  <h2
                    className={`text-4xl md:text-5xl font-bold leading-tight ${
                      isStyle1 ? "text-foreground" : "text-white"
                    }`}
                  >
                    {sectionTitle}
                  </h2>

                  {/* Description */}
                  {sectionDescription && (
                    <div
                      className={`text-base md:text-lg leading-relaxed ${
                        isStyle1 ? "text-muted-foreground" : "text-white/80"
                      }`}
                      dangerouslySetInnerHTML={{ __html: sectionDescription }}
                    />
                  )}

                  {/* Features */}
                  {section.features && section.features.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {section.features
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((feature, idx) => {
                          const featureName = getLocalizedText(feature.name);
                          const featureDescription = getLocalizedText(
                            feature.description
                          );
                          return (
                            <div
                              key={idx}
                              className={`rounded-2xl border p-6 transition hover:shadow-lg ${
                                isStyle1
                                  ? "border-border bg-white shadow-sm hover:border-primary/30"
                                  : "border-white/10 bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                {feature.icon && (
                                  <div
                                    className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl ${
                                      isStyle1
                                        ? "bg-primary/10 text-primary"
                                        : "bg-primary/15 text-primary"
                                    }`}
                                  >
                                    {getIconComponent(feature.icon) || (
                                      <div className="h-6 w-6" />
                                    )}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h3
                                    className={`text-lg font-semibold mb-2 ${
                                      isStyle1
                                        ? "text-foreground"
                                        : "text-white"
                                    }`}
                                  >
                                    {featureName}
                                  </h3>
                                  {featureDescription && (
                                    <p
                                      className={`text-sm leading-relaxed ${
                                        isStyle1
                                          ? "text-muted-foreground"
                                          : "text-white/70"
                                      }`}
                                    >
                                      {featureDescription}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Additional Images Grid */}
                  {section.images && section.images.length > 1 && (
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      {section.images.slice(1, 3).map((image, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-2xl overflow-hidden border border-border/20 shadow-lg"
                        >
                          <Image
                            src={image}
                            alt={`${sectionTitle} - Image ${idx + 2}`}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 640px) 50vw, 300px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
