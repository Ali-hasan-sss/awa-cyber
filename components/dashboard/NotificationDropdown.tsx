"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, Check, X } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isArabic ? "الآن" : "Just now";
    if (minutes < 60) return `${minutes} ${isArabic ? "د" : "m"}`;
    if (hours < 24) return `${hours} ${isArabic ? "س" : "h"}`;
    return `${days} ${isArabic ? "يوم" : "d"}`;
  };

  const handleNotificationClick = (notification: {
    id: string;
    read: boolean;
    data?: any;
  }) => {
    const type = notification.data?.type;

    // Quotation request notification → go to quotations page
    if (type === "quotation_request") {
      if (!notification.read) {
        markAsRead(notification.id).catch((err) => {
          console.error("Failed to mark notification as read:", err);
        });
      }
      router.push("/admin/dashboard/quotes");
      setIsOpen(false);
      return;
    }

    // Project modification notification → go to project modifications tab
    if (type === "project_modification" && notification.data?.projectId) {
      if (!notification.read) {
        markAsRead(notification.id).catch((err) => {
          console.error("Failed to mark notification as read:", err);
        });
      }
      const projectId = notification.data.projectId as string;
      // استخدم كويري بارام للإشارة لتاب التعديلات
      router.push(`/admin/dashboard/projects/${projectId}?tab=modifications`);
      setIsOpen(false);
      return;
    }
  };

  const dropdownContent = (
    <div className="fixed top-16 ltr:right-4 rtl:left-4 z-[2147483647] w-80 rounded-2xl border border-white/10 bg-[#060e1f] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white">
          {isArabic ? "التنبيهات" : "Notifications"}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Fire-and-forget – لا نوقف الواجهة لو فشل الطلب
                markAllAsRead().catch((err) => {
                  console.error(
                    "Failed to mark all notifications as read:",
                    err
                  );
                });
              }}
              className="text-xs text-white/60 hover:text-white"
            >
              {isArabic ? "قراءة الكل" : "Mark all read"}
            </Button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/60">
            {isArabic ? "لا توجد تنبيهات" : "No notifications"}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`cursor-pointer p-4 transition hover:bg-white/5 ${
                  !notification.read ? "bg-white/[0.02]" : ""
                }`}
                onClick={() =>
                  handleNotificationClick({
                    id: notification.id,
                    read: notification.read,
                    data: notification.data,
                  })
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {notification.body}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-white/10 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const confirmed = window.confirm(
                isArabic
                  ? "هل أنت متأكد من حذف جميع الإشعارات؟ لا يمكن التراجع عن هذه العملية."
                  : "Are you sure you want to delete all notifications? This cannot be undone."
              );
              if (!confirmed) return;
              await clearNotifications();
            }}
            className="w-full text-xs text-primary hover:text-white"
          >
            {isArabic ? "حذف الكل" : "Delete all"}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full border border-white/10 bg-white/[0.05] p-2 text-white/80 transition hover:bg-white/10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && isMounted && typeof document !== "undefined"
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  );
}
