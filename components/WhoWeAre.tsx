"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WhoWeAre() {
  const { messages } = useLanguage();
  const section = messages?.aboutSection ?? {};

  const paragraphs: string[] = section.paragraphs ?? [];
  const stats: { value: string; label: string }[] = section.stats ?? [
    { value: "500+", label: "Projects" },
    { value: "10+", label: "Years" },
    { value: "24/7", label: "Support" },
    { value: "100%", label: "Satisfied" },
  ];

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8 text-center md:rtl:text-right md:ltr:text-left">
            {section.eyebrow && (
              <div className="flex justify-center md:justify-start">
                <div className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.4em] text-primary uppercase">
                  <span>{section.eyebrow}</span>
                  <span className="hidden sm:block h-px w-16 bg-primary/40" />
                </div>
              </div>
            )}

            {section.title ? (
              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
                <span>{section.title.line1} </span>
                <span className="text-primary">
                  {section.title.highlight}
                </span>{" "}
                <span>{section.title.line2}</span>
              </h2>
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
                Leading <span className="text-primary">Cybersecurity</span>{" "}
                Experts
              </h2>
            )}

            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {paragraphs.length ? (
                paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-balance">
                    {paragraph}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-balance">
                    AWA Cyber is a premier cybersecurity firm dedicated to
                    protecting businesses from evolving digital threats. With
                    over decades of experience, we&apos;ve secured hundreds of
                    organizations across various industries.
                  </p>
                  <p className="text-balance">
                    From penetration testing to security audits, we employ
                    industry-leading methodologies and cutting-edge tools to
                    identify vulnerabilities and strengthen your security
                    posture.
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-4 border-t border-border text-center sm:text-left rtl:sm:text-right">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block text-3xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {section.cta && (
              <div className="flex justify-center md:justify-start">
                <button className="inline-flex items-center gap-3 rounded-full border border-transparent bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-foreground/90">
                  {section.cta}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={section.image ?? "/images/cyber.jpg"}
                alt={section.imageAlt ?? "Cybersecurity experts at work"}
                width={640}
                height={480}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-primary/10" />
            </div>
            <div className="absolute -bottom-6 ltr:-right-6 rtl:-left-6 hidden sm:block rounded-2xl bg-white/90 px-6 py-4 shadow-lg backdrop-blur">
              <p className="text-sm font-semibold text-muted-foreground">
                {section.badgeLabel ?? "Trusted by global enterprises"}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {section.badgeValue ?? "99.7% Satisfaction"}
              </p>
            </div>
            <span className="absolute -top-6 ltr:-left-6 rtl:-right-6 hidden md:block h-28 w-28 rounded-full border-4 border-primary/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
