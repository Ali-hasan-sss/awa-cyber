"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { getSectionsByPage } from "@/lib/api/sections";

// Helper function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // Server-side: simple regex approach
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
  // Client-side: use DOM
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function Hero({ sections: sectionsProp }: { sections?: any[] }) {
  const { locale } = useLanguage();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use provided sections or load them
  useEffect(() => {
    if (sectionsProp && sectionsProp.length > 0) {
      setSections(sectionsProp);
      setLoading(false);
      setCurrentSlide(0);
    } else {
      loadSections();
    }
  }, [sectionsProp, locale]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("home", locale);
      setSections(data);
      setCurrentSlide(0); // Reset to first slide when data changes
    } catch (error) {
      console.error("Error loading hero sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get first section (can be null if no sections)
  const heroSection = useMemo(() => {
    if (sections.length === 0) return null;
    return sections[0];
  }, [sections]);

  // Prepare slides from section images (always have at least one slide)
  const slides = useMemo(() => {
    if (
      !heroSection ||
      !heroSection.images ||
      heroSection.images.length === 0
    ) {
      // Return fallback slide if no images
      return [
        {
          image: "/images/publicContain.jpg",
          title: heroSection?.title || "",
          description: heroSection?.description
            ? stripHtml(heroSection.description)
            : "",
          index: 0,
        },
      ];
    }
    return heroSection.images.map((image: string, index: number) => ({
      image,
      title: heroSection.title,
      description: stripHtml(heroSection.description || ""),
      index,
    }));
  }, [heroSection]);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  // Get hero content (use section data or fallback)
  const heroTitle =
    heroSection?.title || (locale === "ar" ? "أهلاً بك" : "Welcome");
  const heroDescription = heroSection?.description
    ? stripHtml(heroSection.description)
    : "";

  // Show loading state
  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto md:mx-0 md:ltr:mr-auto md:rtl:ml-auto px-4 sm:px-0 space-y-6">
            {/* Accent Bar Skeleton */}
            <div className="mb-6 flex justify-center md:justify-start">
              <div className="h-1.5 w-24 bg-primary/30 rounded-full animate-pulse" />
            </div>
            {/* Title Skeleton */}
            <div className="space-y-3">
              <div className="h-16 md:h-20 lg:h-24 bg-white/10 rounded-lg w-3/4 animate-pulse" />
              <div className="h-16 md:h-20 lg:h-24 bg-white/10 rounded-lg w-1/2 animate-pulse" />
            </div>
            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-4/6 animate-pulse" />
            </div>
            {/* Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <div className="h-14 bg-primary/30 rounded-lg w-48 animate-pulse" />
              <div className="h-14 bg-white/10 rounded-lg w-48 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Always show hero, even if no section data
  const currentSlideData = slides[currentSlide] || slides[0];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Images with transitions */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        {/* Slides container */}
        <div className="relative w-full h-full">
          {slides.map(
            (
              slide: {
                image: string;
                title: string;
                description: string;
                index: number;
              },
              index: number
            ) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100 z-0" : "opacity-0 z-0"
                }`}
              >
                <Image
                  src={slide.image || "/images/publicContain.jpg"}
                  alt={`${heroTitle} - Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
            )
          )}
        </div>

        {/* Simple overlay for text readability - subtle like first image */}
        <div className="absolute inset-0 bg-black/10 z-[5]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto md:mx-0 md:ltr:mr-auto md:rtl:ml-auto px-4 sm:px-0 text-center md:text-left md:rtl:text-right md:ltr:text-left relative z-20">
          {/* Yellow Accent Bar */}
          <div className="mb-6 flex justify-center md:justify-start">
            <div className="h-1.5 w-24 bg-primary rounded-full" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-500">
            <span className="text-primary">{heroTitle}</span>
          </h1>

          {/* Description */}
          {heroDescription && (
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0 transition-all duration-500">
              {heroDescription}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 transition-all duration-500 items-center md:items-start">
            <Button size="lg" className="group text-base px-8 py-6" asChild>
              <Link href="/quote">
                {locale === "ar" ? "اطلب عرض سعر" : "Get a Quote"}
                <ArrowRight className="ltr:ml-2 rtl:mr-2 rtl:rotate-180 w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-black"
              asChild
            >
              <Link href="/services">
                {locale === "ar" ? "استكشف خدماتنا" : "Explore Our Services"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than one slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute ltr:left-4 rtl:right-4 md:ltr:left-8 md:rtl:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform rtl:rotate-180" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute ltr:right-4 rtl:left-4 md:ltr:right-8 md:rtl:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform rtl:rotate-180" />
          </button>
        </>
      )}

      {/* Slide Indicators - Only show if more than one slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
