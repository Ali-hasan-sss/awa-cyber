"use client";

import { useEffect, useState, useRef } from "react";
import {
  Pencil,
  Plus,
  Send,
  AlertCircle,
  FileText,
  Loader2,
  X,
  CheckCircle,
  Clock,
  DollarSign,
  Paperclip,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Menu,
  Download,
  Mic,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useProjects,
  AdminModification,
  ModificationFile,
} from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import VoiceRecorder from "@/components/ui/VoiceRecorder";
import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config/api";

interface ModificationsProps {
  projectId: string;
  refreshKey?: number;
}

const formatDate = (date: string, isArabic: boolean) => {
  const dateObj = new Date(date);
  // Force Gregorian calendar by using English locale for Arabic
  const locale = isArabic ? "ar-EG-u-ca-gregory" : "en-US";
  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusBadge = (status: string, isArabic: boolean) => {
  const statusMap: Record<
    string,
    { text: string; className: string; icon: any; borderColor: string }
  > = {
    pending: {
      text: isArabic ? "قيد المراجعة" : "Under Review",
      className: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      borderColor: "border-gray-200",
    },
    accepted: {
      text: isArabic ? "موافق عليه" : "Approved",
      className: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
      borderColor: "border-primary",
    },
    rejected: {
      text: isArabic ? "مرفوض" : "Rejected",
      className: "bg-red-100 text-red-800",
      icon: XCircle,
      borderColor: "border-red-300",
    },
    completed: {
      text: isArabic ? "مكتمل" : "Completed",
      className: "bg-green-100 text-green-800",
      icon: CheckCircle2,
      borderColor: "border-gray-200",
    },
    needs_extra_payment: {
      text: isArabic ? "يتطلب دفع إضافي" : "Requires Additional Payment",
      className: "bg-orange-100 text-orange-800",
      icon: DollarSign,
      borderColor: "border-orange-400",
    },
  };
  return statusMap[status] || statusMap.pending;
};

export default function Modifications({
  projectId,
  refreshKey,
}: ModificationsProps) {
  const { locale, messages } = useLanguage();
  const isArabic = locale === "ar";
  const { createModification, getProject, updateModification } = useProjects();
  const [modifications, setModifications] = useState<AdminModification[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "low" as "low" | "medium" | "high" | "critical",
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [voiceRecording, setVoiceRecording] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = messages.portalModifications || {};

  useEffect(() => {
    loadModifications();
  }, [projectId, refreshKey]);

  const loadModifications = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const project = await getProject(projectId);
      if (project && project.modifications) {
        const mods = project.modifications;
        // Check if modifications is an array of objects (AdminModification) or strings (IDs)
        if (Array.isArray(mods) && mods.length > 0) {
          // If first element is a string, it's an array of IDs, so return empty array
          // Otherwise, it's an array of AdminModification objects
          const isModificationObjects =
            typeof mods[0] === "object" && mods[0] !== null && "_id" in mods[0];
          setModifications(
            isModificationObjects ? (mods as AdminModification[]) : []
          );
        } else {
          setModifications([]);
        }
      } else {
        setModifications([]);
      }
    } catch (err) {
      console.error("Failed to load modifications:", err);
      setModifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Limit to 5 files maximum
      if (attachedFiles.length + newFiles.length > 5) {
        alert(
          isArabic
            ? "يمكنك رفع حتى 5 ملفات فقط"
            : "You can upload up to 5 files only"
        );
        const remainingSlots = 5 - attachedFiles.length;
        setAttachedFiles([
          ...attachedFiles,
          ...newFiles.slice(0, remainingSlots),
        ]);
      } else {
        setAttachedFiles([...attachedFiles, ...newFiles]);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      alert(
        isArabic
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }

    setSubmitting(true);
    try {
      // Upload files if any
      const fileUrls: ModificationFile[] = [];
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await apiClient.post(
              `${API_BASE_URL}/api/upload`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            const fileUrl =
              uploadResponse.data.url || uploadResponse.data.data?.url;
            if (fileUrl) {
              fileUrls.push({
                url: fileUrl,
                fileName: file.name,
                fileType: file.type || "application/octet-stream",
                fileSize: file.size,
              });
            }
          } catch (fileErr: any) {
            console.error("Failed to upload file:", fileErr);
            alert(
              isArabic
                ? `فشل رفع الملف: ${file.name}`
                : `Failed to upload file: ${file.name}`
            );
            throw fileErr;
          }
        }
      }

      // Upload voice recording if any - send as separate audioMessageUrl field
      let audioMessageUrl: string | undefined = undefined;
      if (voiceRecording) {
        try {
          // Use consistent naming format for voice recordings
          const timestamp = Date.now();
          const voiceFileName = `voice-recording-${timestamp}.webm`;
          const voiceFileType = "audio/webm";

          const audioFile = new File([voiceRecording], voiceFileName, {
            type: voiceFileType,
          });
          const formData = new FormData();
          formData.append("file", audioFile);

          const uploadResponse = await apiClient.post(
            `${API_BASE_URL}/api/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const fileUrl =
            uploadResponse.data.url || uploadResponse.data.data?.url;
          if (fileUrl) {
            // Store as audioMessageUrl instead of adding to attachedFiles
            audioMessageUrl = fileUrl;
            console.log("Voice recording uploaded:", {
              url: fileUrl,
              fileName: voiceFileName,
              fileType: voiceFileType,
            });
          } else {
            console.error("No file URL returned from upload");
          }
        } catch (audioErr: any) {
          console.error("Failed to upload voice recording:", audioErr);
          alert(
            isArabic
              ? "فشل رفع التسجيل الصوتي"
              : "Failed to upload voice recording"
          );
          throw audioErr;
        }
      }

      // Create modification with attached files and audio message
      // Don't send userId - backend will get it from project
      const modificationData = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        projectId,
        status: "pending" as const,
        attachedFiles: fileUrls.length > 0 ? fileUrls : undefined,
        audioMessageUrl: audioMessageUrl, // Send voice recording as separate field
      };

      console.log("Creating modification:", modificationData);

      await createModification(modificationData);

      // Reset form
      setForm({
        title: "",
        description: "",
        priority: "low",
      });
      setAttachedFiles([]);
      setVoiceRecording(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Reload modifications without full page reload
      await loadModifications();
    } catch (err: any) {
      console.error("Failed to create modification:", err);
      alert(
        err?.response?.data?.message ||
          (isArabic
            ? "فشل إرسال طلب التعديل"
            : "Failed to submit modification request")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptExtraPayment = async (modId: string) => {
    try {
      await updateModification(modId, {
        costAccepted: true,
        status: "accepted",
      });
      await loadModifications();
    } catch (err) {
      console.error("Failed to accept extra payment:", err);
    }
  };

  const handleRejectExtraPayment = async (modId: string) => {
    if (
      !confirm(
        isArabic
          ? "هل أنت متأكد من رفض هذا التعديل؟"
          : "Are you sure you want to reject this modification?"
      )
    ) {
      return;
    }
    try {
      await updateModification(modId, {
        status: "rejected",
      });
      await loadModifications();
    } catch (err) {
      console.error("Failed to reject modification:", err);
    }
  };

  return (
    <section id="modifications" className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 space-y-2 ${isArabic ? "rtl" : "ltr"}`}
        >
          <div className="flex items-center justify-center gap-3">
            <Pencil className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t.title ||
                (isArabic ? "طلبات التعديل" : "Modification Requests")}
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-primary rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-gray-900 flex-shrink-0" />
            <p className="text-gray-900 font-medium">
              {t.freeModificationsInfo ||
                (isArabic
                  ? "التعديلات المجانية متاحة خلال أول 10 أيام فقط"
                  : "Free modifications are available within the first 10 days only")}
            </p>
          </div>

          {/* New Modification Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-md">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isArabic ? "rtl flex-row-reverse" : "ltr"
              }`}
            >
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-900">
                {t.newRequest ||
                  (isArabic ? "طلب تعديل جديد" : "New Modification Request")}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.modificationTitle ||
                    (isArabic ? "عنوان التعديل" : "Modification Title")}
                </label>
                <Input
                  type="text"
                  placeholder={
                    t.titlePlaceholder ||
                    (isArabic
                      ? "مثال: تغيير ألوان الصفحة الرئيسية"
                      : "Example: Change homepage colors")
                  }
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.modificationDescription ||
                    (isArabic ? "وصف التعديل" : "Modification Description")}
                </label>
                <Textarea
                  placeholder={
                    t.descriptionPlaceholder ||
                    (isArabic
                      ? "اشرح التعديل المطلوب بالتفصيل....."
                      : "Explain the required modification in detail.....")
                  }
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={6}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.priority || (isArabic ? "الأولوية" : "Priority")}
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: e.target.value as typeof form.priority,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="low">{isArabic ? "منخفضة" : "Low"}</option>
                  <option value="medium">
                    {isArabic ? "متوسطة" : "Medium"}
                  </option>
                  <option value="high">{isArabic ? "عالية" : "High"}</option>
                  <option value="critical">
                    {isArabic ? "حرجة" : "Critical"}
                  </option>
                </select>
              </div>

              {/* Voice Recording */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {isArabic
                    ? "تسجيل صوتي (اختياري)"
                    : "Voice Recording (Optional)"}
                </label>
                <VoiceRecorder
                  onRecordingComplete={(blob) => setVoiceRecording(blob)}
                  onRecordingRemove={() => setVoiceRecording(null)}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.uploadFiles ||
                    (isArabic
                      ? "رفع ملفات مرفقة (اختياري)"
                      : "Upload attached files (optional)")}
                </label>
                <div
                  className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-gray-50 ${
                    isArabic ? "rtl" : "ltr"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.zip"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {t.dragDropFiles ||
                        (isArabic
                          ? "اسحب الملفات هنا أو انقر للتصفح"
                          : "Drag files here or click to browse")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.supportedFormats ||
                        (isArabic
                          ? "PDF, JPG, PNG, ZIP (الحد الأقصى 5 ملفات)"
                          : "PDF, JPG, PNG, ZIP (Maximum 5 files)")}
                    </p>
                    {attachedFiles.length > 0 && (
                      <p className="text-xs text-primary font-semibold">
                        {isArabic
                          ? `${attachedFiles.length} / 5 ملفات`
                          : `${attachedFiles.length} / 5 files`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected Files */}
                {attachedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                      >
                        <span className="text-sm text-gray-700 truncate flex-1">
                          {file.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-black shadow-lg hover:bg-primary/90 rounded-xl py-3 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ltr:mr-2 rtl:ml-2" />
                    {isArabic ? "جاري الإرسال..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                    {t.submitRequest ||
                      (isArabic
                        ? "إرسال طلب التعديل"
                        : "Send Modification Request")}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Previous Modifications */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div
              className={`flex items-center justify-between mb-6 ${
                isArabic ? "rtl flex-row-reverse" : "ltr"
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900">
                {t.previousRequests ||
                  (isArabic
                    ? "طلبات التعديل السابقة"
                    : "Previous Modification Requests")}
              </h3>
              <Menu className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {modifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {t.noModifications ||
                    (isArabic
                      ? "لا توجد طلبات تعديل"
                      : "No modification requests")}
                </p>
              ) : (
                modifications.map((mod) => {
                  const statusBadge = getStatusBadge(mod.status, isArabic);
                  const StatusIcon = statusBadge.icon;
                  const userName =
                    typeof mod.userId === "object" && mod.userId
                      ? mod.userId.name
                      : "";

                  return (
                    <div
                      key={mod._id}
                      className={`bg-white rounded-xl border-2 ${statusBadge.borderColor} p-6 shadow-sm`}
                    >
                      <div
                        className={`flex items-start justify-between mb-4 ${
                          isArabic ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {mod.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            {mod.description}
                          </p>
                          <div
                            className={`flex items-center gap-4 text-xs text-gray-500 flex-wrap ${
                              isArabic ? "rtl" : "ltr"
                            }`}
                          >
                            <span>{formatDate(mod.createdAt, isArabic)}</span>
                            {userName && <span>{userName}</span>}
                            {mod.priority && (
                              <span>
                                {mod.priority === "low"
                                  ? isArabic
                                    ? "منخفضة"
                                    : "Low"
                                  : mod.priority === "medium"
                                  ? isArabic
                                    ? "متوسطة"
                                    : "Medium"
                                  : mod.priority === "high"
                                  ? isArabic
                                    ? "عالية"
                                    : "High"
                                  : isArabic
                                  ? "عاجلة"
                                  : "Urgent"}
                              </span>
                            )}
                            {mod.attachedFiles &&
                            mod.attachedFiles.length > 0 ? (
                              <span className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                {isArabic
                                  ? `${mod.attachedFiles.length} مرفق`
                                  : `${mod.attachedFiles.length} attachment${
                                      mod.attachedFiles.length > 1 ? "s" : ""
                                    }`}
                                {mod.attachedFiles.some(
                                  (f) =>
                                    f.fileType?.includes("audio") ||
                                    f.fileName?.includes("voice-recording")
                                ) && <Mic className="w-3 h-3 text-primary" />}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                {isArabic ? "لا توجد مرفقات" : "No attachments"}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusBadge.className}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusBadge.text}
                        </span>
                      </div>

                      {/* Attached Files */}
                      {mod.attachedFiles && mod.attachedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            {isArabic ? "الملفات المرفقة" : "Attached Files"}:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mod.attachedFiles.map((file, fileIndex) => {
                              const isAudio =
                                file.fileType?.includes("audio") ||
                                file.fileName?.includes("voice-recording");
                              return (
                                <a
                                  key={fileIndex}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition"
                                >
                                  {isAudio ? (
                                    <Mic className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Paperclip className="w-4 h-4 text-gray-600" />
                                  )}
                                  <span className="text-sm text-gray-700 truncate flex-1">
                                    {file.fileName}
                                  </span>
                                  <Download className="w-4 h-4 text-primary" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Progress Info for Accepted */}
                      {mod.status === "accepted" && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-800">
                            {isArabic
                              ? "جاري العمل على هذا التعديل، سيتم الانتهاء خلال يومين"
                              : "Work is underway on this modification, it will be completed within two days"}
                          </p>
                        </div>
                      )}

                      {/* Extra Payment Info */}
                      {mod.status === "needs_extra_payment" &&
                        mod.extraPaymentAmount &&
                        !mod.costAccepted && (
                          <div className="mt-4 space-y-3">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex items-start gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-semibold text-orange-900">
                                  {isArabic
                                    ? "هذا التعديل خارج نطاق العمل الأصلي"
                                    : "This modification is outside the original scope of work"}
                                </p>
                              </div>
                              <p className="text-sm text-orange-800 mr-7">
                                {isArabic
                                  ? `التكلفة المقدرة: ${mod.extraPaymentAmount.toLocaleString()} ريال | الوقت المتوقع: 5 أيام`
                                  : `Estimated cost: ${mod.extraPaymentAmount.toLocaleString()} SAR | Estimated time: 5 days`}
                              </p>
                            </div>
                            <div
                              className={`flex gap-3 ${
                                isArabic ? "flex-row-reverse" : ""
                              }`}
                            >
                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleRejectExtraPayment(mod._id)
                                }
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <XCircle className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                {isArabic ? "رفض" : "Reject"}
                              </Button>
                              <Button
                                onClick={() =>
                                  handleAcceptExtraPayment(mod._id)
                                }
                                className="flex-1 bg-orange-500 text-white hover:bg-orange-600 rounded-lg"
                              >
                                <CheckCircle2 className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                {isArabic
                                  ? "قبول وإضافة إلى الفاتورة"
                                  : "Accept and Add to Invoice"}
                              </Button>
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
