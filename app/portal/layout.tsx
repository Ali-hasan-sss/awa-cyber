"use client";

import { ReactNode } from "react";
import { ProjectProvider } from "@/contexts/ProjectContext";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}
