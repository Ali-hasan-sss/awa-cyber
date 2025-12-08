"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicServices } from "@/lib/actions/serviceActions";
import ServiceHero from "./ServiceHero";
import ServiceFeatures from "./ServiceFeatures";
import RelatedServices from "./RelatedServices";

export default function ServiceDetail({ serviceId }: { serviceId: string }) {
  const { locale } = useLanguage();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, [locale]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await fetchPublicServices(locale);
      setServices(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const currentService = useMemo(() => {
    return services.find((s: any) => s._id === serviceId);
  }, [services, serviceId]);

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

      {/* Content Section */}
      <div className="relative z-10 bg-white">
        <ServiceFeatures service={currentService} />
        <RelatedServices currentServiceId={serviceId} services={services} />
      </div>
    </div>
  );
}
