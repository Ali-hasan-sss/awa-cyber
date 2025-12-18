"use client";

import {
  Building2,
  ShieldCheck,
  Cloud,
  Server,
  Cpu,
  LaptopMinimal,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getSectionsByPage } from "@/lib/api/sections";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";

// Helper function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // Server-side: simple regex approach
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }
  // Client-side: use DOM
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const iconMap: Record<string, LucideIcon> = {
  Building2,
  ShieldCheck,
  Cloud,
  Server,
  Cpu,
  LaptopMinimal,
};

export default function TrustedClients({
  sections: sectionsProp,
}: {
  sections?: any[];
}) {
  const { locale, messages } = useLanguage();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const isManualDragRef = useRef(false);

  // Use provided sections or load them
  useEffect(() => {
    if (sectionsProp && sectionsProp.length > 0) {
      setSections(sectionsProp);
      setLoading(false);
    } else {
      loadSections();
    }
  }, [sectionsProp, locale]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("home", locale);
      setSections(data);
    } catch (error) {
      console.error("Error loading sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get third section (index 2) or fallback
  const clientsSection = useMemo(() => {
    if (sections.length < 3) return null;
    return sections[2]; // Third section
  }, [sections]);

  // Get section title
  const sectionTitle = useMemo(() => {
    if (clientsSection?.title) {
      // API returns title as string (already localized) or as object with locale keys
      const title =
        typeof clientsSection.title === "string"
          ? clientsSection.title
          : clientsSection.title[locale] || clientsSection.title.en || "";
      // Try to split title for highlight if it contains common patterns
      const parts = title.split(/(\s+)/);
      if (parts.length > 2) {
        // Take first part as line1, last part as highlight
        const line1 = parts.slice(0, -2).join("");
        const highlight = parts.slice(-2).join("").trim();
        return { line1, highlight };
      }
      return { line1: title, highlight: "" };
    }
    return null;
  }, [clientsSection, locale]);

  // Get section description (convert HTML to text)
  const sectionDescription = useMemo(() => {
    if (clientsSection?.description) {
      // API returns description as string (already localized) or as object with locale keys
      const desc =
        typeof clientsSection.description === "string"
          ? clientsSection.description
          : clientsSection.description[locale] ||
            clientsSection.description.en ||
            "";
      return stripHtml(desc);
    }
    return null;
  }, [clientsSection, locale]);

  // Get features as brands
  const brands = useMemo(() => {
    if (clientsSection?.features && clientsSection.features.length > 0) {
      return clientsSection.features
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((feature: any) => ({
          name:
            typeof feature.name === "string"
              ? feature.name
              : feature.name?.[locale] || feature.name?.en || "",
          tagline:
            typeof feature.description === "string"
              ? feature.description
              : feature.description?.[locale] || feature.description?.en || "",
          icon: feature.icon || "",
        }));
    }
    return [];
  }, [clientsSection, locale]);

  // Fallback to messages if no section data
  const fallbackSection = messages?.clientsSection ?? {};
  const fallbackBrands: { name: string; tagline?: string; icon?: string }[] =
    fallbackSection.brands ?? [];

  // Handle mouse/touch drag - Must be defined before any early returns
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    const container = scrollContainerRef.current;

    // Get current transform value
    const computedStyle = window.getComputedStyle(container);
    const matrix = computedStyle.transform;
    let currentX = 0;
    if (matrix && matrix !== "none") {
      const matrixValues = matrix.match(/matrix.*\((.+)\)/);
      if (matrixValues) {
        currentX = parseFloat(matrixValues[1].split(", ")[4]) || 0;
      }
    }

    dragOffsetRef.current = currentX;
    isManualDragRef.current = true;

    // Pause animation and use manual transform
    container.style.animation = "none";
    container.style.transform = `translateX(${currentX}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    isManualDragRef.current = false;
    // Resume animation from current position
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const computedStyle = window.getComputedStyle(container);
      const matrix = computedStyle.transform;
      let currentX = 0;
      if (matrix && matrix !== "none") {
        const matrixValues = matrix.match(/matrix.*\((.+)\)/);
        if (matrixValues) {
          currentX = parseFloat(matrixValues[1].split(", ")[4]) || 0;
        }
      }
      dragOffsetRef.current = currentX;
      // Reset animation will be handled by CSS
      container.style.animation = "";
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    isManualDragRef.current = false;
    // Resume animation from current position
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.animation = "";
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;
      e.preventDefault();
      const walk = (e.pageX - startX) * 2; // Scroll speed multiplier
      // When dragging left, content moves left (more negative)
      // When dragging right, content moves right (less negative/more positive)
      const newX = dragOffsetRef.current + walk;

      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.transform = `translateX(${newX}px)`;
      }
    },
    [isDragging, startX]
  );

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    const container = scrollContainerRef.current;

    // Get current transform value
    const computedStyle = window.getComputedStyle(container);
    const matrix = computedStyle.transform;
    let currentX = 0;
    if (matrix && matrix !== "none") {
      const matrixValues = matrix.match(/matrix.*\((.+)\)/);
      if (matrixValues) {
        currentX = parseFloat(matrixValues[1].split(", ")[4]) || 0;
      }
    }

    dragOffsetRef.current = currentX;
    isManualDragRef.current = true;

    // Pause animation and use manual transform
    container.style.animation = "none";
    container.style.transform = `translateX(${currentX}px)`;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;
      const walk = (e.touches[0].pageX - startX) * 2;
      // When dragging left, content moves left (more negative)
      // When dragging right, content moves right (less negative/more positive)
      const newX = dragOffsetRef.current + walk;

      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.transform = `translateX(${newX}px)`;
      }
    },
    [isDragging, startX]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    isManualDragRef.current = false;
    // Resume animation from current position
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.animation = "";
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Title Skeleton */}
            <div className="text-center">
              <div className="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto animate-pulse" />
            </div>
            {/* Logos Grid Skeleton */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-32 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Determine which data to use: API data or fallback
  const displayTitle = sectionTitle || fallbackSection.title;
  const displayDescription = sectionDescription || fallbackSection.description;
  const displayBrands = brands.length
    ? brands
    : fallbackBrands.length
    ? fallbackBrands
    : defaultBrands;

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto rtl:text-center">
          {displayTitle ? (
            typeof displayTitle === "object" && "line1" in displayTitle ? (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {displayTitle.line1}{" "}
                {displayTitle.highlight && (
                  <span className="text-primary">{displayTitle.highlight}</span>
                )}
              </h2>
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {typeof displayTitle === "string" ? displayTitle : ""}
              </h2>
            )
          ) : fallbackSection.title ? (
            typeof fallbackSection.title === "object" &&
            "line1" in fallbackSection.title ? (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {fallbackSection.title.line1}{" "}
                {fallbackSection.title.highlight && (
                  <span className="text-primary">
                    {fallbackSection.title.highlight}
                  </span>
                )}
              </h2>
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {typeof fallbackSection.title === "string"
                  ? fallbackSection.title
                  : ""}
              </h2>
            )
          ) : (
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trusted by industry-leading{" "}
              <span className="text-primary">organizations</span>
            </h2>
          )}

          {displayDescription && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {displayDescription}
            </p>
          )}
        </div>

        {/* Infinite Scrolling Cards */}
        <div className="mt-12 overflow-hidden relative group">
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @keyframes scroll-trusted-clients {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              @keyframes scroll-trusted-clients-rtl {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(50%);
                }
              }
              .scrolling-wrapper-trusted-clients {
                animation: scroll-trusted-clients 60s linear infinite;
                cursor: grab;
                will-change: transform;
              }
              .scrolling-wrapper-trusted-clients:active,
              .scrolling-wrapper-trusted-clients.dragging {
                cursor: grabbing;
              }
              [dir="rtl"] .scrolling-wrapper-trusted-clients {
                animation: scroll-trusted-clients-rtl 60s linear infinite;
              }
              .group:hover .scrolling-wrapper-trusted-clients:not(.dragging) {
                animation-play-state: paused;
              }
            `,
            }}
          />
          <div
            ref={scrollContainerRef}
            className={`scrolling-wrapper-trusted-clients flex gap-4 md:gap-6 w-max select-none ${
              locale === "ar" ? "rtl" : ""
            } ${isDragging ? "dragging" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              userSelect: "none",
              touchAction: "none",
            }}
          >
            {/* Duplicate brands for seamless infinite scroll */}
            {[...displayBrands, ...displayBrands].map(
              (
                brand: { name: string; tagline?: string; icon?: string },
                idx: number
              ) => {
                // Check if icon is a URL/image path (not an icon name)
                const isImageUrl =
                  brand.icon &&
                  (brand.icon.startsWith("http") ||
                    brand.icon.startsWith("/") ||
                    brand.icon.includes(".") ||
                    brand.icon.includes("72.60.208.192") ||
                    brand.icon.includes("awacyber.com"));
                const Icon =
                  !isImageUrl && brand.icon ? iconMap[brand.icon] : null;
                const FallbackIcon = Icon || Building2;

                return (
                  <div
                    key={`${brand.name}-${idx}`}
                    className="rounded-2xl border border-border bg-white/80 p-6 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg w-[250px] h-[250px] flex flex-col flex-shrink-0 grayscale hover:grayscale-0"
                  >
                    <div className="mx-auto mb-4 flex items-center justify-center h-32 w-full">
                      {isImageUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={normalizeImageUrl(brand.icon!)}
                            alt={brand.name}
                            fill
                            className="object-contain transition-all duration-300"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <FallbackIcon className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="font-semibold text-lg text-foreground mb-1">
                        {brand.name}
                      </p>
                      {brand.tagline && (
                        <p className="text-sm text-muted-foreground">
                          {brand.tagline}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const defaultBrands = [
  {
    name: "Enterprise Co.",
    tagline: "Global fintech leader",
    icon: "Building2",
  },
  {
    name: "SecureTech",
    tagline: "Critical infrastructure",
    icon: "ShieldCheck",
  },
  { name: "CloudXiq", tagline: "Multi-cloud platform", icon: "Cloud" },
  { name: "DataSolutions", tagline: "Healthcare analytics", icon: "Server" },
  { name: "TechLogy", tagline: "Autonomous systems", icon: "Cpu" },
];
