"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicServices } from "@/lib/actions/serviceActions";

interface PortfolioFilterProps {
  selectedServiceId: string | null;
  onServiceChange: (serviceId: string | null) => void;
}

export default function PortfolioFilter({
  selectedServiceId,
  onServiceChange,
}: PortfolioFilterProps) {
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
      const servicesList = Array.isArray(data) ? data : data?.data || [];
      setServices(servicesList);
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center gap-3 py-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 py-8 px-4">
      {/* All Projects Button */}
      <button
        onClick={() => onServiceChange(null)}
        className={`px-6 py-3 rounded-full font-semibold text-base md:text-lg transition-all duration-300 ${
          selectedServiceId === null
            ? "bg-primary text-white shadow-lg hover:shadow-xl"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {locale === "ar" ? "جميع المشاريع" : "All Projects"}
      </button>

      {/* Service Filter Buttons */}
      {services.map((service: any) => {
        const serviceTitle =
          typeof service.title === "string"
            ? service.title
            : service.title?.[locale] || service.title?.en || "";

        const isSelected = selectedServiceId === service._id;

        return (
          <button
            key={service._id}
            onClick={() => onServiceChange(service._id)}
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
  );
}
