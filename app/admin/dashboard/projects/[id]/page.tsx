"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useProjects,
  AdminProject,
  AdminPayment,
  AdminModification,
  ModificationFile,
} from "@/contexts/ProjectContext";
import { useUsers } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { addLocaleToPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, RefreshCw, Plus } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config/api";

// Import components
import OverviewTab from "./components/OverviewTab";
import TimelineTab from "./components/TimelineTab";
import PaymentsTab from "./components/PaymentsTab";
import ModificationsTab from "./components/ModificationsTab";
import TeamTab from "./components/TeamTab";
import ClientFilesTab from "./components/ClientFilesTab";
import CompanyFilesTab from "./components/CompanyFilesTab";
import PaymentModal from "./components/modals/PaymentModal";
import ModificationModal from "./components/modals/ModificationModal";
import ExtraPaymentModal from "./components/modals/ExtraPaymentModal";
import AddEmployeeModal from "./components/modals/AddEmployeeModal";
import FileUploadModal from "./components/modals/FileUploadModal";
import { PhaseForm, PaymentStatus } from "./components/types";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const { admin } = useAuth();
  const isAdmin = admin?.role === "admin";
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
    createProjectFile,
    getProjectFiles,
    deleteProjectFile,
    generatePortalCode,
  } = useProjects();
  const { users, fetchUsers } = useUsers();

  const [project, setProject] = useState<AdminProject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
      phaseNumber: number;
      status: "upcoming" | "in_progress" | "completed";
      progress: number;
    }>,
    startDate: "",
    progress: 0,
    progressType: "project" as "project" | "modification",
    whatsappGroupLink: "",
    employees: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "timeline"
    | "payments"
    | "modifications"
    | "clientFiles"
    | "companyFiles"
    | "team"
  >("overview");
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(
    null
  );
  const [newPhase, setNewPhase] = useState<PhaseForm | null>(null);
  const [submittingPortalCode, setSubmittingPortalCode] = useState(false);

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

  // Team form
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // Modification form
  const [modificationModalOpen, setModificationModalOpen] = useState(false);
  const [modificationForm, setModificationForm] = useState({
    title: "",
    description: "",
  });
  const [modificationAttachedFiles, setModificationAttachedFiles] = useState<
    File[]
  >([]);
  const modificationFileInputRef = useRef<HTMLInputElement>(null);

  // Extra payment form for modifications
  const [extraPaymentModalOpen, setExtraPaymentModalOpen] = useState(false);
  const [selectedModificationId, setSelectedModificationId] = useState<
    string | null
  >(null);
  const [extraPaymentForm, setExtraPaymentForm] = useState({
    amount: 0,
  });

  // Project Files
  const [clientFiles, setClientFiles] = useState<any[]>([]);
  const [companyFiles, setCompanyFiles] = useState<any[]>([]);
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false);
  const [fileUploadType, setFileUploadType] = useState<"client" | "company">(
    "client"
  );

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
    fetchUsers();
  }, [projectId]);

  // Read tab from query parameters and set active tab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "overview",
        "timeline",
        "payments",
        "modifications",
        "clientFiles",
        "companyFiles",
        "team",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [searchParams]);

  // Auto-calculate project progress based on phases
  useEffect(() => {
    if (!form.phases.length || editingPhaseIndex !== null) return;

    // Calculate progress: each completed phase = 100%, in_progress phase = its progress%, upcoming = 0%
    const totalPhases = form.phases.length;
    if (totalPhases === 0) {
      setForm((prev) => ({ ...prev, progress: 0 }));
      return;
    }

    const phaseWeight = 100 / totalPhases; // Each phase represents this percentage
    let totalProgress = 0;

    form.phases.forEach((phase) => {
      if (phase.status === "completed") {
        totalProgress += phaseWeight; // 100% of this phase's weight
      } else if (phase.status === "in_progress") {
        totalProgress += (phaseWeight * phase.progress) / 100; // Progress% of this phase's weight
      }
      // upcoming phases contribute 0%
    });

    const calculatedProgress = Math.round(totalProgress);
    if (form.progress !== calculatedProgress) {
      setForm((prev) => ({ ...prev, progress: calculatedProgress }));
    }
  }, [form.phases, editingPhaseIndex]);

  // Auto-update phase status based on progress
  useEffect(() => {
    if (!project || !form.phases.length || editingPhaseIndex !== null) return;

    const updatedPhases = [...form.phases];
    let hasChanges = false;

    // Find the first in_progress phase
    const inProgressIndex = updatedPhases.findIndex(
      (p) => p.status === "in_progress"
    );

    if (inProgressIndex !== -1) {
      const currentPhase = updatedPhases[inProgressIndex];
      // If progress reaches 100%, mark as completed
      if (currentPhase.progress >= 100 && currentPhase.status !== "completed") {
        updatedPhases[inProgressIndex].status = "completed";
        hasChanges = true;

        // Activate next phase if exists
        if (inProgressIndex + 1 < updatedPhases.length) {
          updatedPhases[inProgressIndex + 1].status = "in_progress";
          hasChanges = true;
        }
      }
    } else {
      // If no phase is in progress, activate the first upcoming phase
      const firstUpcomingIndex = updatedPhases.findIndex(
        (p) => p.status === "upcoming"
      );
      if (firstUpcomingIndex !== -1) {
        updatedPhases[firstUpcomingIndex].status = "in_progress";
        hasChanges = true;
      }
    }

    if (hasChanges) {
      // Auto-save when status changes
      const savePhases = async () => {
        try {
          // Calculate progress
          const totalPhases = updatedPhases.length;
          let calculatedProgress = 0;
          if (totalPhases > 0) {
            const phaseWeight = 100 / totalPhases;
            updatedPhases.forEach((phase) => {
              if (phase.status === "completed") {
                calculatedProgress += phaseWeight;
              } else if (phase.status === "in_progress") {
                calculatedProgress += (phaseWeight * phase.progress) / 100;
              }
            });
            calculatedProgress = Math.round(calculatedProgress);
          }

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
              phaseNumber: phase.phaseNumber,
              status: phase.status,
              progress: phase.progress,
            })),
            progress: calculatedProgress,
          });
          await loadProject();
        } catch (err) {
          console.error("Failed to auto-update phases:", err);
        }
      };
      savePhases();
    }
  }, [form.phases, project, editingPhaseIndex]);

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
        phases: (loadedProject.phases || []).map((phase: any, index) => {
          // Ensure we properly extract title and description
          let titleEn = "";
          let titleAr = "";
          let descriptionEn = "";
          let descriptionAr = "";

          // Extract title
          if (phase.title) {
            if (typeof phase.title === "object" && phase.title !== null) {
              titleEn = String(phase.title.en || "").trim();
              titleAr = String(phase.title.ar || "").trim();
            }
          }

          // Extract description
          if (phase.description) {
            if (
              typeof phase.description === "object" &&
              phase.description !== null
            ) {
              descriptionEn = String(phase.description.en || "").trim();
              descriptionAr = String(phase.description.ar || "").trim();
            }
          }

          return {
            titleEn: titleEn || "",
            titleAr: titleAr || "",
            descriptionEn: descriptionEn || "",
            descriptionAr: descriptionAr || "",
            duration: phase.duration,
            phaseNumber: phase.phaseNumber || index + 1,
            status: phase.status,
            progress: phase.progress,
          };
        }),
        startDate: loadedProject.startDate
          ? new Date(loadedProject.startDate).toISOString().split("T")[0]
          : "",
        progress: loadedProject.progress,
        progressType: loadedProject.progressType,
        whatsappGroupLink: loadedProject.whatsappGroupLink || "",
        employees: Array.isArray(loadedProject.employees)
          ? loadedProject.employees.map((emp: any) =>
              typeof emp === "object" && emp !== null && "_id" in emp
                ? emp._id
                : emp
            )
          : [],
      });

      // Load files
      if (loadedProject._id) {
        try {
          const files = await getProjectFiles(loadedProject._id);
          if (Array.isArray(files)) {
            setClientFiles(files.filter((f: any) => f.uploadedBy === "client"));
            setCompanyFiles(
              files.filter((f: any) => f.uploadedBy === "company")
            );
          }
        } catch (err) {
          console.error("Failed to load files:", err);
          setClientFiles([]);
          setCompanyFiles([]);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      // Calculate progress before saving
      const totalPhases = form.phases.length;
      let calculatedProgress = 0;
      if (totalPhases > 0) {
        const phaseWeight = 100 / totalPhases;
        form.phases.forEach((phase) => {
          if (phase.status === "completed") {
            calculatedProgress += phaseWeight;
          } else if (phase.status === "in_progress") {
            calculatedProgress += (phaseWeight * phase.progress) / 100;
          }
        });
        calculatedProgress = Math.round(calculatedProgress);
      }

      await updateProject(project._id, {
        name: { en: form.nameEn, ar: form.nameAr },
        description: { en: form.descriptionEn, ar: form.descriptionAr },
        logo: form.logo || undefined,
        ...(isAdmin && { totalCost: form.totalCost }), // Only include totalCost if admin
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
          phaseNumber: phase.phaseNumber,
          status: phase.status,
          progress: phase.progress,
        })),
        startDate: form.startDate || undefined,
        progress: calculatedProgress, // Use calculated progress
        progressType: form.progressType,
        whatsappGroupLink: form.whatsappGroupLink || undefined,
        employees: form.employees.length > 0 ? form.employees : undefined,
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

  const handleModificationFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Limit to 5 files maximum
      if (modificationAttachedFiles.length + newFiles.length > 5) {
        alert(
          isArabic
            ? "يمكنك رفع ما يصل إلى 5 ملفات فقط"
            : "You can upload up to 5 files only"
        );
        const remainingSlots = 5 - modificationAttachedFiles.length;
        setModificationAttachedFiles([
          ...modificationAttachedFiles,
          ...newFiles.slice(0, remainingSlots),
        ]);
      } else {
        setModificationAttachedFiles([
          ...modificationAttachedFiles,
          ...newFiles,
        ]);
      }
    }
  };

  const handleRemoveModificationFile = (index: number) => {
    setModificationAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateModification = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      const userId =
        typeof project.userId === "object" && project.userId !== null
          ? project.userId._id
          : project.userId;

      // Upload files if any
      const fileUrls: ModificationFile[] = [];
      if (modificationAttachedFiles.length > 0) {
        for (const file of modificationAttachedFiles) {
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

      // If created by admin, status is "accepted" by default
      await createModification({
        title: modificationForm.title,
        description: modificationForm.description,
        priority: "medium",
        projectId: project._id,
        userId: userId as string,
        status: "accepted", // Admin creates with accepted status
        extraPaymentAmount: undefined,
        costAccepted: false,
        attachedFiles: fileUrls.length > 0 ? fileUrls : undefined,
      });

      setModificationModalOpen(false);
      setModificationForm({
        title: "",
        description: "",
      });
      setModificationAttachedFiles([]);
      if (modificationFileInputRef.current) {
        modificationFileInputRef.current.value = "";
      }
      await loadProject();
    } catch (err) {
      console.error("Failed to create modification:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptModification = async (modificationId: string) => {
    if (!project) return;
    setSubmitting(true);
    try {
      await updateModification(modificationId, {
        status: "accepted",
      });
      await loadProject();
    } catch (err) {
      console.error("Failed to accept modification:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectModification = async (modificationId: string) => {
    if (!project) return;
    if (
      !confirm(
        isArabic
          ? "هل أنت متأكد من رفض هذا التعديل؟"
          : "Are you sure you want to reject this modification?"
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await updateModification(modificationId, {
        status: "rejected",
      });
      await loadProject();
    } catch (err) {
      console.error("Failed to reject modification:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestExtraPayment = async () => {
    if (!project || !selectedModificationId) return;
    setSubmitting(true);
    try {
      await updateModification(selectedModificationId, {
        status: "needs_extra_payment",
        extraPaymentAmount: extraPaymentForm.amount,
        costAccepted: false,
      });
      setExtraPaymentModalOpen(false);
      setSelectedModificationId(null);
      setExtraPaymentForm({ amount: 0 });
      await loadProject();
    } catch (err) {
      console.error("Failed to request extra payment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptExtraPayment = async (modificationId: string) => {
    if (!project) return;
    setSubmitting(true);
    try {
      // Find the modification to get extraPaymentAmount
      const modification = modifications.find((mod) => {
        const modData = typeof mod === "object" ? mod : null;
        return modData?._id === modificationId;
      });
      const modData = typeof modification === "object" ? modification : null;
      const extraPaymentAmount = modData?.extraPaymentAmount || 0;

      // Only add to total cost if not already accepted (to avoid double addition)
      const shouldAddToTotal = !modData?.costAccepted && extraPaymentAmount > 0;

      // Update modification status
      await updateModification(modificationId, {
        costAccepted: true,
        status: "accepted", // Change status to accepted when client accepts the payment
      });

      // Add extra payment amount to project total cost (only if not already added)
      if (shouldAddToTotal) {
        await updateProject(project._id, {
          totalCost: project.totalCost + extraPaymentAmount,
        });
      }

      await loadProject();
    } catch (err) {
      console.error("Failed to accept extra payment:", err);
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
      phaseNumber: isArabic ? "رقم المرحلة" : "Phase Number",
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
      accept: isArabic ? "موافق" : "Accept",
      reject: isArabic ? "مرفوض" : "Reject",
      requestExtraPayment: isArabic
        ? "يحتاج دفعة إضافية"
        : "Request Extra Payment",
      clientAcceptedPayment: isArabic
        ? "العميل موافق على الدفعة"
        : "Client Accepted Payment",
      extraPaymentAmount: isArabic
        ? "مبلغ الدفعة الإضافية"
        : "Extra Payment Amount",
      whatsappGroupLink: isArabic
        ? "رابط مجموعة واتساب"
        : "WhatsApp Group Link",
      openWhatsApp: isArabic ? "فتح واتساب" : "Open WhatsApp",
      clientFiles: isArabic ? "ملفات الزبون" : "Client Files",
      companyFiles: isArabic ? "ملفات الشركة" : "Company Files",
      uploadFile: isArabic ? "رفع ملف" : "Upload File",
      fileName: isArabic ? "اسم الملف" : "File Name",
      fileType: isArabic ? "نوع الملف" : "File Type",
      uploadedBy: isArabic ? "رفع بواسطة" : "Uploaded By",
      noFiles: isArabic ? "لا توجد ملفات" : "No files",
      portalCode: isArabic ? "رمز الدخول للبورتال" : "Portal Access Code",
      generateCode: isArabic ? "توليد رمز" : "Generate Code",
      copyCode: isArabic ? "نسخ الرمز" : "Copy Code",
      codeCopied: isArabic ? "تم نسخ الرمز" : "Code Copied",
      portalLink: isArabic ? "رابط البورتال" : "Portal Link",
      employees: isArabic ? "الموظفين المسؤولين" : "Assigned Employees",
      selectEmployees: isArabic ? "اختر الموظفين" : "Select Employees",
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

  const payments: AdminPayment[] = Array.isArray(project.payments)
    ? project.payments.filter(
        (p): p is AdminPayment => typeof p === "object" && p !== null
      )
    : [];
  const modifications: AdminModification[] = Array.isArray(
    project.modifications
  )
    ? project.modifications.filter(
        (m): m is AdminModification => typeof m === "object" && m !== null
      )
    : [];

  return (
    <div className="space-y-8 text-slate-100">
      <div className="flex items-center justify-between">
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
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        {(
          [
            "overview",
            "timeline",
            ...(isAdmin ? ["payments"] : []),
            "modifications",
            "team",
            "clientFiles",
            "companyFiles",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-white/60 hover:text-white"
            }`}
          >
            {tab === "team"
              ? isArabic
                ? "طاقم العمل"
                : "Team"
              : copy[tab as keyof typeof copy]}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && project && (
        <OverviewTab
          project={project}
          isEditing={isEditing}
          form={{
            nameEn: form.nameEn,
            nameAr: form.nameAr,
            descriptionEn: form.descriptionEn,
            descriptionAr: form.descriptionAr,
            logo: form.logo,
            totalCost: form.totalCost,
            startDate: form.startDate,
            progress: form.progress,
            whatsappGroupLink: form.whatsappGroupLink,
          }}
          setForm={(newForm) =>
            setForm({
              ...form,
              ...newForm,
            })
          }
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
            loadProject();
          }}
          submitting={submitting}
          generatePortalCode={generatePortalCode}
          loadProject={loadProject}
          submittingPortalCode={submittingPortalCode}
          setSubmittingPortalCode={setSubmittingPortalCode}
        />
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && project && (
        <TimelineTab
          project={project}
          phases={form.phases}
          setPhases={(phases) => {
            if (typeof phases === "function") {
              setForm((prev) => ({ ...prev, phases: phases(prev.phases) }));
            } else {
              setForm((prev) => ({ ...prev, phases }));
            }
          }}
          newPhase={newPhase}
          setNewPhase={setNewPhase}
          editingPhaseIndex={editingPhaseIndex}
          setEditingPhaseIndex={setEditingPhaseIndex}
          onAddPhase={() => {
            const hasInProgress = form.phases.some(
              (p) => p.status === "in_progress"
            );
            const allCompleted = form.phases.every(
              (p) => p.status === "completed"
            );
            const status =
              form.phases.length === 0 || allCompleted
                ? "in_progress"
                : "upcoming";

            const usedNumbers = form.phases.map((p) => p.phaseNumber);
            const availableNumbers = [1, 2, 3, 4, 5].filter(
              (n) => !usedNumbers.includes(n)
            );
            const phaseNumber = availableNumbers[0] || 1;

            setNewPhase({
              titleEn: "",
              titleAr: "",
              descriptionEn: "",
              descriptionAr: "",
              duration: 1,
              phaseNumber: phaseNumber,
              status: status as "upcoming" | "in_progress" | "completed",
              progress: 0,
            });
          }}
          onSavePhase={async (phase) => {
            if (!project) return;
            if (!phase.titleEn.trim() || !phase.titleAr.trim()) {
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
                  titleEn: phase.titleEn.trim(),
                  titleAr: phase.titleAr.trim(),
                  descriptionEn: phase.descriptionEn.trim(),
                  descriptionAr: phase.descriptionAr.trim(),
                  duration: phase.duration,
                  phaseNumber: phase.phaseNumber,
                  status: phase.status,
                  progress: phase.progress,
                },
              ];

              const totalPhases = updatedPhases.length;
              let calculatedProgress = 0;
              if (totalPhases > 0) {
                const phaseWeight = 100 / totalPhases;
                updatedPhases.forEach((phase) => {
                  if (phase.status === "completed") {
                    calculatedProgress += phaseWeight;
                  } else if (phase.status === "in_progress") {
                    calculatedProgress += (phaseWeight * phase.progress) / 100;
                  }
                });
                calculatedProgress = Math.round(calculatedProgress);
              }

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
                  phaseNumber: phase.phaseNumber,
                  status: phase.status,
                  progress: phase.progress,
                })),
                progress: calculatedProgress,
              });
              setNewPhase(null);
              await loadProject();
            } catch (err) {
              console.error("Failed to add phase:", err);
            } finally {
              setSubmitting(false);
            }
          }}
          onUpdatePhase={async (index) => {
            if (!project) return;
            setSubmitting(true);
            try {
              const totalPhases = form.phases.length;
              let calculatedProgress = 0;
              if (totalPhases > 0) {
                const phaseWeight = 100 / totalPhases;
                form.phases.forEach((phase) => {
                  if (phase.status === "completed") {
                    calculatedProgress += phaseWeight;
                  } else if (phase.status === "in_progress") {
                    calculatedProgress += (phaseWeight * phase.progress) / 100;
                  }
                });
                calculatedProgress = Math.round(calculatedProgress);
              }

              await updateProject(project._id, {
                phases: form.phases.map((phase) => ({
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
                  phaseNumber: phase.phaseNumber,
                  status: phase.status,
                  progress: phase.progress,
                })),
                progress: calculatedProgress,
              });
              setEditingPhaseIndex(null);
              await loadProject();
            } catch (err) {
              console.error("Failed to update phase:", err);
            } finally {
              setSubmitting(false);
            }
          }}
          onDeletePhase={async (index) => {
            if (!project) return;
            setSubmitting(true);
            try {
              const updatedPhases = form.phases.filter((_, i) => i !== index);

              const totalPhases = updatedPhases.length;
              let calculatedProgress = 0;
              if (totalPhases > 0) {
                const phaseWeight = 100 / totalPhases;
                updatedPhases.forEach((phase) => {
                  if (phase.status === "completed") {
                    calculatedProgress += phaseWeight;
                  } else if (phase.status === "in_progress") {
                    calculatedProgress += (phaseWeight * phase.progress) / 100;
                  }
                });
                calculatedProgress = Math.round(calculatedProgress);
              }

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
                  phaseNumber: phase.phaseNumber,
                  status: phase.status,
                  progress: phase.progress,
                })),
                progress: calculatedProgress,
              });
              await loadProject();
            } catch (err) {
              console.error("Failed to delete phase:", err);
            } finally {
              setSubmitting(false);
            }
          }}
          onCancelEdit={() => {
            setEditingPhaseIndex(null);
            loadProject();
          }}
          submitting={submitting}
          loadProject={loadProject}
        />
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && project && (
        <PaymentsTab
          payments={payments}
          onAddPayment={() => setPaymentModalOpen(true)}
          onDeletePayment={async (paymentId) => {
            await deletePayment(paymentId);
            await loadProject();
          }}
        />
      )}

      {/* Modifications Tab */}
      {activeTab === "modifications" && project && (
        <ModificationsTab
          modifications={modifications}
          onAddModification={() => setModificationModalOpen(true)}
          onAcceptModification={async (modificationId) => {
            await updateModification(modificationId, {
              status: "accepted",
            });
            await loadProject();
          }}
          onRejectModification={async (modificationId) => {
            if (
              !confirm(
                isArabic
                  ? "هل أنت متأكد من رفض هذا التعديل؟"
                  : "Are you sure you want to reject this modification?"
              )
            ) {
              return;
            }
            await updateModification(modificationId, {
              status: "rejected",
            });
            await loadProject();
          }}
          onRequestExtraPayment={(modificationId) => {
            setSelectedModificationId(modificationId);
            setExtraPaymentModalOpen(true);
          }}
          onAcceptExtraPayment={async (modificationId) => {
            const modification = modifications.find((mod) => {
              const modData = typeof mod === "object" ? mod : null;
              return modData?._id === modificationId;
            });
            const modData =
              typeof modification === "object" ? modification : null;
            const extraPaymentAmount = modData?.extraPaymentAmount || 0;

            const shouldAddToTotal =
              !modData?.costAccepted && extraPaymentAmount > 0;

            await updateModification(modificationId, {
              costAccepted: true,
              status: "accepted",
            });

            if (shouldAddToTotal && project) {
              await updateProject(project._id, {
                totalCost: project.totalCost + extraPaymentAmount,
              });
            }

            await loadProject();
          }}
          onDeleteModification={async (modificationId) => {
            await deleteModification(modificationId);
            await loadProject();
          }}
        />
      )}

      {/* Team Tab */}
      {activeTab === "team" && project && (
        <TeamTab
          project={project}
          onAddEmployee={() => setAddEmployeeModalOpen(true)}
          onRemoveEmployee={async (employeeId) => {
            if (!project) return;
            setSubmitting(true);
            try {
              const currentEmployees = Array.isArray(project.employees)
                ? project.employees
                    .map((e: any) =>
                      typeof e === "object" && e !== null && "_id" in e
                        ? e._id
                        : e
                    )
                    .filter((id: string) => id !== employeeId)
                : [];
              await updateProject(project._id, {
                employees: currentEmployees,
              });
              await loadProject();
            } catch (err) {
              console.error("Failed to remove employee:", err);
            } finally {
              setSubmitting(false);
            }
          }}
          submitting={submitting}
        />
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={addEmployeeModalOpen}
        onClose={() => {
          setAddEmployeeModalOpen(false);
          setSelectedEmployeeId("");
        }}
        project={project}
        users={users}
        selectedEmployeeId={selectedEmployeeId}
        setSelectedEmployeeId={setSelectedEmployeeId}
        onSubmit={async () => {
          if (!project || !selectedEmployeeId) {
            alert(isArabic ? "يرجى اختيار موظف" : "Please select an employee");
            return;
          }
          setSubmitting(true);
          try {
            const currentEmployees = Array.isArray(project.employees)
              ? project.employees.map((e: any) =>
                  typeof e === "object" && e !== null && "_id" in e ? e._id : e
                )
              : [];
            await updateProject(project._id, {
              employees: [...currentEmployees, selectedEmployeeId],
            });
            setAddEmployeeModalOpen(false);
            setSelectedEmployeeId("");
            await loadProject();
          } catch (err) {
            console.error("Failed to add employee:", err);
          } finally {
            setSubmitting(false);
          }
        }}
        submitting={submitting}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        form={paymentForm}
        setForm={setPaymentForm}
        onSubmit={handleCreatePayment}
        submitting={submitting}
      />

      {/* Modification Modal */}
      <ModificationModal
        isOpen={modificationModalOpen}
        onClose={() => {
          setModificationModalOpen(false);
          setModificationForm({ title: "", description: "" });
          setModificationAttachedFiles([]);
          if (modificationFileInputRef.current) {
            modificationFileInputRef.current.value = "";
          }
        }}
        form={modificationForm}
        setForm={setModificationForm}
        attachedFiles={modificationAttachedFiles}
        onFileSelect={handleModificationFileSelect}
        onRemoveFile={handleRemoveModificationFile}
        onSubmit={handleCreateModification}
        submitting={submitting}
      />

      {/* Extra Payment Modal */}
      <ExtraPaymentModal
        isOpen={extraPaymentModalOpen}
        onClose={() => {
          setExtraPaymentModalOpen(false);
          setSelectedModificationId(null);
          setExtraPaymentForm({ amount: 0 });
        }}
        amount={extraPaymentForm.amount}
        setAmount={(amount) => setExtraPaymentForm({ amount })}
        onSubmit={handleRequestExtraPayment}
        submitting={submitting}
      />

      {/* Client Files Tab */}
      {activeTab === "clientFiles" && (
        <ClientFilesTab
          files={clientFiles}
          onUpload={() => {
            setFileUploadType("client");
            setFileUploadModalOpen(true);
          }}
          onDelete={async (fileId) => {
            await deleteProjectFile(fileId);
            await loadProject();
          }}
        />
      )}

      {/* Company Files Tab */}
      {activeTab === "companyFiles" && (
        <CompanyFilesTab
          files={companyFiles}
          onUpload={() => {
            setFileUploadType("company");
            setFileUploadModalOpen(true);
          }}
          onDelete={async (fileId) => {
            await deleteProjectFile(fileId);
            await loadProject();
          }}
        />
      )}

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={fileUploadModalOpen}
        onClose={() => {
          setFileUploadModalOpen(false);
          setFileUploadType("client");
        }}
        uploadType={fileUploadType}
        onUploadComplete={async (url) => {
          if (!project) return;
          setSubmitting(true);
          try {
            const userId =
              typeof project.userId === "object" && project.userId !== null
                ? project.userId._id
                : project.userId;

            // Extract file name and type from URL or use defaults
            const fileName = url.split("/").pop() || "file";
            const fileType = fileName.split(".").pop() || "unknown";

            await createProjectFile({
              projectId: project._id,
              userId: userId as string,
              fileUrl: url,
              fileName: fileName,
              fileType: fileType,
              uploadedBy: fileUploadType,
            });

            setFileUploadModalOpen(false);
            setFileUploadType("client");
            await loadProject();
          } catch (err) {
            console.error("Failed to upload file:", err);
            alert(isArabic ? "فشل رفع الملف" : "Failed to upload file");
          } finally {
            setSubmitting(false);
          }
        }}
        submitting={submitting}
      />
      {/* Floating Refresh Button - Only show when project is loaded */}
      {project && (
        <Button
          onClick={async () => {
            setRefreshing(true);
            try {
              await loadProject();
            } catch (err) {
              console.error("Failed to refresh project:", err);
            } finally {
              setRefreshing(false);
            }
          }}
          disabled={refreshing}
          className="fixed bottom-8 left-8 z-50 h-14 w-14 rounded-full bg-primary text-black shadow-lg hover:bg-primary/90 transition-all hover:scale-110 disabled:opacity-50"
          title={isArabic ? "تحديث البيانات" : "Refresh Data"}
        >
          <RefreshCw
            className={`h-6 w-6 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      )}
    </div>
  );
}
