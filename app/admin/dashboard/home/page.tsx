"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useUsers } from "@/contexts/UserContext";
import { ShieldCheck, Users, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardOverviewPage() {
  const { locale } = useLanguage();
  const { users, loading } = useUsers();
  const isArabic = locale === "ar";

  const stats = [
    {
      label: isArabic ? "إجمالي المستخدمين" : "Total Users",
      value: users.length.toString(),
      icon: Users,
      color: "text-cyan-300",
      bgColor: "bg-cyan-500/15 border border-cyan-400/20",
    },
    {
      label: isArabic ? "المسؤولون" : "Admins",
      value: users.filter((u) => u.role === "admin").length.toString(),
      icon: ShieldCheck,
      color: "text-primary",
      bgColor: "bg-primary/15 border border-primary/30",
    },
    {
      label: isArabic ? "الزبائن" : "Clients",
      value: users.filter((u) => u.role === "client").length.toString(),
      icon: Users,
      color: "text-emerald-300",
      bgColor: "bg-emerald-500/15 border border-emerald-400/25",
    },
    {
      label: isArabic ? "نشاط اليوم" : "Today's Activity",
      value: "0",
      icon: Activity,
      color: "text-indigo-300",
      bgColor: "bg-indigo-500/15 border border-indigo-400/25",
    },
  ];

  return (
    <div className="space-y-10 text-slate-100">
      <header className="space-y-3">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <ShieldCheck className="h-10 w-10 text-primary" />
          {isArabic ? "لوحة التحكم" : "Admin Dashboard"}
        </h1>
        <p className="max-w-2xl text-slate-300">
          {isArabic
            ? "مرحبًا بك في لوحة التحكم، تابع نشاط المنصة من هنا."
            : "Welcome to the console—keep track of platform activity here."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-widest text-white/60">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-4xl font-semibold text-white">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`rounded-2xl p-3 shadow-inner ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {isArabic ? "إدارة المستخدمين" : "User Management"}
              </h2>
            </div>
            <Link href="/admin/dashboard/users">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                {isArabic ? "عرض الكل" : "View All"}
              </Button>
            </Link>
          </div>
          <p className="mb-6 text-sm text-slate-300">
            {isArabic
              ? "قم بإدارة المستخدمين وإضافة حسابات جديدة وتوليد رموز الدخول."
              : "Manage users, add new accounts, and generate login codes."}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <TrendingUp className="h-4 w-4 text-emerald-300" />
            <span>
              {isArabic
                ? `${users.length} مستخدم مسجل`
                : `${users.length} registered users`}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent p-6 shadow-[0_25px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-3 text-white">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {isArabic ? "النشاط العام" : "General Activity"}
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            {isArabic
              ? "يمكنك هنا إضافة الرسوم البيانية والتقارير في المراحل القادمة."
              : "This section will host charts and reports in future iterations."}
          </p>
        </div>
      </section>
    </div>
  );
}
