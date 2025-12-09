"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

interface ServiceSecondSectionProps {
  section: {
    title: string | { en: string; ar: string };
    description?: string | { en: string; ar: string };
    features?: Array<{
      icon: string;
      name: string | { en: string; ar: string };
      description: string | { en: string; ar: string };
    }>;
  };
}

const getIconComponent = (iconName: string) => {
  const IconComponent =
    serviceIconComponents[iconName as ServiceIconKey] ||
    serviceIconComponents["ShieldCheck"];
  return IconComponent;
};

export default function ServiceSecondSection({
  section,
}: ServiceSecondSectionProps) {
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

          {/* Features Grid */}
          {features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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

                const IconComponent = getIconComponent(feature.icon);

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    {/* Feature Title */}
                    {featureName && (
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                        {featureName}
                      </h3>
                    )}

                    {/* Feature Description */}
                    {featureDescription && (
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
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
