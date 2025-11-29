"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  createUserApi,
  deleteUserApi,
  fetchUsersApi,
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
  role: "admin" | "client" | "employee";
  hasLoginCode?: boolean;
  loginCode?: string; // Raw login code (deprecated - only for old clients)
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
  fetchUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: "admin" | "client" | "employee";
  }) => Promise<void>;
  createUser: (payload: UserPayload) => Promise<void>;
  updateUser: (id: string, payload: Partial<UserPayload>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchUsers = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: "admin" | "client" | "employee";
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
    },
    [token]
  );

  // Removed automatic fetchUsers on mount - let pages control when to fetch
  // Pages should call fetchUsers explicitly with their desired parameters

  const createUser = async (payload: UserPayload) => {
    setLoading(true);
    setError(null);
    try {
      await createUserApi(payload);
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

  const value = useMemo(
    () => ({
      users,
      loading,
      error,
      pagination,
      fetchUsers,
      createUser,
      updateUser,
      deleteUser,
    }),
    [users, loading, error, pagination, fetchUsers]
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
