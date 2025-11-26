"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserApi,
  deleteUserApi,
  fetchUsersApi,
  generateLoginCodeApi,
  updateUserApi,
  UserPayload,
} from "@/lib/actions/userActions";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  role: "admin" | "client";
  hasLoginCode?: boolean;
  loginCode?: string; // Raw login code (e.g., awa123456)
  createdAt?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserContextValue {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  lastGeneratedCode?: { code: string; userId: string };
  fetchUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: "admin" | "client";
  }) => Promise<void>;
  createUser: (payload: UserPayload) => Promise<void>;
  updateUser: (id: string, payload: Partial<UserPayload>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  generateLoginCode: (id: string) => Promise<string>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [lastGeneratedCode, setLastGeneratedCode] =
    useState<UserContextValue["lastGeneratedCode"]>();

  const fetchUsers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: "admin" | "client";
  }) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsersApi(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Removed automatic fetchUsers on mount - let pages control when to fetch
  // Pages should call fetchUsers explicitly with their desired parameters

  const createUser = async (payload: UserPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createUserApi(payload);
      // If the response includes a loginCode, store it temporarily
      if (response.loginCode) {
        setLastGeneratedCode({
          code: response.loginCode,
          userId: response._id,
        });
      }
      await fetchUsers();
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to create user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, payload: Partial<UserPayload>) => {
    setLoading(true);
    setError(null);
    try {
      await updateUserApi(id, payload);
      await fetchUsers();
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to update user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteUserApi(id);
      // Note: fetchUsers should be called by the component with current filters
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to delete user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateLoginCode = async (id: string) => {
    setError(null);
    try {
      const data = await generateLoginCodeApi(id);
      setLastGeneratedCode({ code: data.code, userId: id });
      // Refresh users list to get the updated login code
      await fetchUsers();
      return data.code;
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to generate code");
      throw err;
    }
  };

  const value = useMemo(
    () => ({
      users,
      loading,
      error,
      pagination,
      lastGeneratedCode,
      fetchUsers,
      createUser,
      updateUser,
      deleteUser,
      generateLoginCode,
    }),
    [users, loading, error, pagination, lastGeneratedCode]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUsers must be used within UserProvider");
  }
  return ctx;
};
