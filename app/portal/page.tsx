"use client";

import { Suspense } from "react";
import PortalHeader from "@/components/portal/PortalHeader";
import PortalHero from "@/components/portal/Hero";
import PortalFeatures from "@/components/portal/Features";
import PortalFiles from "@/components/portal/Files";
import PortalModifications from "@/components/portal/Modifications";
import PortalPayments from "@/components/portal/Payments";
import PortalFooter from "@/components/portal/PortalFooter";
import { useProjects } from "@/contexts/ProjectContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

function PortalContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { locale, messages } = useLanguage();
  const isArabic = locale === "ar";
  const { getProjectByPortalCode, getProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadProject();
  }, [code]);

  const loadProject = async () => {
    if (!code) {
      setError(
        isArabic ? "لم يتم توفير رمز البورتال" : "No portal code provided"
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Get project by portal code
      const project = await getProjectByPortalCode(code);
      if (project?._id) {
        setSelectedProjectId(project._id);
      } else {
        setError(isArabic ? "المشروع غير موجود" : "Project not found");
      }
    } catch (err) {
      console.error("Failed to load project:", err);
      setError(isArabic ? "فشل تحميل المشروع" : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!code || refreshing) return;

    // Save current scroll position
    const scrollPosition = window.scrollY;

    setRefreshing(true);
    try {
      // Reload project data without page reload
      const project = await getProjectByPortalCode(code);
      if (project?._id) {
        // Update project ID to trigger re-fetch in child components
        // The components will re-fetch data via useEffect when projectId changes
        setSelectedProjectId(project._id);
        // Force re-render of child components by updating refresh key
        setRefreshKey((prev) => prev + 1);

        // Restore scroll position after a brief delay to ensure DOM has updated
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 100);
      }
    } catch (err) {
      console.error("Failed to refresh project:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Show loading screen while initial load
  if (loading) {
    return (
      <div className="p-xl">
        <PortalHeader />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {isArabic ? "جاري تحميل المشروع..." : "Loading project..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen if project not found
  if (error || !selectedProjectId) {
    return (
      <div className="p-xl">
        <PortalHeader />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white pt-20">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">
              {error || (isArabic ? "المشروع غير موجود" : "Project not found")}
            </p>
            <Button onClick={loadProject} variant="outline">
              {isArabic ? "إعادة المحاولة" : "Retry"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-xl">
      <PortalHeader />
      <PortalHero />
      <PortalFeatures />
      <PortalPayments
        key={`payments-${refreshKey}`}
        projectId={selectedProjectId}
      />
      <PortalFiles key={`files-${refreshKey}`} projectId={selectedProjectId} />
      <PortalModifications
        key={`modifications-${refreshKey}`}
        projectId={selectedProjectId}
        refreshKey={refreshKey}
      />
      <PortalFooter />
      {/* Floating Refresh Button */}
      <Button
        onClick={handleRefresh}
        disabled={refreshing}
        className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-primary text-black shadow-lg hover:bg-primary/90 transition-all hover:scale-110 disabled:opacity-50"
        title={isArabic ? "تحديث البيانات" : "Refresh Data"}
      >
        <RefreshCw className={`h-6 w-6 ${refreshing ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
}

export default function Portal() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <PortalContent />
      </Suspense>
    </main>
  );
}
