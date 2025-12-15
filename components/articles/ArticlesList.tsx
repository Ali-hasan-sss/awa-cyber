"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicServices } from "@/lib/actions/serviceActions";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const calculateReadingTime = (html: string): number => {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const wordsPerMinute = 200;
  return Math.ceil(words.length / wordsPerMinute) || 1;
};

const formatDate = (
  dateString: string | undefined,
  locale: "en" | "ar"
): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ArticlesList() {
  const { locale } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load services on mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await fetchPublicServices(locale);
        setServices(
          Array.isArray(servicesData) ? servicesData : servicesData?.data || []
        );
      } catch (error) {
        console.error("Error loading services:", error);
        setServices([]);
      }
    };
    loadServices();
  }, [locale]);

  const loadArticles = useCallback(
    async (page: number = 1, reset: boolean = false) => {
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
        if (selectedService) {
          params.serviceId = selectedService;
        }

        const { data } = await apiClient.get("/api/articles/public", {
          headers: { "x-lang": locale },
          params,
        });
        const responseData = data?.data || data;
        const newArticles = Array.isArray(responseData) ? responseData : [];

        if (reset) {
          setArticles(newArticles);
        } else {
          setArticles((prev) => [...prev, ...newArticles]);
        }

        // Check if there are more pages
        setHasMore(newArticles.length === 10);
      } catch (error) {
        console.error("Error loading articles:", error);
        if (reset) {
          setArticles([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [locale, selectedService]
  );

  // Reset pagination when filter or locale changes
  useEffect(() => {
    setCurrentPage(1);
    setArticles([]);
    setHasMore(true);
    loadArticles(1, true);
  }, [locale, selectedService, loadArticles]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadArticles(nextPage, false);
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
  }, [hasMore, loadingMore, loading, currentPage, loadArticles]);

  if (loading) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-border/60 shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-24" />
                  <div className="h-6 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="flex gap-4 mt-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-10 md:py-15">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter */}
        {services.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 py-8 px-4">
            {/* All Articles Button */}
            <button
              onClick={() => setSelectedService("")}
              className={`px-6 py-3 rounded-full font-semibold text-base md:text-lg transition-all duration-300 ${
                selectedService === ""
                  ? "bg-primary text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {locale === "ar" ? "جميع المقالات" : "All Articles"}
            </button>

            {/* Service Filter Buttons */}
            {services.map((service: any) => {
              const serviceTitle =
                typeof service.title === "string"
                  ? service.title
                  : service.title?.[locale] || service.title?.en || "";

              const isSelected =
                selectedService === (service._id || service.id);

              return (
                <button
                  key={service._id || service.id}
                  onClick={() => setSelectedService(service._id || service.id)}
                  className={`px-6 py-3 rounded-full font-semibold text-base md:text-lg transition-all duration-300 ${
                    isSelected
                      ? "bg-primary text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {serviceTitle}
                </button>
              );
            })}
          </div>
        )}

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {locale === "ar"
                ? "لا توجد مقالات متاحة حالياً"
                : "No articles available at the moment"}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article (Latest) */}
            {articles.length > 0 && (
              <div className="mb-12">
                {(() => {
                  const featuredArticle = articles[0];
                  const readingTime = calculateReadingTime(
                    featuredArticle.body || ""
                  );
                  const publishedDate = formatDate(
                    featuredArticle.publishedAt,
                    locale
                  );
                  const serviceTitle = featuredArticle.serviceTitle || "";

                  return (
                    <Link
                      href={`/articles/${
                        featuredArticle._id || featuredArticle.id
                      }`}
                      className="group block rounded-3xl bg-white border border-border/60 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="relative h-64 lg:h-auto lg:min-h-[400px] w-full overflow-hidden">
                          {featuredArticle.mainImage ? (
                            <Image
                              src={featuredArticle.mainImage}
                              alt={featuredArticle.title || ""}
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-6xl text-primary/40">
                                📄
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-500 text-white px-4 py-1.5 text-sm font-semibold">
                              {locale === "ar" ? "مميز" : "Featured"}
                            </span>
                            {serviceTitle && (
                              <span className="rounded-full bg-gray-100 text-gray-700 px-4 py-1.5 text-sm font-medium">
                                {serviceTitle}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                            {featuredArticle.title || ""}
                          </h2>

                          {/* Description */}
                          <p className="text-lg text-muted-foreground leading-relaxed line-clamp-4">
                            {featuredArticle.description || ""}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border/40">
                            {publishedDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                <span>{publishedDate}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5" />
                              <span>
                                {readingTime}{" "}
                                {locale === "ar" ? "دقائق قراءة" : "min read"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })()}
              </div>
            )}

            {/* Other Articles Grid */}
            {articles.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.slice(1).map((article: any) => {
                  const readingTime = calculateReadingTime(article.body || "");
                  const publishedDate = formatDate(article.publishedAt, locale);
                  const serviceTitle = article.serviceTitle || "";

                  return (
                    <Link
                      key={article._id || article.id}
                      href={`/articles/${article._id || article.id}`}
                      className="group rounded-3xl bg-white border border-border/60 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative h-48 w-full overflow-hidden">
                        {article.mainImage ? (
                          <Image
                            src={article.mainImage}
                            alt={article.title || ""}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-4xl text-gray-400">📄</span>
                          </div>
                        )}
                        {/* Category Badge */}
                        {serviceTitle && (
                          <div className="absolute top-4 left-4">
                            <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-900 shadow-sm">
                              {serviceTitle}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title || ""}
                        </h3>

                        {/* Description */}
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {article.description || ""}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
                          {publishedDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>{publishedDate}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>
                              {readingTime}{" "}
                              {locale === "ar" ? "دقائق قراءة" : "min read"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Loading indicator and observer target */}
            {hasMore && (
              <div ref={observerTarget} className="py-8">
                {loadingMore && (
                  <div className="flex justify-center items-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="rounded-3xl bg-white border border-border/60 shadow-lg overflow-hidden animate-pulse"
                        >
                          <div className="h-48 bg-gray-200" />
                          <div className="p-6 space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-24" />
                            <div className="h-6 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                          </div>
                        </div>
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
