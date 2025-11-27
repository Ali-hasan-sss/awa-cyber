"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUsers } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  Trash2,
  Pencil,
  KeyRound,
  Users,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const roleOptions = [
  { value: "client", label: { en: "Client", ar: "زبون" } },
  { value: "admin", label: { en: "Admin", ar: "مسؤول" } },
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  role: "client" | "admin";
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  role: "client",
};

const glassPanel =
  "rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl";
const glassCard =
  "rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_15px_45px_rgba(2,6,23,0.45)] backdrop-blur-xl";
const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";
const selectStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent";
const pillClass =
  "inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/70";

export default function UsersManagementPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();
  const copy = {
    title: isArabic ? "إدارة المستخدمين" : "User Management",
    subtitle: isArabic
      ? "قم بإضافة المستخدمين والتحكم في صلاحياتهم ورموز دخولهم."
      : "Add users and manage their roles and login codes.",
    addUser: isArabic ? "إضافة مستخدم" : "Add User",
    updateUser: isArabic ? "تحديث بيانات" : "Update user",
    delete: isArabic ? "حذف" : "Delete",
    edit: isArabic ? "تعديل" : "Edit",
    loginCode: isArabic ? "توليد رمز الدخول" : "Generate login code",
    codeCopied: isArabic ? "تم النسخ!" : "Copied!",
  };

  const {
    users,
    loading,
    error,
    pagination,
    createUser,
    updateUser,
    deleteUser,
    generateLoginCode,
    lastGeneratedCode,
    fetchUsers,
  } = useUsers();

  const [form, setForm] = useState<FormState>(initialForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [codeInfo, setCodeInfo] = useState<{ userId: string; code: string }>();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"admin" | "client" | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  });

  const handleInputChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createUser(form);
      setForm(initialForm);
      // Refresh users with current filters
      fetchUsers({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
      });
    } catch (error) {
      // Error is handled by UserContext
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUserId) return;
    await updateUser(editingUserId, form);
    setEditingUserId(null);
    setForm(initialForm);
    // Refresh users with current filters
    fetchUsers({
      page: currentPage,
      limit: 10,
      search: searchQuery || undefined,
      role: roleFilter || undefined,
    });
  };

  const startEdit = (userId: string) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;
    setEditingUserId(userId);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      companyName: user.companyName,
      role: user.role,
    });
    // Scroll to form
    const formElement = document.getElementById("user-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setForm(initialForm);
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.userId) return;

    try {
      await deleteUser(confirmDialog.userId);
      setConfirmDialog({ isOpen: false, userId: null, userName: "" });
      // Refresh users with current filters
      fetchUsers({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
      });
    } catch (error) {
      // Error is handled by UserContext
    }
  };

  const handleGenerateCode = async (userId: string) => {
    const code = await generateLoginCode(userId);
    setCodeInfo({ userId, code });
    navigator.clipboard.writeText(code).catch(() => {});
    // Refresh users with current filters
    fetchUsers({
      page: currentPage,
      limit: 10,
      search: searchQuery || undefined,
      role: roleFilter || undefined,
    });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers({
      page: 1,
      limit: 10,
      search: searchQuery || undefined,
      role: roleFilter || undefined,
    });
  };

  // Handle role filter change
  const handleRoleFilterChange = (role: "admin" | "client" | "") => {
    setRoleFilter(role);
    setCurrentPage(1);
    fetchUsers({
      page: 1,
      limit: 10,
      search: searchQuery || undefined,
      role: role || undefined,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers({
      page,
      limit: 10,
      search: searchQuery || undefined,
      role: roleFilter || undefined,
    });
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchUsers({
      page: 1,
      limit: 10,
    });
  }, []);

  const [prefillApplied, setPrefillApplied] = useState(false);

  useEffect(() => {
    if (prefillApplied) return;
    const prefillName = searchParams.get("prefillName");
    const prefillEmail = searchParams.get("prefillEmail");
    const prefillPhone = searchParams.get("prefillPhone");
    const prefillCompany = searchParams.get("prefillCompany");
    if (prefillName || prefillEmail || prefillPhone || prefillCompany) {
      setForm((prev) => ({
        ...prev,
        name: prefillName || prev.name,
        email: prefillEmail || prev.email,
        phone: prefillPhone || prev.phone,
        companyName: prefillCompany || prev.companyName,
        role: "client",
      }));
      setPrefillApplied(true);
      setEditingUserId(null);
      router.replace("/admin/dashboard/users");
    }
  }, [searchParams, prefillApplied, router]);

  return (
    <div className="space-y-8 text-slate-100">
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <Users className="h-8 w-8 text-primary" />
          {copy.title}
        </h1>
        <p className="text-slate-300">{copy.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          id="user-form"
          onSubmit={editingUserId ? handleUpdate : handleCreate}
          className={`${glassPanel} space-y-5 p-6`}
        >
          <div className="flex items-center gap-2 text-white">
            <Plus className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold tracking-wide text-white/80">
              {editingUserId ? copy.updateUser : copy.addUser}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder={isArabic ? "الاسم الكامل" : "Full name"}
              required
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={inputStyles}
            />
            <Input
              placeholder="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={inputStyles}
            />
            <Input
              placeholder={isArabic ? "رقم الهاتف" : "Phone number"}
              required
              value={form.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={inputStyles}
            />
            <Input
              placeholder={isArabic ? "اسم الشركة" : "Company name"}
              required
              value={form.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className={inputStyles}
            />
            <select
              className={selectStyles}
              value={form.role}
              onChange={(e) =>
                handleInputChange("role", e.target.value as "admin" | "client")
              }
            >
              {roleOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-slate-950 text-slate-100"
                >
                  {option.label[locale]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            {editingUserId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                className="rounded-full border-white/20 bg-white/5 px-6 text-white/80 hover:bg-white/10"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-primary to-cyan-400 px-6 text-slate-950 shadow-lg"
            >
              {editingUserId ? copy.updateUser : copy.addUser}
            </Button>
          </div>
        </form>

        <div className={`${glassPanel} space-y-4 p-6`}>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-primary" />
            <p className="text-sm text-slate-300">
              {isArabic
                ? "تحديث مستمر لقائمة المستخدمين والتقارير اليومية."
                : "Live overview of registered users and daily reports."}
            </p>
          </div>
          {codeInfo && (
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-sm text-primary shadow-inner backdrop-blur-xl">
              <p>
                {isArabic ? "رمز الدخول للمستخدم" : "Login code for user"}{" "}
                <strong>{codeInfo.userId}</strong>:
              </p>
              <p className="text-3xl font-bold tracking-wider">
                {codeInfo.code}
              </p>
              <p className="mt-1 text-xs text-primary/70">
                {isArabic ? "تم نسخه إلى الحافظة." : "Copied to clipboard."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className={`${glassPanel} p-6`}>
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 ltr:left-3 rtl:right-3" />
            <Input
              type="text"
              placeholder={
                isArabic
                  ? "ابحث بالاسم أو البريد الإلكتروني..."
                  : "Search by name or email..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputStyles} ltr:pl-10 rtl:pr-10`}
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-primary to-cyan-400 text-slate-950 shadow-lg sm:w-auto sm:px-6"
          >
            <Search className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {isArabic ? "بحث" : "Search"}
          </Button>
          <select
            className={`${selectStyles} sm:w-48`}
            value={roleFilter}
            onChange={(e) =>
              handleRoleFilterChange(e.target.value as "admin" | "client" | "")
            }
          >
            <option value="" className="bg-slate-950 text-slate-100">
              {isArabic ? "جميع الصلاحيات" : "All Roles"}
            </option>
            {roleOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-950 text-slate-100"
              >
                {option.label[locale]}
              </option>
            ))}
          </select>
        </form>
      </div>

      <div className={`${glassPanel} p-6`}>
        {error && (
          <p className="mb-4 text-sm text-red-400">
            {typeof error === "string" ? error : "Error"}
          </p>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="ltr:text-left rtl:text-right border-b border-white/10 text-[11px] uppercase tracking-[0.25em] text-white/70">
              <tr>
                <th className="py-2 ltr:text-left rtl:text-right">#</th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "الاسم" : "Name"}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">Email</th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "الهاتف" : "Phone"}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "الشركة" : "Company"}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "الدور" : "Role"}
                </th>
                <th className="py-2">
                  <div className="flex items-center justify-start">
                    {isArabic ? "رمز الدخول" : "Login Code"}
                  </div>
                </th>
                <th className="py-2">
                  <div className="flex items-center justify-start">
                    {isArabic ? "الإجراءات" : "Actions"}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {users.map((user, index) => {
                // Get login code from user object (returned from API) or from recently generated codes
                const userCode =
                  user.loginCode || // From API response (always available if user has a code)
                  (codeInfo?.userId === user._id ? codeInfo.code : null) ||
                  (lastGeneratedCode?.userId === user._id
                    ? lastGeneratedCode.code
                    : null);

                return (
                  <tr key={user._id}>
                    <td className="py-3 ltr:text-left rtl:text-right text-white/50">
                      {index + 1}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right font-semibold text-white">
                      {user.name}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right text-white/80">
                      {user.email}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right text-white/80">
                      {user.phone}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right text-white/80">
                      {user.companyName}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right">
                      <span className={`${pillClass} bg-white/15`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 ltr:flex-row rtl:flex-row-reverse">
                        {userCode ? (
                          <>
                            <code className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary">
                              {userCode}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(userCode)
                                  .catch(() => {});
                              }}
                              className="text-white/40 transition hover:text-white"
                              title={isArabic ? "نسخ" : "Copy"}
                            >
                              <KeyRound className="h-3 w-3" />
                            </button>
                          </>
                        ) : user.hasLoginCode ? (
                          <span className="text-xs text-white/60">
                            {isArabic ? "تم التوليد" : "Generated"}
                          </span>
                        ) : (
                          <span className="text-xs text-white/40">
                            {isArabic ? "غير متوفر" : "Not set"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2 ltr:flex-row rtl:flex-row-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                          onClick={() => handleGenerateCode(user._id)}
                          title={isArabic ? "توليد رمز" : "Generate code"}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                          onClick={() => startEdit(user._id)}
                          title={isArabic ? "تعديل" : "Edit"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-red-400/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteClick(user._id, user.name)}
                          title={isArabic ? "حذف" : "Delete"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {users.map((user, index) => {
            // Get login code from user object (returned from API) or from recently generated codes
            const userCode =
              user.loginCode || // From API response (always available if user has a code)
              (codeInfo?.userId === user._id ? codeInfo.code : null) ||
              (lastGeneratedCode?.userId === user._id
                ? lastGeneratedCode.code
                : null);

            return (
              <div key={user._id} className={`${glassCard} p-4`}>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs text-white/50">
                        #{index + 1}
                      </span>
                      <h3 className="font-semibold text-white">{user.name}</h3>
                    </div>
                    <span className={`${pillClass} mt-2`}>{user.role}</span>
                  </div>
                  <div className="flex gap-2 ltr:flex-row rtl:flex-row-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                      onClick={() => startEdit(user._id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-red-400/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDeleteClick(user._id, user.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-primary/40 text-primary hover:bg-primary/10"
                      onClick={() => handleGenerateCode(user._id)}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="min-w-[80px] text-white/70 ltr:text-left rtl:text-right">
                      Email:
                    </span>
                    <span className="text-white/90">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="min-w-[80px] text-white/70 ltr:text-left rtl:text-right">
                      {isArabic ? "الهاتف" : "Phone"}:
                    </span>
                    <span className="text-white/90">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="min-w-[80px] text-white/70 ltr:text-left rtl:text-right">
                      {isArabic ? "الشركة" : "Company"}:
                    </span>
                    <span className="text-white/90">{user.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="min-w-[80px] text-white/70 ltr:text-left rtl:text-right">
                      {isArabic ? "رمز الدخول" : "Login Code"}:
                    </span>
                    <div className="flex-1">
                      {userCode ? (
                        <div className="flex items-center gap-2 ltr:flex-row rtl:flex-row-reverse">
                          <code className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary">
                            {userCode}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard
                                .writeText(userCode)
                                .catch(() => {});
                            }}
                            className="text-white/40 transition hover:text-white"
                            title={isArabic ? "نسخ" : "Copy"}
                          >
                            <KeyRound className="h-3 w-3" />
                          </button>
                        </div>
                      ) : user.hasLoginCode ? (
                        <span className="text-xs text-white/60">
                          {isArabic ? "تم التوليد" : "Generated"}
                        </span>
                      ) : (
                        <span className="text-xs text-white/40">
                          {isArabic ? "غير متوفر" : "Not set"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {loading && <p className="mt-4 text-sm text-white/70">Loading...</p>}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
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
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="ltr:flex-row rtl:flex-row-reverse rounded-full border-white/20 text-white/80 hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                <span className="hidden sm:inline">
                  {isArabic ? "السابق" : "Previous"}
                </span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pagination.page === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={
                          pagination.page === pageNum
                            ? "rounded-full bg-primary text-black"
                            : "rounded-full border-white/20 text-white/80 hover:bg-white/10"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="ltr:flex-row rtl:flex-row-reverse rounded-full border-white/20 text-white/80 hover:bg-white/10"
              >
                <span className="hidden sm:inline">
                  {isArabic ? "التالي" : "Next"}
                </span>
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, userId: null, userName: "" })
        }
        onConfirm={handleDeleteConfirm}
        title={isArabic ? "تأكيد الحذف" : "Confirm Delete"}
        message={
          isArabic
            ? `هل أنت متأكد من حذف المستخدم "${confirmDialog.userName}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete user "${confirmDialog.userName}"? This action cannot be undone.`
        }
        confirmText={isArabic ? "حذف" : "Delete"}
        cancelText={isArabic ? "إلغاء" : "Cancel"}
        confirmVariant="destructive"
        isLoading={loading}
      />
    </div>
  );
}
