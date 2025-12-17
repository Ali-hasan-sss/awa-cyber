"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuotes, QuotationRequest } from "@/contexts/QuoteContext";
import { useServices } from "@/contexts/ServiceContext";
import { QuotationStatus } from "@/lib/actions/quoteActions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Plus,
  RefreshCw,
  DollarSign,
  CalendarDays,
  Clock5,
  Layers,
  Building2,
  Mail,
  Phone,
  Search,
  UserPlus,
  Eye,
  X,
  MoreVertical,
} from "lucide-react";

const glassPanel =
  "rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl";
const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

const statusTokens = {
  pending: "bg-amber-500/15 text-amber-200 border border-amber-500/30",
  in_review: "bg-blue-500/15 text-blue-200 border border-blue-500/30",
  quoted: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30",
  closed: "bg-slate-500/15 text-slate-200 border border-slate-500/30",
} as const;

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  serviceId: "",
  projectDescription: "",
  budgetFrom: "",
  budgetTo: "",
  expectedDuration: "",
  startDate: "",
  endDate: "",
  additionalInfo: "",
};

const statusOptions = [
  { value: "", label: { en: "All statuses", ar: "كل الحالات" } },
  { value: "pending", label: { en: "Pending", ar: "قيد الانتظار" } },
  { value: "in_review", label: { en: "In review", ar: "قيد المراجعة" } },
  { value: "quoted", label: { en: "Quoted", ar: "تم إرسال عرض" } },
  { value: "closed", label: { en: "Closed", ar: "مغلق" } },
];

const statusLabels = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  in_review: { en: "In review", ar: "قيد المراجعة" },
  quoted: { en: "Quoted", ar: "تم إرسال عرض" },
  closed: { en: "Closed", ar: "مغلق" },
} as const;

const formatDate = (value?: string, isArabic?: boolean) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const locale = isArabic ? "ar-EG-u-ca-gregory" : "en-US";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function QuotationsPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const router = useRouter();
  const {
    requests,
    loading,
    error,
    pagination,
    fetchQuotationRequests,
    createQuotationRequest,
    updateQuotationRequestStatus,
  } = useQuotes();
  const { services, fetchServices } = useServices();
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "">("");
  const [selectedRequest, setSelectedRequest] =
    useState<QuotationRequest | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);
  const [statusMenuPosition, setStatusMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetchQuotationRequests({ page: 1, limit: 10 });
    fetchServices();
  }, [fetchQuotationRequests, fetchServices]);

  const getServiceName = (serviceId: string): string => {
    const service = services.find((s) => s._id === serviceId);
    if (!service) return serviceId; // Fallback to ID if service not found
    return isArabic ? service.title.ar : service.title.en;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // fullName: min 3 characters
    if (!form.fullName.trim()) {
      errors.fullName = isArabic
        ? "الاسم الكامل مطلوب"
        : "Full name is required";
    } else if (form.fullName.trim().length < 3) {
      errors.fullName = isArabic
        ? "الاسم يجب أن يكون 3 أحرف على الأقل"
        : "Full name must be at least 3 characters";
    }

    // email: valid email
    if (!form.email.trim()) {
      errors.email = isArabic ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errors.email = isArabic
          ? "البريد الإلكتروني غير صحيح"
          : "Invalid email address";
      }
    }

    // phone: min 6 characters
    if (!form.phone.trim()) {
      errors.phone = isArabic ? "رقم الهاتف مطلوب" : "Phone number is required";
    } else if (form.phone.trim().length < 6) {
      errors.phone = isArabic
        ? "رقم الهاتف يجب أن يكون 6 أحرف على الأقل"
        : "Phone number must be at least 6 characters";
    }

    // companyName: min 2 characters if provided (optional)
    if (
      form.companyName &&
      form.companyName.trim().length > 0 &&
      form.companyName.trim().length < 2
    ) {
      errors.companyName = isArabic
        ? "اسم الشركة يجب أن يكون حرفين على الأقل"
        : "Company name must be at least 2 characters";
    }

    // serviceId: min 1 character (required)
    if (!form.serviceId.trim()) {
      errors.serviceId = isArabic ? "الخدمة مطلوبة" : "Service is required";
    }

    // projectDescription: min 10 characters
    if (!form.projectDescription.trim()) {
      errors.projectDescription = isArabic
        ? "وصف المشروع مطلوب"
        : "Project description is required";
    } else if (form.projectDescription.trim().length < 10) {
      errors.projectDescription = isArabic
        ? "وصف المشروع يجب أن يكون 10 أحرف على الأقل"
        : "Project description must be at least 10 characters";
    }

    // budget: from and to must be non-negative, and to >= from
    if (!form.budgetFrom || !form.budgetTo) {
      if (!form.budgetFrom) {
        errors.budgetFrom = isArabic
          ? "بداية الميزانية مطلوبة"
          : "Budget from is required";
      }
      if (!form.budgetTo) {
        errors.budgetTo = isArabic
          ? "نهاية الميزانية مطلوبة"
          : "Budget to is required";
      }
    } else {
      const from = Number(form.budgetFrom);
      const to = Number(form.budgetTo);
      if (from < 0) {
        errors.budgetFrom = isArabic
          ? "الميزانية يجب أن تكون أكبر من أو تساوي صفر"
          : "Budget must be non-negative";
      }
      if (to < 0) {
        errors.budgetTo = isArabic
          ? "الميزانية يجب أن تكون أكبر من أو تساوي صفر"
          : "Budget must be non-negative";
      }
      if (to < from) {
        errors.budgetTo = isArabic
          ? "نهاية الميزانية يجب أن تكون أكبر من أو تساوي البداية"
          : "Budget 'to' must be greater than or equal to 'from'";
      }
    }

    // expectedDuration: min 2 characters
    if (!form.expectedDuration.trim()) {
      errors.expectedDuration = isArabic
        ? "مدة التنفيذ المتوقعة مطلوبة"
        : "Expected duration is required";
    } else if (form.expectedDuration.trim().length < 2) {
      errors.expectedDuration = isArabic
        ? "مدة التنفيذ يجب أن تكون حرفين على الأقل"
        : "Expected duration must be at least 2 characters";
    }

    // startDate: valid date
    if (!form.startDate) {
      errors.startDate = isArabic
        ? "تاريخ البدء مطلوب"
        : "Start date is required";
    } else {
      const startDate = new Date(form.startDate);
      if (Number.isNaN(startDate.getTime())) {
        errors.startDate = isArabic
          ? "تاريخ البدء غير صحيح"
          : "Invalid start date";
      }
    }

    // endDate: valid date, must be after startDate
    if (!form.endDate) {
      errors.endDate = isArabic
        ? "تاريخ الانتهاء مطلوب"
        : "End date is required";
    } else {
      const endDate = new Date(form.endDate);
      if (Number.isNaN(endDate.getTime())) {
        errors.endDate = isArabic
          ? "تاريخ الانتهاء غير صحيح"
          : "Invalid end date";
      } else if (form.startDate) {
        const startDate = new Date(form.startDate);
        if (endDate.getTime() < startDate.getTime()) {
          errors.endDate = isArabic
            ? "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"
            : "End date must be after start date";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createQuotationRequest({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        companyName: form.companyName?.trim() || undefined,
        serviceId: form.serviceId.trim(),
        projectDescription: form.projectDescription.trim(),
        budget: {
          from: Number(form.budgetFrom),
          to: Number(form.budgetTo),
        },
        expectedDuration: form.expectedDuration.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        additionalInfo: form.additionalInfo?.trim() || undefined,
      });
      setForm(initialForm);
      setFormErrors({});
      setFormModalOpen(false);
      fetchQuotationRequests({
        page: 1,
        limit: 10,
        search: searchQuery || undefined,
        status: statusFilter ? statusFilter : undefined,
      });
    } catch (error: any) {
      // Error handled by context
      console.error("Failed to create quotation request:", error);
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchQuotationRequests({
      page: 1,
      limit: 10,
      search: searchQuery || undefined,
      status: statusFilter ? statusFilter : undefined,
    });
  };

  const handlePageChange = (page: number) => {
    fetchQuotationRequests({
      page,
      limit: pagination?.limit || 10,
      search: searchQuery || undefined,
      status: statusFilter ? statusFilter : undefined,
    });
  };

  const totalValue = useMemo(() => {
    return requests.reduce((acc, item) => acc + (item.budget?.to || 0), 0);
  }, [requests]);

  const copy = {
    title: isArabic ? "طلبات عرض السعر" : "Quotation Requests",
    subtitle: isArabic
      ? "تابع طلبات العملاء واعرض التفاصيل لإنشاء عروض دقيقة."
      : "Track inbound quote requests and capture the context needed to respond.",
    formTitle: isArabic ? "إضافة طلب جديد" : "Create new request",
    overviewTitle: isArabic ? "نظرة سريعة" : "Quick snapshot",
    formHint: isArabic
      ? "استخدم هذا النموذج لإدخال طلبات العملاء التي تصلك عبر القنوات المختلفة."
      : "Use this form to log client discovery calls or inbound inquiries in one place.",
    tableHeading: isArabic ? "سجل الطلبات" : "Requests log",
    budgetLabel: isArabic ? "الميزانية المتوقعة" : "Budget range",
    timelineLabel: isArabic ? "الجدول الزمني" : "Timeline",
    serviceLabel: isArabic ? "الخدمة" : "Service",
  };

  const statusActions = [
    {
      value: "in_review",
      label: { en: "Mark In Review", ar: "تعيين قيد المراجعة" },
    },
    {
      value: "quoted",
      label: { en: "Mark Quoted", ar: "تم إرسال العرض" },
    },
    {
      value: "closed",
      label: { en: "Mark Closed", ar: "تعيين كملغى" },
    },
  ] as const;

  useEffect(() => {
    if (!statusMenuOpenId) return;
    const handleDocumentClick = () => {
      setStatusMenuOpenId(null);
      setStatusMenuPosition(null);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [statusMenuOpenId]);

  const handleStatusChange = async (
    requestId: string,
    status: QuotationStatus
  ) => {
    await updateQuotationRequestStatus(requestId, status);
    setStatusMenuOpenId(null);
    setStatusMenuPosition(null);
  };

  const openStatusMenu = (requestId: string, target: HTMLElement) => {
    setStatusMenuOpenId((prev) => {
      if (prev === requestId) {
        setStatusMenuPosition(null);
        return null;
      }
      const rect = target.getBoundingClientRect();
      const menuWidth = 220;
      const margin = 16;
      let x =
        locale === "ar"
          ? rect.left + window.scrollX
          : rect.right + window.scrollX - menuWidth;
      const viewportWidth = window.innerWidth;
      if (x + menuWidth > viewportWidth - margin) {
        x = viewportWidth - margin - menuWidth;
      }
      if (x < margin) {
        x = margin;
      }
      const y = rect.bottom + window.scrollY + 8;
      setStatusMenuPosition({ x, y });
      return requestId;
    });
  };

  const handleViewDetails = (request: QuotationRequest) => {
    setSelectedRequest(request);
  };

  const handlePrefillUser = (request: QuotationRequest) => {
    const params = new URLSearchParams({
      prefillName: request.fullName || "",
      prefillEmail: request.email || "",
      prefillPhone: request.phone || "",
      prefillCompany: request.companyName || "",
    });
    router.push(`/admin/dashboard/users?${params.toString()}`);
  };

  return (
    <div className="space-y-8 text-slate-100">
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <ClipboardList className="h-9 w-9 text-primary" />
          {copy.title}
        </h1>
        <p className="text-slate-300">{copy.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${glassPanel} flex flex-col gap-4 p-6`}>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              {copy.formTitle}
            </p>
            <p className="text-sm text-slate-400">{copy.formHint}</p>
          </div>
          <Button
            type="button"
            className="self-start rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
            onClick={() => setFormModalOpen(true)}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Plus className="h-4 w-4" />
              {isArabic ? "إضافة طلب" : "New request"}
            </div>
          </Button>
        </div>

        <div className={`${glassPanel} space-y-4 p-6`}>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-white">
                {copy.overviewTitle}
              </p>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? "قيمة تقريبية لآخر الطلبات المسجلة"
                  : "Latest pipeline snapshot based on logged requests"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <DollarSign className="h-4 w-4 text-primary" />
                {copy.budgetLabel}
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {new Intl.NumberFormat(undefined, {
                  maximumFractionDigits: 0,
                }).format(totalValue || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <Clock5 className="h-4 w-4 text-primary" />
                {copy.timelineLabel}
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {requests[0]?.expectedDuration || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <form
            onSubmit={handleSubmit}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {copy.formTitle}
                </p>
                <p className="text-sm text-slate-400">{copy.formHint}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/70 hover:bg-white/10"
                onClick={() => {
                  setFormModalOpen(false);
                  setForm(initialForm);
                  setFormErrors({});
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {Object.keys(formErrors).length > 0 && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <p className="font-semibold mb-2">
                  {isArabic
                    ? "يرجى تصحيح الأخطاء التالية:"
                    : "Please fix the following errors:"}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {Object.values(formErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.fullName ? "border-red-400/60" : ""
                  }`}
                  placeholder={isArabic ? "الاسم الكامل" : "Full name"}
                  required
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.fullName}
                  </p>
                )}
              </div>
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.email ? "border-red-400/60" : ""
                  }`}
                  placeholder="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.phone ? "border-red-400/60" : ""
                  }`}
                  placeholder={isArabic ? "رقم الهاتف" : "Phone number"}
                  required
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.companyName ? "border-red-400/60" : ""
                  }`}
                  placeholder={
                    isArabic ? "اسم الشركة (اختياري)" : "Company (optional)"
                  }
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                />
                {formErrors.companyName && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.companyName}
                  </p>
                )}
              </div>
              <div>
                <select
                  className={`${inputStyles} ${
                    formErrors.serviceId ? "border-red-400/60" : ""
                  }`}
                  required
                  value={form.serviceId}
                  onChange={(e) => handleChange("serviceId", e.target.value)}
                >
                  <option value="" className="bg-slate-900 text-white">
                    {isArabic ? "اختر الخدمة" : "Select service"}
                  </option>
                  {services.map((service) => (
                    <option
                      key={service._id}
                      value={service._id}
                      className="bg-slate-900 text-white"
                    >
                      {isArabic ? service.title.ar : service.title.en}
                    </option>
                  ))}
                </select>
                {formErrors.serviceId && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.serviceId}
                  </p>
                )}
              </div>
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.expectedDuration ? "border-red-400/60" : ""
                  }`}
                  placeholder={
                    isArabic
                      ? "مدة التنفيذ المتوقعة"
                      : "Expected duration (e.g. 6 weeks)"
                  }
                  required
                  value={form.expectedDuration}
                  onChange={(e) =>
                    handleChange("expectedDuration", e.target.value)
                  }
                />
                {formErrors.expectedDuration && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.expectedDuration}
                  </p>
                )}
              </div>
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.budgetFrom ? "border-red-400/60" : ""
                  }`}
                  placeholder={isArabic ? "بداية الميزانية" : "Budget from"}
                  type="number"
                  min={0}
                  required
                  value={form.budgetFrom}
                  onChange={(e) => handleChange("budgetFrom", e.target.value)}
                />
                {formErrors.budgetFrom && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.budgetFrom}
                  </p>
                )}
              </div>
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.budgetTo ? "border-red-400/60" : ""
                  }`}
                  placeholder={isArabic ? "نهاية الميزانية" : "Budget to"}
                  type="number"
                  min={0}
                  required
                  value={form.budgetTo}
                  onChange={(e) => handleChange("budgetTo", e.target.value)}
                />
                {formErrors.budgetTo && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.budgetTo}
                  </p>
                )}
              </div>
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.startDate ? "border-red-400/60" : ""
                  }`}
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
                {formErrors.startDate && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.startDate}
                  </p>
                )}
              </div>
              <div>
                <Input
                  className={`${inputStyles} ${
                    formErrors.endDate ? "border-red-400/60" : ""
                  }`}
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
                {formErrors.endDate && (
                  <p className="mt-1 text-xs text-red-300">
                    {formErrors.endDate}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Textarea
                className={`${inputStyles} min-h-[120px] ${
                  formErrors.projectDescription ? "border-red-400/60" : ""
                }`}
                placeholder={
                  isArabic
                    ? "وصف المشروع"
                    : "Project description & success criteria"
                }
                required
                value={form.projectDescription}
                onChange={(e) =>
                  handleChange("projectDescription", e.target.value)
                }
              />
              {formErrors.projectDescription && (
                <p className="mt-1 text-xs text-red-300">
                  {formErrors.projectDescription}
                </p>
              )}
            </div>
            <div>
              <Textarea
                className={`${inputStyles} min-h-[100px]`}
                placeholder={
                  isArabic
                    ? "معلومات إضافية (اختياري)"
                    : "Additional context (optional)"
                }
                value={form.additionalInfo}
                onChange={(e) => handleChange("additionalInfo", e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
                onClick={() => setFormModalOpen(false)}
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full bg-gradient-to-r from-primary to-cyan-400 px-6 text-slate-950 shadow-lg"
              >
                {isArabic ? "حفظ الطلب" : "Log request"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className={`${glassPanel} space-y-4 p-6`}>
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 ltr:left-3 rtl:right-3" />
            <Input
              className={`${inputStyles} ltr:pl-10 rtl:pr-10`}
              placeholder={
                isArabic
                  ? "ابحث بالاسم أو البريد..."
                  : "Search by name or email..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={`${inputStyles} sm:w-48`}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as QuotationStatus | "")
            }
          >
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-900 text-slate-100"
              >
                {option.label[locale]}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-primary to-cyan-400 text-slate-950 shadow-lg sm:w-auto sm:px-6"
          >
            {isArabic ? "بحث" : "Apply"}
          </Button>
        </form>

        {error && (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.3em] text-white/50">
              <tr>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "العميل" : "Client"}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {copy.serviceLabel}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {copy.budgetLabel}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {copy.timelineLabel}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "الحالة" : "Status"}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "التواريخ" : "Dates"}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/90">
              {requests.map((request) => (
                <tr key={request._id}>
                  <td className="py-3">
                    <div className="font-semibold text-white">
                      {request.fullName}
                    </div>
                    <div className="text-xs text-white/60">{request.email}</div>
                    <div className="text-xs text-white/60">{request.phone}</div>
                  </td>
                  <td className="py-3">
                    <p className="text-white">
                      {getServiceName(request.serviceId)}
                    </p>
                    {request.companyName && (
                      <span className="text-xs text-white/60">
                        {request.companyName}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {new Intl.NumberFormat().format(request.budget?.from || 0)}{" "}
                    - {new Intl.NumberFormat().format(request.budget?.to || 0)}
                  </td>
                  <td className="py-3">{request.expectedDuration}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.35em] ${
                        statusTokens[request.status]
                      }`}
                    >
                      {statusLabels[request.status][locale]}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="text-xs text-white/80">
                      {formatDate(request.startDate, isArabic)} →{" "}
                      {formatDate(request.endDate, isArabic)}
                    </div>
                    <div className="text-xs text-white/40">
                      {formatDate(request.createdAt, isArabic)}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-xs">
                          {isArabic ? "تفاصيل" : "Details"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-primary/40 text-primary hover:bg-primary/10"
                        onClick={() => handlePrefillUser(request)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="text-xs">
                          {isArabic ? "إضافة مستخدم" : "Add user"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-primary hover:bg-white/10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          openStatusMenu(
                            request._id,
                            e.currentTarget as HTMLElement
                          );
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 md:hidden">
          {requests.map((request) => (
            <div
              key={request._id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{request.fullName}</p>
                  <p className="text-xs text-white/60">{request.email}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
                    statusTokens[request.status]
                  }`}
                >
                  {statusLabels[request.status][locale]}
                </span>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{request.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{request.email}</span>
                </div>
                {request.companyName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{request.companyName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>{getServiceName(request.serviceId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span>
                    {new Intl.NumberFormat().format(request.budget?.from || 0)}{" "}
                    - {new Intl.NumberFormat().format(request.budget?.to || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>
                    {formatDate(request.startDate, isArabic)} →{" "}
                    {formatDate(request.endDate, isArabic)}
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  {request.projectDescription
                    ? request.projectDescription.slice(0, 140) +
                      (request.projectDescription.length > 140 ? "..." : "")
                    : "-"}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      {isArabic ? "تفاصيل" : "Details"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-primary/40 text-primary hover:bg-primary/10"
                    onClick={() => handlePrefillUser(request)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      {isArabic ? "إضافة مستخدم" : "Add user"}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-primary hover:bg-white/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      openStatusMenu(
                        request._id,
                        e.currentTarget as HTMLElement
                      );
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && requests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 p-6 text-center text-sm text-white/60">
            {isArabic ? "لا توجد طلبات حتى الآن." : "No requests captured yet."}
          </div>
        )}

        {loading && (
          <p className="text-center text-sm text-white/70">
            {isArabic ? "جاري التحميل..." : "Loading..."}
          </p>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
            <div>
              {isArabic ? (
                <>
                  عرض {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  من {pagination.total}
                </>
              ) : (
                <>
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page === 1 || loading}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
              >
                {isArabic ? "السابق" : "Prev"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages || loading}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
              >
                {isArabic ? "التالي" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040813] via-[#050b19] to-[#01030a] p-6 text-white shadow-[0_35px_120px_rgba(0,0,0,0.8)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {isArabic ? "تفاصيل الطلب" : "Quotation details"}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {selectedRequest.fullName}
                </h3>
                <p className="text-sm text-white/60">
                  {formatDate(selectedRequest.createdAt, isArabic)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => handlePrefillUser(selectedRequest)}
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="text-xs">
                    {isArabic ? "إنشاء مستخدم" : "Create user"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:bg-white/10"
                  onClick={() => setSelectedRequest(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <DetailsField
                label={isArabic ? "البريد" : "Email"}
                value={selectedRequest.email}
              />
              <DetailsField
                label={isArabic ? "الهاتف" : "Phone"}
                value={selectedRequest.phone}
              />
              {selectedRequest.companyName && (
                <DetailsField
                  label={isArabic ? "الشركة" : "Company"}
                  value={selectedRequest.companyName}
                />
              )}
              <DetailsField
                label={copy.serviceLabel}
                value={getServiceName(selectedRequest.serviceId)}
              />
              <DetailsField
                label={copy.budgetLabel}
                value={`${new Intl.NumberFormat().format(
                  selectedRequest.budget?.from || 0
                )} - ${new Intl.NumberFormat().format(
                  selectedRequest.budget?.to || 0
                )}`}
              />
              <DetailsField
                label={copy.timelineLabel}
                value={`${formatDate(selectedRequest.startDate)} → ${formatDate(
                  selectedRequest.endDate
                )} • ${selectedRequest.expectedDuration}`}
              />
            </div>

            <div className="mt-6 space-y-4">
              <DetailsField
                label={isArabic ? "وصف المشروع" : "Project description"}
                value={selectedRequest.projectDescription}
                fullWidth
              />
              {selectedRequest.additionalInfo && (
                <DetailsField
                  label={isArabic ? "معلومات إضافية" : "Additional info"}
                  value={selectedRequest.additionalInfo}
                  fullWidth
                />
              )}
            </div>
          </div>
        </div>
      )}

      {statusMenuOpenId &&
        statusMenuPosition &&
        createPortal(
          <div
            className="fixed inset-0 z-[70]"
            onClick={() => {
              setStatusMenuOpenId(null);
              setStatusMenuPosition(null);
            }}
          >
            <div
              className="absolute z-[71] w-56 rounded-2xl border border-white/10 bg-[#050b19] p-2 shadow-2xl"
              style={{
                top: statusMenuPosition.y,
                left: statusMenuPosition.x,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {statusActions.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10"
                  onClick={() =>
                    statusMenuOpenId &&
                    handleStatusChange(
                      statusMenuOpenId,
                      action.value as QuotationStatus
                    )
                  }
                >
                  {action.label[locale]}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function DetailsField({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value?: string;
  fullWidth?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <p className="text-xs uppercase tracking-[0.35em] text-white/40">
        {label}
      </p>
      <p className="mt-1 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/90">
        {value}
      </p>
    </div>
  );
}
