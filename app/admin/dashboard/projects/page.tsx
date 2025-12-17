"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjects, AdminProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { addLocaleToPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderKanban,
  Plus,
  Trash2,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function ProjectsManagementPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const router = useRouter();
  const { admin } = useAuth();
  const isEmployee = admin?.role === "employee";
  const { projects, loading, error, pagination, fetchProjects, deleteProject } =
    useProjects();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const limit = 10;

  // Filter projects for employees - show only projects where employee is in the team
  const filteredProjects = useMemo(() => {
    if (!isEmployee || !admin?.id) {
      return projects;
    }
    return projects.filter((project) => {
      if (!project.employees || !Array.isArray(project.employees)) {
        return false;
      }
      return project.employees.some((emp) => {
        if (typeof emp === "string") {
          return emp === admin.id;
        }
        if (typeof emp === "object" && emp !== null && "_id" in emp) {
          return emp._id === admin.id;
        }
        return false;
      });
    });
  }, [projects, isEmployee, admin?.id]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProjects({
      page: currentPage,
      limit,
      search: debouncedSearch || undefined,
    });
  }, [currentPage, debouncedSearch, fetchProjects]);

  const copy = useMemo(
    () => ({
      title: isArabic ? "إدارة المشاريع" : "Projects Management",
      subtitle: isArabic
        ? isEmployee
          ? "استعرض المشاريع التي أنت جزء من طاقم العمل فيها."
          : "استعرض وأدر جميع المشاريع والعملاء."
        : isEmployee
        ? "View projects you are part of the team."
        : "View and manage all projects and clients.",
      addProject: isArabic ? "إضافة مشروع" : "Add Project",
      noProjects: isArabic
        ? "لا توجد مشاريع حالياً."
        : "No projects available.",
      projectName: isArabic ? "اسم المشروع" : "Project Name",
      clientName: isArabic ? "اسم العميل" : "Client Name",
      companyName: isArabic ? "اسم الشركة" : "Company Name",
      startDate: isArabic ? "تاريخ البدء" : "Start Date",
      actions: isArabic ? "الإجراءات" : "Actions",
      delete: isArabic ? "حذف" : "Delete",
      deleteConfirm: isArabic
        ? "هل أنت متأكد من حذف هذا المشروع؟"
        : "Are you sure you want to delete this project?",
      loading: isArabic ? "جاري التحميل..." : "Loading...",
      searchPlaceholder: isArabic
        ? "ابحث عن مشروع أو عميل..."
        : "Search for project or client...",
      noResults: isArabic ? "لا توجد نتائج للبحث." : "No search results found.",
      page: isArabic ? "صفحة" : "Page",
      of: isArabic ? "من" : "of",
      previous: isArabic ? "السابق" : "Previous",
      next: isArabic ? "التالي" : "Next",
      showing: isArabic ? "عرض" : "Showing",
      to: isArabic ? "إلى" : "to",
      results: isArabic ? "نتيجة" : "results",
    }),
    [isArabic]
  );

  const handleDelete = async (projectId: string) => {
    if (!confirm(copy.deleteConfirm)) {
      return;
    }
    try {
      await deleteProject(projectId);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const getUserName = (userId: AdminProject["userId"]): string => {
    if (typeof userId === "object" && userId !== null && "name" in userId) {
      return userId.name;
    }
    return "-";
  };

  const getCompanyName = (userId: AdminProject["userId"]): string => {
    if (
      typeof userId === "object" &&
      userId !== null &&
      "companyName" in userId
    ) {
      return userId.companyName || "-";
    }
    return "-";
  };

  const getProjectName = (project: AdminProject, lang: "en" | "ar"): string => {
    return project.name[lang] || project.name.en || project.name.ar || "-";
  };

  return (
    <div className="space-y-8 text-slate-100">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <FolderKanban className="h-9 w-9 text-primary" />
          {copy.title}
        </h1>
        <p className="text-slate-300">{copy.subtitle}</p>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute top-1/2 transform -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-white/40" />
            <Input
              type="text"
              placeholder={copy.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.02] px-10 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition"
            />
          </div>
        </div>
        {!isEmployee && (
          <Button
            onClick={() =>
              router.push(
                addLocaleToPath("/admin/dashboard/projects/new", locale)
              )
            }
            className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {copy.addProject}
            </div>
          </Button>
        )}
      </div>

      {error && (
        <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {pagination && !isEmployee && (
        <div className="flex items-center justify-between text-sm text-white/70">
          <p>
            {copy.showing}{" "}
            {pagination.page * pagination.limit - pagination.limit + 1}{" "}
            {copy.to}{" "}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount
            )}{" "}
            {copy.of} {pagination.totalCount} {copy.results}
          </p>
        </div>
      )}
      {isEmployee && filteredProjects.length > 0 && (
        <div className="flex items-center justify-between text-sm text-white/70">
          <p>
            {copy.showing} 1 {copy.to} {filteredProjects.length} {copy.results}
          </p>
        </div>
      )}

      {loading && <p className="text-sm text-white/60">{copy.loading}</p>}

      {!loading && filteredProjects.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
          {debouncedSearch ? copy.noResults : copy.noProjects}
        </p>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.35em] text-white/50">
              <tr>
                <th className="py-3 ltr:text-left rtl:text-right w-16"></th>
                <th className="py-3 ltr:text-left rtl:text-right">
                  {copy.projectName}
                </th>
                <th className="py-3 ltr:text-left rtl:text-right">
                  {copy.clientName}
                </th>
                <th className="py-3 ltr:text-left rtl:text-right">
                  {copy.companyName}
                </th>
                <th className="py-3 ltr:text-left rtl:text-right">
                  {copy.startDate}
                </th>
                {!isEmployee && (
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.actions}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProjects.map((project) => (
                <tr
                  key={project._id}
                  className="text-white/90 hover:bg-white/5 cursor-pointer transition"
                  onClick={() =>
                    router.push(
                      addLocaleToPath(
                        `/admin/dashboard/projects/${project._id}`,
                        locale
                      )
                    )
                  }
                >
                  <td className="py-4">
                    {project.logo ? (
                      <img
                        src={project.logo}
                        alt={getProjectName(project, isArabic ? "ar" : "en")}
                        className="h-10 w-10 rounded-lg object-cover border border-white/10"
                        onError={(e) => {
                          console.error("Failed to load logo:", project.logo);
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        style={{ display: "block" }}
                      />
                    ) : null}
                    <div
                      className={`h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${
                        project.logo ? "hidden" : ""
                      }`}
                    >
                      <Building2 className="h-5 w-5 text-white/40" />
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="font-semibold text-white">
                      {getProjectName(project, isArabic ? "ar" : "en")}
                    </p>
                  </td>
                  <td className="py-4">
                    <p className="text-sm">{getUserName(project.userId)}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-sm text-white/70">
                      {getCompanyName(project.userId)}
                    </p>
                  </td>
                  <td className="py-4">
                    <p className="text-sm text-white/70">
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString(
                            isArabic ? "ar-EG-u-ca-gregory" : "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "-"}
                    </p>
                  </td>
                  {!isEmployee && (
                    <td className="py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project._id);
                        }}
                        title={copy.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isEmployee && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="rounded-full border border-white/20 px-4 py-2 text-white/70 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {copy.previous}
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first page, last page, current page, and pages around current
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                );
              })
              .map((page, index, array) => {
                // Add ellipsis if there's a gap
                const showEllipsisBefore =
                  index > 0 && page - array[index - 1] > 1;
                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsisBefore && (
                      <span className="text-white/40 px-2">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "ghost"}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`rounded-full px-4 py-2 ${
                        currentPage === page
                          ? "bg-primary text-black"
                          : "border border-white/20 text-white/70 hover:bg-white/5"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}
          </div>

          <Button
            variant="ghost"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(pagination.totalPages, prev + 1)
              )
            }
            disabled={currentPage === pagination.totalPages || loading}
            className="rounded-full border border-white/20 px-4 py-2 text-white/70 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copy.next}
            <ChevronRight className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
