import { apiClient } from "@/lib/apiClient";

interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "client" | "employee";
  };
}

interface UserLoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
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

export const loginWithCodeApi = async (code: string) => {
  const { data } = await apiClient.post<UserLoginResponse>(
    "/api/auth/login-code-only",
    {
      code,
    }
  );

  return data;
};

interface UpdateProfileResponse {
  message: string;
  admin: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
}

export const updateProfileApi = async (payload: {
  name?: string;
  email?: string;
  phone?: string;
}) => {
  const { data } = await apiClient.patch<UpdateProfileResponse>(
    "/api/auth/profile",
    payload
  );
  return data;
};

interface ChangePasswordResponse {
  message: string;
}

export const changePasswordApi = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data } = await apiClient.post<ChangePasswordResponse>(
    "/api/auth/change-password",
    payload
  );
  return data;
};
