"use client";

import { CheckCircle2, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import { getSectionsByPage } from "@/lib/api/sections";
import { serviceIconComponents } from "@/lib/serviceIconOptions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

// Helper function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // Server-side: simple regex approach
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }
  // Client-side: use DOM
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

type SectionContent = {
  title?: string;
  description?: string;
  features?: string[];
  buttons?: {
    quote?: string;
    call?: string;
  };
  privacy?: string;
};

const fallbackContent: SectionContent = {
  title: "Ready to Secure Your Business?",
  description:
    "Don't wait for a security breach to take action. Get a comprehensive security assessment and protect your business from cyber threats today.",
  features: ["Free Consultation", "No Commitment", "Expert Guidance"],
  buttons: {
    quote: "Get Your Free Quote",
    call: "Schedule a Call",
  },
  privacy: "Your information is secure and confidential",
};

export default function SecurityModal() {
  const { locale, messages } = useLanguage();
  const router = useRouter();
  const fallbackSection = messages?.securityModal ?? {};
  const [sections, setSections] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  // Load sections when locale changes
  useEffect(() => {
    loadSections();
  }, [locale]);

  const loadSections = async () => {
    try {
      setSectionsLoading(true);
      const data = await getSectionsByPage("home", locale);
      setSections(data);
    } catch (error) {
      console.error("Error loading sections:", error);
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  // Get ninth section (index 8) or fallback
  const securityModalSection = useMemo(() => {
    if (sections.length < 9) return null;
    return sections[8]; // Ninth section
  }, [sections]);

  // Get section title
  const sectionTitle = useMemo(() => {
    if (securityModalSection?.title) {
      // API returns title as string (already localized) or as object with locale keys
      const title =
        typeof securityModalSection.title === "string"
          ? securityModalSection.title
          : securityModalSection.title[locale] ||
            securityModalSection.title.en ||
            "";
      return title;
    }
    return null;
  }, [securityModalSection, locale]);

  // Get section description (convert HTML to text)
  const sectionDescription = useMemo(() => {
    if (securityModalSection?.description) {
      // API returns description as string (already localized) or as object with locale keys
      const desc =
        typeof securityModalSection.description === "string"
          ? securityModalSection.description
          : securityModalSection.description[locale] ||
            securityModalSection.description.en ||
            "";
      return stripHtml(desc);
    }
    return null;
  }, [securityModalSection, locale]);

  // Get features from section
  const features = useMemo(() => {
    if (
      securityModalSection?.features &&
      securityModalSection.features.length > 0
    ) {
      return securityModalSection.features
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((feature: any) => {
          const name =
            typeof feature.name === "string"
              ? feature.name
              : feature.name?.[locale] || feature.name?.en || "";
          return name;
        });
    }
    return fallbackContent.features || [];
  }, [securityModalSection, locale]);

  // Build content
  const content: SectionContent = useMemo(() => {
    const contentData: SectionContent = {
      ...fallbackContent,
      ...fallbackSection,
    };

    // Use section title if available
    if (sectionTitle) {
      contentData.title = sectionTitle;
    }

    // Use section description if available
    if (sectionDescription) {
      contentData.description = sectionDescription;
    }

    // Use features from section
    if (features.length > 0) {
      contentData.features = features;
    }

    // Set button labels
    contentData.buttons = {
      quote: locale === "ar" ? "عرض سعر مجاني" : "Get Your Free Quote",
      call: locale === "ar" ? "بدء محادثة واتساب" : "Start WhatsApp Chat",
    };

    return contentData;
  }, [sectionTitle, sectionDescription, features, fallbackSection, locale]);

  // WhatsApp number - replace with actual manager's WhatsApp number
  const whatsappNumber = "966500000000"; // Replace with actual number
  const whatsappMessage =
    locale === "ar"
      ? "مرحباً، أود الحصول على استشارة أمنية"
      : "Hello, I would like to get a security consultation";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-black py-20 md:py-28 text-white overflow-hidden">
      {/* Yellow light spots - top right and bottom left */}
      <div className="absolute top-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-b from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-10 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-primary/20">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-4">
              {content.title}
            </h2>

            {/* Description */}
            <p className="text-base text-gray-700 text-center mb-6 leading-relaxed">
              {content.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {features.map((feature: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-black text-white shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link href="/quote" className="flex-1">
                <Button className="w-full bg-white text-black hover:bg-gray-100 rounded-full px-6 py-3 font-semibold shadow-lg">
                  <CheckCircle2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {content.buttons?.quote}
                </Button>
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full bg-white/90 text-black hover:bg-white border-2 border-black/20 rounded-full px-6 py-3 font-semibold shadow-lg"
                >
                  <MessageCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {content.buttons?.call}
                </Button>
              </a>
            </div>

            {/* Privacy Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Lock className="h-3 w-3" />
              <span>{content.privacy}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
