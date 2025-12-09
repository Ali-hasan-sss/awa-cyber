"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface ServiceFourthSectionProps {
  section: {
    title: string | { en: string; ar: string };
    description?: string | { en: string; ar: string };
  };
  serviceId: string;
}

export default function ServiceFourthSection({
  section,
  serviceId,
}: ServiceFourthSectionProps) {
  const { locale } = useLanguage();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, [serviceId, locale]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/api/portfolios/public", {
        headers: { "x-lang": locale },
        params: { serviceId: serviceId },
      });
      const responseData = data?.data || data;
      setPortfolios(Array.isArray(responseData) ? responseData : []);
    } catch (error) {
      console.error("Error loading portfolios:", error);
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  const title =
    typeof section.title === "string"
      ? section.title
      : section.title?.[locale] || section.title?.en || "";

  const description =
    typeof section.description === "string"
      ? section.description
      : section.description?.[locale] || section.description?.en || "";

  if (!title && !description && portfolios.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <div
                className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>

          {/* Portfolio Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl overflow-hidden bg-gray-200 animate-pulse"
                  style={{ aspectRatio: "4/3" }}
                />
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {locale === "ar"
                  ? "لا توجد أعمال مرتبطة بهذه الخدمة حالياً"
                  : "No projects related to this service at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolios.map((portfolio: any) => {
                const portfolioTitle =
                  typeof portfolio.title === "string"
                    ? portfolio.title
                    : portfolio.title?.[locale] || "";
                const portfolioDescription =
                  typeof portfolio.description === "string"
                    ? portfolio.description
                    : portfolio.description?.[locale] || "";
                const image =
                  portfolio.images?.[0] || "/images/publicContain.jpg";

                return (
                  <Link
                    key={portfolio._id}
                    href={`/portfolio/${portfolio._id}`}
                    className="group relative rounded-3xl overflow-hidden bg-gray-100 aspect-[4/3] hover:shadow-2xl transition-all duration-300"
                  >
                    <Image
                      src={image}
                      alt={portfolioTitle}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {portfolioTitle}
                      </h3>
                      {portfolioDescription && (
                        <p className="text-white/90 text-sm line-clamp-2 mb-4">
                          {portfolioDescription
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 100)}
                          ...
                        </p>
                      )}
                      <div className="flex items-center text-primary font-semibold">
                        <span className="text-sm">
                          {locale === "ar" ? "عرض التفاصيل" : "View Details"}
                        </span>
                        <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:rotate-180" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
