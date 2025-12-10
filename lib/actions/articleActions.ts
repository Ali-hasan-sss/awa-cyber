import { apiClient } from "@/lib/apiClient";

export type LocalizedString = {
  en: string;
  ar: string;
};

export type ArticlePayload = {
  title: LocalizedString;
  description: LocalizedString;
  body: LocalizedString;
  serviceId: string;
  mainImage: string;
  publishedAt?: string;
};

export const fetchAdminArticles = async (serviceId?: string) => {
  const params = serviceId ? { serviceId } : {};
  const { data } = await apiClient.get("/api/articles", {
    params,
    headers: { "x-lang": "NOT" },
  });
  return data;
};

export const createArticleApi = async (payload: ArticlePayload) => {
  const { data } = await apiClient.post("/api/articles", payload);
  return data;
};

export const updateArticleApi = async (
  id: string,
  payload: Partial<ArticlePayload>
) => {
  const { data } = await apiClient.patch(`/api/articles/${id}`, payload);
  return data;
};

export const deleteArticleApi = async (id: string) => {
  await apiClient.delete(`/api/articles/${id}`);
};

export const fetchPublicArticles = async (
  lang: "en" | "ar",
  serviceId?: string
) => {
  const params = serviceId ? { serviceId } : {};
  const { data } = await apiClient.get("/api/articles/public", {
    params,
    headers: { "x-lang": lang },
  });
  return data;
};

export const fetchArticleById = async (
  id: string,
  lang: "en" | "ar" = "en"
) => {
  const { data } = await apiClient.get(`/api/articles/public/${id}`, {
    headers: { "x-lang": lang },
  });
  return data;
};
