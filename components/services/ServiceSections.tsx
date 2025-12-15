"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { Check } from "lucide-react";

interface ServiceSection {
  _id: string;
  title: string;
  description: string;
  images: string[];
  features: Array<{
    name: string;
    description: string;
    icon: string;
    order: number;
  }>;
  order: number;
}

interface ServiceSectionsProps {
  sections: ServiceSection[];
}

export default function ServiceSections({ sections }: ServiceSectionsProps) {
  const { locale } = useLanguage();

  if (!sections || sections.length === 0) {
    return null;
  }

  // ترتيب الأقسام حسب order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-20 md:space-y-28">
      {sortedSections.map((section) => (
        <section
          key={section._id}
          className="relative bg-gradient-to-b from-white to-gray-100 py-16 md:py-24"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  {section.title}
                </h2>
                {section.description && (
                  <div
                    className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: section.description }}
                  />
                )}
              </div>

              {/* Images Grid */}
              {section.images && section.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {section.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <Image
                        src={image}
                        alt={`${section.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Features Grid */}
              {section.features && section.features.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {section.features
                    .sort((a, b) => a.order - b.order)
                    .map((feature, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-white border border-border/60 shadow-sm p-5 flex items-start gap-3"
                      >
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {feature.name}
                          </h3>
                          {feature.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
