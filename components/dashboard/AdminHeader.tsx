"use client";

import { Menu, Bell, LogOut } from "lucide-react";
import Logo from "@/components/ui/logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-50"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center md:hidden gap-3 group">
          <Logo />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleLocale}
          className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-100"
        >
          {locale === "en" ? "AR" : "EN"}
        </button>
        <button className="rounded-full border border-slate-300 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
        </button>
        {admin && (
          <Button
            variant="ghost"
            className="hidden items-center gap-2 text-slate-700 hover:bg-slate-100 md:flex"
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
