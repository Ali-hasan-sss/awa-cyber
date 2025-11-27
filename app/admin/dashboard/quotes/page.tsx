"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuotes } from "@/contexts/QuoteContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  FileText,
  Search,
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

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function QuotationsPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const {
    requests,
    loading,
    error,
    pagination,
    fetchQuotationRequests,
    createQuotationRequest,
  } = useQuotes();
  const [form, setForm] = useState(initialForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchQuotationRequests({ page: 1, limit: 10 });
  }, [fetchQuotationRequests]);

  const handleChange = (
    field: keyof typeof form,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.budgetFrom || !form.budgetTo) return;

    await createQuotationRequest({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      companyName: form.companyName || undefined,
      serviceId: form.serviceId,
      projectDescription: form.projectDescription,
      budget: {
        from: Number(form.budgetFrom),
        to: Number(form.budgetTo),
      },
      expectedDuration: form.expectedDuration,
      startDate: form.startDate,
      endDate: form.endDate,
      additionalInfo: form.additionalInfo || undefined,
    });
    setForm(initialForm);
    fetchQuotationRequests({ page: 1, limit: 10, search: searchQuery, status: statusFilter || undefined });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchQuotationRequests({
      page: 1,
      limit: 10,
      search: searchQuery || undefined,
      status: statusFilter || undefined,
    });
  };

  const handlePageChange = (page: number) => {
    fetchQuotationRequests({
      page,
      limit: pagination?.limit || 10,
      search: searchQuery || undefined,
      status: statusFilter || undefined,
    });
  };

  const totalValue = useMemo(() => {
    return requests.reduce(
      (acc, item) => acc + (item.budget?.to || 0),
      0
    );
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
        <form
          onSubmit={handleSubmit}
          className={`${glassPanel} space-y-5 p-6`}
        >
          <div className="flex items-center gap-2 text-white">
            <Plus className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">
              {copy.formTitle}
            </span>
          </div>
          <p className="text-sm text-slate-400">{copy.formHint}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              className={inputStyles}
              placeholder={isArabic ? "الاسم الكامل" : "Full name"}
              required
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            <Input
              className={inputStyles}
              placeholder="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <Input
              className={inputStyles}
              placeholder={isArabic ? "رقم الهاتف" : "Phone number"}
              required
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <Input
              className={inputStyles}
              placeholder={isArabic ? "اسم الشركة (اختياري)" : "Company (optional)"}
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
            <Input
              className={inputStyles}
              placeholder={isArabic ? "معرف الخدمة أو الرمز" : "Service reference / ID"}
              required
              value={form.serviceId}
              onChange={(e) => handleChange("serviceId", e.target.value)}
            />
            <Input
              className={inputStyles}
              placeholder={
                isArabic ? "مدة التنفيذ المتوقعة" : "Expected duration (e.g. 6 weeks)"
              }
              required
              value={form.expectedDuration}
              onChange={(e) => handleChange("expectedDuration", e.target.value)}
            />
            <Input
              className={inputStyles}
              placeholder={isArabic ? "بداية الميزانية" : "Budget from"}
              type="number"
              min={0}
              required
              value={form.budgetFrom}
              onChange={(e) => handleChange("budgetFrom", e.target.value)}
            />
            <Input
              className={inputStyles}
              placeholder={isArabic ? "نهاية الميزانية" : "Budget to"}
              type="number"
              min={0}
              required
              value={form.budgetTo}
              onChange={(e) => handleChange("budgetTo", e.target.value)}
            />
            <Input
              className={inputStyles}
              type="date"
              required
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
            <Input
              className={inputStyles}
              type="date"
              required
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
          <Textarea
            className={`${inputStyles} min-h-[120px]`}
            placeholder={
              isArabic ? "وصف المشروع" : "Project description & success criteria"
            }
            required
            value={form.projectDescription}
            onChange={(e) => handleChange("projectDescription", e.target.value)}
          />
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
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-primary to-cyan-400 px-6 text-slate-950 shadow-lg"
            >
              {isArabic ? "حفظ الطلب" : "Log request"}
            </Button>
          </div>
        </form>

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
                isArabic ? "ابحث بالاسم أو البريد..." : "Search by name or email..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={`${inputStyles} sm:w-48`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-900 text-slate-100"
              >
                option.label[locale]
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
                    <p className="text-white">{request.serviceId}</p>
                    {request.companyName && (
                      <span className="text-xs text-white/60">
                        {request.companyName}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {new Intl.NumberFormat().format(request.budget?.from || 0)} -{" "}
                    {new Intl.NumberFormat().format(request.budget?.to || 0)}
                  </td>
                  <td className="py-3">{request.expectedDuration}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.35em] ${statusTokens[request.status]}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="text-xs text-white/80">
                      {formatDate(request.startDate)} → {formatDate(request.endDate)}
                    </div>
                    <div className="text-xs text-white/40">
                      {formatDate(request.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 md:hidden">
          {requests.map((request) => (
            <div key={request._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{request.fullName}</p>
                  <p className="text-xs text-white/60">{request.email}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${statusTokens[request.status]}`}
                >
                  {request.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{request.phone}</span>
                </div>
                {request.companyName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{request.companyName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>{request.serviceId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span>
                    {new Intl.NumberFormat().format(request.budget?.from || 0)} -{" "}
                    {new Intl.NumberFormat().format(request.budget?.to || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>
                    {formatDate(request.startDate)} → {formatDate(request.endDate)}
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  {request.projectDescription.slice(0, 140)}
                  {request.projectDescription.length > 140 && "..."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!loading && requests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 p-6 text-center text-sm text-white/60">
            {isArabic
              ? "لا توجد طلبات حتى الآن."
              : "No requests captured yet."}
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
                  {Math.min(pagination.page * pagination.limit, pagination.total)} من{" "}
                  {pagination.total}
                </>
              ) : (
                <>
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total}
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
    </div>
  );
}

