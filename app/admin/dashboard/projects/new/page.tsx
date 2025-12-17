"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/contexts/ProjectContext";
import { useUsers } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { addLocaleToPath } from "@/lib/utils";
import { fetchUsersApi } from "@/lib/actions/userActions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { FolderKanban, ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";

const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

export default function NewProjectPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const { createProject, loading } = useProjects();
  const { users, fetchUsers } = useUsers();
  const [employees, setEmployees] = useState<string[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    logo: "",
    userId: "",
    totalCost: 0,
    phases: [] as Array<{
      titleEn: string;
      titleAr: string;
      descriptionEn: string;
      descriptionAr: string;
      duration: number;
      phaseNumber: number;
      status: "upcoming" | "in_progress" | "completed";
      progress: number;
    }>,
    startDate: "",
    projectUrl: "",
    progressType: "project" as "project" | "modification",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch clients and employees separately
    const loadUsers = async () => {
      try {
        const clientsData = await fetchUsersApi({ role: "client" });
        const employeesData = await fetchUsersApi({ role: "employee" });
        setClients(clientsData.users || []);
        setEmployeesList(employeesData.users || []);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    loadUsers();
  }, []);

  const copy = useMemo(
    () => ({
      title: isArabic ? "إضافة مشروع جديد" : "Add New Project",
      subtitle: isArabic
        ? "أدخل تفاصيل المشروع الجديد"
        : "Enter details for the new project",
      back: isArabic ? "رجوع" : "Back",
      save: isArabic ? "حفظ" : "Save",
      cancel: isArabic ? "إلغاء" : "Cancel",
      projectName: isArabic ? "اسم المشروع" : "Project Name",
      description: isArabic ? "الوصف" : "Description",
      logo: isArabic ? "شعار المشروع" : "Project Logo",
      client: isArabic ? "العميل" : "Client",
      selectClient: isArabic ? "اختر العميل" : "Select Client",
      totalCost: isArabic ? "التكلفة الإجمالية" : "Total Cost",
      phases: isArabic ? "المراحل" : "Phases",
      addPhase: isArabic ? "إضافة مرحلة" : "Add Phase",
      phaseTitle: isArabic ? "عنوان المرحلة" : "Phase Title",
      phaseDescription: isArabic ? "وصف المرحلة" : "Phase Description",
      duration: isArabic ? "المدة (أيام)" : "Duration (days)",
      phaseStatus: isArabic ? "حالة المرحلة" : "Phase Status",
      phaseProgress: isArabic ? "التقدم" : "Progress",
      upcoming: isArabic ? "قادمة" : "Upcoming",
      inProgress: isArabic ? "قيد التنفيذ" : "In Progress",
      completed: isArabic ? "منجزة" : "Completed",
      atLeastOnePhase: isArabic
        ? "يجب إضافة مرحلة واحدة على الأقل"
        : "At least one phase is required",
      startDate: isArabic ? "تاريخ البدء" : "Start Date",
      required: isArabic ? "مطلوب" : "Required",
      employees: isArabic ? "الموظفين المسؤولين" : "Assigned Employees",
      selectEmployees: isArabic ? "اختر الموظفين" : "Select Employees",
      projectUrl: isArabic ? "رابط موقع المشروع" : "Project URL",
      projectUrlPlaceholder: isArabic
        ? "https://example.com"
        : "https://example.com",
      phaseNumber: isArabic ? "رقم المرحلة" : "Phase Number",
      createSuccess: isArabic
        ? "تم إنشاء المشروع بنجاح"
        : "Project created successfully",
      createError: isArabic ? "فشل إنشاء المشروع" : "Failed to create project",
    }),
    [isArabic]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!form.nameEn.trim() || !form.nameAr.trim()) {
      setFormError(
        isArabic
          ? "اسم المشروع مطلوب باللغتين"
          : "Project name is required in both languages"
      );
      return;
    }

    if (!form.descriptionEn.trim() || !form.descriptionAr.trim()) {
      setFormError(
        isArabic
          ? "وصف المشروع مطلوب باللغتين"
          : "Project description is required in both languages"
      );
      return;
    }

    if (!form.userId) {
      setFormError(
        isArabic ? "يجب اختيار العميل" : "Client selection is required"
      );
      return;
    }

    if (form.phases.length === 0) {
      setFormError(copy.atLeastOnePhase);
      return;
    }

    // Validate phases
    for (const phase of form.phases) {
      if (!phase.titleEn.trim() || !phase.titleAr.trim()) {
        setFormError(
          isArabic
            ? "عنوان المرحلة مطلوب باللغتين"
            : "Phase title is required in both languages"
        );
        return;
      }
      if (phase.duration <= 0) {
        setFormError(
          isArabic
            ? "مدة المرحلة يجب أن تكون أكبر من صفر"
            : "Phase duration must be greater than zero"
        );
        return;
      }
    }

    if (form.totalCost <= 0) {
      setFormError(
        isArabic
          ? "التكلفة الإجمالية يجب أن تكون أكبر من صفر"
          : "Total cost must be greater than zero"
      );
      return;
    }

    setSubmitting(true);
    try {
      await createProject({
        name: { en: form.nameEn.trim(), ar: form.nameAr.trim() },
        description: {
          en: form.descriptionEn.trim(),
          ar: form.descriptionAr.trim(),
        },
        logo: form.logo || undefined,
        userId: form.userId,
        totalCost: form.totalCost,
        phases: form.phases.map((phase) => ({
          title: { en: phase.titleEn.trim(), ar: phase.titleAr.trim() },
          description:
            phase.descriptionEn.trim() || phase.descriptionAr.trim()
              ? {
                  en: phase.descriptionEn.trim(),
                  ar: phase.descriptionAr.trim(),
                }
              : undefined,
          duration: phase.duration,
          phaseNumber: phase.phaseNumber,
          status: phase.status,
          progress: phase.progress,
        })),
        startDate: form.startDate || undefined,
        projectUrl: form.projectUrl || undefined,
        progressType: form.progressType,
        employees: employees.length > 0 ? employees : undefined,
      });
      router.push(addLocaleToPath("/admin/dashboard/projects", locale));
    } catch (err) {
      setFormError(typeof err === "string" ? err : copy.createError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
            <FolderKanban className="h-9 w-9 text-primary" />
            {copy.title}
          </h1>
          <p className="text-slate-300 mt-2">{copy.subtitle}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() =>
            router.push(addLocaleToPath("/admin/dashboard/projects", locale))
          }
          className="text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {copy.back}
        </Button>
      </div>

      {formError && (
        <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.projectName} (EN) <span className="text-red-400">*</span>
            </label>
            <Input
              className={inputStyles}
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              placeholder={
                isArabic ? "اسم المشروع بالإنجليزية" : "Project name in English"
              }
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.projectName} (AR) <span className="text-red-400">*</span>
            </label>
            <Input
              className={inputStyles}
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              placeholder={
                isArabic ? "اسم المشروع بالعربية" : "Project name in Arabic"
              }
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-white/80">
              {copy.description} (EN) <span className="text-red-400">*</span>
            </label>
            <Textarea
              className={inputStyles}
              value={form.descriptionEn}
              onChange={(e) =>
                setForm({ ...form, descriptionEn: e.target.value })
              }
              placeholder={
                isArabic
                  ? "وصف المشروع بالإنجليزية"
                  : "Project description in English"
              }
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-white/80">
              {copy.description} (AR) <span className="text-red-400">*</span>
            </label>
            <Textarea
              className={inputStyles}
              value={form.descriptionAr}
              onChange={(e) =>
                setForm({ ...form, descriptionAr: e.target.value })
              }
              placeholder={
                isArabic
                  ? "وصف المشروع بالعربية"
                  : "Project description in Arabic"
              }
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.logo}
            </label>
            <FileUpload
              accept="image/*"
              maxSize={5}
              hideUploadedFiles={true}
              onUploadComplete={(url) => setForm({ ...form, logo: url })}
            />
            {form.logo && (
              <img
                src={form.logo}
                alt="Project logo"
                className="h-24 w-24 rounded-lg object-cover border border-white/10 mt-2"
              />
            )}
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-white/80">
              {copy.client} <span className="text-red-400">*</span>
            </label>
            <select
              className={`${inputStyles} w-full`}
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
            >
              <option value="" className="bg-slate-900 text-white">
                {copy.selectClient}
              </option>
              {clients.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                  className="bg-slate-900 text-white"
                >
                  {user.name} {user.companyName ? `- ${user.companyName}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-white/80">
              {copy.employees}
            </label>
            <select
              multiple
              className={`${inputStyles} w-full`}
              value={employees}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setEmployees(selected);
              }}
            >
              {employeesList.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                  className="bg-slate-900 text-white"
                >
                  {user.name} {user.companyName ? `- ${user.companyName}` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-white/60">
              {isArabic
                ? "اضغط Ctrl (أو Cmd على Mac) لاختيار عدة موظفين"
                : "Hold Ctrl (or Cmd on Mac) to select multiple employees"}
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.totalCost} <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              className={inputStyles}
              value={form.totalCost}
              onChange={(e) =>
                setForm({ ...form, totalCost: Number(e.target.value) })
              }
              placeholder={isArabic ? "0.00" : "0.00"}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.startDate}
            </label>
            <Input
              type="date"
              className={inputStyles}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-white/80">
              {copy.projectUrl}
            </label>
            <Input
              type="url"
              className={inputStyles}
              value={form.projectUrl}
              onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
              placeholder={copy.projectUrlPlaceholder}
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm text-white/80">
                {copy.phases} <span className="text-red-400">*</span>
              </label>
              <Button
                type="button"
                onClick={() => {
                  const usedNumbers = form.phases.map((p) => p.phaseNumber);
                  const availableNumbers = [1, 2, 3, 4, 5].filter(
                    (n) => !usedNumbers.includes(n)
                  );
                  const nextPhaseNumber =
                    availableNumbers.length > 0
                      ? availableNumbers[0]
                      : form.phases.length + 1;
                  setForm({
                    ...form,
                    phases: [
                      ...form.phases,
                      {
                        titleEn: "",
                        titleAr: "",
                        descriptionEn: "",
                        descriptionAr: "",
                        duration: 1,
                        phaseNumber: nextPhaseNumber,
                        status: "upcoming",
                        progress: 0,
                      },
                    ],
                  });
                }}
                className="rounded-full bg-primary/20 px-4 py-2 text-primary hover:bg-primary/30"
              >
                <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {copy.addPhase}
              </Button>
            </div>
            <div className="space-y-4">
              {form.phases.map((phase, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">
                      {copy.phaseTitle} {phase.phaseNumber}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm({
                          ...form,
                          phases: form.phases.filter((_, i) => i !== index),
                        });
                      }}
                      className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-white/80">
                        {copy.phaseTitle} (EN){" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <Input
                        placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
                        className={inputStyles}
                        value={phase.titleEn}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].titleEn = e.target.value;
                          setForm({ ...form, phases: newPhases });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-white/80">
                        {copy.phaseTitle} (AR){" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <Input
                        placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
                        className={inputStyles}
                        value={phase.titleAr}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].titleAr = e.target.value;
                          setForm({ ...form, phases: newPhases });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-white/80">
                        {copy.phaseDescription} (EN)
                      </label>
                      <Textarea
                        placeholder={
                          isArabic ? "الوصف (EN)" : "Description (EN)"
                        }
                        className={inputStyles}
                        value={phase.descriptionEn}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].descriptionEn = e.target.value;
                          setForm({ ...form, phases: newPhases });
                        }}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-white/80">
                        {copy.phaseDescription} (AR)
                      </label>
                      <Textarea
                        placeholder={
                          isArabic ? "الوصف (AR)" : "Description (AR)"
                        }
                        className={inputStyles}
                        value={phase.descriptionAr}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].descriptionAr = e.target.value;
                          setForm({ ...form, phases: newPhases });
                        }}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-white/80">
                        {copy.duration} <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder={
                          isArabic ? "المدة بالأيام" : "Duration in days"
                        }
                        className={inputStyles}
                        value={phase.duration}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].duration = Number(e.target.value);
                          setForm({ ...form, phases: newPhases });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-white/80">
                        {copy.phaseNumber}{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const usedNumbers = form.phases
                            .map((p, i) => (i !== index ? p.phaseNumber : null))
                            .filter((n) => n !== null) as number[];
                          const isUsed = usedNumbers.includes(num);
                          const isSelected = phase.phaseNumber === num;

                          if (isUsed) return null;

                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                const newPhases = [...form.phases];
                                newPhases[index].phaseNumber = num;
                                setForm({ ...form, phases: newPhases });
                              }}
                              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? "bg-primary text-black border-primary font-bold"
                                  : "bg-white/[0.02] text-white/70 border-white/20 hover:border-white/40 hover:bg-white/[0.05]"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-white/80">
                        {copy.phaseStatus}
                      </label>
                      <select
                        className={inputStyles}
                        value={phase.status}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].status = e.target.value as
                            | "upcoming"
                            | "in_progress"
                            | "completed";
                          setForm({ ...form, phases: newPhases });
                        }}
                      >
                        <option value="upcoming">{copy.upcoming}</option>
                        <option value="in_progress">{copy.inProgress}</option>
                        <option value="completed">{copy.completed}</option>
                      </select>
                    </div>
                    {phase.status === "in_progress" && (
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm text-white/80">
                          {copy.phaseProgress} ({phase.progress}%)
                        </label>
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full"
                          value={phase.progress}
                          onChange={(e) => {
                            const newPhases = [...form.phases];
                            newPhases[index].progress = Number(e.target.value);
                            setForm({ ...form, phases: newPhases });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {form.phases.length === 0 && (
                <p className="text-white/60 text-center py-4">
                  {isArabic
                    ? "لا توجد مراحل. اضغط على 'إضافة مرحلة' لإضافة مرحلة جديدة."
                    : "No phases. Click 'Add Phase' to add a new phase."}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              router.push(addLocaleToPath("/admin/dashboard/projects", locale))
            }
            className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
          >
            {copy.cancel}
          </Button>
          <Button
            type="submit"
            disabled={submitting || loading}
            className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
          >
            <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {submitting
              ? isArabic
                ? "جارٍ الحفظ..."
                : "Saving..."
              : copy.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
