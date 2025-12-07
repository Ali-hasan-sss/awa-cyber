"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicPortfolios } from "@/lib/actions/portfolioActions";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function PortfolioGrid() {
  const { locale } = useLanguage();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, [locale]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const data = await fetchPublicPortfolios(locale);
      setPortfolios(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error loading portfolios:", error);
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative bg-white py-20 md:py-28 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse" />
          </div>
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

  return (
    <section className="relative bg-white py-20 md:py-28 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            {locale === "ar" ? "معرض الأعمال" : "Portfolio"}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {locale === "ar"
              ? "استعرض مشاريعنا المتميزة    "
              : "Explore our outstanding projects"}
          </p>
        </div>

        {portfolios.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {locale === "ar"
                ? "لا توجد مشاريع متاحة حالياً"
                : "No portfolios available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolios.map((portfolio: any) => {
              const title =
                typeof portfolio.title === "string"
                  ? portfolio.title
                  : portfolio.title?.[locale] || "";
              const description =
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
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {title}
                    </h3>
                    {description && (
                      <p className="text-white/90 text-sm line-clamp-2 mb-4">
                        {description.replace(/<[^>]*>/g, "").substring(0, 100)}
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
    </section>
  );
}
