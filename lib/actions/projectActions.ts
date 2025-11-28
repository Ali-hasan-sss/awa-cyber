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
