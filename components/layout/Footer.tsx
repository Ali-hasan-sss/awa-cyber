"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import Logo from "../ui/logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSectionsByPage } from "@/lib/api/sections";
import { socialIconComponents, SocialIconKey } from "@/lib/socialIconOptions";

type FooterContent = {
  tagline?: string;
  quickLinks?: {
    title?: string;
    links?: string[];
  };
  services?: {
    title?: string;
    items?: string[];
  };
  contact?: {
    title?: string;
    address?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  copyright?: string;
  policies?: {
    privacy?: string;
    terms?: string;
    cookies?: string;
  };
};

const fallbackContent: FooterContent = {
  tagline:
    "Building modern web and mobile applications, managing effective marketing campaigns, and professional social media management.",
  quickLinks: {
    title: "Quick Links",
    links: ["Home", "About Us", "Services", "Portfolio", "Contact"],
  },
  services: {
    title: "Our Services",
    items: [
      "Web App Development",
      "Mobile App Development",
      "Web Design",
      "Advertising Campaigns",
      "Digital Marketing",
      "Social Media Management",
    ],
  },
  contact: {
    title: "Get In Touch",
    address: "Muscat, Sultanate of Oman",
    email: "info@awacyber.com",
    phone: "+1 (234) 567-890",
    whatsapp: "WhatsApp Us",
  },
  copyright: "© 2025 AWA Cyber. All rights reserved.",
  policies: {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
  },
};

const getIconComponent = (iconName: string) => {
  if (socialIconComponents[iconName as SocialIconKey]) {
    return socialIconComponents[iconName as SocialIconKey];
  }
  return null;
};

export default function Footer() {
  const { locale, messages } = useLanguage();
  const [contactSection, setContactSection] = useState<any>(null);
  const [loadingContact, setLoadingContact] = useState(true);

  const content: FooterContent = {
    ...fallbackContent,
    ...(messages?.footer ?? {}),
  };

  // Load contact section data
  useEffect(() => {
    loadContactSection();
  }, [locale]);

  const loadContactSection = async () => {
    try {
      setLoadingContact(true);
      const data = await getSectionsByPage("contact", locale);
      const sections = Array.isArray(data) ? data : (data as any)?.data || [];
      const firstSection =
        sections.find((s: any) => s.order === 1) || sections[0];
      setContactSection(firstSection);
    } catch (error) {
      console.error("Error loading contact section:", error);
    } finally {
      setLoadingContact(false);
    }
  };

  // Extract contact information from section features
  const features = contactSection?.features || [];
  const addressFeature = features[0];
  const phoneFeature = features[1];
  const socialFeatures = features.slice(3);

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

  // Quick Links mapping
  const quickLinksMap: Record<string, string> = {
    Home: "/",
    "About Us": "/about",
    About: "/about",
    Services: "/services",
    Portfolio: "/portfolio",
    Contact: "/contact",
    "اتصل بنا": "/contact",
    "من نحن": "/about",
    الخدمات: "/services",
    الأعمال: "/portfolio",
    الرئيسية: "/",
  };

  const quickLinks =
    content.quickLinks?.links ?? fallbackContent.quickLinks!.links!;

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/cyber.jpg"
          alt="Footer background"
          fill
          className="object-cover opacity-20"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Company Info & Social Media */}
          <div className="space-y-6">
            <Logo />
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              {content.tagline}
            </p>
            {!loadingContact && socialFeatures.length > 0 && (
              <div className="flex gap-3">
                {socialFeatures.map((feature: any, index: number) => {
                  const iconName = feature.icon;
                  const link =
                    typeof feature.description === "string"
                      ? feature.description
                      : feature.description?.[locale] || "";
                  const IconComponent = getIconComponent(iconName);

                  if (!IconComponent || !link) return null;

                  // Ensure the link has a protocol (http:// or https://)
                  // Only add https:// if it's a domain (contains a dot) and doesn't start with / or #
                  let formattedLink = link;
                  if (
                    !link.startsWith("http://") &&
                    !link.startsWith("https://") &&
                    !link.startsWith("/") &&
                    !link.startsWith("#") &&
                    link.includes(".")
                  ) {
                    formattedLink = `https://${link}`;
                  }

                  return (
                    <a
                      key={index}
                      href={formattedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors"
                      aria-label={iconName}
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-6">
              {content.quickLinks?.title}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => {
                const href =
                  quickLinksMap[link] ||
                  `/${link.toLowerCase().replace(/\s+/g, "-")}`;
                return (
                  <li key={idx}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors group"
                    >
                      <span className="h-1.5 w-1.5 rounded bg-gray-500 group-hover:bg-primary transition-colors" />
                      {link}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-6">
              {content.contact?.title}
            </h3>
            <ul className="space-y-4">
              {address && (
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-primary transition-colors ltr"
                    dir="ltr"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {!address && !phone && !loadingContact && (
                <>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{content.contact?.address}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <a
                      href={`tel:${content.contact?.phone}`}
                      className="hover:text-primary transition-colors ltr"
                      dir="ltr"
                    >
                      {content.contact?.phone}
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>{content.copyright}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                {content.policies?.privacy}
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                {content.policies?.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
