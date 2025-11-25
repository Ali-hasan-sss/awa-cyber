"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

type SectionContent = {
  eyebrow?: string;
  title?: {
    line1?: string;
    highlight?: string;
  };
  description?: string;
  testimonials?: Testimonial[];
};

const fallbackContent: SectionContent = {
  eyebrow: "TESTIMONIALS",
  title: {
    line1: "What Our",
    highlight: "Clients Say",
  },
  description:
    "Don't just take our word for it - hear from the businesses we've protected",
  testimonials: [
    {
      quote:
        "AWA Cyber transformed our security posture. Their penetration testing identified critical vulnerabilities we didn't know existed. Highly professional Team",
      name: "John Davis",
      role: "CTO",
      company: "TechCorp",
    },
    {
      quote:
        "Outstanding service! Their cloud security audit helped us achieve ISO 27001 certification. The team is knowledgeable, responsive, and truly understands enterprise security",
      name: "Sarah Martinez",
      role: "CISO",
      company: "Cloudly inc",
    },
    {
      quote:
        "We've worked with several security firms, but AWA Cyber stands out. Their comprehensive approach and detailed reporting gave us actionable insights to improve our security",
      name: "Michael Roberts",
      role: "CEO",
      company: "DataSecure",
    },
    {
      quote:
        "The best investment we made this year. Their 24/7 monitoring and rapid incident response prevented a major breach. Cannot recommend them enough!",
      name: "Emily Kim",
      role: "VP Operations",
      company: "FinTech Pro",
    },
    {
      quote:
        "Professional, thorough, and extremely competent. Their security training program educated our entire team on best practices. Worth every penny!",
      name: "David Lee",
      role: "Director",
      company: "Enterprise Co",
    },
    {
      quote:
        "Exceptional expertise in network security. They implemented advanced IDS/IPS that has been running flawlessly. Their support team is always available when needed.",
      name: "Amanda Brown",
      role: "CTO",
      company: "NSolutions",
    },
  ],
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function Testimonials() {
  const { messages } = useLanguage();
  const section: SectionContent = {
    ...fallbackContent,
    ...(messages?.testimonialsSection ?? {}),
  };

  const testimonials = section.testimonials ?? fallbackContent.testimonials!;

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          {section.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {section.eyebrow}
            </p>
          )}

          {section.title ? (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {section.title.line1}{" "}
              <span className="text-primary">{section.title.highlight}</span>
            </h2>
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              What Our <span className="text-primary">Clients Say</span>
            </h2>
          )}

          {section.description && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {section.description}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, idx) => {
            const initials = getInitials(testimonial.name);
            return (
              <div
                key={`${testimonial.name}-${idx}`}
                className="rounded-3xl border border-border/60 bg-gradient-to-br from-white to-primary/5 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Stars Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-base text-foreground leading-relaxed mb-6">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
