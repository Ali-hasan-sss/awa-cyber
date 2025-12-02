"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import { getSectionsByPage } from "@/lib/api/sections";

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

export default function WhoWeAre() {
  const { locale } = useLanguage();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sections when locale changes
  useEffect(() => {
    loadSections();
  }, [locale]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("home", locale);
      setSections(data);
    } catch (error) {
      console.error("Error loading sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get second section (index 1) or fallback
  const aboutSection = useMemo(() => {
    if (sections.length < 2) return null;
    return sections[1]; // Second section
  }, [sections]);

  // Get section image (first image or fallback)
  const sectionImage = useMemo(() => {
    if (aboutSection?.images && aboutSection.images.length > 0) {
      return aboutSection.images[0];
    }
    return "/images/cyber.jpg"; // Fallback image
  }, [aboutSection]);

  // Get section title
  const sectionTitle = useMemo(() => {
    return aboutSection?.title || (locale === "ar" ? "من نحن" : "Who We Are");
  }, [aboutSection, locale]);

  // Get section description (convert HTML to text and split into paragraphs)
  const sectionDescription = useMemo(() => {
    if (!aboutSection?.description) {
      return locale === "ar"
        ? "شركة رائدة في مجال الأمن السيبراني مكرسة لحماية الأعمال من التهديدات الرقمية المتطورة."
        : "A premier cybersecurity firm dedicated to protecting businesses from evolving digital threats.";
    }
    const text = stripHtml(aboutSection.description);
    // Split by double line breaks or periods to create paragraphs
    return text
      .split(/\n\n+|\.\s+(?=[A-Z])/)
      .filter((p) => p.trim().length > 0);
  }, [aboutSection, locale]);

  // Get features as stats
  const stats = useMemo(() => {
    if (aboutSection?.features && aboutSection.features.length > 0) {
      return aboutSection.features
        .sort((a: any, b: any) => a.order - b.order)
        .slice(0, 4) // Limit to 4 stats
        .map((feature: any) => ({
          value: feature.name || "",
          label: feature.description || "",
        }));
    }
    // Fallback stats
    return [
      { value: "500+", label: locale === "ar" ? "مشروع" : "Projects" },
      { value: "10+", label: locale === "ar" ? "سنوات" : "Years" },
      { value: "24/7", label: locale === "ar" ? "دعم" : "Support" },
      { value: "100%", label: locale === "ar" ? "رضا" : "Satisfied" },
    ];
  }, [aboutSection, locale]);

  // Show loading state
  if (loading) {
    return (
      <section className="relative bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8 text-center md:rtl:text-right md:ltr:text-left">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
              <span className="text-primary">{sectionTitle}</span>
            </h2>

            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {Array.isArray(sectionDescription) ? (
                sectionDescription.map((paragraph, idx) => (
                  <p key={idx} className="text-balance">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-balance">{sectionDescription}</p>
              )}
            </div>

            {stats.length > 0 && (
              <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-4 border-t border-border text-center sm:text-left rtl:sm:text-right">
                {stats.map(
                  (stat: { value: string; label: string }, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <span className="block text-3xl font-bold text-foreground">
                        {stat.value}
                      </span>
                      <span className="text-sm uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={sectionImage}
                alt={sectionTitle || "About us"}
                width={640}
                height={480}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-primary/10" />
            </div>
            {stats.length > 0 && (
              <div className="absolute -bottom-6 ltr:-right-6 rtl:-left-6 hidden sm:block rounded-2xl bg-white/90 px-6 py-4 shadow-lg backdrop-blur">
                <p className="text-sm font-semibold text-muted-foreground">
                  {locale === "ar"
                    ? "موثوق به عالمياً"
                    : "Trusted by global enterprises"}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats[0]?.value || "99.7%"}{" "}
                  {locale === "ar" ? "رضا" : "Satisfaction"}
                </p>
              </div>
            )}
            <span className="absolute -top-6 ltr:-left-6 rtl:-right-6 hidden md:block h-28 w-28 rounded-full border-4 border-primary/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
