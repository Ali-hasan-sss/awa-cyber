import { apiClient } from "@/lib/apiClient";

interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const loginAdminApi = async (email: string, password: string) => {
  const { data } = await apiClient.post<AdminLoginResponse>("/api/auth/login", {
    email,
    password,
  });

  return data;
};
