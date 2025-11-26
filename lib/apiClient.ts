import axios from "axios";
import { API_BASE_URL } from "./config/api";

let authToken: string | null = null;

// Load token from localStorage on initialization (for SSR compatibility)
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("awa-admin-auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        authToken = parsed.token;
      }
    }
  } catch (e) {
    console.error("Failed to load auth token from localStorage", e);
  }
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  // Always try to get the latest token from localStorage if not set
  if (!authToken && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("awa-admin-auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token) {
          authToken = parsed.token;
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error?.response?.status === 401) {
      // Clear auth state and redirect to login
      if (typeof window !== "undefined") {
        clearAuthToken();
        localStorage.removeItem("awa-admin-auth");
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(
      error?.response?.data?.message || error.message || "Unexpected error"
    );
  }
);
