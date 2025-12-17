"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import enMessages from "@/messages/en.json";
import arMessages from "@/messages/ar.json";

type Locale = "en" | "ar";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Record<string, any>;
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Load messages
const messages = {
  en: enMessages,
  ar: arMessages,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [isMounted, setIsMounted] = useState(false);

  // Load locale from URL query parameter first, then localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Try to get locale from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLocale = urlParams.get("locale") as Locale;

    if (urlLocale && (urlLocale === "en" || urlLocale === "ar")) {
      setLocaleState(urlLocale);
      localStorage.setItem("locale", urlLocale);
      setIsMounted(true);
      return;
    }

    // Fallback to localStorage
    const stored = localStorage.getItem("locale") as Locale;
    if (stored && (stored === "en" || stored === "ar")) {
      setLocaleState(stored);
    } else {
      // Default to Arabic if no language is stored
      const defaultLang: Locale = "ar";
      setLocaleState(defaultLang);
      localStorage.setItem("locale", defaultLang);
    }
    setIsMounted(true);
  }, []);

  // Update HTML attributes when locale changes
  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.className = locale === "ar" ? "rtl" : "ltr";

    localStorage.setItem("locale", locale);
  }, [locale, isMounted]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Update URL query parameter when locale changes
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("locale", newLocale);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        messages: messages[locale],
        isArabic: locale === "ar",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
