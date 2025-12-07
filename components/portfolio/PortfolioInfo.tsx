"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Tag } from "lucide-react";

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

export default function PortfolioInfo({ portfolio }: { portfolio: any }) {
  const { locale } = useLanguage();

  const title =
    typeof portfolio.title === "string"
      ? portfolio.title
      : portfolio.title?.[locale] || "";

  const description =
    typeof portfolio.description === "string"
      ? portfolio.description
      : portfolio.description?.[locale] || "";

  const serviceName =
    typeof portfolio.service === "object" && portfolio.service?.title
      ? typeof portfolio.service.title === "string"
        ? portfolio.service.title
        : portfolio.service.title[locale] || ""
      : "";

  const completionDate = portfolio.completionDate
    ? new Date(portfolio.completionDate).toLocaleDateString(
        locale === "ar" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : "";

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Category Badge */}
          {serviceName && (
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                <Tag className="h-4 w-4" />
                {serviceName}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {stripHtml(description)}
              </p>
            </div>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 pt-8 border-t border-border">
            {completionDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {locale === "ar" ? "تاريخ الإنجاز" : "Completion Date"}
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {completionDate}
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            {portfolio.features && portfolio.features.length > 0 && (
              <div className="flex-1">
                <div className="text-sm text-muted-foreground font-medium mb-3">
                  {locale === "ar" ? "المميزات" : "Features"}
                </div>
                <div className="flex flex-wrap gap-3">
                  {portfolio.features.map((feature: any, index: number) => {
                    const featureName =
                      typeof feature.name === "string"
                        ? feature.name
                        : feature.name?.[locale] || "";
                    return (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-gray-100 text-foreground text-sm font-medium"
                      >
                        {featureName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
