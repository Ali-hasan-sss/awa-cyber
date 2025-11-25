"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import Logo from "./ui/logo";

export default function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const nextLocaleLabel = locale === "en" ? "ar" : "EN";

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              onClick={closeMobileMenu}
            >
              <Logo />
            </Link>

            {/* Navigation Links - Desktop */}
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

            {/* Desktop CTA Button and Language Toggle */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleLocale}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase">{nextLocaleLabel}</span>
              </button>
              <Button>{t("nav.quote")}</Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Sidebar */}
        <div
          className={`absolute top-0 ${
            locale === "ar" ? "left-0" : "right-0"
          } h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "translate-x-0"
              : locale === "ar"
              ? "-translate-x-full"
              : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={closeMobileMenu}
              >
                <Logo />
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-foreground hover:text-primary transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <nav className="flex flex-col gap-6">
                {/* Navigation Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  >
                    {t(link.key)}
                  </Link>
                ))}

                {/* Divider */}
                <div className="border-t border-border my-4" />

                {/* Language Toggle */}
                <button
                  onClick={() => {
                    toggleLocale();
                    closeMobileMenu();
                  }}
                  className="flex items-center gap-3 text-lg font-semibold text-foreground hover:text-primary transition-colors py-2 text-left"
                >
                  <Globe className="h-5 w-5" />
                  <span className="uppercase">{nextLocaleLabel}</span>
                </button>

                {/* CTA Button */}
                <Button className="w-full mt-4" onClick={closeMobileMenu}>
                  {t("nav.quote")}
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
