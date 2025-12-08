"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { Shield, Users, Award, Clock } from "lucide-react";
import { getSectionsByPage } from "@/lib/api/sections";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

// Helper function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const getIconComponent = (iconName: string) => {
  const IconComponent =
    serviceIconComponents[iconName as ServiceIconKey] || Shield;
  return IconComponent;
};

export default function AboutHero() {
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
      const data = await getSectionsByPage("about", locale);
      setSections(data);
    } catch (error) {
      console.error("Error loading about hero sections:", error);
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

  // Get hero content (use section data or fallback from translations)
  // Handle title - can be string or object
  const title =
    typeof heroSection?.title === "string"
      ? heroSection.title
      : heroSection?.title?.[locale] ||
        (locale === "ar" ? "من نحن" : "About Us");

  // Handle subtitle - can be string or object
  const subtitle =
    typeof heroSection?.subtitle === "string"
      ? heroSection.subtitle
      : heroSection?.subtitle?.[locale] || "";

  // Handle description - can be string or object
  const descriptionRaw =
    typeof heroSection?.description === "string"
      ? heroSection.description
      : heroSection?.description?.[locale] || "";
  const description = descriptionRaw ? stripHtml(descriptionRaw) : "";

  const heroImage = heroSection?.images?.[0] || "/images/publicContain.jpg";
  const heroFeatures = heroSection?.features || [];

  // Show loading state
  if (loading) {
    return (
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden w-full">
        {/* Background Image Skeleton */}
        <div className="absolute inset-0 -z-10">
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 animate-pulse" />
          <div className="absolute inset-0 bg-black/25 z-10" />
        </div>

        {/* Content Container Skeleton */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            {/* Subtitle Skeleton */}
            <div className="h-4 w-32 bg-primary/30 rounded mx-auto animate-pulse" />

            {/* Title Skeleton */}
            <div className="space-y-3">
              <div className="h-12 md:h-16 lg:h-20 bg-primary/40 rounded-lg mx-auto max-w-md animate-pulse" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2 max-w-3xl mx-auto">
              <div className="h-4 bg-white/20 rounded w-full animate-pulse" />
              <div className="h-4 bg-white/20 rounded w-5/6 mx-auto animate-pulse" />
              <div className="h-4 bg-white/20 rounded w-4/6 mx-auto animate-pulse" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/30" />
                  <div className="h-8 w-16 bg-white/20 rounded" />
                  <div className="h-4 w-20 bg-white/20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[75vh] flex items-center justify-center overflow-hidden w-full">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt="About Us"
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
          {/* Subtitle */}
          {subtitle && (
            <span className="inline-block text-sm md:text-base font-semibold tracking-[0.2em] text-primary uppercase mb-4">
              {subtitle}
            </span>
          )}

          {/* Main Title - Large, bold, white */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-12">
              {description}
            </p>
          )}

          {/* Stats Grid */}
          {heroFeatures.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12">
              {heroFeatures
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((feature: any, index: number) => {
                  const IconComponent = getIconComponent(feature.icon);
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-white">
                        {feature.description?.[locale] ||
                          feature.name?.[locale]}
                      </div>
                      <div className="text-sm md:text-base text-white/80 text-center">
                        {feature.name?.[locale]}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
