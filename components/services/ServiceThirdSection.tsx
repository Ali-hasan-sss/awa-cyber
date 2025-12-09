"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceThirdSectionProps {
  section: {
    title: string | { en: string; ar: string };
    description?: string | { en: string; ar: string };
    features?: Array<{
      icon: string; // سيحتوي على رقم الخطوة مثل "01"
      name: string | { en: string; ar: string };
      description: string | { en: string; ar: string };
    }>;
  };
}

export default function ServiceThirdSection({
  section,
}: ServiceThirdSectionProps) {
  const { locale } = useLanguage();

  const title =
    typeof section.title === "string"
      ? section.title
      : section.title?.[locale] || section.title?.en || "";

  const description =
    typeof section.description === "string"
      ? section.description
      : section.description?.[locale] || section.description?.en || "";

  const features = section.features || [];

  if (!title && features.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Process Steps Grid */}
          {features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => {
                const featureName =
                  typeof feature.name === "string"
                    ? feature.name
                    : feature.name?.[locale] || feature.name?.en || "";

                const featureDescription =
                  typeof feature.description === "string"
                    ? feature.description
                    : feature.description?.[locale] ||
                      feature.description?.en ||
                      "";

                // استخدام icon كرقم الخطوة
                const stepNumber =
                  feature.icon || String(index + 1).padStart(2, "0");

                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Step Number */}
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-4">
                      {stepNumber}
                    </div>

                    {/* Feature Title */}
                    {featureName && (
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                        {featureName}
                      </h3>
                    )}

                    {/* Feature Description */}
                    {featureDescription && (
                      <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                        {featureDescription}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
