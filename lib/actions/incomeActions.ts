import { apiClient } from "@/lib/apiClient";

export type IncomeType = "one_time" | "monthly_contract";
export type IncomeStatus = "paid" | "pending" | "overdue";

export type IncomePayload = {
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  userId: string;
  projectId?: string;
  amount: number;
  type: IncomeType;
  status?: IncomeStatus;
  dueDate: string;
  paidDate?: string;
  recurring?: boolean;
};

export const fetchIncomes = async (params?: {
  startDate?: string;
  endDate?: string;
  type?: IncomeType;
  status?: IncomeStatus;
  userId?: string;
  page?: number;
  limit?: number;
}) => {
  const { data } = await apiClient.get("/api/incomes", { params });
  return data;
};

export const getIncomeById = async (id: string) => {
  const { data } = await apiClient.get(`/api/incomes/${id}`);
  return data;
};

export const createIncomeApi = async (payload: IncomePayload) => {
  const { data } = await apiClient.post("/api/incomes", payload);
  return data;
};

export const updateIncomeApi = async (
  id: string,
  payload: Partial<IncomePayload>
) => {
  const { data } = await apiClient.patch(`/api/incomes/${id}`, payload);
  return data;
};

export const deleteIncomeApi = async (id: string) => {
  await apiClient.delete(`/api/incomes/${id}`);
};
