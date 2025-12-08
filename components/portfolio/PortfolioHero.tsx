"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
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

export default function PortfolioHero() {
  const { locale } = useLanguage();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
  }, [locale]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("portfolio", locale);
      setSections(data);
    } catch (error) {
      console.error("Error loading portfolio hero sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get first section (hero section)
  const heroSection = useMemo(() => {
    if (sections.length === 0) return null;
    return sections[0];
  }, [sections]);

  const title =
    typeof heroSection?.title === "string"
      ? heroSection.title
      : heroSection?.title?.[locale] ||
        (locale === "ar" ? "معرض الأعمال" : "Portfolio");

  const descriptionRaw =
    typeof heroSection?.description === "string"
      ? heroSection.description
      : heroSection?.description?.[locale] || "";
  const description = descriptionRaw ? stripHtml(descriptionRaw) : "";

  const heroImage = heroSection?.images?.[0] || "/images/publicContain.jpg";

  if (loading) {
    return (
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="h-12 w-3/4 bg-gray-200 rounded-lg mx-auto animate-pulse" />
            <div className="h-6 w-2/3 bg-gray-300 rounded-lg mx-auto animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden w-full">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt="Portfolio"
          fill
          priority
          className="object-cover"
          style={{
            filter: "brightness(0.6)",
          }}
        />
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-black/25 z-10" />
      </div>

      {/* Content Container - Centered */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
