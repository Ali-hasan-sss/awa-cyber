"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function PortalFooter() {
  const { locale, messages } = useLanguage();
  const isArabic = locale === "ar";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p
          className={`text-center text-sm text-gray-400 ${
            isArabic ? "rtl" : "ltr"
          }`}
        >
          {isArabic
            ? `© ${currentYear} AWA CYBER. جميع الحقوق محفوظة.`
            : `© ${currentYear} AWA CYBER. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
