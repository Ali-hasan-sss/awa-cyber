"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicServices } from "@/lib/actions/serviceActions";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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

export default function ServicesList() {
  const { locale } = useLanguage();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, [locale]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await fetchPublicServices(locale);
      const servicesList = Array.isArray(data) ? data : data?.data || [];
      setServices([...servicesList].reverse());
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-border/60 shadow-sm p-6 animate-pulse"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-14 w-14 bg-gray-200" />
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded bg-gray-200" />
                      <div className="h-4 bg-gray-200 rounded flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              {locale === "ar"
                ? "لا توجد خدمات متاحة حالياً"
                : "No services available at the moment"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service: any) => {
            const title =
              typeof service.title === "string"
                ? service.title
                : service.title?.[locale] || "";
            const description =
              typeof service.description === "string"
                ? service.description
                : service.description?.[locale] || "";
            const features = service.features || [];
            const IconComponent =
              features.length > 0 ? getIconComponent(features[0].icon) : null;

            return (
              <Link
                key={service._id}
                href={`/services/${service._id}`}
                className="group relative bg-white border border-border/60 shadow-sm hover:shadow-2xl transition-all duration-300 p-6"
              >
                {/* Icon and Title Section */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Icon Block */}
                  {IconComponent && (
                    <div className="flex-shrink-0 h-14 w-14 bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  {/* Title */}
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground flex-1">
                    {title}
                  </h3>
                </div>

                {/* Description */}
                {description && (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                    {stripHtml(description)}
                  </p>
                )}

                {/* Features List */}
                {features.length > 0 && (
                  <ul className="space-y-3 mb-6">
                    {features.map((feature: any, idx: number) => {
                      const featureName =
                        typeof feature.name === "string"
                          ? feature.name
                          : feature.name?.[locale] || "";
                      return (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground text-sm md:text-base">
                            {featureName}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Learn More Link */}
                <div className="flex items-center text-primary font-semibold text-sm md:text-base group-hover:gap-2 transition-all">
                  <span>{locale === "ar" ? "اعرف المزيد" : "Learn More"}</span>
                  <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
