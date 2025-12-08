"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSectionsByPage } from "@/lib/api/sections";
import Image from "next/image";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";
import { socialIconComponents, SocialIconKey } from "@/lib/socialIconOptions";
import { Phone, MapPin } from "lucide-react";

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

const getIconComponent = (iconName: string) => {
  // First try social icons
  if (socialIconComponents[iconName as SocialIconKey]) {
    return socialIconComponents[iconName as SocialIconKey];
  }
  // Then try service icons
  const IconComponent =
    serviceIconComponents[iconName as ServiceIconKey] ||
    serviceIconComponents["ShieldCheck"];
  return IconComponent;
};

export default function ContactHero() {
  const { locale } = useLanguage();
  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSection();
  }, [locale]);

  const loadSection = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("contact");
      const sections = Array.isArray(data) ? data : (data as any)?.data || [];
      // Get first section (order 1)
      const firstSection =
        sections.find((s: any) => s.order === 1) || sections[0];
      setSection(firstSection);
    } catch (error) {
      console.error("Error loading contact section:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Image Skeleton */}
            <div className="w-full h-64 md:h-80 bg-white/10 rounded-3xl animate-pulse mx-auto" />
            {/* Title Skeleton */}
            <div className="h-12 bg-white/10 rounded-lg w-2/3 mx-auto animate-pulse" />
            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4 mx-auto animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-1/2 mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!section) {
    return null;
  }

  const title =
    typeof section.title === "string"
      ? section.title
      : section.title?.[locale] || "";

  const description =
    typeof section.description === "string"
      ? section.description
      : section.description?.[locale] || "";

  const image = section.images?.[0] || "/images/publicContain.jpg";
  const features = section.features || [];

  // First feature is address, second is phone, rest are social media
  const addressFeature = features[0];
  const phoneFeature = features[1];
  const socialFeatures = features.slice(2);

  const address =
    addressFeature &&
    (typeof addressFeature.name === "string"
      ? addressFeature.name
      : addressFeature.name?.[locale] || "");

  const phone =
    phoneFeature &&
    (typeof phoneFeature.name === "string"
      ? phoneFeature.name
      : phoneFeature.name?.[locale] || "");

  return (
    <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover"
          style={{
            filter: "brightness(0.4)",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        {/* Texture overlay */}
        <div
          className="absolute inset-0 z-20 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-30 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              {stripHtml(description)}
            </p>
          )}

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-8">
            {/* Address */}
            {address && (
              <div className="flex items-center gap-3 text-white/90">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm md:text-base">{address}</span>
              </div>
            )}

            {/* Phone */}
            {phone && (
              <div className="flex items-center gap-3 text-white/90">
                <Phone className="w-5 h-5 text-primary" />
                <a
                  href={`tel:${phone}`}
                  className="text-sm md:text-base hover:text-primary transition-colors"
                >
                  {phone}
                </a>
              </div>
            )}
          </div>

          {/* Social Media Icons */}
          {socialFeatures.length > 0 && (
            <div className="flex items-center justify-center gap-4">
              {socialFeatures.map((feature: any, index: number) => {
                const iconName = feature.icon;
                const link =
                  typeof feature.description === "string"
                    ? feature.description
                    : feature.description?.[locale] || "";
                const IconComponent = getIconComponent(iconName);

                if (!link) return null;

                return (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all duration-300"
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
