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
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Service Description */}
          {description && (
            <div className="mb-16">
              <div className="max-w-4xl mx-auto">
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center">
                    {stripHtml(description)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Service Images Gallery */}
          {images.length > 0 && (
            <div className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
                  >
                    <Image
                      src={image}
                      alt={`${title} - Image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Features */}
          {features.length > 0 && (
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-12 text-center">
                {locale === "ar" ? "مميزات الخدمة" : "Service Features"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature: any, index: number) => {
                  const featureName =
                    typeof feature.name === "string"
                      ? feature.name
                      : feature.name?.[locale] || "";
                  const featureDescription =
                    typeof feature.description === "string"
                      ? feature.description
                      : feature.description?.[locale] || "";
                  const IconComponent = getIconComponent(feature.icon);

                  return (
                    <div
                      key={index}
                      className="group relative rounded-3xl border border-border/60 bg-gradient-to-br from-white to-primary/5 p-6 md:p-8 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Icon */}
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-black transition-colors">
                        <IconComponent className="w-8 h-8" />
                      </div>

                      {/* Feature Name */}
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {featureName}
                      </h3>

                      {/* Feature Description */}
                      {featureDescription && (
                        <p className="text-muted-foreground leading-relaxed">
                          {stripHtml(featureDescription)}
                        </p>
                      )}
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
