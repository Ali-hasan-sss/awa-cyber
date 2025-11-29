"use client";

import { Suspense } from "react";
import PortalHero from "@/components/portal/Hero";
import PortalFeatures from "@/components/portal/Features";
import PortalFiles from "@/components/portal/Files";
import PortalModifications from "@/components/portal/Modifications";
import PortalPayments from "@/components/portal/Payments";
import { useProjects } from "@/contexts/ProjectContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PortalHeader from "@/components/portal/PortalHeader";

function PortalContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { getProjectByPortalCode, getProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProject();
  }, [code]);

  const loadProject = async () => {
    if (!code) {
      console.error("No portal code provided");
      return;
    }
    try {
      // Get project by portal code
      const project = await getProjectByPortalCode(code);
      if (project?._id) {
        setSelectedProjectId(project._id);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  const handleRefresh = async () => {
    if (!code) return;
    setRefreshing(true);
    try {
      // Reload project data
      const project = await getProjectByPortalCode(code);
      if (project?._id) {
        setSelectedProjectId(project._id);
        // Force re-render of child components
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to refresh project:", err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <PortalHeader />
      <PortalHero />
      <PortalFeatures />
      {selectedProjectId && (
        <>
          <PortalPayments projectId={selectedProjectId} />
          <PortalFiles projectId={selectedProjectId} />
          <PortalModifications projectId={selectedProjectId} />
        </>
      )}
      {/* Floating Refresh Button */}
      <Button
        onClick={handleRefresh}
        disabled={refreshing}
        className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-primary text-black shadow-lg hover:bg-primary/90 transition-all hover:scale-110 disabled:opacity-50"
        title="تحديث البيانات"
      >
        <RefreshCw className={`h-6 w-6 ${refreshing ? "animate-spin" : ""}`} />
      </Button>
    </>
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
