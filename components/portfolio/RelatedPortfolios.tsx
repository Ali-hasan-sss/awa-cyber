"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function RelatedPortfolios({
  currentPortfolioId,
  portfolios,
}: {
  currentPortfolioId: string;
  portfolios: any[];
}) {
  const { locale } = useLanguage();

  // Get related portfolios (exclude current, take 3)
  const relatedPortfolios = portfolios
    .filter((p: any) => p._id !== currentPortfolioId)
    .slice(0, 3);

  if (relatedPortfolios.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gray-50 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {locale === "ar" ? "مشاريع ذات صلة" : "Related Portfolios"}
            </h2>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPortfolios.map((portfolio: any) => {
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
                  className="group relative rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    {description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {description.replace(/<[^>]*>/g, "").substring(0, 100)}
                        ...
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
