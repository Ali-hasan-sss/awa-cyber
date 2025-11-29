"use client";

import { Suspense } from "react";
import PortalHero from "@/components/portal/Hero";
import PortalFeatures from "@/components/portal/Features";
import PortalFiles from "@/components/portal/Files";
import PortalModifications from "@/components/portal/Modifications";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function PortalContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { user, loginWithCode } = useAuth();
  const { getProjectByPortalCode, projects, fetchProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadProject();
  }, [code, user]);

  const loadProject = async () => {
    if (code) {
      try {
        // Try to get project by portal code
        try {
          const project = await getProjectByPortalCode(code);
          if (project?._id) {
            setSelectedProjectId(project._id);
            return;
          }
        } catch (err) {
          // If project code fails, try user login code
          try {
            await loginWithCode(code);
            await fetchProjects();
          } catch (loginErr) {
            console.error("Failed to load project:", loginErr);
          }
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      }
    } else if (user?.id) {
      // If user is logged in, get first project
      await fetchProjects();
    }
  };

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const project = projects[0];
      setSelectedProjectId(project._id);
    }
  }, [projects, selectedProjectId]);

  return (
    <>
      <PortalHero />
      <PortalFeatures />
      {selectedProjectId && (
        <>
          <PortalFiles projectId={selectedProjectId} />
          <PortalModifications projectId={selectedProjectId} />
        </>
      )}
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
