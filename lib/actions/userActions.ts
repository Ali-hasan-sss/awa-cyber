import { apiClient } from "@/lib/apiClient";

export interface UserPayload {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  role?: "admin" | "client";
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "client";
}

export interface UsersResponse {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const fetchUsersApi = async (params?: FetchUsersParams) => {
  const { data } = await apiClient.get<UsersResponse>("/api/users", {
    params,
  });
  return data;
};

export const createUserApi = async (payload: UserPayload) => {
  const { data } = await apiClient.post("/api/users", payload);
  return data;
};

export const updateUserApi = async (
  id: string,
  payload: Partial<UserPayload>
) => {
  const { data } = await apiClient.patch(`/api/users/${id}`, payload);
  return data;
};

export const deleteUserApi = async (id: string) => {
  await apiClient.delete(`/api/users/${id}`);
};

export const generateLoginCodeApi = async (id: string) => {
  const { data } = await apiClient.post(`/api/users/${id}/login-code`);
  return data;
};
