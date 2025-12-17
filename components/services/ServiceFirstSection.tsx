"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { normalizeImageUrl, normalizeHtmlContent } from "@/lib/utils";

interface ServiceFirstSectionProps {
  section: {
    title: string | { en: string; ar: string };
    description: string | { en: string; ar: string };
    images?: string[];
  };
}

export default function ServiceFirstSection({
  section,
}: ServiceFirstSectionProps) {
  const { locale } = useLanguage();

  const title =
    typeof section.title === "string"
      ? section.title
      : section.title?.[locale] || section.title?.en || "";

  const description =
    typeof section.description === "string"
      ? section.description
      : section.description?.[locale] || section.description?.en || "";

  const image = section.images?.[0]
    ? normalizeImageUrl(section.images[0])
    : "/images/publicContain.jpg";

  if (!title && !description && !image) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content - Left Column */}
          <div className="space-y-6">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <div
                className="text-base md:text-lg text-gray-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  __html: normalizeHtmlContent(description),
                }}
              />
            )}
          </div>

          {/* Image - Right Column */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
