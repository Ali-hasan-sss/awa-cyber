"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  requestNotificationPermission,
  onMessageListener,
} from "@/lib/firebase/config";
import { useAuth } from "./AuthContext";
import { apiClient } from "@/lib/apiClient";
import { useLanguage } from "./LanguageContext";

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  fcmToken: string | null;
  loading: boolean;
  requestPermission: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = useAuth();
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Request notification permission and get FCM token
  const requestPermission = useCallback(async () => {
    if (!admin) return;

    try {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmToken(token);
        // Send token to backend
        try {
          await apiClient.post("/api/notifications/subscribe", {
            token,
            userId: admin.id,
            role: admin.role,
          });
        } catch (error) {
          console.error("Error subscribing to notifications:", error);
        }
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }, [admin]);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!admin) return;

    setLoading(true);
    try {
      const response = await apiClient.get("/api/notifications/logs", {
        params: { limit: 50 },
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        const fetchedNotifications: Notification[] = response.data.data.map(
          (log: any) => {
            const data = log.data || {};
            let title = log.title as string;
            let body = log.body as string;

            // Quotation request notifications
            if (data.type === "quotation_request") {
              const fullName = data.fullName || "";
              const companyName = data.companyName || "";
              const serviceNameEn = data.serviceNameEn || "";
              const serviceNameAr = data.serviceNameAr || "";
              const serviceName = isArabic ? serviceNameAr : serviceNameEn;

              const companyPart = companyName ? ` (${companyName})` : "";

              title = isArabic ? "طلب عرض سعر جديد" : "New Quotation Request";

              body = isArabic
                ? `${fullName}${companyPart} طلب عرض سعر لـ ${serviceName}`
                : `${fullName}${companyPart} requested a quote for ${serviceName}`;
            }

            // Project modification notifications
            if (data.type === "project_modification") {
              const clientName = data.clientName || "";
              const projectNameEn = data.projectNameEn || "";
              const projectNameAr = data.projectNameAr || "";
              const projectName = isArabic ? projectNameAr : projectNameEn;

              title = isArabic
                ? "تعديل جديد على المشروع"
                : "New Project Modification";

              body = isArabic
                ? `${clientName} أضاف تعديلاً جديداً على المشروع ${projectName}`
                : `${clientName} added a new modification for project ${projectName}`;
            }

            return {
              id: log._id || log.id,
              title: title || log.title,
              body: body || log.body,
              data: log.data,
              timestamp: new Date(log.createdAt || log.timestamp),
              read: log.read || false,
            };
          }
        );
        setNotifications(fetchedNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [admin, isArabic]);

  // Listen for foreground messages
  useEffect(() => {
    if (!admin) return;

    const setupMessageListener = async () => {
      try {
        const payload: any = await onMessageListener();
        if (payload) {
          // Refresh notifications from backend when new message arrives
          await fetchNotifications();
        }
      } catch (error) {
        console.error("Error in message listener:", error);
      }
    };

    // Set up interval to check for messages
    const interval = setInterval(setupMessageListener, 5000);

    return () => clearInterval(interval);
  }, [admin, fetchNotifications]);

  // Request permission when admin logs in
  useEffect(() => {
    if (admin && !fcmToken) {
      requestPermission();
    }
  }, [admin, fcmToken, requestPermission]);

  // Fetch notifications when admin logs in and periodically
  useEffect(() => {
    if (!admin) return;

    // Fetch immediately
    fetchNotifications();

    // Fetch every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [admin, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      try {
        await apiClient.patch(`/api/notifications/${id}/read`);
        // Refresh notifications after marking as read
        await fetchNotifications();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [fetchNotifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    try {
      await apiClient.patch("/api/notifications/read-all");
      // Refresh notifications after marking all as read
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [fetchNotifications]);

  // Clear notifications (delete from backend)
  const clearNotifications = useCallback(async () => {
    if (!admin) return;
    try {
      await apiClient.delete("/api/notifications/logs");
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }, [admin]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fcmToken,
        loading,
        requestPermission,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
