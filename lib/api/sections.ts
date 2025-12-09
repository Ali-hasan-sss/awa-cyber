import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config/api";

export type PageType = "home" | "about" | "services" | "contact" | "portfolio";

export interface Feature {
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  icon: string;
  order: number;
}

export interface Section {
  _id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  page: PageType;
  images: string[];
  features: Feature[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionPayload {
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  page: PageType;
  serviceId?: string; // معرف الخدمة المرتبطة
  images?: string[];
  features?: Feature[];
  order?: number;
  isActive?: boolean;
}

export interface UpdateSectionPayload {
  title?: {
    en?: string;
    ar?: string;
  };
  description?: {
    en?: string;
    ar?: string;
  };
  page?: PageType;
  images?: string[];
  features?: Feature[];
  order?: number;
  isActive?: boolean;
}

export const getSections = async (filters?: {
  page?: PageType;
  isActive?: boolean;
}): Promise<Section[]> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page);
  if (filters?.isActive !== undefined)
    params.append("isActive", String(filters.isActive));

  const response = await apiClient.get(
    `${API_BASE_URL}/api/sections?${params.toString()}`
  );
  return response.data.data || [];
};

export const getSectionById = async (id: string): Promise<Section> => {
  const response = await apiClient.get(`${API_BASE_URL}/api/sections/${id}`);
  return response.data.data;
};

export const createSection = async (
  payload: CreateSectionPayload
): Promise<Section> => {
  const response = await apiClient.post(
    `${API_BASE_URL}/api/sections`,
    payload
  );
  return response.data.data;
};

export const updateSection = async (
  id: string,
  payload: UpdateSectionPayload
): Promise<Section> => {
  const response = await apiClient.put(
    `${API_BASE_URL}/api/sections/${id}`,
    payload
  );
  return response.data.data;
};

export const deleteSection = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/api/sections/${id}`);
};

export const getSectionsByPage = async (
  page: PageType,
  locale: "en" | "ar" = "en"
): Promise<any[]> => {
  const response = await apiClient.get(
    `${API_BASE_URL}/api/sections/page?page=${page}&locale=${locale}`
  );
  return response.data.data || [];
};
