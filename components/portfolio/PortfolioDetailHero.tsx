"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

export default function PortfolioDetailHero({ portfolio }: { portfolio: any }) {
  const { locale } = useLanguage();

  const title =
    typeof portfolio.title === "string"
      ? portfolio.title
      : portfolio.title?.[locale] || "";

  const heroImage = portfolio.images?.[0] || "/images/publicContain.jpg";

  return (
    <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={heroImage}
          alt={title}
          fill
          priority
          className="object-cover"
          style={{
            filter: "brightness(0.4)",
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        {/* Texture overlay - using CSS pattern */}
        <div
          className="absolute inset-0 z-20 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Content Container - Centered */}
      <div className="relative z-30 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Main Title - Large, bold, white, split into lines */}
          <h1 className="text-5xl md:text-6xl text-center lg:text-7xl xl:text-8xl font-bold text-white leading-tight">
            {title
              .split(/\s+/)
              .map((word: string, index: number, array: string[]) => (
                <span key={index} className="block">
                  {word}
                </span>
              ))}
          </h1>
        </div>
      </div>
    </section>
  );
}
