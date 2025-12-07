"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PortfolioNavigationProps {
  prevPortfolio: any | null;
  nextPortfolio: any | null;
  direction: "left" | "right";
}

export default function PortfolioNavigation({
  prevPortfolio,
  nextPortfolio,
  direction,
}: PortfolioNavigationProps) {
  const { locale } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Check if lightbox is open
  useEffect(() => {
    const checkLightbox = () => {
      setIsLightboxOpen(document.body.hasAttribute("data-lightbox-open"));
    };

    // Check initially
    checkLightbox();

    // Watch for changes
    const observer = new MutationObserver(checkLightbox);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-lightbox-open"],
    });

    return () => observer.disconnect();
  }, []);

  const portfolio = direction === "left" ? prevPortfolio : nextPortfolio;
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  if (!portfolio) {
    return null;
  }

  const title =
    typeof portfolio.title === "string"
      ? portfolio.title
      : portfolio.title?.[locale] || "";

  const image = portfolio.images?.[0] || "/images/publicContain.jpg";
  const href = `/portfolio/${portfolio._id}`;

  // Hide navigation when lightbox is open
  if (isLightboxOpen) {
    return null;
  }

  return (
    <div
      className={`fixed ${
        direction === "left" ? "left-0" : "right-0"
      } top-1/2 -translate-y-1/2 z-50 h-[50vh] flex items-center`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Button - Vertical Rectangle (Half Screen Height) */}
      <Link
        href={href}
        className="group relative h-full w-16 md:w-20 flex items-center justify-center bg-black/90 backdrop-blur-sm hover:bg-black transition-all duration-300"
      >
        <Icon className="h-10 w-10 md:h-12 md:w-12 text-primary transition-transform duration-300 group-hover:scale-125" />
      </Link>

      {/* Preview Panel - Slides out on hover */}
      <div
        className={`absolute top-0 bottom-0 ${
          direction === "left" ? "left-16 md:left-20" : "right-16 md:right-20"
        } w-0 overflow-hidden bg-black/95 backdrop-blur-md transition-all duration-500 ease-in-out ${
          isHovered ? "w-80 md:w-96" : "w-0"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Preview Image */}
          <div className="relative flex-1 min-h-0">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 320px, 384px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>

          {/* Preview Content */}
          <div className="p-6 bg-black/95">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center text-primary text-sm font-semibold">
              <span>
                {direction === "left"
                  ? locale === "ar"
                    ? "العمل السابق"
                    : "Previous Work"
                  : locale === "ar"
                  ? "العمل التالي"
                  : "Next Work"}
              </span>
              {direction === "right" && (
                <ChevronRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:rotate-180" />
              )}
              {direction === "left" && (
                <ChevronLeft className="h-4 w-4 ml-2 rtl:mr-2 rtl:rotate-180" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
