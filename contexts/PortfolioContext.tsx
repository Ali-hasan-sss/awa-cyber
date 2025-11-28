"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  PortfolioPayload,
  fetchAdminPortfolios,
  createPortfolioApi,
  updatePortfolioApi,
  deletePortfolioApi,
} from "@/lib/actions/portfolioActions";

export type AdminPortfolio = {
  _id: string;
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  serviceId: string | { _id: string; title: { en: string; ar: string } };
  service?: {
    _id: string;
    title: { en: string; ar: string };
  };
  features?: Array<{
    icon: string;
    name: { en: string; ar: string };
    description?: { en?: string; ar?: string };
  }>;
  images: string[];
  completionDate: string;
};

interface PortfolioContextValue {
  portfolios: AdminPortfolio[];
  loading: boolean;
  error: string | null;
  fetchPortfolios: () => Promise<void>;
  createPortfolio: (payload: PortfolioPayload) => Promise<void>;
  updatePortfolio: (
    id: string,
    payload: Partial<PortfolioPayload>
  ) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(
  undefined
);

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [portfolios, setPortfolios] = useState<AdminPortfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAdminPortfolios();
      // API returns { success: true, data: [...] } or direct array
      const portfoliosData = Array.isArray(response)
        ? response
        : response?.data || [];
      setPortfolios(Array.isArray(portfoliosData) ? portfoliosData : []);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to load portfolios");
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPortfolio = useCallback(
    async (payload: PortfolioPayload) => {
      setLoading(true);
      setError(null);
      try {
        await createPortfolioApi(payload);
        await fetchPortfolios();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to create portfolio");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPortfolios]
  );

  const updatePortfolio = useCallback(
    async (id: string, payload: Partial<PortfolioPayload>) => {
      setLoading(true);
      setError(null);
      try {
        await updatePortfolioApi(id, payload);
        await fetchPortfolios();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to update portfolio");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPortfolios]
  );

  const deletePortfolio = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deletePortfolioApi(id);
        await fetchPortfolios();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete portfolio");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPortfolios]
  );

  const value = useMemo(
    () => ({
      portfolios,
      loading,
      error,
      fetchPortfolios,
      createPortfolio,
      updatePortfolio,
      deletePortfolio,
    }),
    [
      portfolios,
      loading,
      error,
      fetchPortfolios,
      createPortfolio,
      updatePortfolio,
      deletePortfolio,
    ]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolios = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolios must be used within PortfolioProvider");
  }
  return ctx;
};
