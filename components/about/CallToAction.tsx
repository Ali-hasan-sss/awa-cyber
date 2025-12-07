"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSectionsByPage } from "@/lib/api/sections";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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

export default function CallToAction() {
  const { locale } = useLanguage();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
  }, [locale]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("about", locale);
      setSections(data);
    } catch (error) {
      console.error("Error loading call to action sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get third section (call to action section)
  const ctaSection = useMemo(() => {
    if (sections.length < 3) return null;
    return sections[2]; // Third section
  }, [sections]);

  if (loading) {
    return (
      <section className="relative bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[90vh]">
          {/* Left Side - Image Skeleton */}
          <div className="relative order-2 lg:order-1 w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-full">
            <div className="w-full h-full bg-gray-300 animate-pulse" />
          </div>

          {/* Right Side - Content Skeleton */}
          <div className="order-1 lg:order-2 flex items-center bg-gray-50 py-12 sm:py-16 md:py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:px-12 w-full">
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                {/* Title Skeleton */}
                <div className="space-y-2">
                  <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
                </div>

                {/* Accent Line Skeleton */}
                <div className="h-1 w-16 sm:w-20 bg-primary/30 rounded-full animate-pulse" />

                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                </div>

                {/* CTA Button Skeleton */}
                <div className="pt-2 sm:pt-4">
                  <div className="h-12 sm:h-14 bg-primary/30 rounded-lg w-40 sm:w-48 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!ctaSection) {
    return null;
  }

  const sectionTitle =
    typeof ctaSection.title === "string"
      ? ctaSection.title
      : ctaSection.title?.[locale] || "";
  const sectionDescription =
    typeof ctaSection.description === "string"
      ? ctaSection.description
      : ctaSection.description?.[locale] || "";
  const sectionImage = ctaSection.images?.[0] || "/images/publicContain.jpg";

  return (
    <section className="relative bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[90vh]">
        {/* Left Side - Image (Full Height) */}
        <div className="relative order-2 lg:order-1 w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-full">
          <Image
            src={sectionImage}
            alt={sectionTitle || "Call to Action"}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-primary/5" />
        </div>

        {/* Right Side - Content */}
        <div className="order-1 lg:order-2 flex items-center bg-gray-50 py-12 sm:py-16 md:py-20 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:px-12 w-full">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              {/* Title with dot */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {sectionTitle}
                <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary ml-2 align-middle" />
              </h2>

              {/* Accent Line */}
              <div className="h-1 w-16 sm:w-20 bg-primary rounded-full" />

              {/* Description */}
              {sectionDescription && (
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {stripHtml(sectionDescription)}
                </p>
              )}

              {/* CTA Button */}
              <div className="pt-2 sm:pt-4">
                <Button
                  size="lg"
                  className="bg-primary text-black hover:bg-primary/90 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold group w-full sm:w-auto"
                  asChild
                >
                  <Link
                    href="/quote"
                    className="flex items-center justify-center"
                  >
                    {locale === "ar" ? "اطلب عرض سعر" : "Get a Quote"}
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ltr:ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
