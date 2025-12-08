"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

export default function Loading() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo with Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-32 h-32 animate-pulse">
            <Image
              src="/images/logo.png"
              alt="AWA Cyber Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {locale === "ar" ? "جاري التحميل..." : "Loading..."}
        </h2>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>

        {/* Subtitle */}
        <p className="mt-8 text-sm text-white/50">
          {locale === "ar" ? "يرجى الانتظار..." : "Please wait..."}
        </p>
      </div>
    </div>
  );
}
