"use client";

import { Menu, LogOut } from "lucide-react";
import Logo from "@/components/ui/logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotificationDropdown } from "./NotificationDropdown";

export function AdminHeader({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { locale, setLocale } = useLanguage();
  const { logout, admin } = useAuth();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "ar" : "en");
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
          <Button
            variant="ghost"
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/80 shadow-inner transition hover:bg-white/10 md:flex"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span>{admin.name}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
