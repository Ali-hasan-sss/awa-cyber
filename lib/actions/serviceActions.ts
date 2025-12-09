import { apiClient } from "@/lib/apiClient";

export type LocalizedString = {
  en: string;
  ar: string;
};

export type ServiceFeaturePayload = {
  icon: string;
  name: LocalizedString;
  description?: LocalizedString;
};

export type ServicePayload = {
  title: LocalizedString;
  description?: LocalizedString;
  images: string[];
  features?: ServiceFeaturePayload[];
};

export const fetchAdminServices = async () => {
  const { data } = await apiClient.get("/api/services", {
    headers: { "x-lang": "NOT" },
  });
  return data;
};

export const createServiceApi = async (payload: ServicePayload) => {
  const { data } = await apiClient.post("/api/services", payload);
  return data;
};

export const updateServiceApi = async (
  id: string,
  payload: Partial<ServicePayload>
) => {
  const { data } = await apiClient.patch(`/api/services/${id}`, payload);
  return data;
};

export const deleteServiceApi = async (id: string) => {
  await apiClient.delete(`/api/services/${id}`);
};

export const fetchPublicServices = async (lang: "en" | "ar") => {
  const { data } = await apiClient.get("/api/services/public", {
    headers: { "x-lang": lang },
  });
  return data;
};

export const fetchServiceById = async (
  id: string,
  lang: "en" | "ar" = "en"
) => {
  const { data } = await apiClient.get(`/api/services/public/${id}`, {
    headers: { "x-lang": lang },
  });
  return data;
};
