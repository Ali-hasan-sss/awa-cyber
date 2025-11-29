"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects, AdminProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Trash2, Building2 } from "lucide-react";
import Image from "next/image";

export default function ProjectsManagementPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const router = useRouter();
  const { projects, loading, error, fetchProjects, deleteProject } =
    useProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const copy = useMemo(
    () => ({
      title: isArabic ? "إدارة المشاريع" : "Projects Management",
      subtitle: isArabic
        ? "استعرض وأدر جميع المشاريع والعملاء."
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
        <Button
          onClick={() => router.push("/admin/dashboard/projects/new")}
          className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {copy.addProject}
          </div>
        </Button>
        {error && (
          <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      {loading && <p className="text-sm text-white/60">{copy.loading}</p>}

      {!loading && projects.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
          {copy.noProjects}
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
                <th className="py-3 ltr:text-left rtl:text-right">
                  {copy.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((project) => (
                <tr
                  key={project._id}
                  className="text-white/90 hover:bg-white/5 cursor-pointer transition"
                  onClick={() =>
                    router.push(`/admin/dashboard/projects/${project._id}`)
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
