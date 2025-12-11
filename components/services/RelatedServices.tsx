"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import Image from "next/image";
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

export default function RelatedServices({
  currentServiceId,
  services,
}: {
  currentServiceId: string;
  services: any[];
}) {
  const { locale } = useLanguage();

  // Get related services (exclude current, take 3)
  const relatedServices = services
    .filter((s: any) => s._id !== currentServiceId)
    .slice(0, 3);

  if (relatedServices.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gray-50 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {locale === "ar" ? "خدمات ذات صلة" : "Related Services"}
            </h2>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedServices.map((service: any) => {
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
                  className="group relative rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
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
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    {description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {stripHtml(description)}
                      </p>
                    )}
                    <div className="flex items-center text-primary font-semibold text-sm">
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
      </div>
    </section>
  );
}
