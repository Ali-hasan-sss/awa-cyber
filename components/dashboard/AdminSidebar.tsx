"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  LayoutDashboard,
  ClipboardList,
  Layers,
  Briefcase,
  FileText,
} from "lucide-react";
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
  {
    href: "/admin/dashboard/quotes",
    icon: ClipboardList,
    label: { en: "Quotations", ar: "طلبات التسعير" },
  },
  {
    href: "/admin/dashboard/services",
    icon: Layers,
    label: { en: "Services", ar: "الخدمات" },
  },
  {
    href: "/admin/dashboard/portfolios",
    icon: Briefcase,
    label: { en: "Portfolios", ar: "معرض الأعمال" },
  },
  {
    href: "/admin/dashboard/projects",
    icon: FileText,
    label: { en: "Projects", ar: "المشاريع" },
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
    <div className="relative flex h-full flex-col gap-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#060e1f] px-5 py-6 text-slate-100 shadow-[0_25px_80px_rgba(2,6,23,0.65)]">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#081024] via-[#050a17] to-[#030712]" />
      </div>
      <div className="relative z-10 flex h-full flex-col gap-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="rounded-2xl bg-white/10 p-2 transition-transform duration-300 group-hover:scale-105">
            <Logo />
          </div>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">
              AWA
            </p>
            <p className="text-lg font-semibold text-white">Admin Portal</p>
          </div>
        </Link>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            {locale === "ar" ? "القائمة" : "Navigation"}
          </p>
          <span className="block h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        <nav className="admin-sidebar-nav flex-1 space-y-2 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href; // Exact match for other pages
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-white text-slate-900 shadow-[0_20px_45px_rgba(14,165,233,0.4)]"
                    : "text-slate-200/80 hover:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-3 w-[2px] rounded-full bg-white/20 transition-opacity duration-300",
                    active ? "opacity-60 ltr:left-2 rtl:right-2" : "opacity-0"
                  )}
                />
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Icon className={cn("h-4 w-4", active && "text-slate-900")} />
                </span>
                <span className={cn(active && "text-slate-900")}>
                  {item.label[locale]}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300 shadow-inner">
          <p className="font-semibold text-white/90">
            {locale === "ar" ? "جاهز للمستقبل" : "Future-ready"}
          </p>
          <p>
            {locale === "ar"
              ? "لوحة تحكم سحابية لحماية أعمالك."
              : "A cloud-first console powering your cyber mission."}
          </p>
          <p className="text-[11px] text-white/50">
            © {new Date().getFullYear()} AWA Cyber
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden w-72 px-3 py-4 md:block">
        <div className="h-full">{content}</div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
          onClick={onClose}
        >
          <div
            className="absolute inset-y-0 w-72 ltr:left-3 rtl:right-3"
            onClick={(event) => event.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}
