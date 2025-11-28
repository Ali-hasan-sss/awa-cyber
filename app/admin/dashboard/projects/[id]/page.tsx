"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useProjects,
  AdminProject,
  AdminPayment,
  AdminModification,
} from "@/contexts/ProjectContext";
import { useUsers } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import {
  FolderKanban,
  ArrowLeft,
  Pencil,
  X,
  Save,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { AdminProjectPhase } from "@/contexts/ProjectContext";

type PaymentStatus = "due" | "due_soon" | "paid" | "upcoming";
type ModificationPriority = "low" | "medium" | "high" | "critical";
type ModificationStatus =
  | "pending"
  | "accepted"
  | "completed"
  | "needs_extra_payment";

const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const projectId = params.id as string;
  const {
    projects,
    loading,
    error,
    getProject,
    updateProject,
    createPayment,
    updatePayment,
    deletePayment,
    createModification,
    updateModification,
    deleteModification,
  } = useProjects();
  const { users, fetchUsers } = useUsers();

  const [project, setProject] = useState<AdminProject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    logo: "",
    totalCost: 0,
    phases: [] as Array<{
      titleEn: string;
      titleAr: string;
      descriptionEn: string;
      descriptionAr: string;
      duration: number;
      status: "upcoming" | "in_progress" | "completed";
      progress: number;
    }>,
    startDate: "",
    progress: 0,
    progressType: "project" as "project" | "modification",
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "payments" | "modifications"
  >("overview");
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(
    null
  );
  const [newPhase, setNewPhase] = useState<{
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    duration: number;
    status: "upcoming" | "in_progress" | "completed";
    progress: number;
  } | null>(null);

  // Payment form
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    amount: 0,
    dueDate: "",
    status: "upcoming" as PaymentStatus,
  });

  // Modification form
  const [modificationModalOpen, setModificationModalOpen] = useState(false);
  const [modificationForm, setModificationForm] = useState({
    title: "",
    description: "",
    priority: "medium" as ModificationPriority,
    status: "pending" as ModificationStatus,
    extraPaymentAmount: 0,
    costAccepted: false,
  });

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
    fetchUsers();
  }, [projectId]);

  const loadProject = async () => {
    const loadedProject = await getProject(projectId);
    if (loadedProject) {
      setProject(loadedProject);
      setForm({
        nameEn: loadedProject.name.en,
        nameAr: loadedProject.name.ar,
        descriptionEn: loadedProject.description.en,
        descriptionAr: loadedProject.description.ar,
        logo: loadedProject.logo || "",
        totalCost: loadedProject.totalCost,
        phases: (loadedProject.phases || []).map((phase) => ({
          titleEn: phase.title.en,
          titleAr: phase.title.ar,
          descriptionEn: phase.description?.en || "",
          descriptionAr: phase.description?.ar || "",
          duration: phase.duration,
          status: phase.status,
          progress: phase.progress,
        })),
        startDate: loadedProject.startDate
          ? new Date(loadedProject.startDate).toISOString().split("T")[0]
          : "",
        progress: loadedProject.progress,
        progressType: loadedProject.progressType,
      });
    }
  };

  const handleSave = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      await updateProject(project._id, {
        name: { en: form.nameEn, ar: form.nameAr },
        description: { en: form.descriptionEn, ar: form.descriptionAr },
        logo: form.logo || undefined,
        totalCost: form.totalCost,
        phases: form.phases.map((phase) => ({
          title: { en: phase.titleEn, ar: phase.titleAr },
          description:
            phase.descriptionEn || phase.descriptionAr
              ? {
                  en: phase.descriptionEn,
                  ar: phase.descriptionAr,
                }
              : undefined,
          duration: phase.duration,
          status: phase.status,
          progress: phase.progress,
        })),
        startDate: form.startDate || undefined,
        progress: form.progress,
        progressType: form.progressType,
      });
      setIsEditing(false);
      await loadProject();
    } catch (err) {
      console.error("Failed to update project:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      const userId =
        typeof project.userId === "object" && project.userId !== null
          ? project.userId._id
          : project.userId;

      await createPayment({
        title: { en: paymentForm.titleEn, ar: paymentForm.titleAr },
        description:
          paymentForm.descriptionEn || paymentForm.descriptionAr
            ? {
                en: paymentForm.descriptionEn,
                ar: paymentForm.descriptionAr,
              }
            : undefined,
        projectId: project._id,
        userId: userId as string,
        amount: paymentForm.amount,
        dueDate: paymentForm.dueDate,
        status: paymentForm.status,
      });

      setPaymentModalOpen(false);
      setPaymentForm({
        titleEn: "",
        titleAr: "",
        descriptionEn: "",
        descriptionAr: "",
        amount: 0,
        dueDate: "",
        status: "upcoming",
      });
      await loadProject();
    } catch (err) {
      console.error("Failed to create payment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateModification = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      const userId =
        typeof project.userId === "object" && project.userId !== null
          ? project.userId._id
          : project.userId;

      await createModification({
        title: modificationForm.title,
        description: modificationForm.description,
        priority: modificationForm.priority,
        projectId: project._id,
        userId: userId as string,
        status: modificationForm.status,
        extraPaymentAmount:
          modificationForm.extraPaymentAmount > 0
            ? modificationForm.extraPaymentAmount
            : undefined,
        costAccepted: modificationForm.costAccepted,
      });

      setModificationModalOpen(false);
      setModificationForm({
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        extraPaymentAmount: 0,
        costAccepted: false,
      });
      await loadProject();
    } catch (err) {
      console.error("Failed to create modification:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const copy = useMemo(
    () => ({
      back: isArabic ? "رجوع" : "Back",
      edit: isArabic ? "تعديل" : "Edit",
      save: isArabic ? "حفظ" : "Save",
      cancel: isArabic ? "إلغاء" : "Cancel",
      overview: isArabic ? "نظرة عامة" : "Overview",
      timeline: isArabic ? "الجدول الزمني" : "Timeline",
      payments: isArabic ? "الدفعات" : "Payments",
      modifications: isArabic ? "التعديلات" : "Modifications",
      projectName: isArabic ? "اسم المشروع" : "Project Name",
      description: isArabic ? "الوصف" : "Description",
      logo: isArabic ? "شعار المشروع" : "Project Logo",
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
      startDate: isArabic ? "تاريخ البدء" : "Start Date",
      progress: isArabic ? "مستوى التقدم" : "Progress",
      client: isArabic ? "العميل" : "Client",
      company: isArabic ? "الشركة" : "Company",
      addPayment: isArabic ? "إضافة دفعة" : "Add Payment",
      addModification: isArabic ? "إضافة تعديل" : "Add Modification",
      paymentTitle: isArabic ? "عنوان الدفعة" : "Payment Title",
      amount: isArabic ? "المبلغ" : "Amount",
      dueDate: isArabic ? "تاريخ الاستحقاق" : "Due Date",
      status: isArabic ? "الحالة" : "Status",
      modificationTitle: isArabic ? "عنوان التعديل" : "Modification Title",
      priority: isArabic ? "الأولوية" : "Priority",
      extraPayment: isArabic ? "دفعة إضافية" : "Extra Payment",
      costAccepted: isArabic ? "قبول التكلفة" : "Cost Accepted",
      delete: isArabic ? "حذف" : "Delete",
    }),
    [isArabic]
  );

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-300">
          {isArabic ? "المشروع غير موجود" : "Project not found"}
        </p>
      </div>
    );
  }

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

  const payments = Array.isArray(project.payments) ? project.payments : [];
  const modifications = Array.isArray(project.modifications)
    ? project.modifications
    : [];

  return (
    <div className="space-y-8 text-slate-100">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/dashboard/projects")}
          className="text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {copy.back}
        </Button>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {copy.edit}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(["overview", "timeline", "payments", "modifications"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {copy[tab]}
            </button>
          )
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.projectName} (EN)
              </label>
              {isEditing ? (
                <Input
                  className={inputStyles}
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                />
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                  {project.name.en}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.projectName} (AR)
              </label>
              {isEditing ? (
                <Input
                  className={inputStyles}
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                />
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                  {project.name.ar}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-white/80">
                {copy.description} (EN)
              </label>
              {isEditing ? (
                <Textarea
                  className={inputStyles}
                  value={form.descriptionEn}
                  onChange={(e) =>
                    setForm({ ...form, descriptionEn: e.target.value })
                  }
                />
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                  {project.description.en}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-white/80">
                {copy.description} (AR)
              </label>
              {isEditing ? (
                <Textarea
                  className={inputStyles}
                  value={form.descriptionAr}
                  onChange={(e) =>
                    setForm({ ...form, descriptionAr: e.target.value })
                  }
                />
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                  {project.description.ar}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.logo}
              </label>
              {isEditing ? (
                <FileUpload
                  accept="image/*"
                  maxSize={5}
                  hideUploadedFiles={true}
                  onUploadComplete={(url) => setForm({ ...form, logo: url })}
                />
              ) : (
                project.logo && (
                  <img
                    src={project.logo}
                    alt={project.name.en}
                    className="h-24 w-24 rounded-lg object-cover border border-white/10"
                  />
                )
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.totalCost}
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  className={inputStyles}
                  value={form.totalCost}
                  onChange={(e) =>
                    setForm({ ...form, totalCost: Number(e.target.value) })
                  }
                />
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                  {project.totalCost.toLocaleString()}{" "}
                  {isArabic ? "ريال" : "SAR"}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.startDate}
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  className={inputStyles}
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString(
                        isArabic ? "ar-SA" : "en-US"
                      )
                    : "-"}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.progress} ({project.progress}%)
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full"
                    value={form.progress}
                    onChange={(e) =>
                      setForm({ ...form, progress: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-white/60 text-center">
                    {form.progress}%
                  </p>
                </div>
              ) : (
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.client}
              </label>
              <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                {getUserName(project.userId)}
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.company}
              </label>
              <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                {getCompanyName(project.userId)}
              </p>
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  loadProject();
                }}
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
              >
                {copy.cancel}
              </Button>
              <Button
                onClick={handleSave}
                disabled={submitting}
                className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
              >
                <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {copy.save}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setNewPhase({
                  titleEn: "",
                  titleAr: "",
                  descriptionEn: "",
                  descriptionAr: "",
                  duration: 1,
                  status: "upcoming",
                  progress: 0,
                });
              }}
              className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {copy.addPhase}
            </Button>
          </div>

          {/* New Phase Form */}
          {newPhase && (
            <div className="rounded-2xl border border-primary/30 bg-white/[0.03] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-primary">
                  {isArabic ? "مرحلة جديدة" : "New Phase"}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setNewPhase(null)}
                  className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
                  className={inputStyles}
                  value={newPhase.titleEn}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, titleEn: e.target.value })
                  }
                />
                <Input
                  placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
                  className={inputStyles}
                  value={newPhase.titleAr}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, titleAr: e.target.value })
                  }
                />
                <Textarea
                  placeholder={isArabic ? "الوصف (EN)" : "Description (EN)"}
                  className={inputStyles}
                  value={newPhase.descriptionEn}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, descriptionEn: e.target.value })
                  }
                />
                <Textarea
                  placeholder={isArabic ? "الوصف (AR)" : "Description (AR)"}
                  className={inputStyles}
                  value={newPhase.descriptionAr}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, descriptionAr: e.target.value })
                  }
                />
                <Input
                  type="number"
                  min="1"
                  placeholder={copy.duration}
                  className={inputStyles}
                  value={newPhase.duration}
                  onChange={(e) =>
                    setNewPhase({
                      ...newPhase,
                      duration: Number(e.target.value),
                    })
                  }
                />
                <select
                  className={inputStyles}
                  value={newPhase.status}
                  onChange={(e) =>
                    setNewPhase({
                      ...newPhase,
                      status: e.target.value as
                        | "upcoming"
                        | "in_progress"
                        | "completed",
                    })
                  }
                >
                  <option value="upcoming">{copy.upcoming}</option>
                  <option value="in_progress">{copy.inProgress}</option>
                  <option value="completed">{copy.completed}</option>
                </select>
                {newPhase.status === "in_progress" && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs text-white/60">
                      {copy.phaseProgress} ({newPhase.progress}%)
                    </label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full"
                      value={newPhase.progress}
                      onChange={(e) =>
                        setNewPhase({
                          ...newPhase,
                          progress: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setNewPhase(null)}
                  className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
                >
                  {copy.cancel}
                </Button>
                <Button
                  onClick={async () => {
                    if (!project || !newPhase) return;
                    if (!newPhase.titleEn.trim() || !newPhase.titleAr.trim()) {
                      alert(
                        isArabic
                          ? "عنوان المرحلة مطلوب باللغتين"
                          : "Phase title is required in both languages"
                      );
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const updatedPhases = [
                        ...form.phases,
                        {
                          titleEn: newPhase.titleEn.trim(),
                          titleAr: newPhase.titleAr.trim(),
                          descriptionEn: newPhase.descriptionEn.trim(),
                          descriptionAr: newPhase.descriptionAr.trim(),
                          duration: newPhase.duration,
                          status: newPhase.status,
                          progress: newPhase.progress,
                        },
                      ];
                      await updateProject(project._id, {
                        phases: updatedPhases.map((phase) => ({
                          title: { en: phase.titleEn, ar: phase.titleAr },
                          description:
                            phase.descriptionEn || phase.descriptionAr
                              ? {
                                  en: phase.descriptionEn,
                                  ar: phase.descriptionAr,
                                }
                              : undefined,
                          duration: phase.duration,
                          status: phase.status,
                          progress: phase.progress,
                        })),
                      });
                      setNewPhase(null);
                      await loadProject();
                    } catch (err) {
                      console.error("Failed to add phase:", err);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
                >
                  <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {copy.save}
                </Button>
              </div>
            </div>
          )}

          {/* Existing Phases */}
          <div className="space-y-4">
            {form.phases.map((phase, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                {editingPhaseIndex === index ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">
                        {copy.phaseTitle} {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingPhaseIndex(null);
                          loadProject();
                        }}
                        className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
                        className={inputStyles}
                        value={phase.titleEn}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].titleEn = e.target.value;
                          setForm({ ...form, phases: newPhases });
                        }}
                      />
                      <Input
                        placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
                        className={inputStyles}
                        value={phase.titleAr}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].titleAr = e.target.value;
                          setForm({ ...form, phases: newPhases });
                        }}
                      />
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
                      <Input
                        type="number"
                        min="1"
                        placeholder={copy.duration}
                        className={inputStyles}
                        value={phase.duration}
                        onChange={(e) => {
                          const newPhases = [...form.phases];
                          newPhases[index].duration = Number(e.target.value);
                          setForm({ ...form, phases: newPhases });
                        }}
                      />
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
                      {phase.status === "in_progress" && (
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-xs text-white/60">
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
                              newPhases[index].progress = Number(
                                e.target.value
                              );
                              setForm({ ...form, phases: newPhases });
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingPhaseIndex(null);
                          loadProject();
                        }}
                        className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
                      >
                        {copy.cancel}
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!project) return;
                          setSubmitting(true);
                          try {
                            await updateProject(project._id, {
                              phases: form.phases.map((phase) => ({
                                title: { en: phase.titleEn, ar: phase.titleAr },
                                description:
                                  phase.descriptionEn || phase.descriptionAr
                                    ? {
                                        en: phase.descriptionEn,
                                        ar: phase.descriptionAr,
                                      }
                                    : undefined,
                                duration: phase.duration,
                                status: phase.status,
                                progress: phase.progress,
                              })),
                            });
                            setEditingPhaseIndex(null);
                            await loadProject();
                          } catch (err) {
                            console.error("Failed to update phase:", err);
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        disabled={submitting}
                        className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
                      >
                        <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {copy.save}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">
                          {phase.titleEn ||
                            phase.titleAr ||
                            `${copy.phaseTitle} ${index + 1}`}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            phase.status === "completed"
                              ? "bg-green-500/20 text-green-300"
                              : phase.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {phase.status === "completed"
                            ? copy.completed
                            : phase.status === "in_progress"
                            ? copy.inProgress
                            : copy.upcoming}
                        </span>
                      </div>
                      {(phase.descriptionEn || phase.descriptionAr) && (
                        <p className="text-sm text-white/70 mb-2">
                          {phase.descriptionEn || phase.descriptionAr}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-white/60">
                        <span>
                          {copy.duration}: {phase.duration}{" "}
                          {isArabic ? "يوم" : "days"}
                        </span>
                        {phase.status === "in_progress" && (
                          <span>
                            {copy.phaseProgress}: {phase.progress}%
                          </span>
                        )}
                      </div>
                      {phase.status === "in_progress" && (
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPhaseIndex(index)}
                        className="h-8 w-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                        title={copy.edit}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (
                            confirm(
                              isArabic
                                ? "حذف هذه المرحلة؟"
                                : "Delete this phase?"
                            )
                          ) {
                            if (!project) return;
                            setSubmitting(true);
                            try {
                              const updatedPhases = form.phases.filter(
                                (_, i) => i !== index
                              );
                              await updateProject(project._id, {
                                phases: updatedPhases.map((phase) => ({
                                  title: {
                                    en: phase.titleEn,
                                    ar: phase.titleAr,
                                  },
                                  description:
                                    phase.descriptionEn || phase.descriptionAr
                                      ? {
                                          en: phase.descriptionEn,
                                          ar: phase.descriptionAr,
                                        }
                                      : undefined,
                                  duration: phase.duration,
                                  status: phase.status,
                                  progress: phase.progress,
                                })),
                              });
                              await loadProject();
                            } catch (err) {
                              console.error("Failed to delete phase:", err);
                            } finally {
                              setSubmitting(false);
                            }
                          }
                        }}
                        className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        title={copy.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {form.phases.length === 0 && !newPhase && (
              <p className="text-white/60 text-center py-8">
                {isArabic
                  ? "لا توجد مراحل. اضغط على 'إضافة مرحلة' لإضافة مرحلة جديدة."
                  : "No phases. Click 'Add Phase' to add a new phase."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setPaymentModalOpen(true)}
              className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {copy.addPayment}
            </Button>
          </div>
          <div className="space-y-2">
            {payments.length === 0 ? (
              <p className="text-white/60 text-center py-8">
                {isArabic ? "لا توجد دفعات" : "No payments"}
              </p>
            ) : (
              payments.map((payment) => {
                const paymentData =
                  typeof payment === "object" ? payment : null;
                if (!paymentData) return null;

                return (
                  <div
                    key={paymentData._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">
                          {paymentData.title[isArabic ? "ar" : "en"]}
                        </h4>
                        {paymentData.description && (
                          <p className="text-sm text-white/70 mt-1">
                            {paymentData.description[isArabic ? "ar" : "en"]}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-white/60">
                          <span>
                            {copy.amount}: {paymentData.amount.toLocaleString()}{" "}
                            {isArabic ? "ريال" : "SAR"}
                          </span>
                          <span>
                            {copy.dueDate}:{" "}
                            {new Date(paymentData.dueDate).toLocaleDateString(
                              isArabic ? "ar-SA" : "en-US"
                            )}
                          </span>
                          <span
                            className={`${
                              paymentData.status === "paid"
                                ? "text-green-400"
                                : paymentData.status === "due"
                                ? "text-red-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {copy.status}: {paymentData.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        onClick={async () => {
                          if (
                            confirm(
                              isArabic
                                ? "حذف هذه الدفعة؟"
                                : "Delete this payment?"
                            )
                          ) {
                            await deletePayment(paymentData._id);
                            await loadProject();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modifications Tab */}
      {activeTab === "modifications" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setModificationModalOpen(true)}
              className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {copy.addModification}
            </Button>
          </div>
          <div className="space-y-2">
            {modifications.length === 0 ? (
              <p className="text-white/60 text-center py-8">
                {isArabic ? "لا توجد تعديلات" : "No modifications"}
              </p>
            ) : (
              modifications.map((mod) => {
                const modData = typeof mod === "object" ? mod : null;
                if (!modData) return null;

                return (
                  <div
                    key={modData._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-white">
                            {modData.title}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              modData.priority === "critical"
                                ? "bg-red-500/20 text-red-300"
                                : modData.priority === "high"
                                ? "bg-orange-500/20 text-orange-300"
                                : modData.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {modData.priority}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              modData.status === "completed"
                                ? "bg-green-500/20 text-green-300"
                                : modData.status === "accepted"
                                ? "bg-blue-500/20 text-blue-300"
                                : modData.status === "needs_extra_payment"
                                ? "bg-orange-500/20 text-orange-300"
                                : "bg-gray-500/20 text-gray-300"
                            }`}
                          >
                            {modData.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 mt-1">
                          {modData.description}
                        </p>
                        {modData.extraPaymentAmount && (
                          <p className="text-xs text-yellow-400 mt-2">
                            {copy.extraPayment}:{" "}
                            {modData.extraPaymentAmount.toLocaleString()}{" "}
                            {isArabic ? "ريال" : "SAR"}
                          </p>
                        )}
                        <p className="text-xs text-white/60 mt-2">
                          {copy.costAccepted}:{" "}
                          {modData.costAccepted
                            ? isArabic
                              ? "نعم"
                              : "Yes"
                            : isArabic
                            ? "لا"
                            : "No"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        onClick={async () => {
                          if (
                            confirm(
                              isArabic
                                ? "حذف هذا التعديل؟"
                                : "Delete this modification?"
                            )
                          ) {
                            await deleteModification(modData._id);
                            await loadProject();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold">{copy.addPayment}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPaymentModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
                className={inputStyles}
                value={paymentForm.titleEn}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, titleEn: e.target.value })
                }
              />
              <Input
                placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
                className={inputStyles}
                value={paymentForm.titleAr}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, titleAr: e.target.value })
                }
              />
              <Textarea
                placeholder={isArabic ? "الوصف (EN)" : "Description (EN)"}
                className={inputStyles}
                value={paymentForm.descriptionEn}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    descriptionEn: e.target.value,
                  })
                }
              />
              <Textarea
                placeholder={isArabic ? "الوصف (AR)" : "Description (AR)"}
                className={inputStyles}
                value={paymentForm.descriptionAr}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    descriptionAr: e.target.value,
                  })
                }
              />
              <Input
                type="number"
                placeholder={copy.amount}
                className={inputStyles}
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    amount: Number(e.target.value),
                  })
                }
              />
              <Input
                type="date"
                placeholder={copy.dueDate}
                className={inputStyles}
                value={paymentForm.dueDate}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, dueDate: e.target.value })
                }
              />
              <select
                className={inputStyles}
                value={paymentForm.status}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    status: e.target.value as PaymentStatus,
                  })
                }
              >
                <option value="upcoming">
                  {isArabic ? "قادمة" : "Upcoming"}
                </option>
                <option value="due_soon">
                  {isArabic ? "مستحقة قريباً" : "Due Soon"}
                </option>
                <option value="due">{isArabic ? "مستحقة" : "Due"}</option>
                <option value="paid">{isArabic ? "مدفوعة" : "Paid"}</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setPaymentModalOpen(false)}
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
              >
                {copy.cancel}
              </Button>
              <Button
                onClick={handleCreatePayment}
                disabled={submitting}
                className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
              >
                {copy.save}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modification Modal */}
      {modificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold">{copy.addModification}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModificationModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                placeholder={copy.modificationTitle}
                className={inputStyles}
                value={modificationForm.title}
                onChange={(e) =>
                  setModificationForm({
                    ...modificationForm,
                    title: e.target.value,
                  })
                }
              />
              <Textarea
                placeholder={copy.description}
                className={inputStyles}
                value={modificationForm.description}
                onChange={(e) =>
                  setModificationForm({
                    ...modificationForm,
                    description: e.target.value,
                  })
                }
              />
              <select
                className={inputStyles}
                value={modificationForm.priority}
                onChange={(e) =>
                  setModificationForm({
                    ...modificationForm,
                    priority: e.target.value as ModificationPriority,
                  })
                }
              >
                <option value="low">{isArabic ? "منخفضة" : "Low"}</option>
                <option value="medium">{isArabic ? "متوسطة" : "Medium"}</option>
                <option value="high">{isArabic ? "مرتفعة" : "High"}</option>
                <option value="critical">
                  {isArabic ? "حرجة" : "Critical"}
                </option>
              </select>
              <select
                className={inputStyles}
                value={modificationForm.status}
                onChange={(e) =>
                  setModificationForm({
                    ...modificationForm,
                    status: e.target.value as ModificationStatus,
                  })
                }
              >
                <option value="pending">{isArabic ? "معلق" : "Pending"}</option>
                <option value="accepted">
                  {isArabic ? "مقبول" : "Accepted"}
                </option>
                <option value="completed">
                  {isArabic ? "مكتمل" : "Completed"}
                </option>
                <option value="needs_extra_payment">
                  {isArabic ? "يحتاج دفعة إضافية" : "Needs Extra Payment"}
                </option>
              </select>
              <Input
                type="number"
                placeholder={copy.extraPayment}
                className={inputStyles}
                value={modificationForm.extraPaymentAmount}
                onChange={(e) =>
                  setModificationForm({
                    ...modificationForm,
                    extraPaymentAmount: Number(e.target.value),
                  })
                }
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={modificationForm.costAccepted}
                  onChange={(e) =>
                    setModificationForm({
                      ...modificationForm,
                      costAccepted: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span className="text-sm">{copy.costAccepted}</span>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setModificationModalOpen(false)}
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
              >
                {copy.cancel}
              </Button>
              <Button
                onClick={handleCreateModification}
                disabled={submitting}
                className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
              >
                {copy.save}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
