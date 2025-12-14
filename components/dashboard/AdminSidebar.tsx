"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Users,
  UserCog,
  LayoutDashboard,
  ClipboardList,
  Layers,
  Briefcase,
  FileText,
  DollarSign,
  FileCode,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileStack,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "../ui/logo";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

type NavItem = {
  href?: string;
  icon: any;
  label: { en: string; ar: string };
  children?: NavItem[];
};

const navItems: NavItem[] = [
  {
    href: "/admin/dashboard/home",
    icon: LayoutDashboard,
    label: { en: "Overview", ar: "نظرة عامة" },
  },
  {
    href: "/admin/dashboard/users",
    icon: Users,
    label: { en: "Clients", ar: "العملاء" },
  },
  {
    href: "/admin/dashboard/employees",
    icon: UserCog,
    label: { en: "Employees", ar: "الموظفون" },
  },
  {
    href: "/admin/dashboard/quotes",
    icon: ClipboardList,
    label: { en: "Quotations", ar: "طلبات التسعير" },
  },
  {
    icon: FileStack,
    label: { en: "Pages", ar: "الصفحات" },
    children: [
      {
        href: "/admin/dashboard/sections",
        icon: FileCode,
        label: { en: "Page Sections", ar: "إدارة الصفحات" },
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
        href: "/admin/dashboard/articles",
        icon: BookOpen,
        label: { en: "Articles", ar: "المقالات" },
      },
    ],
  },
  {
    href: "/admin/dashboard/projects",
    icon: FileText,
    label: { en: "Projects", ar: "المشاريع" },
  },
  {
    href: "/admin/dashboard/revenue",
    icon: DollarSign,
    label: { en: "Revenue & Expenses", ar: "الإيرادات والمصاريف" },
  },
  {
    href: "/admin/dashboard/contact-messages",
    icon: MessageSquare,
    label: { en: "Contact Messages", ar: "رسائل اتصل بنا" },
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
  const { admin } = useAuth();
  const { notifications } = useNotifications();
  const isEmployee = admin?.role === "employee";
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const hasUnreadQuoteNotifications = notifications.some(
    (n) => n.data?.type === "quotation_request" && !n.read
  );

  const hasUnreadContactNotifications = notifications.some(
    (n) => n.data?.type === "contact_message" && !n.read
  );

  // Filter nav items based on role
  const filteredNavItems = isEmployee
    ? navItems.filter(
        (item) =>
          // Hide revenue/accounting page from employees
          item.href !== "/admin/dashboard/revenue"
      )
    : navItems;

  // Check if any child is active
  const isParentActive = (item: NavItem): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.children) {
      return item.children.some((child) => {
        if (child.href) {
          return (
            pathname === child.href || pathname.startsWith(child.href + "/")
          );
        }
        return isParentActive(child);
      });
    }
    return false;
  };

  // Auto-expand parent if any child is active
  const shouldBeExpanded = (item: NavItem): boolean => {
    if (expandedItems.has(item.label.en)) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) => {
        if (child.href) {
          return (
            pathname === child.href || pathname.startsWith(child.href + "/")
          );
        }
        return false;
      });
    }
    return false;
  };

  const toggleExpand = (itemLabel: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel);
      } else {
        newSet.add(itemLabel);
      }
      return newSet;
    });
  };

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
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = hasChildren && shouldBeExpanded(item);
            const parentActive = isParentActive(item);
            const isQuotesTab = item.href === "/admin/dashboard/quotes";
            const isContactTab =
              item.href === "/admin/dashboard/contact-messages";

            if (hasChildren) {
              return (
                <div key={item.label.en} className="space-y-1">
                  <button
                    onClick={() => toggleExpand(item.label.en)}
                    className={cn(
                      "group relative flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                      parentActive
                        ? "bg-white text-slate-900 shadow-[0_20px_45px_rgba(14,165,233,0.4)]"
                        : "text-slate-200/80 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className={cn(
                          "absolute inset-y-3 w-[2px] rounded-full bg-white/20 transition-opacity duration-300",
                          parentActive
                            ? "opacity-60 ltr:left-2 rtl:right-2"
                            : "opacity-0"
                        )}
                      />
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            parentActive && "text-slate-900"
                          )}
                        />
                      </span>
                      <span className={cn(parentActive && "text-slate-900")}>
                        {item.label[locale]}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp
                        className={cn(
                          "h-4 w-4",
                          parentActive && "text-slate-900"
                        )}
                      />
                    ) : (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4",
                          parentActive && "text-slate-900"
                        )}
                      />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ltr:ml-4 rtl:mr-4 space-y-1 mt-1 border-l-2 border-white/10 ltr:pl-4 rtl:pr-4">
                      {item.children!.map((child) => {
                        if (!child.href) return null;
                        const ChildIcon = child.icon;
                        const childActive =
                          pathname === child.href ||
                          pathname.startsWith(child.href + "/");
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
                              childActive
                                ? "bg-white/20 text-white shadow-sm"
                                : "text-slate-300/70 hover:bg-white/5 hover:text-slate-200"
                            )}
                          >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
                              <ChildIcon className="h-3.5 w-3.5" />
                            </span>
                            <span>{child.label[locale]}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active =
              pathname === item.href ||
              (item.href && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href || "#"}
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
                <span
                  className={cn(
                    "flex items-center gap-2",
                    active && "text-slate-900"
                  )}
                >
                  <span>{item.label[locale]}</span>
                  {isQuotesTab && hasUnreadQuoteNotifications && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(248,113,113,0.35)] ltr:ml-1 rtl:mr-1" />
                  )}
                  {isContactTab && hasUnreadContactNotifications && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(248,113,113,0.35)] ltr:ml-1 rtl:mr-1" />
                  )}
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
