"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import { getSectionsByPage } from "@/lib/api/sections";

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function Testimonials({
  sections: sectionsProp,
}: {
  sections?: any[];
}) {
  const { locale } = useLanguage();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sectionsProp && sectionsProp.length > 0) {
      // Sort sections by order to ensure correct indexing
      const sortedData = [...sectionsProp].sort(
        (a: any, b: any) => (a.order || 0) - (b.order || 0)
      );
      setSections(sortedData);
      setLoading(false);
    } else {
      loadSections();
    }
  }, [sectionsProp, locale]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("home", locale);
      // Sort sections by order to ensure correct indexing
      const sortedData = data.sort(
        (a: any, b: any) => (a.order || 0) - (b.order || 0)
      );
      setSections(sortedData);
    } catch (error) {
      console.error("Error loading testimonials sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get tenth section (order 10) - Testimonials section
  const testimonialsSection = useMemo(() => {
    if (sections.length === 0) return null;
    // Find section with order 10 (tenth section)
    const section = sections.find((s: any) => s.order === 10);
    // If not found by order, try index 9 as fallback
    return section || (sections.length > 9 ? sections[9] : null);
  }, [sections]);

  // Get section title and description
  const sectionTitle =
    typeof testimonialsSection?.title === "string"
      ? testimonialsSection.title
      : testimonialsSection?.title?.[locale] || "";
  const sectionDescription =
    typeof testimonialsSection?.description === "string"
      ? testimonialsSection.description
      : testimonialsSection?.description?.[locale] || "";

  // Get testimonials from features
  const testimonials = useMemo(() => {
    if (!testimonialsSection?.features) return [];
    return testimonialsSection.features
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((feature: any) => {
        // Extract rating from icon field (stores rating 1-5)
        let rating = 5;
        if (feature.icon) {
          const ratingValue = parseInt(feature.icon.toString(), 10);
          if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
            rating = ratingValue;
          }
        }

        // Name is client name
        const name =
          typeof feature.name === "string"
            ? feature.name
            : feature.name?.[locale] || "";

        // Description is testimonial quote
        const quote =
          typeof feature.description === "string"
            ? feature.description
            : feature.description?.[locale] || "";

        // Extract role and company from quote or use defaults
        const quoteText = stripHtml(quote);
        const parts = quoteText.split(",");
        const role = parts.length > 1 ? parts[parts.length - 1].trim() : "";
        const company = "";

        return {
          name,
          quote: quoteText,
          role,
          company,
          rating,
        };
      });
  }, [testimonialsSection, locale]);

  if (loading) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Title and Description Skeleton */}
            <div className="text-center space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
            </div>
            {/* Testimonials Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-2xl space-y-4">
                  {/* Stars Skeleton */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div
                        key={j}
                        className="w-5 h-5 bg-gray-200 rounded animate-pulse"
                      />
                    ))}
                  </div>
                  {/* Text Skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                  </div>
                  {/* Name Skeleton */}
                  <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show section even if there are no testimonials (show title and description)
  if (!testimonialsSection) {
    return null;
  }

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          {/* Title */}
          {sectionTitle && (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {sectionTitle}
            </h2>
          )}

          {/* Description */}
          {sectionDescription && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {stripHtml(sectionDescription)}
            </p>
          )}
        </div>

        {/* Testimonials Grid - Only show if there are testimonials */}
        {testimonials.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial: any, idx: number) => {
              const initials = getInitials(testimonial.name);
              return (
                <div
                  key={`${testimonial.name}-${idx}`}
                  className="rounded-3xl border border-border/60 bg-gradient-to-br from-white to-primary/5 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Stars Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating
                            ? "fill-primary text-primary"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-base text-foreground leading-relaxed mb-6">
                    &quot;{testimonial.quote}&quot;
                  </p>

                  {/* Client Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm">
                        {testimonial.name}
                      </p>
                      {testimonial.role && (
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
