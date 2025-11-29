import { apiClient } from "@/lib/apiClient";

export type LocalizedString = {
  en: string;
  ar: string;
};

export type PaymentStatus = "due" | "due_soon" | "paid" | "upcoming";
export type ModificationPriority = "low" | "medium" | "high" | "critical";
export type ModificationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "needs_extra_payment";
export type ProgressType = "project" | "modification";

export type PaymentPayload = {
  title: LocalizedString;
  description?: LocalizedString;
  projectId: string;
  userId: string;
  amount: number;
  dueDate: string;
  status?: PaymentStatus;
};

export type ModificationPayload = {
  title: string;
  description: string;
  priority?: ModificationPriority;
  projectId: string;
  userId: string;
  status?: ModificationStatus;
  extraPaymentAmount?: number;
  costAccepted?: boolean;
};

export type PhaseStatus = "upcoming" | "in_progress" | "completed";

export type ProjectPhasePayload = {
  title: LocalizedString;
  description?: LocalizedString;
  duration: number;
  status?: PhaseStatus;
  progress?: number;
};

export type ProjectPayload = {
  name: LocalizedString;
  description: LocalizedString;
  logo?: string;
  userId: string;
  totalCost: number;
  phases: ProjectPhasePayload[];
  startDate?: string;
  progress?: number;
  progressType?: ProgressType;
  whatsappGroupLink?: string;
};

// Project APIs
export const fetchProjects = async () => {
  const { data } = await apiClient.get("/api/projects");
  return data;
};

export const getProjectById = async (id: string) => {
  const { data } = await apiClient.get(`/api/projects/${id}`);
  return data;
};

export const createProjectApi = async (payload: ProjectPayload) => {
  const { data } = await apiClient.post("/api/projects", payload);
  return data;
};

export const updateProjectApi = async (
  id: string,
  payload: Partial<ProjectPayload>
) => {
  const { data } = await apiClient.patch(`/api/projects/${id}`, payload);
  return data;
};

export const deleteProjectApi = async (id: string) => {
  await apiClient.delete(`/api/projects/${id}`);
};

// Payment APIs
export const createPaymentApi = async (payload: PaymentPayload) => {
  const { data } = await apiClient.post("/api/projects/payments", payload);
  return data;
};

export const updatePaymentApi = async (
  id: string,
  payload: Partial<PaymentPayload>
) => {
  const { data } = await apiClient.patch(
    `/api/projects/payments/${id}`,
    payload
  );
  return data;
};

export const deletePaymentApi = async (id: string) => {
  await apiClient.delete(`/api/projects/payments/${id}`);
};

// Modification APIs
export const createModificationApi = async (payload: ModificationPayload) => {
  const { data } = await apiClient.post("/api/projects/modifications", payload);
  return data;
};

export const updateModificationApi = async (
  id: string,
  payload: Partial<ModificationPayload>
) => {
  const { data } = await apiClient.patch(
    `/api/projects/modifications/${id}`,
    payload
  );
  return data;
};

export const deleteModificationApi = async (id: string) => {
  await apiClient.delete(`/api/projects/modifications/${id}`);
};

// Project Files
export type ProjectFilePayload = {
  projectId: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  uploadedBy: "client" | "company";
};

export type ProjectFile = {
  _id: string;
  projectId: string | { _id: string };
  userId: string | { _id: string; name: string; email: string };
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  uploadedBy: "client" | "company";
  createdAt: string;
  updatedAt: string;
};

export const createProjectFile = async (data: ProjectFilePayload) => {
  const response = await apiClient.post("/api/projects/files", data);
  return response.data;
};

export const getProjectFiles = async (
  projectId: string,
  uploadedBy?: "client" | "company"
) => {
  const params = uploadedBy ? { uploadedBy } : {};
  const response = await apiClient.get(`/api/projects/files/${projectId}`, {
    params,
  });
  return response.data;
};

export const updateProjectFile = async (
  id: string,
  data: { fileName?: string }
) => {
  const response = await apiClient.patch(`/api/projects/files/${id}`, data);
  return response.data;
};

export const deleteProjectFile = async (id: string) => {
  const response = await apiClient.delete(`/api/projects/files/${id}`);
  return response.data;
};

// Portal Code
export const generatePortalCode = async (projectId: string) => {
  const response = await apiClient.post(
    `/api/projects/${projectId}/generate-portal-code`
  );
  return response.data;
};

export const getProjectByPortalCode = async (code: string) => {
  try {
    const response = await apiClient.get(`/api/projects/portal/${code}`);
    if (response.data.success && response.data.data) {
      return response.data;
    }
    throw new Error(response.data.message || "Invalid portal code");
  } catch (error: any) {
    // Re-throw with a clear error message
    const errorMessage =
      error?.response?.data?.message || error?.message || "Invalid portal code";
    throw new Error(errorMessage);
  }
};
