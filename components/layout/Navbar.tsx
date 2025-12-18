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
  MapPin,
  Phone,
} from "lucide-react";
import Logo from "../ui/logo";
import { fetchPublicServices } from "@/lib/actions/serviceActions";
import { getSectionsByPage } from "@/lib/api/sections";

export default function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const { user, admin, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<{
    address: string;
    phone: string;
    mapLat?: number;
    mapLng?: number;
  } | null>(null);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const navLinks = [
    { key: "nav.home", href: "/" },
    { key: "nav.about", href: "/about" },
    { key: "nav.services", href: "/services" },
    { key: "nav.portfolio", href: "/portfolio" },
    { key: "nav.articles", href: "/articles" },
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

  // Load contact information
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const data = await getSectionsByPage("contact", locale);
        const sections = Array.isArray(data) ? data : (data as any)?.data || [];
        const firstSection =
          sections.find((s: any) => s.order === 1) || sections[0];

        if (firstSection) {
          const features = firstSection.features || [];
          const addressFeature = features[0];
          const phoneFeature = features[1];
          const locationFeature = features[2];

          const address =
            addressFeature &&
            (typeof addressFeature.name === "string"
              ? addressFeature.name
              : addressFeature.name?.[locale] || "");

          const phone =
            phoneFeature &&
            (typeof phoneFeature.name === "string"
              ? phoneFeature.name
              : phoneFeature.name?.[locale] || "");

          // Get map coordinates from location feature (third feature)
          let mapLat: number | undefined;
          let mapLng: number | undefined;
          if (locationFeature) {
            const lat = parseFloat(locationFeature.description || "");
            const lng = parseFloat(locationFeature.name || "");
            if (!isNaN(lat) && !isNaN(lng)) {
              mapLat = lat;
              mapLng = lng;
            }
          }

          if (address || phone || mapLat) {
            setContactInfo({
              address: address || "",
              phone: phone || "",
              mapLat,
              mapLng,
            });
          }
        }
      } catch (error) {
        console.error("Error loading contact info:", error);
      }
    };
    loadContactInfo();
  }, [locale]);

  // Close location dropdown when clicking outside (services uses hover only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        locationButtonRef.current &&
        !locationDropdownRef.current.contains(event.target as Node) &&
        !locationButtonRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };

    if (isLocationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLocationDropdownOpen]);

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
    const colorClasses = active
      ? "text-primary"
      : "text-white hover:text-primary";

    return `${baseClasses} ${colorClasses}`;
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/90 text-white border-b border-white/10"
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
                        <ChevronDown className="h-4 w-4 text-white" />
                        {isActive(link.href) && (
                          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
                        )}
                      </Link>

                      {/* Services Dropdown */}
                      {isServicesDropdownOpen && services.length > 0 && (
                        <div
                          className={`absolute top-full pt-2 max-w-[calc(100vw-2rem)] w-[500px] bg-transparent z-50 ${
                            locale === "ar" ? "right-0" : "left-0"
                          }`}
                          onMouseEnter={() => setIsServicesDropdownOpen(true)}
                          onMouseLeave={() => setIsServicesDropdownOpen(false)}
                        >
                          <div className="bg-white shadow-2xl border border-primary/20 overflow-hidden rounded-lg">
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
                                      className="block px-4 py-3 text-foreground hover:bg-primary hover:text-white transition-all rounded-lg bg-white border border-gray-200"
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
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold transition-colors text-white hover:text-primary"
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase">{nextLocaleLabel}</span>
              </button>

              {/* Contact Info - Location and Phone */}
              {contactInfo && (
                <>
                  {contactInfo.mapLat && contactInfo.mapLng && (
                    <div className="relative" ref={locationDropdownRef}>
                      <button
                        ref={locationButtonRef}
                        onClick={() =>
                          setIsLocationDropdownOpen(!isLocationDropdownOpen)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors text-white hover:text-primary relative"
                        title={
                          locale === "ar" ? "موقع الشركة" : "Company Location"
                        }
                      >
                        <MapPin className="h-4 w-4" />
                      </button>

                      {/* Location Dropdown */}
                      {isLocationDropdownOpen && (
                        <div
                          className={`absolute top-full mt-2 w-[400px] max-w-[calc(100vw-2rem)] bg-white shadow-2xl border border-primary/20 overflow-hidden z-50 rounded-xl ${
                            locale === "ar" ? "right-0" : "left-0"
                          }`}
                          style={{
                            // Ensure dropdown doesn't go off screen
                            ...(locale === "ar" ? {} : {}),
                          }}
                        >
                          <div className="relative w-full h-[300px]">
                            <iframe
                              src={`https://www.google.com/maps?q=${contactInfo.mapLat},${contactInfo.mapLng}&output=embed&z=15`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              className="w-full h-full"
                            />
                          </div>
                          {contactInfo.address && (
                            <div className="p-4 border-t border-gray-200">
                              <p className="text-sm text-gray-700">
                                {contactInfo.address}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {contactInfo.phone && (
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors text-white hover:text-primary ltr"
                      dir="ltr"
                      title={locale === "ar" ? "اتصل بنا" : "Call Us"}
                    >
                      <Phone className="h-4 w-4" />
                      <span className="hidden lg:inline">
                        {contactInfo.phone}
                      </span>
                    </a>
                  )}
                </>
              )}

              {/* User Info or Quote Button */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-white">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {user?.name || admin?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-white/20 text-white hover:bg-white/10"
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
              className="md:hidden p-2 transition-colors text-white hover:text-primary"
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

                {/* Contact Info - Mobile */}
                {contactInfo && (
                  <>
                    <div className="border-t border-border my-4" />
                    {contactInfo.mapLat && contactInfo.mapLng && (
                      <div className="space-y-2">
                        <div className="relative w-full h-[250px] rounded-lg overflow-hidden border border-border">
                          <iframe
                            src={`https://www.google.com/maps?q=${contactInfo.mapLat},${contactInfo.mapLng}&output=embed&z=15`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full"
                          />
                        </div>
                        {contactInfo.address && (
                          <p className="text-sm text-gray-600">
                            {contactInfo.address}
                          </p>
                        )}
                      </div>
                    )}
                    {contactInfo.phone && (
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors py-2 ltr"
                        dir="ltr"
                        onClick={closeMobileMenu}
                      >
                        <Phone className="h-5 w-5" />
                        <span>{contactInfo.phone}</span>
                      </a>
                    )}
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
