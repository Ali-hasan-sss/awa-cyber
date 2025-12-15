"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSectionsByPage } from "@/lib/api/sections";
import { Phone, MapPin } from "lucide-react";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";
import { socialIconComponents, SocialIconKey } from "@/lib/socialIconOptions";
import ContactMap from "./ContactMap";

const getIconComponent = (iconName: string) => {
  // First try social icons
  if (socialIconComponents[iconName as SocialIconKey]) {
    return socialIconComponents[iconName as SocialIconKey];
  }
  // Then try service icons
  const IconComponent =
    serviceIconComponents[iconName as ServiceIconKey] ||
    serviceIconComponents["ShieldCheck"];
  return IconComponent;
};

export default function ContactInfo() {
  const { locale } = useLanguage();
  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSection();
  }, [locale]);

  const loadSection = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("contact");
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
      <div className="w-full h-full space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!section) {
    return null;
  }

  const features = section.features || [];
  const addressFeature = features[0];
  const phoneFeature = features[1];
  const socialFeatures = features.slice(3); // Skip location feature (index 2)

  const address =
    addressFeature &&
    (typeof addressFeature.name === "string"
      ? addressFeature.name
      : addressFeature.name?.[locale] || "");

  const phone =
    phoneFeature &&
    (typeof phoneFeature.name === "string"
      ? phoneFeature.name
      : phoneFeature.name?.[locale] || "");

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative rounded-3xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 border border-border/60 shadow-xl p-8 space-y-8 h-full flex flex-col justify-center min-h-[500px]">
        {/* Decorative background elements */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Address Card */}
          {address && (
            <div className="group relative rounded-2xl bg-white border border-border/60 p-6 hover:shadow-lg hover:border-primary/40 transition-all duration-300 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {locale === "ar" ? "العنوان" : "Address"}
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed font-medium">
                    {address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phone Card */}
          {phone && (
            <div className="group relative rounded-2xl bg-white border border-border/60 p-6 hover:shadow-lg hover:border-primary/40 transition-all duration-300 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {locale === "ar" ? "الهاتف" : "Phone"}
                  </h3>
                  <a
                    href={`tel:${phone}`}
                    className="text-base text-gray-700 hover:text-primary transition-colors font-medium block"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Icons Card */}
          {socialFeatures.length > 0 && (
            <div className="relative rounded-2xl bg-white border border-border/60 p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-6">
                {locale === "ar" ? "تابعنا على" : "Follow Us"}
              </h3>
              <div className="flex items-center flex-wrap gap-3">
                {socialFeatures.map((feature: any, index: number) => {
                  const iconName = feature.icon;
                  // Use description for full URL, fallback to name if description is empty
                  const link =
                    typeof feature.description === "string"
                      ? feature.description || feature.name
                      : feature.description?.[locale] ||
                        feature.name?.[locale] ||
                        "";
                  const IconComponent = getIconComponent(iconName);

                  if (!link) return null;

                  return (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white border border-primary hover:bg-transparent hover:text-primary hover:border-primary/40 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                      title={iconName}
                    >
                      <IconComponent className="w-6 h-6 transition-transform group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
