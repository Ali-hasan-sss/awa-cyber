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
  ProjectFilePayload,
  ProjectFile,
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
  createProjectFile,
  getProjectFiles,
  updateProjectFile,
  deleteProjectFile as deleteProjectFileApi,
  generatePortalCode as generatePortalCodeApi,
  getProjectByPortalCode as getProjectByPortalCodeApi,
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

export type ModificationFile = {
  url: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
};

export type AdminModification = {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  projectId: string | { _id: string };
  userId: string | { _id: string; name: string; companyName: string };
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "completed"
    | "needs_extra_payment";
  extraPaymentAmount?: number;
  costAccepted: boolean;
  attachedFiles?: ModificationFile[];
  audioMessageUrl?: string; // Voice recording URL as separate field
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
    | {
        _id: string;
        name: string;
        companyName: string;
        email: string;
        phone?: string;
      };
  totalCost: number;
  payments: AdminPayment[] | string[];
  modifications: AdminModification[] | string[];
  phases: AdminProjectPhase[];
  startDate?: string;
  progress: number;
  progressType: "project" | "modification";
  activeModificationId?: string | AdminModification;
  whatsappGroupLink?: string;
  portalCode?: string;
  projectUrl?: string;
  employees?: Array<
    | string
    | {
        _id: string;
        name: string;
        email: string;
        companyName: string;
        role: string;
      }
  >;
  createdAt: string;
  updatedAt: string;
};

interface ProjectContextValue {
  projects: AdminProject[];
  loading: boolean;
  error: string | null;
  pagination: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  fetchProjects: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => Promise<void>;
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
  createProjectFile: (payload: ProjectFilePayload) => Promise<void>;
  getProjectFiles: (
    projectId: string,
    uploadedBy?: "client" | "company"
  ) => Promise<ProjectFile[]>;
  updateProjectFile: (
    id: string,
    payload: { fileName?: string }
  ) => Promise<void>;
  deleteProjectFile: (id: string) => Promise<void>;
  generatePortalCode: (projectId: string) => Promise<{ portalCode: string }>;
  getProjectByPortalCode: (code: string) => Promise<AdminProject>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  const fetchProjectsList = useCallback(
    async (params?: { page?: number; limit?: number; search?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProjects(params);
        const projectsData = Array.isArray(response)
          ? response
          : response?.data || [];
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        if (response?.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination(null);
        }
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to load projects");
        setProjects([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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

  const createProjectFileHandler = useCallback(
    async (payload: ProjectFilePayload) => {
      setLoading(true);
      setError(null);
      try {
        await createProjectFile(payload);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to upload file");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const getProjectFilesHandler = useCallback(
    async (projectId: string, uploadedBy?: "client" | "company") => {
      setLoading(true);
      setError(null);
      try {
        const result = await getProjectFiles(projectId, uploadedBy);
        // Handle both response formats: { data: [...] } or direct array
        if (result && typeof result === "object" && "data" in result) {
          return Array.isArray(result.data) ? result.data : [];
        }
        return Array.isArray(result) ? result : [];
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to get files");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProjectFileHandler = useCallback(
    async (id: string, payload: { fileName?: string }) => {
      setLoading(true);
      setError(null);
      try {
        await updateProjectFile(id, payload);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to update file");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const deleteProjectFileHandler = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteProjectFileApi(id);
        await fetchProjectsList();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete file");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const generatePortalCodeHandler = useCallback(
    async (projectId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await generatePortalCodeApi(projectId);
        await fetchProjectsList();
        return result.data;
      } catch (err) {
        setError(
          typeof err === "string" ? err : "Failed to generate portal code"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjectsList]
  );

  const getProjectByPortalCodeHandler = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjectByPortalCodeApi(code);
      // Return the project data directly
      return result.data || result;
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        (typeof err === "string" ? err : "Failed to get project by code");
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      pagination,
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
      createProjectFile: createProjectFileHandler,
      getProjectFiles: getProjectFilesHandler,
      updateProjectFile: updateProjectFileHandler,
      deleteProjectFile: deleteProjectFileHandler,
      generatePortalCode: generatePortalCodeHandler,
      getProjectByPortalCode: getProjectByPortalCodeHandler,
    }),
    [
      projects,
      loading,
      error,
      pagination,
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
      createProjectFileHandler,
      getProjectFilesHandler,
      updateProjectFileHandler,
      deleteProjectFileHandler,
      generatePortalCodeHandler,
      getProjectByPortalCodeHandler,
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
