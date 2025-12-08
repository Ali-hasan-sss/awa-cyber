"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-32 h-32">
            <Image
              src="/images/logo.png"
              alt="AWA Cyber Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-9xl md:text-[12rem] font-bold text-primary leading-none">
            404
          </h1>
        </div>

        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <ShieldAlert className="w-16 h-16 text-primary/50" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {locale === "ar"
            ? "الصفحة غير موجودة"
            : "Page Not Found"}
        </h2>

        {/* Description */}
        <p className="text-lg text-white/70 mb-8 leading-relaxed">
          {locale === "ar"
            ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
            : "Sorry, the page you are looking for doesn't exist or has been moved."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-primary text-black hover:bg-primary/90 px-8 py-6 text-base font-semibold group"
            asChild
          >
            <Link href="/">
              <Home className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
              {locale === "ar" ? "العودة للرئيسية" : "Go Home"}
              <ArrowRight className="w-5 h-5 ltr:ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold"
            onClick={() => window.history.back()}
          >
            {locale === "ar" ? "رجوع" : "Go Back"}
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/30 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

