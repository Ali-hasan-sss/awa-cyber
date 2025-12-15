"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";
import { Check } from "lucide-react";

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
    serviceIconComponents[iconName as ServiceIconKey] ||
    serviceIconComponents["ShieldCheck"];
  return IconComponent;
};

export default function ServiceFeatures({ service }: { service: any }) {
  const { locale } = useLanguage();

  const title =
    typeof service.title === "string"
      ? service.title
      : service.title?.[locale] || "";

  const description =
    typeof service.description === "string"
      ? service.description
      : service.description?.[locale] || "";

  const images = service.images || [];
  const features = service.features || [];

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-10 md:py-18">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* What's Included Section */}
          {features.length > 0 && (
            <div className="mt-20">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  {locale === "ar" ? "مزايا الخدمة" : "Service Features"}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground">
                  {locale === "ar"
                    ? "كل ما تحتاجه للحصول على حضور احترافي على الإنترنت"
                    : "Everything you need for a professional online presence"}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature: any, index: number) => {
                  const featureName =
                    typeof feature.name === "string"
                      ? feature.name
                      : feature.name?.[locale] || "";

                  return (
                    <div
                      key={index}
                      className="rounded-2xl bg-white border border-border/60 shadow-sm p-5 flex items-start gap-3"
                    >
                      {/* Checkmark Icon */}
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      {/* Feature Name */}
                      <span className="text-foreground text-sm md:text-base leading-relaxed">
                        {featureName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
