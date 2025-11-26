"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "../ui/logo";

const navItems = [
  {
    href: "/admin/dashboard/home",
    icon: LayoutDashboard,
    label: { en: "Overview", ar: "نظرة عامة" },
  },
  {
    href: "/admin/dashboard/users",
    icon: Users,
    label: { en: "Users", ar: "المستخدمون" },
  },
];

export function AdminSidebar({
  open,
  onClose,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  locale: "en" | "ar";
}) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col gap-6 bg-white border-r border-slate-200 px-4 py-6 text-slate-900">
      <Link href="/" className="flex items-center gap-3 group">
        <Logo />
      </Link>
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href; // Exact match for other pages
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-black"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label[locale]}</span>
            </Link>
          );
        })}
      </nav>
      <p className="text-xs text-slate-400">© {new Date().getFullYear()} AWA</p>
    </div>
  );

  return (
    <>
      <div className="hidden w-64 bg-white border-r border-slate-200 md:block">
        {content}
      </div>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden">
          <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 w-64 bg-white border-r border-slate-200 shadow-2xl">
            {content}
          </div>
          <button
            className="absolute inset-0 w-full h-full"
            aria-label="Close sidebar"
            onClick={onClose}
          />
        </div>
      )}
    </>
  );
}
