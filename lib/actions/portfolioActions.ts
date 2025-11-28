import { apiClient } from "@/lib/apiClient";

export type LocalizedString = {
  en: string;
  ar: string;
};

export type PortfolioFeaturePayload = {
  icon: string;
  name: LocalizedString;
  description?: LocalizedString;
};

export type PortfolioPayload = {
  title: LocalizedString;
  description?: LocalizedString;
  serviceId: string;
  features?: PortfolioFeaturePayload[];
  images: string[];
  completionDate: string;
};

export const fetchAdminPortfolios = async () => {
  const { data } = await apiClient.get("/api/portfolios", {
    headers: { "x-lang": "NOT" },
  });
  return data;
};

export const fetchPublicPortfolios = async (lang: "en" | "ar") => {
  const { data } = await apiClient.get("/api/portfolios/public", {
    headers: { "x-lang": lang },
  });
  return data;
};

export const createPortfolioApi = async (payload: PortfolioPayload) => {
  const { data } = await apiClient.post("/api/portfolios", payload);
  return data;
};

export const updatePortfolioApi = async (
  id: string,
  payload: Partial<PortfolioPayload>
) => {
  const { data } = await apiClient.patch(`/api/portfolios/${id}`, payload);
  return data;
};

export const deletePortfolioApi = async (id: string) => {
  await apiClient.delete(`/api/portfolios/${id}`);
};
