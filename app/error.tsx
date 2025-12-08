"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLanguage();

  useEffect(() => {
    // Log error to console for debugging
    console.error("Application error:", error);
  }, [error]);

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

        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="w-20 h-20 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {locale === "ar" ? "حدث خطأ ما" : "Something Went Wrong"}
        </h1>

        {/* Description */}
        <p className="text-lg text-white/70 mb-8 leading-relaxed">
          {locale === "ar"
            ? "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية."
            : "Sorry, an unexpected error occurred. Please try again or return to the homepage."}
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
            <p className="text-sm text-red-300 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-400/70 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-primary text-black hover:bg-primary/90 px-8 py-6 text-base font-semibold group"
            onClick={reset}
          >
            <RefreshCw className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {locale === "ar" ? "إعادة المحاولة" : "Try Again"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold group"
            asChild
          >
            <Link href="/">
              <Home className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
              {locale === "ar" ? "العودة للرئيسية" : "Go Home"}
              <ArrowRight className="w-5 h-5 ltr:ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-red-500/30 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
