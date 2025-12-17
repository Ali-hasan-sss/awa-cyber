"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Target,
  Activity,
  Globe,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeImageUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import { getSectionsByPage, getSections } from "@/lib/api/sections";
import { fetchPublicPortfolios } from "@/lib/actions/portfolioActions";
import { serviceIconComponents } from "@/lib/serviceIconOptions";

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

type ProjectHighlight = {
  icon?: string;
  text: string;
};

type ProjectContent = {
  badge: string;
  badgeIcon?: string;
  timeline: string;
  title: string;
  summary: string;
  highlights: ProjectHighlight[];
  linkLabel: string;
  image: string;
  imageAlt: string;
};

const iconMap: Record<string, LucideIcon> = {
  ...serviceIconComponents,
  ShieldCheck,
  Target,
  Activity,
  Globe,
};

const fallbackProject: ProjectContent = {
  badge: "Web Security",
  badgeIcon: "Globe",
  timeline: "Completed Q4 2024",
  title: "E-Commerce Platform Security",
  summary:
    "Comprehensive penetration testing and security hardening for a major e-commerce platform, protecting customer data and payment systems.",
  highlights: [
    { icon: "ShieldCheck", text: "50+ vulnerabilities fixed" },
    { icon: "Target", text: "PCI DSS compliance achieved" },
    { icon: "Activity", text: "24/7 monitoring implemented" },
  ],
  linkLabel: "View Case Study",
  image: "/images/skils.jpg",
  imageAlt: "Security specialists reviewing e-commerce dashboards",
};

export default function LatestProjects({
  sections: sectionsProp,
}: {
  sections?: any[];
}) {
  const { locale, messages } = useLanguage();
  const fallbackSection = messages?.projectsSection ?? {};
  const [sections, setSections] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Use provided sections or load them
  useEffect(() => {
    if (sectionsProp && sectionsProp.length > 0) {
      setSections(sectionsProp);
      setSectionsLoading(false);
    } else {
      loadSections();
    }
  }, [sectionsProp, locale]);

  const loadSections = async () => {
    try {
      setSectionsLoading(true);
      // Use getSections to get full section data including selectedPortfolioId
      const allSections = await getSections({ page: "home" });
      const sortedSections = allSections.sort((a, b) => a.order - b.order);

      // Also get localized data for display
      const localizedData = await getSectionsByPage("home", locale);

      // Merge: use localized data but keep selectedPortfolioId from full data
      const mergedSections = sortedSections.map((section, index) => {
        const localized = localizedData[index];
        return {
          ...localized,
          selectedPortfolioId: (section as any).selectedPortfolioId,
        };
      });

      setSections(mergedSections);
    } catch (error) {
      console.error("Error loading sections:", error);
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  // Load portfolios when locale changes
  useEffect(() => {
    loadPortfolios();
  }, [locale]);

  const loadPortfolios = async () => {
    try {
      setPortfoliosLoading(true);
      const lang = locale === "ar" ? "ar" : "en";
      const data = await fetchPublicPortfolios(lang);
      const portfoliosList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      // Sort by completionDate descending and take the latest one
      const sorted = portfoliosList.sort((a: any, b: any) => {
        const dateA = new Date(a.completionDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.completionDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setPortfolios(sorted);
    } catch (error) {
      console.error("Error loading portfolios:", error);
      setPortfolios([]);
    } finally {
      setPortfoliosLoading(false);
    }
  };

  // Get fifth section (index 4) or fallback
  const projectsSection = useMemo(() => {
    if (sections.length < 5) return null;
    return sections[4]; // Fifth section
  }, [sections]);

  // Get section title
  const sectionTitle = useMemo(() => {
    if (projectsSection?.title) {
      // API returns title as string (already localized) or as object with locale keys
      const title =
        typeof projectsSection.title === "string"
          ? projectsSection.title
          : projectsSection.title[locale] || projectsSection.title.en || "";
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
  }, [projectsSection, locale]);

  // Get section description (convert HTML to text)
  const sectionDescription = useMemo(() => {
    if (projectsSection?.description) {
      // API returns description as string (already localized) or as object with locale keys
      const desc =
        typeof projectsSection.description === "string"
          ? projectsSection.description
          : projectsSection.description[locale] ||
            projectsSection.description.en ||
            "";
      return stripHtml(desc);
    }
    return null;
  }, [projectsSection, locale]);

  // Get selected portfolios (up to 3) from features or selectedPortfolioId
  const selectedPortfolios = useMemo(() => {
    if (portfolios.length === 0) return [];

    const selectedPortfolioList: any[] = [];

    // Check if section has features with portfolio IDs
    if (projectsSection?.features && projectsSection.features.length > 0) {
      // Use features to get portfolio IDs (feature.name contains portfolio ID)
      projectsSection.features
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .slice(0, 3) // Take only first 3
        .forEach((feature: any) => {
          const portfolioId = feature.name || feature.description;
          if (portfolioId) {
            const portfolio = portfolios.find(
              (p: any) => p._id === portfolioId
            );
            if (portfolio) {
              selectedPortfolioList.push(portfolio);
            }
          }
        });
    }

    // Fallback: Check if section has selectedPortfolioId (backward compatibility)
    if (selectedPortfolioList.length === 0) {
      const selectedPortfolioId = (projectsSection as any)?.selectedPortfolioId;
      if (selectedPortfolioId && selectedPortfolioId.trim() !== "") {
        const selected = portfolios.find(
          (p: any) => p._id === selectedPortfolioId
        );
        if (selected) {
          selectedPortfolioList.push(selected);
        }
      }
    }

    // If still no portfolios, use latest 3 portfolios
    if (selectedPortfolioList.length === 0) {
      return portfolios.slice(0, 3);
    }

    return selectedPortfolioList;
  }, [portfolios, projectsSection]);

  // Auto-rotate projects every 10 seconds
  useEffect(() => {
    if (selectedPortfolios.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentProjectIndex((prev) => (prev + 1) % selectedPortfolios.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [selectedPortfolios.length]);

  // Navigation functions
  const goToNext = () => {
    setCurrentProjectIndex((prev) => (prev + 1) % selectedPortfolios.length);
  };

  const goToPrevious = () => {
    setCurrentProjectIndex(
      (prev) =>
        (prev - 1 + selectedPortfolios.length) % selectedPortfolios.length
    );
  };

  // Get current portfolio to display
  const latestPortfolio = useMemo(() => {
    if (selectedPortfolios.length === 0) return null;
    return selectedPortfolios[currentProjectIndex] || selectedPortfolios[0];
  }, [selectedPortfolios, currentProjectIndex]);

  // Build project content from portfolio
  const project: ProjectContent = useMemo(() => {
    if (latestPortfolio) {
      const portfolioTitle =
        typeof latestPortfolio.title === "string"
          ? latestPortfolio.title
          : latestPortfolio.title?.[locale] || latestPortfolio.title?.en || "";

      const portfolioDescription =
        typeof latestPortfolio.description === "string"
          ? latestPortfolio.description
          : latestPortfolio.description?.[locale] ||
            latestPortfolio.description?.en ||
            "";

      // Get features/highlights from portfolio
      const highlights: ProjectHighlight[] =
        latestPortfolio.features && Array.isArray(latestPortfolio.features)
          ? latestPortfolio.features.map((feature: any) => ({
              icon: feature.icon || "ShieldCheck",
              text:
                typeof feature.name === "string"
                  ? feature.name
                  : feature.name?.[locale] ||
                    feature.name?.en ||
                    feature.description?.[locale] ||
                    feature.description?.en ||
                    "",
            }))
          : [];

      // Format completion date
      const completionDate = latestPortfolio.completionDate
        ? new Date(latestPortfolio.completionDate).toLocaleDateString(
            locale === "ar" ? "ar-SA" : "en-US",
            {
              year: "numeric",
              month: "short",
            }
          )
        : "";

      return {
        badge: portfolioTitle.split(" ").slice(0, 2).join(" ") || "Project",
        badgeIcon: latestPortfolio.features?.[0]?.icon || "Globe",
        timeline: completionDate ? `Completed ${completionDate}` : "",
        title: portfolioTitle,
        summary: portfolioDescription,
        highlights: highlights.slice(0, 3), // Max 3 highlights
        linkLabel: locale === "ar" ? "عرض التفاصيل" : "View Details",
        image:
          latestPortfolio.images && latestPortfolio.images.length > 0
            ? latestPortfolio.images[0]
            : fallbackProject.image,
        imageAlt: portfolioTitle,
      };
    }
    return fallbackProject;
  }, [latestPortfolio, locale]);

  const highlights = project.highlights ?? fallbackProject.highlights;
  const BadgeIcon = iconMap[project.badgeIcon ?? "Globe"] ?? Globe;

  // Determine which data to use: API data or fallback
  const displayTitle = sectionTitle || fallbackSection.title;
  const displayDescription = sectionDescription || fallbackSection.description;

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 rtl:text-center">
          {displayTitle ? (
            typeof displayTitle === "object" && "line1" in displayTitle ? (
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {displayTitle.line1}{" "}
                {displayTitle.highlight && (
                  <span className="text-primary">{displayTitle.highlight}</span>
                )}
              </h2>
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {typeof displayTitle === "string" ? displayTitle : ""}
              </h2>
            )
          ) : fallbackSection.title ? (
            typeof fallbackSection.title === "object" &&
            "line1" in fallbackSection.title ? (
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {fallbackSection.title.line1}{" "}
                {fallbackSection.title.highlight && (
                  <span className="text-primary">
                    {fallbackSection.title.highlight}
                  </span>
                )}
              </h2>
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {typeof fallbackSection.title === "string"
                  ? fallbackSection.title
                  : ""}
              </h2>
            )
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Latest Security <span className="text-primary">Projects</span>
            </h2>
          )}

          {displayDescription && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {displayDescription}
            </p>
          )}
        </div>

        <div className="mt-12 relative">
          {/* Carousel container with slide transition */}
          <div className="relative rounded-[32px] border border-border/40 bg-white shadow-2xl overflow-hidden group">
            {selectedPortfolios.length > 0 ? (
              <div className="relative overflow-hidden">
                {/* Slider wrapper */}
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform:
                      locale === "ar"
                        ? `translateX(${currentProjectIndex * 100}%)`
                        : `translateX(-${currentProjectIndex * 100}%)`,
                  }}
                >
                  {selectedPortfolios.map((portfolio, idx) => {
                    // Build project content for each portfolio
                    const portfolioTitle =
                      typeof portfolio.title === "string"
                        ? portfolio.title
                        : portfolio.title?.[locale] ||
                          portfolio.title?.en ||
                          "";

                    const portfolioDescription =
                      typeof portfolio.description === "string"
                        ? portfolio.description
                        : portfolio.description?.[locale] ||
                          portfolio.description?.en ||
                          "";

                    const portfolioHighlights: ProjectHighlight[] =
                      portfolio.features && Array.isArray(portfolio.features)
                        ? portfolio.features.map((feature: any) => ({
                            icon: feature.icon || "ShieldCheck",
                            text:
                              typeof feature.name === "string"
                                ? feature.name
                                : feature.name?.[locale] ||
                                  feature.name?.en ||
                                  feature.description?.[locale] ||
                                  feature.description?.en ||
                                  "",
                          }))
                        : [];

                    const completionDate = portfolio.completionDate
                      ? new Date(portfolio.completionDate).toLocaleDateString(
                          locale === "ar" ? "ar-SA" : "en-US",
                          {
                            year: "numeric",
                            month: "short",
                          }
                        )
                      : "";

                    const portfolioProject: ProjectContent = {
                      badge:
                        portfolioTitle.split(" ").slice(0, 2).join(" ") ||
                        "Project",
                      badgeIcon: portfolio.features?.[0]?.icon || "Globe",
                      timeline: completionDate
                        ? `Completed ${completionDate}`
                        : "",
                      title: portfolioTitle,
                      summary: portfolioDescription,
                      highlights: portfolioHighlights.slice(0, 3),
                      linkLabel:
                        locale === "ar" ? "عرض التفاصيل" : "View Details",
                      image:
                        portfolio.images && portfolio.images.length > 0
                          ? portfolio.images[0]
                          : fallbackProject.image,
                      imageAlt: portfolioTitle,
                    };

                    const PortfolioBadgeIcon =
                      iconMap[portfolioProject.badgeIcon ?? "Globe"] ?? Globe;

                    return (
                      <div key={portfolio._id} className="w-full flex-shrink-0">
                        <div className="flex flex-col lg:flex-row">
                          <div className="relative lg:w-1/2 aspect-[4/3] lg:min-h-[420px] lg:max-h-[600px]">
                            <Image
                              src={
                                normalizeImageUrl(portfolioProject.image) ||
                                fallbackProject.image
                              }
                              alt={
                                portfolioProject.imageAlt ||
                                fallbackProject.imageAlt
                              }
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                              sizes="(max-width: 1024px) 100vw, 640px"
                            />
                            <span className="absolute top-6 left-6 flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-foreground shadow">
                              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                                <PortfolioBadgeIcon className="h-4 w-4" />
                              </span>
                              {portfolioProject.badge}
                            </span>
                          </div>

                          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col gap-6 text-center md:text-left md:rtl:text-right">
                            {portfolioProject.timeline && (
                              <div className="flex items-center justify-center md:justify-start gap-3 text-sm font-semibold text-primary">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                {portfolioProject.timeline}
                              </div>
                            )}
                            <div className="space-y-4">
                              <h3 className="text-3xl font-bold text-foreground">
                                {portfolioProject.title}
                              </h3>
                              <p className="text-base text-muted-foreground leading-relaxed">
                                {portfolioProject.summary}
                              </p>
                            </div>
                            <ul className="space-y-4">
                              {portfolioProject.highlights.map(
                                (item, highlightIdx) => {
                                  const Icon =
                                    iconMap[item.icon ?? "ShieldCheck"] ??
                                    ShieldCheck;
                                  return (
                                    <li
                                      key={`${item.text}-${highlightIdx}`}
                                      className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground justify-center md:justify-start"
                                    >
                                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                      </span>
                                      <span className="text-base text-foreground">
                                        {item.text}
                                      </span>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                            {portfolioProject.linkLabel && (
                              <Link
                                href={`/portfolio/${portfolio._id}`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 justify-center md:justify-start transition-colors"
                              >
                                {portfolioProject.linkLabel}
                                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation arrows */}
                {selectedPortfolios.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 rtl:left-auto rtl:right-4"
                      aria-label={locale === "ar" ? "السابق" : "Previous"}
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-700 rtl:rotate-180" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 rtl:right-auto rtl:left-4"
                      aria-label={locale === "ar" ? "التالي" : "Next"}
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700 rtl:rotate-180" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              // Fallback: Show single project using old method
              <div className="flex flex-col lg:flex-row">
                <div className="relative lg:w-1/2 aspect-[4/3] lg:min-h-[420px] lg:max-h-[600px]">
                  <Image
                    src={project.image || fallbackProject.image}
                    alt={project.imageAlt || fallbackProject.imageAlt}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                  <span className="absolute top-6 left-6 flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-foreground shadow">
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <BadgeIcon className="h-4 w-4" />
                    </span>
                    {project.badge}
                  </span>
                </div>

                <div className="lg:w-1/2 p-8 md:p-12 flex flex-col gap-6 text-center md:text-left md:rtl:text-right">
                  {project.timeline && (
                    <div className="flex items-center justify-center md:justify-start gap-3 text-sm font-semibold text-primary">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {project.timeline}
                    </div>
                  )}
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-foreground">
                      {project.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {project.summary}
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {highlights.map((item, idx) => {
                      const Icon =
                        iconMap[item.icon ?? "ShieldCheck"] ?? ShieldCheck;
                      return (
                        <li
                          key={`${item.text}-${idx}`}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground justify-center md:justify-start"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="text-base text-foreground">
                            {item.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {project.linkLabel && latestPortfolio && (
                    <Link
                      href={`/portfolio/${latestPortfolio._id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 justify-center md:justify-start transition-colors"
                    >
                      {project.linkLabel}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Carousel indicators */}
          {selectedPortfolios.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {selectedPortfolios.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentProjectIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentProjectIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to project ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {fallbackSection.cta && (
          <div className="mt-12 flex justify-center">
            <Button
              className="bg-muted text-foreground hover:bg-muted/90 px-8 py-6 text-base font-semibold rounded-full"
              asChild
            >
              <Link href="/portfolio">
                {fallbackSection.cta}
                <ArrowRight className="h-4 w-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
