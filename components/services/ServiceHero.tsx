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
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt={title}
          fill
          priority
          className="object-cover"
          style={{
            filter: "blur(4px)",
          }}
        />
        {/* Dark blue overlay */}
        <div className="absolute inset-0 bg-primary/70 z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl">
          {/* Back to Services Link */}
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-white hover:text-primary transition-colors mb-8"
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
              <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-white border border-primary/20 flex items-center justify-center">
                <IconComponent className="h-8 w-8 text-primary" />
              </div>
            )}
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight flex-1">
              {title}
            </h1>
          </div>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-3xl">
              {stripHtml(description)}
            </p>
          )}

          {/* Get Started Button */}
          <Button
            asChild
            className="rounded-full bg-white text-primary hover:bg-white/90 px-8 py-6 text-base font-semibold shadow-lg"
          >
            <Link href="/quote">
              {locale === "ar" ? "ابدأ الآن" : "Get Started"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
