"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

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

export default function ServiceHero({ service }: { service: any }) {
  const { locale } = useLanguage();

  const title =
    typeof service.title === "string"
      ? service.title
      : service.title?.[locale] || "";

  const description =
    typeof service.description === "string"
      ? service.description
      : service.description?.[locale] || "";

  const heroImage = service.images?.[0] || "/images/publicContain.jpg";
  const features = service.features || [];
  const IconComponent =
    features.length > 0 ? getIconComponent(features[0].icon) : null;

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-yellow-400 via-amber-300 to-amber-200">
      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl">
          {/* Back to Services Link */}
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span className="text-base font-medium">
              {locale === "ar" ? "العودة إلى الخدمات" : "Back to Services"}
            </span>
          </Link>

          {/* Icon and Title Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Icon Block */}
            {IconComponent && (
              <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-white border border-gray-900/20 flex items-center justify-center shadow-lg">
                <IconComponent className="h-8 w-8 text-gray-900" />
              </div>
            )}
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight flex-1">
              {title}
            </h1>
          </div>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-8 max-w-3xl">
              {stripHtml(description)}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Get Started Button */}
            <Button
              asChild
              size="lg"
              className="bg-gray-900 text-white hover:bg-gray-800 font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/quote">
                {locale === "ar" ? "طلب عرض سعر" : "Get a Free Quote"}
              </Link>
            </Button>

            {/* Contact Us Button */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/contact">
                {locale === "ar" ? "اتصل بنا" : "Contact Us"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
