"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import PortfolioFilter from "./PortfolioFilter";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function PortfolioGrid() {
  const { locale } = useLanguage();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setPortfolios([]);
    setHasMore(true);
    loadPortfolios(1, true);
  }, [locale, selectedServiceId]);

  const loadPortfolios = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page,
        limit: 10,
      };
      if (selectedServiceId) {
        params.serviceId = selectedServiceId;
      }

      const { data } = await apiClient.get("/api/portfolios/public", {
        headers: { "x-lang": locale },
        params,
      });
      const responseData = data?.data || data;
      const newPortfolios = Array.isArray(responseData) ? responseData : [];

      if (reset) {
        setPortfolios(newPortfolios);
      } else {
        setPortfolios((prev) => [...prev, ...newPortfolios]);
      }

      // Check if there are more pages
      setHasMore(newPortfolios.length === 10);
    } catch (error) {
      console.error("Error loading portfolios:", error);
      if (reset) {
        setPortfolios([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadPortfolios(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, currentPage]);

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
    <section className="relative bg-white py-10 md:py-15 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <PortfolioFilter
          selectedServiceId={selectedServiceId}
          onServiceChange={setSelectedServiceId}
        />

        {portfolios.length === 0 && !loading ? (
          <div className="text-center mt-20 py-20">
            <p className="text-muted-foreground text-lg">
              {locale === "ar"
                ? "لا توجد مشاريع متاحة حالياً"
                : "No portfolios available at the moment"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-20 gap-8">
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
                      className="object-cover group-hover:scale-110 transition-all duration-500 grayscale group-hover:grayscale-0"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {title}
                      </h3>
                      {description && (
                        <p className="text-white/90 text-sm line-clamp-2 mb-4">
                          {description
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

            {/* Loading indicator and observer target */}
            {hasMore && (
              <div ref={observerTarget} className="py-8">
                {loadingMore && (
                  <div className="flex justify-center items-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="rounded-3xl overflow-hidden bg-gray-200 animate-pulse"
                          style={{ aspectRatio: "4/3" }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
