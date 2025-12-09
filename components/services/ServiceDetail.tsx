"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchServiceById,
  fetchPublicServices,
} from "@/lib/actions/serviceActions";
import ServiceHero from "./ServiceHero";
import ServiceFeatures from "./ServiceFeatures";
import ServiceSections from "./ServiceSections";
import ServiceFirstSection from "./ServiceFirstSection";
import ServiceSecondSection from "./ServiceSecondSection";
import ServiceThirdSection from "./ServiceThirdSection";
import ServiceFourthSection from "./ServiceFourthSection";
import ServiceFifthSection from "./ServiceFifthSection";
import RelatedServices from "./RelatedServices";

export default function ServiceDetail({ serviceId }: { serviceId: string }) {
  const { locale } = useLanguage();
  const [currentService, setCurrentService] = useState<any>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [serviceId, locale]);

  const loadService = async () => {
    try {
      setLoading(true);
      // جلب الخدمة المطلوبة حسب المعرف مع الأقسام
      const serviceData = await fetchServiceById(serviceId, locale);
      setCurrentService(serviceData);

      // جلب جميع الخدمات للعرض في RelatedServices
      const allServicesData = await fetchPublicServices(locale);
      const allServices = Array.isArray(allServicesData)
        ? allServicesData
        : allServicesData?.data || [];
      setRelatedServices(allServices);
    } catch (error) {
      console.error("Error loading service:", error);
      setCurrentService(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-900">
        {/* Hero Skeleton */}
        <div className="relative h-[60vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-4xl space-y-6">
              <div className="h-12 bg-white/10 rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-white/10 rounded w-1/2 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="relative z-10 bg-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 rounded w-full animate-pulse"
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentService) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          {locale === "ar" ? "الخدمة غير موجودة" : "Service not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <ServiceHero service={currentService} />

      {/* First Section - Two Column Layout */}
      {currentService.sections &&
        currentService.sections.length > 0 &&
        currentService.sections[0] && (
          <ServiceFirstSection section={currentService.sections[0]} />
        )}

      {/* Content Section */}
      <div className="relative z-10 bg-white">
        <ServiceFeatures service={currentService} />

        {/* Second Section - Key Features & Benefits */}
        {currentService.sections &&
          currentService.sections.length > 1 &&
          currentService.sections[1] && (
            <ServiceSecondSection section={currentService.sections[1]} />
          )}

        {/* Third Section - Our Process */}
        {currentService.sections &&
          currentService.sections.length > 2 &&
          currentService.sections[2] && (
            <ServiceThirdSection section={currentService.sections[2]} />
          )}

        {/* Fourth Section - Recent Projects */}
        {currentService.sections &&
          currentService.sections.length > 3 &&
          currentService.sections[3] && (
            <ServiceFourthSection
              section={currentService.sections[3]}
              serviceId={serviceId}
            />
          )}

        {/* Fifth Section - Call to Action */}
        {currentService.sections &&
          currentService.sections.length > 4 &&
          currentService.sections[4] && (
            <ServiceFifthSection section={currentService.sections[4]} />
          )}

        {/* Other Sections */}
        {currentService.sections && currentService.sections.length > 5 && (
          <ServiceSections sections={currentService.sections.slice(5)} />
        )}

        <RelatedServices
          currentServiceId={serviceId}
          services={relatedServices}
        />
      </div>
    </div>
  );
}
