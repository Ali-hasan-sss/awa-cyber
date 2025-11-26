"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminHeader } from "@/components/dashboard/AdminHeader";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { AdminFooter } from "@/components/dashboard/AdminFooter";
import { UserProvider } from "@/contexts/UserContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { token, initializing } = useAuth();
  const { locale } = useLanguage();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Wait for initialization to complete before checking token
    if (!initializing && !token) {
      router.replace("/admin/login");
    }
  }, [token, initializing, router]);

  // Show loading state while initializing or if no token
  if (initializing || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          locale={locale}
        />
        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50 min-h-0">
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>
    </UserProvider>
  );
}
