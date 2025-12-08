"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getContactMessages,
  markContactMessageAsRead,
  deleteContactMessage,
  ContactMessage,
} from "@/lib/actions/contactActions";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  User,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ContactMessagesPage() {
  const { token } = useAuth();
  const { locale } = useLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (token) {
      loadMessages();
    }
  }, [token, filterRead, page]);

  const loadMessages = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await getContactMessages(token, {
        read: filterRead,
        page,
        limit: 20,
      });
      setMessages(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await markContactMessageAsRead(token, id);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, read: true } : msg))
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (
      !confirm(
        locale === "ar"
          ? "هل أنت متأكد من حذف هذه الرسالة؟"
          : "Are you sure you want to delete this message?"
      )
    ) {
      return;
    }
    try {
      await deleteContactMessage(token, id);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query) ||
      (msg.phone && msg.phone.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/70">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {locale === "ar" ? "رسائل اتصل بنا" : "Contact Messages"}
          </h1>
          <p className="text-white/70 mt-1">
            {locale === "ar"
              ? "إدارة رسائل العملاء"
              : "Manage customer messages"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <Input
            type="text"
            placeholder={
              locale === "ar" ? "بحث في الرسائل..." : "Search messages..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterRead === undefined ? "default" : "outline"}
            onClick={() => setFilterRead(undefined)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            {locale === "ar" ? "الكل" : "All"}
          </Button>
          <Button
            variant={filterRead === false ? "default" : "outline"}
            onClick={() => setFilterRead(false)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            {locale === "ar" ? "غير مقروءة" : "Unread"}
          </Button>
          <Button
            variant={filterRead === true ? "default" : "outline"}
            onClick={() => setFilterRead(true)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            {locale === "ar" ? "مقروءة" : "Read"}
          </Button>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12 text-white/70">
          {locale === "ar" ? "لا توجد رسائل" : "No messages found"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message._id}
              className={`rounded-2xl border p-6 transition-all ${
                message.read
                  ? "bg-white/5 border-white/10"
                  : "bg-primary/10 border-primary/30 shadow-lg shadow-primary/10"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {message.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Mail className="w-4 h-4" />
                          <span>{message.email}</span>
                        </div>
                      </div>
                    </div>
                    {!message.read && (
                      <span className="px-2 py-1 rounded-full bg-primary text-black text-xs font-semibold">
                        {locale === "ar" ? "جديد" : "New"}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  {message.phone && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Phone className="w-4 h-4" />
                      <span>{message.phone}</span>
                    </div>
                  )}

                  {/* Message */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/90 whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!message.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(message._id)}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(message._id)}
                    className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            {locale === "ar" ? "السابق" : "Previous"}
          </Button>
          <span className="text-white/70">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            {locale === "ar" ? "التالي" : "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}
