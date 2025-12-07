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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
