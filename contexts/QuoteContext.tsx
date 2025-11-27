"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  CreateQuotationPayload,
  createQuotationRequestApi,
  fetchQuotationRequestsApi,
  FetchQuotationParams,
  QuotationStatus,
} from "@/lib/actions/quoteActions";

export interface BudgetRange {
  from: number;
  to: number;
}

export interface QuotationRequest {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  serviceId: string;
  projectDescription: string;
  budget: BudgetRange;
  expectedDuration: string;
  startDate: string;
  endDate: string;
  additionalInfo?: string;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QuoteContextValue {
  requests: QuotationRequest[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  fetchQuotationRequests: (params?: FetchQuotationParams) => Promise<void>;
  createQuotationRequest: (payload: CreateQuotationPayload) => Promise<void>;
}

const QuoteContext = createContext<QuoteContextValue | undefined>(undefined);

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [lastParams, setLastParams] = useState<FetchQuotationParams | undefined>();

  const fetchQuotationRequests = async (params?: FetchQuotationParams) => {
    setLoading(true);
    setError(null);
    try {
      if (params) {
        setLastParams(params);
      }
      const effectiveParams = params ?? lastParams ?? { page: 1, limit: 10 };
      const data = await fetchQuotationRequestsApi(effectiveParams);
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const createQuotationRequest = async (payload: CreateQuotationPayload) => {
    setLoading(true);
    setError(null);
    try {
      await createQuotationRequestApi(payload);
      await fetchQuotationRequests(lastParams);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to create request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      requests,
      loading,
      error,
      pagination,
      fetchQuotationRequests,
      createQuotationRequest,
    }),
    [requests, loading, error, pagination]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
};

export const useQuotes = () => {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error("useQuotes must be used within QuoteProvider");
  }
  return ctx;
};

