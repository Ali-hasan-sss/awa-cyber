"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdminApi } from "@/lib/actions/authActions";
import { setAuthToken, clearAuthToken } from "@/lib/apiClient";

// Helper function to clear auth state
const clearAuthState = () => {
  if (typeof window !== "undefined") {
    clearAuthToken();
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

interface AuthState {
  token: string | null;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AuthContextValue extends AuthState {
  loading: boolean;
  initializing: boolean; // Indicates if we're still loading from localStorage
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "awa-admin-auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    token: null,
    admin: null,
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // Start as true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load auth state from localStorage on mount
    const loadAuthState = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate that we have both token and admin data
          if (parsed.token && parsed.admin) {
            setState(parsed);
            setAuthToken(parsed.token);
          } else {
            // Invalid data, remove it
            clearAuthState();
          }
        }
      } catch (e) {
        console.error("Failed parsing auth state", e);
        clearAuthState();
      } finally {
        setInitializing(false); // Mark initialization as complete
      }
    };

    loadAuthState();
  }, []);

  const persistState = (authState: AuthState) => {
    setState(authState);
    setAuthToken(authState.token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginAdminApi(email, password);
      persistState({ token: data.token, admin: data.admin });
      router.push("/admin/dashboard/home");
    } catch (err) {
      setError(typeof err === "string" ? err : "فشل تسجيل الدخول");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setState({ token: null, admin: null });
    clearAuthState();
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ ...state, loading, initializing, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
