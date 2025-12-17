"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchArticleById,
  fetchPublicArticles,
} from "@/lib/actions/articleActions";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Share2,
} from "lucide-react";
import { normalizeImageUrl, normalizeHtmlContent } from "@/lib/utils";

const calculateReadingTime = (html: string): number => {
  if (!html) return 1;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
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

export default function ArticleDetail({ articleId }: { articleId: string }) {
  const { locale } = useLanguage();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    loadArticle();
  }, [articleId, locale]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await fetchArticleById(articleId, locale);
      setArticle(data);

      // Load related articles after article is loaded
      if (data?.serviceId) {
        loadRelatedArticles(data.serviceId);
      }
    } catch (error) {
      console.error("Error loading article:", error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedArticles = async (serviceId: string) => {
    try {
      setLoadingRelated(true);
      const articles = await fetchPublicArticles(locale, serviceId);
      const articlesArray = Array.isArray(articles)
        ? articles
        : articles?.data || [];

      // Filter out current article and limit to 3
      const filtered = articlesArray
        .filter((a: any) => (a._id || a.id) !== articleId)
        .slice(0, 3);

      setRelatedArticles(filtered);
    } catch (error) {
      console.error("Error loading related articles:", error);
      setRelatedArticles([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  if (loading) {
    return (
      <article className="relative min-h-screen">
        <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] bg-gray-200 animate-pulse" />
        <div className="relative bg-white py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (!article) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <p className="text-muted-foreground text-lg">
            {locale === "ar" ? "المقالة غير موجودة" : "Article not found"}
          </p>
          <Link
            href="/articles"
            className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === "ar" ? "العودة للمقالات" : "Back to Articles"}
          </Link>
        </div>
      </section>
    );
  }

  const readingTime = calculateReadingTime(article.body || "");
  const publishedDate = formatDate(article.publishedAt, locale);
  const serviceTitle = article.serviceTitle || "";

  return (
    <article className="relative min-h-screen">
      {/* Hero Section - Full Width Image */}
      {article.mainImage ? (
        <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
          <Image
            src={normalizeImageUrl(article.mainImage)}
            alt={article.title || ""}
            fill
            priority
            className="object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Back Button */}
          <div
            className={`absolute top-6 z-20 ${
              locale === "ar" ? "right-6" : "left-6"
            }`}
          >
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-full text-gray-900 transition-colors shadow-lg"
            >
              <ArrowLeft
                className={`h-4 w-4 ${locale === "ar" ? "rotate-180" : ""}`}
              />
              <span className="font-medium">
                {locale === "ar" ? "العودة" : "Back"}
              </span>
            </Link>
          </div>
        </div>
      ) : (
        // Fallback if no image
        <div className="relative w-full h-[50vh] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-gray-900 hover:text-primary mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>
                {locale === "ar" ? "العودة للمقالات" : "Back to Articles"}
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Article Header Section */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft
                className={`h-4 w-4 ${locale === "ar" ? "rotate-180" : ""}`}
              />
              <span>
                {locale === "ar" ? "العودة للمقالات" : "Back to Articles"}
              </span>
            </Link>

            {/* Service Tag and Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {serviceTitle && (
                <span className="inline-block rounded-md bg-blue-500 text-white px-3 py-1.5 text-sm font-medium">
                  {serviceTitle}
                </span>
              )}
              {publishedDate && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{publishedDate}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {readingTime} {locale === "ar" ? "دقائق قراءة" : "min read"}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              {article.title || ""}
            </h1>

            {/* Author and Share Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-6 border-t border-gray-200">
              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  <Image
                    src="/images/logo.png"
                    alt="AWA Cyber"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">AWA Cyber</div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "ar" ? "كاتب" : "Author"}
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {locale === "ar" ? "مشاركة:" : "Share:"}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      shareUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors text-gray-700"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      shareUrl
                    )}&text=${encodeURIComponent(article.title || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-400 hover:text-white flex items-center justify-center transition-colors text-gray-700"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      shareUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors text-gray-700"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: article.title || "",
                          text: article.description || "",
                          url: shareUrl,
                        });
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-700"
                    aria-label={locale === "ar" ? "مشاركة" : "Share"}
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="relative bg-white py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Body */}
          {article.body && (
            <div
              className="article-content max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-gray-900 [&_strong]:font-semibold [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:my-6 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm"
              dangerouslySetInnerHTML={{
                __html: normalizeHtmlContent(article.body),
              }}
            />
          )}
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className="relative bg-gray-50 py-12 md:py-20 border-t border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                {locale === "ar" ? "مقالات ذات صلة" : "Related Articles"}
              </h2>

              {loadingRelated ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle: any) => {
                    const relatedReadingTime = calculateReadingTime(
                      relatedArticle.body || ""
                    );
                    const relatedPublishedDate = formatDate(
                      relatedArticle.publishedAt,
                      locale
                    );

                    return (
                      <Link
                        key={relatedArticle._id || relatedArticle.id}
                        href={`/articles/${
                          relatedArticle._id || relatedArticle.id
                        }`}
                        className="group rounded-3xl bg-white border border-border/60 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Image */}
                        <div className="relative h-48 w-full overflow-hidden">
                          {relatedArticle.mainImage ? (
                            <Image
                              src={normalizeImageUrl(relatedArticle.mainImage)}
                              alt={relatedArticle.title || ""}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-4xl text-primary/40">
                                📄
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                          {/* Title */}
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedArticle.title || ""}
                          </h3>

                          {/* Description */}
                          <p className="text-muted-foreground text-sm line-clamp-3">
                            {relatedArticle.description || ""}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
                            {relatedPublishedDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{relatedPublishedDate}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span>
                                {relatedReadingTime}{" "}
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
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
