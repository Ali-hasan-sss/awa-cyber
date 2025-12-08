"use server";

import { apiClient } from "@/lib/apiClient";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function createContactMessage(
  payload: CreateContactMessagePayload
) {
  try {
    const response = await apiClient.post("/api/contact", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
}

export async function getContactMessages(
  token: string,
  params?: {
    read?: boolean;
    page?: number;
    limit?: number;
  }
) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.read !== undefined) {
      queryParams.append("read", params.read.toString());
    }
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const response = await apiClient.get(
      `/api/contact?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch messages"
    );
  }
}

export async function getContactMessage(token: string, id: string) {
  try {
    const response = await apiClient.get(`/api/contact/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch message");
  }
}

export async function markContactMessageAsRead(token: string, id: string) {
  try {
    const response = await apiClient.patch(
      `/api/contact/${id}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update message"
    );
  }
}

export async function deleteContactMessage(token: string, id: string) {
  try {
    const response = await apiClient.delete(`/api/contact/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete message"
    );
  }
}

export async function getUnreadContactCount(token: string) {
  try {
    const response = await apiClient.get("/api/contact/unread-count", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch unread count"
    );
  }
}
