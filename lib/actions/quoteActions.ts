import { apiClient } from "@/lib/apiClient";

export type QuotationStatus = "pending" | "in_review" | "quoted" | "closed";

export interface CreateQuotationPayload {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  serviceId: string;
  projectDescription: string;
  budget: {
    from: number;
    to: number;
  };
  expectedDuration: string;
  startDate: string;
  endDate: string;
  additionalInfo?: string;
}

export interface FetchQuotationParams {
  page?: number;
  limit?: number;
  search?: string;
  serviceId?: string;
  status?: QuotationStatus | "";
}

export const fetchQuotationRequestsApi = async (
  params?: FetchQuotationParams
) => {
  const { data } = await apiClient.get("/api/quotations", {
    params,
  });
  return data;
};

export const createQuotationRequestApi = async (
  payload: CreateQuotationPayload
) => {
  const { data } = await apiClient.post("/api/quotations", payload);
  return data;
};

export const updateQuotationStatusApi = async (
  id: string,
  status: QuotationStatus
) => {
  const { data } = await apiClient.patch(`/api/quotations/${id}/status`, {
    status,
  });
  return data;
};
