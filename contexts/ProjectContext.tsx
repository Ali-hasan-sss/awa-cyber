"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  ProjectPayload,
  PaymentPayload,
  ModificationPayload,
  fetchProjects,
  getProjectById,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  createPaymentApi,
  updatePaymentApi,
  deletePaymentApi,
  createModificationApi,
  updateModificationApi,
  deleteModificationApi,
} from "@/lib/actions/projectActions";

export type AdminPayment = {
  _id: string;
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  projectId: string | { _id: string };
  userId: string | { _id: string; name: string; companyName: string };
  amount: number;
  dueDate: string;
  status: "due" | "due_soon" | "paid" | "upcoming";
  createdAt: string;
  updatedAt: string;
};

export type AdminModification = {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  projectId: string | { _id: string };
  userId: string | { _id: string; name: string; companyName: string };
  status: "pending" | "accepted" | "completed" | "needs_extra_payment";
  extraPaymentAmount?: number;
  costAccepted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PhaseStatus = "upcoming" | "in_progress" | "completed";

export type AdminProjectPhase = {
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  duration: number;
  status: PhaseStatus;
  progress: number;
};

export type AdminProject = {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  logo?: string;
  userId:
    | string
    | { _id: string; name: string; companyName: string; email: string };
  totalCost: number;
  payments: AdminPayment[] | string[];
  modifications: AdminModification[] | string[];
  phases: AdminProjectPhase[];
  startDate?: string;
  progress: number;
  progressType: "project" | "modification";
  activeModificationId?: string | AdminModification;
  createdAt: string;
  updatedAt: string;
};

interface ProjectContextValue {
  projects: AdminProject[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  getProject: (id: string) => Promise<AdminProject | null>;
  createProject: (payload: ProjectPayload) => Promise<void>;
  updateProject: (
    id: string,
    payload: Partial<ProjectPayload>
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createPayment: (payload: PaymentPayload) => Promise<void>;
  updatePayment: (
    id: string,
    payload: Partial<PaymentPayload>
  ) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  createModification: (payload: ModificationPayload) => Promise<void>;
  updateModification: (
    id: string,
    payload: Partial<ModificationPayload>
  ) => Promise<void>;
  deleteModification: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProjects();
      const projectsData = Array.isArray(response)
        ? response
        : response?.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjectById(id);
      const projectData = response?.data || response;
      return projectData;
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to load project");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(
    async (payload: ProjectPayload) => {
      setLoading(true);
      setError(null);
      try {
        await createProjectApi(payload);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to create project");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const updateProject = useCallback(
    async (id: string, payload: Partial<ProjectPayload>) => {
      setLoading(true);
      setError(null);
      try {
        await updateProjectApi(id, payload);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to update project");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteProjectApi(id);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete project");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const createPayment = useCallback(
    async (payload: PaymentPayload) => {
      setLoading(true);
      setError(null);
      try {
        await createPaymentApi(payload);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to create payment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const updatePayment = useCallback(
    async (id: string, payload: Partial<PaymentPayload>) => {
      setLoading(true);
      setError(null);
      try {
        await updatePaymentApi(id, payload);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to update payment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const deletePayment = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deletePaymentApi(id);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete payment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const createModification = useCallback(
    async (payload: ModificationPayload) => {
      setLoading(true);
      setError(null);
      try {
        await createModificationApi(payload);
        await fetchProjectsList();
      } catch (err) {
        setError(
          typeof err === "string" ? err : "Failed to create modification"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const updateModification = useCallback(
    async (id: string, payload: Partial<ModificationPayload>) => {
      setLoading(true);
      setError(null);
      try {
        await updateModificationApi(id, payload);
        await fetchProjectsList();
      } catch (err) {
        setError(
          typeof err === "string" ? err : "Failed to update modification"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const deleteModification = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteModificationApi(id);
        await fetchProjectsList();
      } catch (err) {
        setError(
          typeof err === "string" ? err : "Failed to delete modification"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      fetchProjects: fetchProjectsList,
      getProject,
      createProject,
      updateProject,
      deleteProject,
      createPayment,
      updatePayment,
      deletePayment,
      createModification,
      updateModification,
      deleteModification,
    }),
    [
      projects,
      loading,
      error,
      fetchProjectsList,
      getProject,
      createProject,
      updateProject,
      deleteProject,
      createPayment,
      updatePayment,
      deletePayment,
      createModification,
      updateModification,
      deleteModification,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjects must be used within ProjectProvider");
  }
  return ctx;
};
