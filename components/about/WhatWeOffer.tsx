"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSectionsByPage } from "@/lib/api/sections";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";
import { Shield } from "lucide-react";

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
  const IconComponent =
    serviceIconComponents[iconName as ServiceIconKey] || Shield;
  return IconComponent;
};

// Donut Chart Component
const DonutChart = ({
  percentage,
  size = 120,
  strokeWidth = 20,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ width: size, height: size }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          className="text-primary transition-all duration-1000 ease-out"
          style={{
            strokeDashoffset: offset,
          }}
        />
      </svg>
    </div>
  );
};

export default function WhatWeOffer() {
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
      console.error("Error loading what we offer sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get second section (what we offer section)
  const offerSection = useMemo(() => {
    if (sections.length < 2) return null;
    return sections[1]; // Second section
  }, [sections]);

  // Get features from the section
  const features = useMemo(() => {
    if (!offerSection?.features) return [];
    return offerSection.features
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .slice(0, 4) // Limit to 4 features
      .map((feature: any) => {
        // Extract percentage from icon field (icon contains only percentage now)
        let percentage = 0;
        if (feature.icon) {
          const iconValue = feature.icon.toString();
          const match = iconValue.match(/\d+/);
          if (match) {
            percentage = parseInt(match[0], 10);
          } else {
            // If it's just a number, parse it directly
            const numValue = parseInt(iconValue, 10);
            percentage = isNaN(numValue) ? 75 : numValue;
          }
        } else {
          percentage = 75; // Default
        }

        const name =
          typeof feature.name === "string"
            ? feature.name
            : feature.name?.[locale] || "";
        const description =
          typeof feature.description === "string"
            ? feature.description
            : feature.description?.[locale] || "";

        return {
          name,
          description: stripHtml(description),
          percentage,
        };
      });
  }, [offerSection, locale]);

  if (loading) {
    return (
      <section className="relative bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Title Skeleton */}
            <div className="text-center mb-12 md:mb-16">
              <div className="h-10 md:h-12 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse" />
            </div>

            {/* Donut Charts Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  {/* Donut Chart Skeleton */}
                  <div className="relative w-32 h-32 animate-pulse">
                    <div className="absolute inset-0 rounded-full border-8 border-gray-200" />
                    <div className="absolute inset-0 rounded-full border-8 border-primary/30" />
                  </div>

                  {/* Title Skeleton */}
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />

                  {/* Description Skeleton */}
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-5/6 mx-auto animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!offerSection || features.length === 0) {
    return null;
  }

  const sectionTitle =
    typeof offerSection.title === "string"
      ? offerSection.title
      : offerSection.title?.[locale] || "";

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          {sectionTitle && (
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {sectionTitle}
              </h2>
            </div>
          )}

          {/* Donut Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {features.map((feature: any, index: number) => {
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  {/* Donut Chart */}
                  <DonutChart percentage={feature.percentage} />

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {feature.name}
                  </h3>

                  {/* Description */}
                  {feature.description && (
                    <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
                      {feature.description}
                    </p>
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
