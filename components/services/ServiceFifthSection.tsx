"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { normalizeHtmlContent } from "@/lib/utils";

interface ServiceFifthSectionProps {
  section: {
    title: string | { en: string; ar: string };
    description?: string | { en: string; ar: string };
  };
}

export default function ServiceFifthSection({
  section,
}: ServiceFifthSectionProps) {
  const { locale } = useLanguage();

  const title =
    typeof section.title === "string"
      ? section.title
      : section.title?.[locale] || section.title?.en || "";

  const description =
    typeof section.description === "string"
      ? section.description
      : section.description?.[locale] || section.description?.en || "";

  if (!title && !description) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-yellow-400 via-amber-300 to-amber-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          {title && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
          )}

          {/* Description */}
          {description && (
            <div
              className="text-lg md:text-xl text-gray-800 mb-8 max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{
                __html: normalizeHtmlContent(description),
              }}
            />
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            {/* Get a Free Quote Button */}
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-gray-900 text-white hover:bg-gray-800 font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                {locale === "ar" ? "طلب عرض سعر" : "Get a Free Quote"}
              </Button>
            </Link>

            {/* Contact Us Button */}
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                {locale === "ar" ? "اتصل بنا" : "Contact Us"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
