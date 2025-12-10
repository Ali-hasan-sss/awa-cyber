"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Globe,
  LogOut,
  User,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Logo from "../ui/logo";
import { fetchPublicServices } from "@/lib/actions/serviceActions";

export default function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const { user, admin, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const navLinks = [
    { key: "nav.home", href: "/" },
    { key: "nav.about", href: "/about" },
    { key: "nav.services", href: "/services" },
    { key: "nav.portfolio", href: "/portfolio" },
    { key: "nav.articles", href: "/articles" },
    { key: "nav.contact", href: "/contact" },
  ];

  // Detect background color behind navbar
  useEffect(() => {
    const checkBackgroundColor = () => {
      if (!navRef.current) return;

      const navRect = navRef.current.getBoundingClientRect();
      // Check multiple points to get better accuracy
      const checkPoints = [
        { x: navRect.left + navRect.width / 2, y: navRect.bottom + 5 },
        { x: navRect.left + navRect.width / 4, y: navRect.bottom + 5 },
        { x: navRect.left + (navRect.width * 3) / 4, y: navRect.bottom + 5 },
      ];

      let totalLuminance = 0;
      let validChecks = 0;

      for (const point of checkPoints) {
        const element = document.elementFromPoint(point.x, point.y);
        if (element) {
          const computedStyle = window.getComputedStyle(element);
          const bgColor = computedStyle.backgroundColor;

          // Extract RGB values
          const rgbMatch = bgColor.match(/\d+/g);
          if (rgbMatch && rgbMatch.length >= 3) {
            const r = parseInt(rgbMatch[0]);
            const g = parseInt(rgbMatch[1]);
            const b = parseInt(rgbMatch[2]);

            // Calculate luminance
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            totalLuminance += luminance;
            validChecks++;
          }
        }
      }

      if (validChecks > 0) {
        const avgLuminance = totalLuminance / validChecks;
        // If average luminance is less than 0.5, it's a dark background
        setIsDarkBackground(avgLuminance < 0.5);
      }
    };

    // Check on mount and scroll
    checkBackgroundColor();
    const handleScroll = () => checkBackgroundColor();
    const handleResize = () => checkBackgroundColor();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Also check after a short delay to ensure page is loaded
    const timeout = setTimeout(checkBackgroundColor, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [pathname]);

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    setLocale(newLocale);
  };

  const nextLocaleLabel = locale === "en" ? "ar" : "EN";

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isLoggedIn = !!user || !!admin;

  // Load services for dropdown
  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchPublicServices(locale);
        setServices(Array.isArray(data) ? data : data?.data || []);
      } catch (error) {
        console.error("Error loading services:", error);
        setServices([]);
      }
    };
    loadServices();
  }, [locale]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsServicesDropdownOpen(false);
      }
    };

    if (isServicesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isServicesDropdownOpen]);

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

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const linkClassName = (href: string) => {
    const active = isActive(href);
    const baseClasses = "relative transition-colors font-medium";
    const colorClasses = isDarkBackground
      ? active
        ? "text-primary"
        : "text-white/90 hover:text-primary"
      : active
      ? "text-primary"
      : "text-foreground hover:text-primary";

    return `${baseClasses} ${colorClasses}`;
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-colors ${
          isDarkBackground
            ? "bg-black/20 text-white"
            : "bg-white/10 text-foreground"
        }`}
      >
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
            <div className="hidden sm:flex items-center gap-8">
              {navLinks.map((link) => {
                if (link.href === "/services") {
                  return (
                    <div
                      key={link.key}
                      ref={servicesDropdownRef}
                      className="relative"
                      onMouseEnter={() => setIsServicesDropdownOpen(true)}
                      onMouseLeave={() => setIsServicesDropdownOpen(false)}
                    >
                      <Link
                        href={link.href}
                        className={`${linkClassName(
                          link.href
                        )} flex items-center gap-1`}
                      >
                        {t(link.key)}
                        <ChevronDown className="h-4 w-4" />
                        {isActive(link.href) && (
                          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
                        )}
                      </Link>

                      {/* Services Dropdown */}
                      {isServicesDropdownOpen && services.length > 0 && (
                        <div
                          className={`absolute top-full mt-2 max-w-[calc(100vw-2rem)] w-[500px] bg-gradient-to-br from-white via-primary/5 to-primary/10 shadow-2xl border border-primary/20 overflow-hidden z-50 ${
                            locale === "ar" ? "right-0" : "left-0"
                          }`}
                        >
                          <div className="p-4">
                            <div className="grid grid-cols-2 gap-2">
                              {services.map((service: any) => {
                                const serviceTitle =
                                  typeof service.title === "string"
                                    ? service.title
                                    : service.title?.[locale] || "";
                                return (
                                  <Link
                                    key={service._id}
                                    href={`/services/${service._id}`}
                                    className="block px-4 py-3 text-foreground hover:bg-primary/20 hover:text-white transition-all rounded-lg bg-white/50 backdrop-blur-sm border border-white/30"
                                    onClick={() =>
                                      setIsServicesDropdownOpen(false)
                                    }
                                  >
                                    {serviceTitle}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={linkClassName(link.href)}
                  >
                    {t(link.key)}
                    {isActive(link.href) && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA Button and Language Toggle */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleLocale}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isDarkBackground
                    ? "text-white/90 hover:text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase">{nextLocaleLabel}</span>
              </button>

              {/* User Info or Quote Button */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {user?.name || admin?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-foreground/20 text-foreground hover:bg-foreground/10"
                  >
                    <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {locale === "ar" ? "تسجيل الخروج" : "Logout"}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="bg-primary text-black hover:bg-primary/90 group"
                  asChild
                >
                  <Link href="/quote">
                    {t("nav.quote") ||
                      (locale === "ar" ? "إنشاء طلب تسعير" : "Request Quote")}
                    <ArrowRight className="h-4 w-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 transition-colors ${
                isDarkBackground
                  ? "text-white/90 hover:text-primary"
                  : "text-foreground hover:text-primary"
              }`}
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
                    className={`text-lg font-medium transition-colors py-2 relative ${
                      isActive(link.href)
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {t(link.key)}
                    {isActive(link.href) && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                    )}
                  </Link>
                ))}

                {/* Divider */}
                <div className="border-t border-border my-4" />

                {/* User Info - Mobile */}
                {isLoggedIn && (
                  <>
                    <div className="flex items-center gap-3 py-2 text-foreground">
                      <User className="h-5 w-5" />
                      <span className="font-medium">
                        {user?.name || admin?.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                    >
                      <LogOut className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                      {locale === "ar" ? "تسجيل الخروج" : "Logout"}
                    </Button>
                  </>
                )}

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
                <Button className="w-full mt-4" asChild>
                  <Link href="/quote" onClick={closeMobileMenu}>
                    {t("nav.quote")}
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
