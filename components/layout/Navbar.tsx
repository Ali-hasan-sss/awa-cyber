"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Globe, LogIn, LogOut, User } from "lucide-react";
import Logo from "../ui/logo";

export default function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const { user, admin, loginWithCode, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginCode, setLoginCode] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginCode.trim()) {
      setLoginError(
        locale === "ar" ? "يرجى إدخال رمز الدخول" : "Please enter login code"
      );
      return;
    }

    try {
      await loginWithCode(loginCode.trim());
      setLoginCode("");
      setShowLoginForm(false);
    } catch (error) {
      // Error is handled by AuthContext
      setLoginError(
        locale === "ar" ? "رمز الدخول غير صحيح" : "Invalid login code"
      );
    }
  };

  const isLoggedIn = !!user || !!admin;

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-xl ">
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
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleLocale}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase">{nextLocaleLabel}</span>
              </button>

              {/* Login Form or User Info */}
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
              ) : showLoginForm ? (
                <form
                  onSubmit={handleLogin}
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    type="text"
                    placeholder={locale === "ar" ? "رمز الدخول" : "Login Code"}
                    value={loginCode}
                    onChange={(e) => {
                      setLoginCode(e.target.value);
                      setLoginError(null);
                    }}
                    className="w-32 bg-white/10 border-foreground/20 text-primary placeholder:text-foreground/60"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading}
                    className="bg-primary text-black hover:bg-primary/90"
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {locale === "ar" ? "دخول" : "Login"}
                      </>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginForm(false);
                      setLoginCode("");
                      setLoginError(null);
                    }}
                    className="text-foreground/60 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowLoginForm(true)}
                  className="bg-primary text-black hover:bg-primary/90"
                >
                  <LogIn className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {locale === "ar" ? "تسجيل الدخول" : "Login"}
                </Button>
              )}
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

                {/* Login Form or User Info - Mobile */}
                {isLoggedIn ? (
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
                ) : (
                  <form onSubmit={handleLogin} className="space-y-3">
                    <Input
                      type="text"
                      placeholder={
                        locale === "ar" ? "رمز الدخول" : "Login Code"
                      }
                      value={loginCode}
                      onChange={(e) => {
                        setLoginCode(e.target.value);
                        setLoginError(null);
                      }}
                      className="w-full bg-slate-50 border-border"
                      disabled={loading}
                    />
                    {loginError && (
                      <p className="text-sm text-red-500">{loginError}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <LogIn className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                          {locale === "ar" ? "تسجيل الدخول" : "Login"}
                        </>
                      )}
                    </Button>
                  </form>
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
