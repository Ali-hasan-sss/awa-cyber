"use client";

import { useState, useEffect } from "react";
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

export default function UsersManagementPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
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

  return (
    <div className="space-y-8 text-slate-900">
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Users className="h-8 w-8 text-primary" />
          {copy.title}
        </h1>
        <p className="text-slate-500">{copy.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          id="user-form"
          onSubmit={editingUserId ? handleUpdate : handleCreate}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 text-slate-500">
            <Plus className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              {editingUserId ? copy.updateUser : copy.addUser}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder={isArabic ? "الاسم الكامل" : "Full name"}
              required
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <Input
              placeholder={isArabic ? "رقم الهاتف" : "Phone number"}
              required
              value={form.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
            <Input
              placeholder={isArabic ? "اسم الشركة" : "Company name"}
              required
              value={form.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
            />
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              value={form.role}
              onChange={(e) =>
                handleInputChange("role", e.target.value as "admin" | "client")
              }
            >
              {roleOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-black"
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
                className="rounded-full border-slate-200 text-slate-700 px-6"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-primary text-black px-6"
            >
              {editingUserId ? copy.updateUser : copy.addUser}
            </Button>
          </div>
        </form>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-primary" />
            <p className="text-sm text-slate-500">
              {isArabic
                ? "تحديث مستمر لقائمة المستخدمين والتقارير اليومية."
                : "Live overview of registered users and daily reports."}
            </p>
          </div>
          {codeInfo && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
              <p>
                {isArabic ? "رمز الدخول للمستخدم" : "Login code for user"}{" "}
                <strong>{codeInfo.userId}</strong>:
              </p>
              <p className="text-2xl font-bold">{codeInfo.code}</p>
              <p className="text-primary/70 text-xs mt-1">
                {isArabic ? "تم نسخه إلى الحافظة." : "Copied to clipboard."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={
                isArabic
                  ? "ابحث بالاسم أو البريد الإلكتروني..."
                  : "Search by name or email..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ltr:pl-10 rtl:pr-10"
            />
          </div>
          <Button type="submit" className="sm:w-auto w-full sm:px-6">
            <Search className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {isArabic ? "بحث" : "Search"}
          </Button>
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:w-48"
            value={roleFilter}
            onChange={(e) =>
              handleRoleFilterChange(e.target.value as "admin" | "client" | "")
            }
          >
            <option value="">
              {isArabic ? "جميع الصلاحيات" : "All Roles"}
            </option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label[locale]}
              </option>
            ))}
          </select>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <p className="mb-4 text-sm text-red-500">
            {typeof error === "string" ? error : "Error"}
          </p>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="ltr:text-left rtl:text-right text-slate-500">
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
                  <div className="flex items-center justify-start  ">
                    {isArabic ? "رمز الدخول" : "Login Code"}
                  </div>
                </th>
                <th className="py-2">
                  <div className="flex items-center justify-start ">
                    {isArabic ? "الإجراءات" : "Actions"}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
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
                    <td className="py-3 ltr:text-left rtl:text-right text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right font-semibold text-slate-900">
                      {user.name}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right text-slate-500">
                      {user.email}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right text-slate-500">
                      {user.phone}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right text-slate-500">
                      {user.companyName}
                    </td>
                    <td className="py-3 ltr:text-left rtl:text-right">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-start ltr:justify-start rtl:justify-end gap-2 ltr:flex-row rtl:flex-row-reverse">
                        {userCode ? (
                          <>
                            <code className="rounded-lg bg-secondary/70 px-2 py-1 text-xs font-mono text-primary font-semibold">
                              {userCode}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(userCode)
                                  .catch(() => {});
                              }}
                              className="text-slate-400 hover:text-slate-600"
                              title={isArabic ? "نسخ" : "Copy"}
                            >
                              <KeyRound className="h-3 w-3" />
                            </button>
                          </>
                        ) : user.hasLoginCode ? (
                          <span className="text-xs text-slate-400">
                            {isArabic ? "تم التوليد" : "Generated"}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">
                            {isArabic ? "غير متوفر" : "Not set"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center justify-start ltr:justify-start rtl:justify-end gap-2 ltr:flex-row rtl:flex-row-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 text-slate-700"
                          onClick={() => startEdit(user._id)}
                          title={isArabic ? "تعديل" : "Edit"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-500"
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
              <div
                key={user._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400">
                        #{index + 1}
                      </span>
                      <h3 className="font-semibold text-slate-900">
                        {user.name}
                      </h3>
                    </div>
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600 mt-2">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex gap-2 ltr:flex-row rtl:flex-row-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 text-slate-700"
                      onClick={() => startEdit(user._id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-500"
                      onClick={() => handleDeleteClick(user._id, user.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/40 text-primary"
                      onClick={() => handleGenerateCode(user._id)}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 min-w-[80px] ltr:text-left rtl:text-right">
                      Email:
                    </span>
                    <span className="text-slate-700">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 min-w-[80px] ltr:text-left rtl:text-right">
                      {isArabic ? "الهاتف" : "Phone"}:
                    </span>
                    <span className="text-slate-700">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 min-w-[80px] ltr:text-left rtl:text-right">
                      {isArabic ? "الشركة" : "Company"}:
                    </span>
                    <span className="text-slate-700">{user.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 min-w-[80px] ltr:text-left rtl:text-right">
                      {isArabic ? "رمز الدخول" : "Login Code"}:
                    </span>
                    <div className="flex-1">
                      {userCode ? (
                        <div className="flex items-center gap-2 ltr:flex-row rtl:flex-row-reverse">
                          <code className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-mono text-primary font-semibold">
                            {userCode}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard
                                .writeText(userCode)
                                .catch(() => {});
                            }}
                            className="text-slate-400 hover:text-slate-600"
                            title={isArabic ? "نسخ" : "Copy"}
                          >
                            <KeyRound className="h-3 w-3" />
                          </button>
                        </div>
                      ) : user.hasLoginCode ? (
                        <span className="text-xs text-slate-400">
                          {isArabic ? "تم التوليد" : "Generated"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">
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

        {loading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="text-sm text-slate-500">
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
                className="ltr:flex-row rtl:flex-row-reverse"
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
                            ? "bg-primary text-black"
                            : ""
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
                className="ltr:flex-row rtl:flex-row-reverse"
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
