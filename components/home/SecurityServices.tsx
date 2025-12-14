"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, useMemo } from "react";
import { fetchPublicServices } from "@/lib/actions/serviceActions";
import { getSectionsByPage } from "@/lib/api/sections";
import { ArrowRight } from "lucide-react";

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

type ServiceCard = {
  _id?: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  linkLabel?: string;
};

export default function SecurityServices({
  sections: sectionsProp,
}: {
  sections?: any[];
}) {
  const { locale, messages } = useLanguage();
  const fallbackSection = messages?.servicesSection ?? {};
  const [sections, setSections] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [remoteCards, setRemoteCards] = useState<ServiceCard[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Use provided sections or load them
  useEffect(() => {
    if (sectionsProp && sectionsProp.length > 0) {
      setSections(sectionsProp);
      setSectionsLoading(false);
    } else {
      loadSections();
    }
  }, [sectionsProp, locale]);

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

  // Get fourth section (index 3) or fallback
  const servicesSection = useMemo(() => {
    if (sections.length < 4) return null;
    return sections[3]; // Fourth section
  }, [sections]);

  // Get section title
  const sectionTitle = useMemo(() => {
    if (servicesSection?.title) {
      // API returns title as string (already localized) or as object with locale keys
      const title =
        typeof servicesSection.title === "string"
          ? servicesSection.title
          : servicesSection.title[locale] || servicesSection.title.en || "";
      // Try to split title for highlight if it contains common patterns
      const parts = title.split(/(\s+)/);
      if (parts.length > 2) {
        // Take first part as line1, last part as highlight
        const line1 = parts.slice(0, -2).join("");
        const highlight = parts.slice(-2).join("").trim();
        return { line1, highlight };
      }
      return { line1: title, highlight: "" };
    }
    return null;
  }, [servicesSection, locale]);

  // Get section description (convert HTML to text)
  const sectionDescription = useMemo(() => {
    if (servicesSection?.description) {
      // API returns description as string (already localized) or as object with locale keys
      const desc =
        typeof servicesSection.description === "string"
          ? servicesSection.description
          : servicesSection.description[locale] ||
            servicesSection.description.en ||
            "";
      return stripHtml(desc);
    }
    return null;
  }, [servicesSection, locale]);

  // Load services
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const lang = locale === "ar" ? "ar" : "en";
    fetchPublicServices(lang)
      .then((data) => {
        if (cancelled) return;
        const servicesList = Array.isArray(data) ? data : data?.data || [];
        const mapped: ServiceCard[] = servicesList
          .slice(0, 4)
          .map((service: any) => ({
            _id: service._id,
            title: service.title || "",
            description: service.description || "",
            image:
              service.images && service.images.length > 0
                ? service.images[0]
                : undefined,
          }));
        setRemoteCards(mapped.length ? mapped : null);
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteCards(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const cards: ServiceCard[] = remoteCards
    ? remoteCards.slice(0, 4)
    : Array.isArray(fallbackSection.cards)
    ? fallbackSection.cards.slice(0, 4)
    : defaultCards.slice(0, 4);

  // Determine which data to use: API data or fallback
  const displayTitle = sectionTitle || fallbackSection.title;
  const displayDescription = sectionDescription || fallbackSection.description;

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 rtl:text-center">
          {displayTitle ? (
            typeof displayTitle === "object" && "line1" in displayTitle ? (
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {displayTitle.line1}{" "}
                {displayTitle.highlight && (
                  <span className="text-primary">{displayTitle.highlight}</span>
                )}
              </h2>
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {typeof displayTitle === "string" ? displayTitle : ""}
              </h2>
            )
          ) : fallbackSection.title ? (
            typeof fallbackSection.title === "object" &&
            "line1" in fallbackSection.title ? (
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {fallbackSection.title.line1}{" "}
                {fallbackSection.title.highlight && (
                  <span className="text-primary">
                    {fallbackSection.title.highlight}
                  </span>
                )}
              </h2>
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {typeof fallbackSection.title === "string"
                  ? fallbackSection.title
                  : ""}
              </h2>
            )
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Comprehensive Security{" "}
              <span className="text-primary">Solutions</span>
            </h2>
          )}

          {displayDescription && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {displayDescription}
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card: ServiceCard, idx: number) => {
            // Find the service ID from remoteCards
            const serviceId =
              remoteCards && remoteCards[idx]
                ? (remoteCards[idx] as any)._id
                : null;

            return (
              <Link
                key={`${card.title}-${idx}`}
                href={serviceId ? `/services/${serviceId}` : "/services"}
                className="group rounded-3xl border border-border/60 bg-white shadow-sm overflow-hidden h-full flex flex-col hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              >
                {card.image ? (
                  <div className="relative w-full aspect-video overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-gradient-to-br from-primary/10 to-primary/5" />
                )}
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed flex-grow mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center text-primary font-semibold text-sm mt-auto">
                    <span>
                      {locale === "ar" ? "عرض التفاصيل" : "View Details"}
                    </span>
                    <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const defaultCards: ServiceCard[] = [
  {
    title: "Penetration Testing",
    description:
      "Identify vulnerabilities before attackers do with comprehensive ethical hacking assessments.",
    icon: "Target",
    linkLabel: "Learn More",
  },
  {
    title: "Security Audits",
    description:
      "Complete evaluation of your security posture with prioritized recommendations for improvement.",
    icon: "ShieldCheck",
    linkLabel: "Learn More",
  },
  {
    title: "Web Security",
    description:
      "Protect critical web applications from OWASP Top 10 vulnerabilities using advanced testing.",
    icon: "Globe",
    linkLabel: "Learn More",
  },
  {
    title: "Network Security",
    description:
      "Secure your network with continuous monitoring, firewalls, and intrusion detection systems.",
    icon: "Wifi",
    linkLabel: "Learn More",
  },
  {
    title: "Cloud Security",
    description:
      "Safeguard AWS, Azure, or GCP environments with best practices, compliance, and 24/7 monitoring.",
    icon: "Cloud",
    linkLabel: "Learn More",
  },
  {
    title: "Security Training",
    description:
      "Empower teams with awareness programs and hands-on cyber defense simulations.",
    icon: "GraduationCap",
    linkLabel: "Learn More",
  },
];
