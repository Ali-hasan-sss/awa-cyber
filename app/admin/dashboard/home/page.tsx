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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: isArabic ? "المسؤولون" : "Admins",
      value: users.filter((u) => u.role === "admin").length.toString(),
      icon: ShieldCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: isArabic ? "الزبائن" : "Clients",
      value: users.filter((u) => u.role === "client").length.toString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: isArabic ? "نشاط اليوم" : "Today's Activity",
      value: "0",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8 text-slate-900">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <ShieldCheck className="h-8 w-8 text-primary" />
          {isArabic ? "لوحة التحكم" : "Admin Dashboard"}
        </h1>
        <p className="text-slate-500">
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
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`rounded-2xl ${stat.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-slate-700">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {isArabic ? "إدارة المستخدمين" : "User Management"}
              </h2>
            </div>
            <Link href="/admin/dashboard/users">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {isArabic ? "عرض الكل" : "View All"}
              </Button>
            </Link>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            {isArabic
              ? "قم بإدارة المستخدمين وإضافة حسابات جديدة وتوليد رموز الدخول."
              : "Manage users, add new accounts, and generate login codes."}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-slate-600">
              {isArabic
                ? `${users.length} مستخدم مسجل`
                : `${users.length} registered users`}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {isArabic ? "النشاط العام" : "General Activity"}
            </h2>
          </div>
          <p className="text-slate-500 text-sm">
            {isArabic
              ? "يمكنك هنا إضافة الرسوم البيانية والتقارير في المراحل القادمة."
              : "This section will host charts and reports in future iterations."}
          </p>
        </div>
      </section>
    </div>
  );
}
