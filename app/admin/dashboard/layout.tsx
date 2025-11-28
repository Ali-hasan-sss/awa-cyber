"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminHeader } from "@/components/dashboard/AdminHeader";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { AdminFooter } from "@/components/dashboard/AdminFooter";
import { UserProvider } from "@/contexts/UserContext";
import { QuoteProvider } from "@/contexts/QuoteContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { ProjectProvider } from "@/contexts/ProjectContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { token, initializing } = useAuth();
  const { locale } = useLanguage();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const BackgroundDecor = () => (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#030617] via-[#030a1c] to-[#01030a]" />
      <div className="absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/25 blur-[140px]" />
      <div className="absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute inset-0 opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.45),_transparent_55%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(115deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:140px_140px]" />
    </div>
  );

  useEffect(() => {
    // Wait for initialization to complete before checking token
    if (!initializing && !token) {
      router.replace("/admin/login");
    }
  }, [token, initializing, router]);

  // Show loading state while initializing or if no token
  if (initializing || !token) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#030617] text-slate-100">
        <BackgroundDecor />
        <div className="relative z-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <QuoteProvider>
        <ServiceProvider>
          <PortfolioProvider>
            <ProjectProvider>
              <div className="relative min-h-screen overflow-hidden bg-[#030617] text-slate-100">
                <BackgroundDecor />
                <div className="relative z-10 flex h-screen max-h-screen overflow-hidden">
                  <AdminSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    locale={locale}
                  />
                  <div className="flex flex-1 min-w-0 flex-col">
                    <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />
                    <main className="dashboard-scroll flex-1 min-h-0 overflow-y-auto px-6 py-8">
                      {children}
                    </main>
                    <AdminFooter />
                  </div>
                </div>
              </div>
            </ProjectProvider>
          </PortfolioProvider>
        </ServiceProvider>
      </QuoteProvider>
    </UserProvider>
  );
}
