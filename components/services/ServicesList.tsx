"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicServices } from "@/lib/actions/serviceActions";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      setServices(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl overflow-hidden bg-gray-200 animate-pulse"
                style={{ aspectRatio: "4/3" }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section className="relative bg-white py-20 md:py-28">
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
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any) => {
            const title =
              typeof service.title === "string"
                ? service.title
                : service.title?.[locale] || "";
            const description =
              typeof service.description === "string"
                ? service.description
                : service.description?.[locale] || "";
            const image = service.images?.[0] || "/images/publicContain.jpg";
            const features = service.features || [];
            const IconComponent =
              features.length > 0 ? getIconComponent(features[0].icon) : null;

            return (
              <Link
                key={service._id}
                href={`/services/${service._id}`}
                className="group relative rounded-3xl overflow-hidden bg-white border border-border/60 shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                {/* Service Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Icon Overlay */}
                  {IconComponent && (
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-black" />
                    </div>
                  )}
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {title}
                  </h3>

                  {description && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {stripHtml(description)}
                    </p>
                  )}

                  {/* Features Preview */}
                  {features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {features
                          .slice(0, 3)
                          .map((feature: any, idx: number) => {
                            const featureName =
                              typeof feature.name === "string"
                                ? feature.name
                                : feature.name?.[locale] || "";
                            return (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                              >
                                {featureName}
                              </span>
                            );
                          })}
                        {features.length > 3 && (
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-muted-foreground text-xs font-medium">
                            +{features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Details Link */}
                  <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>
                      {locale === "ar" ? "عرض التفاصيل" : "View Details"}
                    </span>
                    <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
