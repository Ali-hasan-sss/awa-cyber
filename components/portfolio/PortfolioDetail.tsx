"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicPortfolios } from "@/lib/actions/portfolioActions";
import PortfolioDetailHero from "./PortfolioDetailHero";
import PortfolioInfo from "./PortfolioInfo";
import PortfolioGallery from "./PortfolioGallery";
import RelatedPortfolios from "./RelatedPortfolios";
import PortfolioNavigation from "./PortfolioNavigation";

export default function PortfolioDetail({
  portfolioId,
}: {
  portfolioId: string;
}) {
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

  const currentPortfolio = useMemo(() => {
    return portfolios.find((p: any) => p._id === portfolioId);
  }, [portfolios, portfolioId]);

  const currentIndex = useMemo(() => {
    return portfolios.findIndex((p: any) => p._id === portfolioId);
  }, [portfolios, portfolioId]);

  const nextPortfolio = useMemo(() => {
    if (currentIndex === -1 || currentIndex === portfolios.length - 1) {
      return portfolios[0];
    }
    return portfolios[currentIndex + 1];
  }, [portfolios, currentIndex]);

  const prevPortfolio = useMemo(() => {
    if (currentIndex === -1 || currentIndex === 0) {
      return portfolios[portfolios.length - 1];
    }
    return portfolios[currentIndex - 1];
  }, [portfolios, currentIndex]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-900">
        {/* Hero Skeleton */}
        <div className="relative h-[60vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-4xl space-y-6">
              <div className="h-12 bg-white/10 rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-white/10 rounded w-1/2 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="relative z-10 bg-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Gallery Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
              {/* Info Skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded w-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPortfolio) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          {locale === "ar" ? "المشروع غير موجود" : "Portfolio not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Navigation Buttons with Preview */}
      <PortfolioNavigation
        prevPortfolio={prevPortfolio}
        nextPortfolio={null}
        direction="left"
      />
      <PortfolioNavigation
        prevPortfolio={null}
        nextPortfolio={nextPortfolio}
        direction="right"
      />

      {/* Hero Section */}
      <PortfolioDetailHero portfolio={currentPortfolio} />

      {/* Content Section */}
      <div className="relative z-10 bg-white">
        <PortfolioInfo portfolio={currentPortfolio} />
        <PortfolioGallery portfolio={currentPortfolio} />
        <RelatedPortfolios
          currentPortfolioId={portfolioId}
          portfolios={portfolios}
        />
      </div>
    </div>
  );
}
