"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Logo from "./ui/logo";

export default function Navbar() {
  const { locale, setLocale, t } = useLanguage();

  const navLinks = [
    { key: "nav.services", href: "/services" },
    { key: "nav.portfolio", href: "/portfolio" },
    { key: "nav.about", href: "/about" },
    { key: "nav.contact", href: "/contact" },
  ];

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    setLocale(newLocale);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Logo />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* CTA Button and Language Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLocale}
              className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {locale === "en" ? "عربي" : "EN"}
            </button>
            <Button className="hidden sm:inline-flex">{t("nav.quote")}</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
