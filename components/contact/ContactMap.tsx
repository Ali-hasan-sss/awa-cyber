"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSectionsByPage } from "@/lib/api/sections";

export default function ContactMap() {
  const { locale } = useLanguage();
  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSection();
  }, [locale]);

  const loadSection = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("contact", locale);
      const sections = Array.isArray(data) ? data : (data as any)?.data || [];
      // Get first section (order 1)
      const firstSection =
        sections.find((s: any) => s.order === 1) || sections[0];
      setSection(firstSection);
    } catch (error) {
      console.error("Error loading contact section:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] flex-1">
        <div className="h-full rounded-3xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-3xl bg-gray-100 flex items-center justify-center">
        <p className="text-muted-foreground">
          {locale === "ar" ? "لا توجد بيانات للعرض" : "No data available"}
        </p>
      </div>
    );
  }

  // Get location from third feature (index 2)
  const features = section?.features || [];
  const locationFeature = features[2];

  // Default coordinates (Riyadh, Saudi Arabia) if not provided
  const defaultLat = 24.7136;
  const defaultLng = 46.6753;

  let mapLat = defaultLat;
  let mapLng = defaultLng;

  if (locationFeature) {
    // Try to get coordinates from name or description
    const lat = parseFloat(locationFeature.description || "");
    const lng = parseFloat(locationFeature.name || "");
    if (!isNaN(lat) && !isNaN(lng)) {
      mapLat = lat;
      mapLng = lng;
    }
  }
  console.log("lat:", mapLat);
  console.log("lang:", mapLng);
  // Google Maps embed URL - using simple embed format
  const mapUrl = `https://www.google.com/maps?q=${mapLat},${mapLng}&output=embed&z=15`;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/60 h-full min-h-[500px] flex-1">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {!locationFeature && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === "ar"
              ? "⚠️ لم يتم تحديد موقع الشركة بعد. يرجى تحديد الموقع من لوحة التحكم."
              : "⚠️ Company location has not been set yet. Please set the location from the admin panel."}
          </p>
        </div>
      )}
    </div>
  );
}
