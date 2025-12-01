import { apiClient } from "@/lib/apiClient";

export type ExpenseType = "subscription_monthly" | "subscription_yearly" | "utility" | "one_time";
export type ExpenseStatus = "paid" | "pending" | "overdue";

export type ExpensePayload = {
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  amount: number;
  type: ExpenseType;
  status?: ExpenseStatus;
  dueDate: string;
  paidDate?: string;
  recurring?: boolean;
  recurringInterval?: "monthly" | "yearly";
};

export const fetchExpenses = async (params?: {
  startDate?: string;
  endDate?: string;
  type?: ExpenseType;
  status?: ExpenseStatus;
  page?: number;
  limit?: number;
}) => {
  const { data } = await apiClient.get("/api/expenses", { params });
  return data;
};

export const getExpenseById = async (id: string) => {
  const { data } = await apiClient.get(`/api/expenses/${id}`);
  return data;
};

export const createExpenseApi = async (payload: ExpensePayload) => {
  const { data } = await apiClient.post("/api/expenses", payload);
  return data;
};

export const updateExpenseApi = async (id: string, payload: Partial<ExpensePayload>) => {
  const { data } = await apiClient.patch(`/api/expenses/${id}`, payload);
  return data;
};

export const deleteExpenseApi = async (id: string) => {
  await apiClient.delete(`/api/expenses/${id}`);
};

