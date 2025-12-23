"use client";

import { Menu, LogOut, User, Settings, ChevronDown } from "lucide-react";
import Logo from "@/components/ui/logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NotificationDropdown } from "./NotificationDropdown";

export function AdminHeader({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { locale, setLocale } = useLanguage();
  const { logout, admin } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleLocale = () => {
    setLocale(locale === "en" ? "ar" : "en");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="md:rounded-full flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-4 text-slate-100 shadow-[0_10px_40px_rgba(3,7,18,0.45)] backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/80 transition hover:bg-white/10"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-3 md:hidden">
          <Logo />
          <span className="text-sm font-semibold tracking-wide text-white/80">
            AWA Cyber
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleLocale}
          className="rounded-full bg-gradient-to-r from-cyan-500/90 to-blue-600/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-950 shadow-lg transition hover:scale-[1.02]"
        >
          {locale === "en" ? "AR" : "EN"}
        </button>
        <NotificationDropdown />
        {admin && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/80 shadow-inner transition hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                {getInitials(admin.name || "A")}
              </div>
              <span className="max-w-[120px] truncate">{admin.name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isProfileOpen &&
              isMounted &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  className="fixed inset-0 z-[2147483646]"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div
                    className="fixed top-16 ltr:right-4 rtl:left-4 z-[2147483647] w-64 rounded-2xl border border-white/10 bg-[#060e1f] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
                          {getInitials(admin.name || "A")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {admin.name}
                          </p>
                          <p className="text-xs text-white/60 truncate">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/admin/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>
                          {locale === "ar" ? "الإعدادات" : "Settings"}
                        </span>
                      </Link>
                      <div className="border-t border-white/10 my-2" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>
                          {locale === "ar" ? "تسجيل الخروج" : "Logout"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </div>
        )}
      </div>
    </header>
  );
}
