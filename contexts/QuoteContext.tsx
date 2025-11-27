"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  CreateQuotationPayload,
  createQuotationRequestApi,
  fetchQuotationRequestsApi,
  FetchQuotationParams,
  QuotationStatus,
  updateQuotationStatusApi,
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
  updateQuotationRequestStatus: (
    id: string,
    status: QuotationStatus
  ) => Promise<void>;
}

const QuoteContext = createContext<QuoteContextValue | undefined>(undefined);

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const lastParamsRef = useRef<FetchQuotationParams | undefined>(undefined);

  const fetchQuotationRequests = useCallback(
    async (params?: FetchQuotationParams) => {
      setLoading(true);
      setError(null);
      try {
        const nextParams = params ??
          lastParamsRef.current ?? { page: 1, limit: 10 };
        if (params) {
          lastParamsRef.current = params;
        } else if (!lastParamsRef.current) {
          lastParamsRef.current = nextParams;
        }
        const data = await fetchQuotationRequestsApi(nextParams);
        setRequests(data.requests);
        setPagination(data.pagination);
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createQuotationRequest = useCallback(
    async (payload: CreateQuotationPayload) => {
      setLoading(true);
      setError(null);
      try {
        await createQuotationRequestApi(payload);
        await fetchQuotationRequests(lastParamsRef.current);
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to create request");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchQuotationRequests]
  );

  const updateQuotationRequestStatus = useCallback(
    async (id: string, status: QuotationStatus) => {
      setLoading(true);
      setError(null);
      try {
        await updateQuotationStatusApi(id, status);
        await fetchQuotationRequests(lastParamsRef.current);
      } catch (err) {
        setError(
          typeof err === "string" ? err : "Failed to update request status"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchQuotationRequests]
  );

  const value = useMemo(
    () => ({
      requests,
      loading,
      error,
      pagination,
      fetchQuotationRequests,
      createQuotationRequest,
      updateQuotationRequestStatus,
    }),
    [
      requests,
      loading,
      error,
      pagination,
      fetchQuotationRequests,
      createQuotationRequest,
      updateQuotationRequestStatus,
    ]
  );

  return (
    <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
  );
};

export const useQuotes = () => {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error("useQuotes must be used within QuoteProvider");
  }
  return ctx;
};
