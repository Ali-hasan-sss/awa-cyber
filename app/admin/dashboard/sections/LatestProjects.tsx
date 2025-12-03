"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Pencil, Save, X, Trash2, Plus } from "lucide-react";
import { getSections, updateSection, Section } from "@/lib/api/sections";
import {
  fetchAdminPortfolios,
  createPortfolioApi,
  updatePortfolioApi,
  deletePortfolioApi,
  PortfolioPayload,
} from "@/lib/actions/portfolioActions";
import FileUpload from "@/components/ui/FileUpload";
import Image from "next/image";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";
import { fetchAdminServices } from "@/lib/actions/serviceActions";

// Helper function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

type Portfolio = {
  _id: string;
  title: { en: string; ar: string };
  description?: { en: string; ar: string };
  images: string[];
  serviceId?: string | { _id: string; title: { en: string; ar: string } };
  features?: Array<{
    icon: string;
    name: { en: string; ar: string };
    description?: { en: string; ar: string };
  }>;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
};

type Service = {
  _id: string;
  title: { en: string; ar: string };
};

export default function LatestProjectsSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [latestProjectsSection, setLatestProjectsSection] =
    useState<Section | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [iconPickerIndex, setIconPickerIndex] = useState<
    number | string | null
  >(null);
  const [draftPortfolio, setDraftPortfolio] = useState<{
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    images: string[];
    completionDate: string;
    serviceId: string;
    features: Array<{
      icon: string;
      nameEn: string;
      nameAr: string;
      descriptionEn: string;
      descriptionAr: string;
    }>;
  } | null>(null);
  const [editedPortfolio, setEditedPortfolio] = useState<{
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    images: string[];
    completionDate: string;
    serviceId: string;
    features: Array<{
      icon: string;
      nameEn: string;
      nameAr: string;
      descriptionEn: string;
      descriptionAr: string;
    }>;
  } | null>(null);

  // Form state for section (title and description only)
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
  });

  useEffect(() => {
    loadLatestProjectsSection();
    loadPortfolios();
    loadServices();
  }, []);

  const loadLatestProjectsSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "home" });
      // Get the fifth section (index 4) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 4) {
        const section = sortedData[4];
        setLatestProjectsSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Latest Projects section");
      console.error("Error loading Latest Projects section:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolios = async () => {
    try {
      setPortfoliosLoading(true);
      const response = await fetchAdminPortfolios();
      // Handle different response formats: response.data or response directly
      let data: any[] = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && typeof response === "object") {
        // Check if response has a data property
        if (Array.isArray((response as any).data)) {
          data = (response as any).data;
        } else if (
          (response as any).success &&
          Array.isArray((response as any).data)
        ) {
          data = (response as any).data;
        }
      }

      // Sort by completionDate or createdAt descending and take latest one only
      const sortedPortfolios =
        data.length > 0
          ? data
              .sort((a: any, b: any) => {
                const dateA = new Date(
                  a.completionDate || a.createdAt || 0
                ).getTime();
                const dateB = new Date(
                  b.completionDate || b.createdAt || 0
                ).getTime();
                return dateB - dateA;
              })
              .slice(0, 1) // Take only the latest one
          : [];
      setPortfolios(sortedPortfolios);
    } catch (err: any) {
      console.error("Error loading portfolios:", err);
      setPortfolios([]);
    } finally {
      setPortfoliosLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const data = await fetchAdminServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading services:", err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!latestProjectsSection) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        title: {
          en: form.titleEn.trim(),
          ar: form.titleAr.trim(),
        },
        description: {
          en: form.descriptionEn.trim(),
          ar: form.descriptionAr.trim(),
        },
      };

      await updateSection(latestProjectsSection._id, payload);
      await loadLatestProjectsSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save Latest Projects section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (latestProjectsSection) {
      setForm({
        titleEn: latestProjectsSection.title?.en || "",
        titleAr: latestProjectsSection.title?.ar || "",
        descriptionEn: latestProjectsSection.description?.en || "",
        descriptionAr: latestProjectsSection.description?.ar || "",
      });
    }
    setIsEditing(false);
    setError(null);
    setDraftPortfolio(null);
    setIsEditingPortfolio(false);
    setEditedPortfolio(null);
  };

  const addPortfolio = () => {
    setIsEditingPortfolio(false);
    setDraftPortfolio({
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      images: [],
      completionDate: "",
      serviceId: "",
      features: [],
    });
  };

  const saveDraftPortfolio = async () => {
    if (!draftPortfolio) return;

    const hasContent =
      draftPortfolio.titleEn ||
      draftPortfolio.titleAr ||
      draftPortfolio.descriptionEn ||
      draftPortfolio.descriptionAr;

    if (!hasContent) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (!draftPortfolio.serviceId) {
        setError(isArabic ? "يجب اختيار الخدمة" : "Service is required");
        setSubmitting(false);
        return;
      }

      const payload: PortfolioPayload = {
        title: {
          en: draftPortfolio.titleEn.trim(),
          ar: draftPortfolio.titleAr.trim(),
        },
        description: {
          en: draftPortfolio.descriptionEn.trim(),
          ar: draftPortfolio.descriptionAr.trim(),
        },
        images: draftPortfolio.images,
        completionDate:
          draftPortfolio.completionDate || new Date().toISOString(),
        serviceId: draftPortfolio.serviceId,
        features: draftPortfolio.features.map((f) => ({
          icon: f.icon,
          name: {
            en: f.nameEn.trim(),
            ar: f.nameAr.trim(),
          },
          description: {
            en: f.descriptionEn.trim(),
            ar: f.descriptionAr.trim(),
          },
        })),
      };

      await createPortfolioApi(payload);
      await loadPortfolios();
      setDraftPortfolio(null);
    } catch (err: any) {
      setError(err.message || "Failed to create portfolio");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelDraftPortfolio = () => {
    setDraftPortfolio(null);
  };

  const updateDraftPortfolio = (
    field:
      | "titleEn"
      | "titleAr"
      | "descriptionEn"
      | "descriptionAr"
      | "completionDate"
      | "serviceId",
    value: string
  ) => {
    if (!draftPortfolio) return;
    setDraftPortfolio({ ...draftPortfolio, [field]: value });
  };

  const updateDraftPortfolioImages = (images: string[]) => {
    if (!draftPortfolio) return;
    setDraftPortfolio({ ...draftPortfolio, images });
  };

  const addDraftFeature = () => {
    if (!draftPortfolio) return;
    setDraftPortfolio({
      ...draftPortfolio,
      features: [
        ...draftPortfolio.features,
        {
          icon: "ShieldCheck",
          nameEn: "",
          nameAr: "",
          descriptionEn: "",
          descriptionAr: "",
        },
      ],
    });
  };

  const updateDraftFeature = (
    index: number,
    field: "icon" | "nameEn" | "nameAr" | "descriptionEn" | "descriptionAr",
    value: string
  ) => {
    if (!draftPortfolio) return;
    const features = [...draftPortfolio.features];
    features[index] = { ...features[index], [field]: value };
    setDraftPortfolio({ ...draftPortfolio, features });
  };

  const removeDraftFeature = (index: number) => {
    if (!draftPortfolio) return;
    setDraftPortfolio({
      ...draftPortfolio,
      features: draftPortfolio.features.filter((_, i) => i !== index),
    });
  };

  const removePortfolio = async (portfolioId: string) => {
    if (
      !confirm(isArabic ? "هل تريد حذف هذا المشروع؟" : "Delete this portfolio?")
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await deletePortfolioApi(portfolioId);
      await loadPortfolios(); // This will reload and get the latest one only
      setIsEditingPortfolio(false);
      setEditedPortfolio(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete portfolio");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditingPortfolio = (portfolio: Portfolio) => {
    // Handle serviceId as string or object
    const serviceIdValue =
      typeof portfolio.serviceId === "string"
        ? portfolio.serviceId
        : (portfolio.serviceId as any)?._id || "";

    setEditedPortfolio({
      titleEn: portfolio.title?.en || "",
      titleAr: portfolio.title?.ar || "",
      descriptionEn: portfolio.description?.en || "",
      descriptionAr: portfolio.description?.ar || "",
      images: portfolio.images || [],
      completionDate: portfolio.completionDate
        ? new Date(portfolio.completionDate).toISOString().split("T")[0]
        : "",
      serviceId: serviceIdValue,
      features:
        portfolio.features?.map((f) => ({
          icon: f.icon || "ShieldCheck",
          nameEn: f.name?.en || "",
          nameAr: f.name?.ar || "",
          descriptionEn: f.description?.en || "",
          descriptionAr: f.description?.ar || "",
        })) || [],
    });
    setIsEditingPortfolio(true);
  };

  const updateEditedPortfolio = (
    field:
      | "titleEn"
      | "titleAr"
      | "descriptionEn"
      | "descriptionAr"
      | "completionDate"
      | "serviceId",
    value: string
  ) => {
    if (!editedPortfolio) return;
    setEditedPortfolio({ ...editedPortfolio, [field]: value });
  };

  const updateEditedPortfolioImages = (images: string[]) => {
    if (!editedPortfolio) return;
    setEditedPortfolio({ ...editedPortfolio, images });
  };

  const addEditedFeature = () => {
    if (!editedPortfolio) return;
    setEditedPortfolio({
      ...editedPortfolio,
      features: [
        ...editedPortfolio.features,
        {
          icon: "ShieldCheck",
          nameEn: "",
          nameAr: "",
          descriptionEn: "",
          descriptionAr: "",
        },
      ],
    });
  };

  const updateEditedFeature = (
    index: number,
    field: "icon" | "nameEn" | "nameAr" | "descriptionEn" | "descriptionAr",
    value: string
  ) => {
    if (!editedPortfolio) return;
    const features = [...editedPortfolio.features];
    features[index] = { ...features[index], [field]: value };
    setEditedPortfolio({ ...editedPortfolio, features });
  };

  const removeEditedFeature = (index: number) => {
    if (!editedPortfolio) return;
    setEditedPortfolio({
      ...editedPortfolio,
      features: editedPortfolio.features.filter((_, i) => i !== index),
    });
  };

  const savePortfolio = async (portfolioId: string) => {
    if (!editedPortfolio) return;

    setSubmitting(true);
    setError(null);

    try {
      if (!editedPortfolio.serviceId) {
        setError(isArabic ? "يجب اختيار الخدمة" : "Service is required");
        setSubmitting(false);
        return;
      }

      const payload: PortfolioPayload = {
        title: {
          en: editedPortfolio.titleEn.trim(),
          ar: editedPortfolio.titleAr.trim(),
        },
        description: {
          en: editedPortfolio.descriptionEn.trim(),
          ar: editedPortfolio.descriptionAr.trim(),
        },
        images: editedPortfolio.images,
        completionDate:
          editedPortfolio.completionDate || new Date().toISOString(),
        serviceId: editedPortfolio.serviceId,
        features: editedPortfolio.features.map((f) => ({
          icon: f.icon,
          name: {
            en: f.nameEn.trim(),
            ar: f.nameAr.trim(),
          },
          description: {
            en: f.descriptionEn.trim(),
            ar: f.descriptionAr.trim(),
          },
        })),
      };

      await updatePortfolioApi(portfolioId, payload);
      await loadPortfolios(); // This will reload and get the latest one only
      setEditedPortfolio(null);
      setIsEditingPortfolio(false);
    } catch (err: any) {
      setError(err.message || "Failed to update portfolio");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEditingPortfolio = () => {
    setEditedPortfolio(null);
    setIsEditingPortfolio(false);
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get section content
  const sectionTitle = isEditing
    ? form.titleEn || form.titleAr
    : latestProjectsSection?.title?.[locale] ||
      (locale === "ar" ? "أحدث المشاريع" : "Latest Projects");
  const sectionDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(latestProjectsSection?.description?.[locale] || "");

  // Get latest portfolio (already limited to 1 in loadPortfolios)
  const latestPortfolio = useMemo(() => {
    return portfolios.length > 0 ? portfolios[0] : null;
  }, [portfolios]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading Latest Projects section..."}
        </div>
      </div>
    );
  }

  if (!latestProjectsSection && !isEditing) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic
            ? "لا يوجد قسم أحدث المشاريع للعرض"
            : "No Latest Projects section found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "قسم أحدث المشاريع" : "Latest Projects Section"}
        </h2>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="rounded-full"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {isArabic ? "تعديل" : "Edit"}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="rounded-full"
            >
              <X className="h-4 w-4 mr-2" />
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="rounded-full bg-primary px-6 text-black hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {submitting
                ? isArabic
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isArabic
                ? "حفظ"
                : "Save"}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Latest Projects Display/Edit Section */}
      <div className="relative bg-gradient-to-b from-white to-primary/5 rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
        {isEditing ? (
          <div className="p-6 space-y-6">
            {/* Grid Layout for Large Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Title, Description */}
              <div className="space-y-6">
                {/* Title */}
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {isArabic ? "العنوان (إنجليزي)" : "Title (English)"}
                      </label>
                      <Input
                        value={form.titleEn}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            titleEn: e.target.value,
                          }))
                        }
                        className={inputStyles}
                        placeholder={
                          isArabic
                            ? "أدخل العنوان بالإنجليزية"
                            : "Enter title in English"
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {isArabic ? "العنوان (عربي)" : "Title (Arabic)"}
                      </label>
                      <Input
                        value={form.titleAr}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            titleAr: e.target.value,
                          }))
                        }
                        className={inputStyles}
                        placeholder={
                          isArabic
                            ? "أدخل العنوان بالعربية"
                            : "Enter title in Arabic"
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {isArabic ? "الوصف (إنجليزي)" : "Description (English)"}
                      </label>
                      <RichTextEditor
                        value={form.descriptionEn}
                        onChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            descriptionEn: value,
                          }))
                        }
                        placeholder={
                          isArabic
                            ? "أدخل الوصف بالإنجليزية..."
                            : "Enter description in English..."
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {isArabic ? "الوصف (عربي)" : "Description (Arabic)"}
                      </label>
                      <RichTextEditor
                        value={form.descriptionAr}
                        onChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            descriptionAr: value,
                          }))
                        }
                        placeholder={
                          isArabic
                            ? "أدخل الوصف بالعربية..."
                            : "Enter description in Arabic..."
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Portfolio Management */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border-2 border-primary/30 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <span className="text-primary">📁</span>
                        {isArabic ? "آخر مشروع" : "Latest Project"}
                      </h3>
                      <p className="text-xs text-white/60">
                        {isArabic
                          ? "أضف أو عدّل آخر مشروع"
                          : "Add or edit latest project"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={addPortfolio}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                    </Button>
                  </div>

                  {/* Draft Portfolio Form */}
                  {draftPortfolio && (
                    <div className="mb-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 space-y-4 max-h-[600px] overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-cyan-300">
                          {isArabic ? "إضافة مشروع" : "Add Project"}
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={saveDraftPortfolio}
                            size="sm"
                            disabled={submitting}
                            className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
                          >
                            {isArabic ? "حفظ" : "Save"}
                          </Button>
                          <Button
                            type="button"
                            onClick={cancelDraftPortfolio}
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                          >
                            {isArabic ? "إلغاء" : "Cancel"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-white/70 mb-1">
                            {isArabic ? "الخدمة" : "Service"} *
                          </label>
                          <select
                            value={draftPortfolio.serviceId}
                            onChange={(e) =>
                              updateDraftPortfolio("serviceId", e.target.value)
                            }
                            className={inputStyles}
                            required
                          >
                            <option value="">
                              {isArabic ? "اختر الخدمة" : "Select Service"}
                            </option>
                            {services.map((service) => (
                              <option key={service._id} value={service._id}>
                                {service.title?.[locale] ||
                                  service.title?.en ||
                                  ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "العنوان (EN)" : "Title (EN)"}
                            </label>
                            <Input
                              value={draftPortfolio.titleEn}
                              onChange={(e) =>
                                updateDraftPortfolio("titleEn", e.target.value)
                              }
                              className={inputStyles}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "العنوان (AR)" : "Title (AR)"}
                            </label>
                            <Input
                              value={draftPortfolio.titleAr}
                              onChange={(e) =>
                                updateDraftPortfolio("titleAr", e.target.value)
                              }
                              className={inputStyles}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "الوصف (EN)" : "Description (EN)"}
                            </label>
                            <Input
                              value={draftPortfolio.descriptionEn}
                              onChange={(e) =>
                                updateDraftPortfolio(
                                  "descriptionEn",
                                  e.target.value
                                )
                              }
                              className={inputStyles}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "الوصف (AR)" : "Description (AR)"}
                            </label>
                            <Input
                              value={draftPortfolio.descriptionAr}
                              onChange={(e) =>
                                updateDraftPortfolio(
                                  "descriptionAr",
                                  e.target.value
                                )
                              }
                              className={inputStyles}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-white/70 mb-1">
                            {isArabic ? "تاريخ الإنجاز" : "Completion Date"}
                          </label>
                          <Input
                            type="date"
                            value={draftPortfolio.completionDate}
                            onChange={(e) =>
                              updateDraftPortfolio(
                                "completionDate",
                                e.target.value
                              )
                            }
                            className={inputStyles}
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-white/70 mb-1">
                            {isArabic ? "الصور" : "Images"}
                          </label>
                          <FileUpload
                            multiple
                            accept="image/*"
                            maxSize={10}
                            hideUploadedFiles={true}
                            onMultipleUploadComplete={(urls) => {
                              updateDraftPortfolioImages([
                                ...draftPortfolio.images,
                                ...urls,
                              ]);
                            }}
                          />
                          {draftPortfolio.images.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {draftPortfolio.images.map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className="relative rounded-lg overflow-hidden border border-white/10"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Portfolio ${index + 1}`}
                                    className="w-full h-20 object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDraftPortfolioImages(
                                        draftPortfolio.images.filter(
                                          (_, i) => i !== index
                                        )
                                      );
                                    }}
                                    className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs text-white/70">
                              {isArabic ? "الميزات" : "Features"}
                            </label>
                            <Button
                              type="button"
                              onClick={addDraftFeature}
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {isArabic ? "إضافة" : "Add"}
                            </Button>
                          </div>
                          {draftPortfolio.features.map((feature, idx) => (
                            <div
                              key={idx}
                              className="mb-2 p-2 rounded-lg border border-white/10 bg-white/[0.02]"
                            >
                              <div className="grid gap-2 md:grid-cols-3 mb-2">
                                <div>
                                  <label className="block text-xs text-white/70 mb-1">
                                    {isArabic ? "الأيقونة" : "Icon"}
                                  </label>
                                  <Input
                                    value={feature.icon}
                                    onChange={(e) =>
                                      updateDraftFeature(
                                        idx,
                                        "icon",
                                        e.target.value
                                      )
                                    }
                                    className={inputStyles}
                                    placeholder="ShieldCheck"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-white/70 mb-1">
                                    {isArabic ? "الاسم (EN)" : "Name (EN)"}
                                  </label>
                                  <Input
                                    value={feature.nameEn}
                                    onChange={(e) =>
                                      updateDraftFeature(
                                        idx,
                                        "nameEn",
                                        e.target.value
                                      )
                                    }
                                    className={inputStyles}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-white/70 mb-1">
                                    {isArabic ? "الاسم (AR)" : "Name (AR)"}
                                  </label>
                                  <div className="flex gap-1">
                                    <Input
                                      value={feature.nameAr}
                                      onChange={(e) =>
                                        updateDraftFeature(
                                          idx,
                                          "nameAr",
                                          e.target.value
                                        )
                                      }
                                      className={inputStyles}
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => removeDraftFeature(idx)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Portfolio */}
                  {portfoliosLoading ? (
                    <p className="text-sm text-white/60 text-center py-4">
                      {isArabic ? "جاري التحميل..." : "Loading..."}
                    </p>
                  ) : latestPortfolio ? (
                    <div className="rounded-2xl border border-white/20 bg-white/[0.05] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {latestPortfolio.title?.[locale] ||
                              latestPortfolio.title?.en ||
                              ""}
                          </p>
                          {latestPortfolio.images &&
                            latestPortfolio.images.length > 0 && (
                              <div className="mt-2 relative w-full h-20 rounded-lg overflow-hidden">
                                <Image
                                  src={latestPortfolio.images[0]}
                                  alt={latestPortfolio.title?.[locale] || ""}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            onClick={() => {
                              if (isEditingPortfolio) {
                                cancelEditingPortfolio();
                              } else {
                                startEditingPortfolio(latestPortfolio);
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 h-7 w-7 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => removePortfolio(latestPortfolio._id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {isEditingPortfolio && editedPortfolio && (
                        <div className="space-y-3 pt-3 border-t border-white/10 max-h-[600px] overflow-y-auto">
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "الخدمة" : "Service"} *
                            </label>
                            <select
                              value={editedPortfolio.serviceId}
                              onChange={(e) =>
                                updateEditedPortfolio(
                                  "serviceId",
                                  e.target.value
                                )
                              }
                              className={inputStyles}
                              required
                            >
                              <option value="">
                                {isArabic ? "اختر الخدمة" : "Select Service"}
                              </option>
                              {services.map((service) => (
                                <option key={service._id} value={service._id}>
                                  {service.title?.[locale] ||
                                    service.title?.en ||
                                    ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="block text-xs text-white/70 mb-1">
                                {isArabic ? "العنوان (EN)" : "Title (EN)"}
                              </label>
                              <Input
                                value={editedPortfolio.titleEn}
                                onChange={(e) =>
                                  updateEditedPortfolio(
                                    "titleEn",
                                    e.target.value
                                  )
                                }
                                className={inputStyles}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/70 mb-1">
                                {isArabic ? "العنوان (AR)" : "Title (AR)"}
                              </label>
                              <Input
                                value={editedPortfolio.titleAr}
                                onChange={(e) =>
                                  updateEditedPortfolio(
                                    "titleAr",
                                    e.target.value
                                  )
                                }
                                className={inputStyles}
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="block text-xs text-white/70 mb-1">
                                {isArabic ? "الوصف (EN)" : "Description (EN)"}
                              </label>
                              <Input
                                value={editedPortfolio.descriptionEn}
                                onChange={(e) =>
                                  updateEditedPortfolio(
                                    "descriptionEn",
                                    e.target.value
                                  )
                                }
                                className={inputStyles}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/70 mb-1">
                                {isArabic ? "الوصف (AR)" : "Description (AR)"}
                              </label>
                              <Input
                                value={editedPortfolio.descriptionAr}
                                onChange={(e) =>
                                  updateEditedPortfolio(
                                    "descriptionAr",
                                    e.target.value
                                  )
                                }
                                className={inputStyles}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "تاريخ الإنجاز" : "Completion Date"}
                            </label>
                            <Input
                              type="date"
                              value={editedPortfolio.completionDate}
                              onChange={(e) =>
                                updateEditedPortfolio(
                                  "completionDate",
                                  e.target.value
                                )
                              }
                              className={inputStyles}
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "الصور" : "Images"}
                            </label>
                            <FileUpload
                              multiple
                              accept="image/*"
                              maxSize={10}
                              hideUploadedFiles={true}
                              onMultipleUploadComplete={(urls) => {
                                updateEditedPortfolioImages([
                                  ...editedPortfolio.images,
                                  ...urls,
                                ]);
                              }}
                            />
                            {editedPortfolio.images &&
                              editedPortfolio.images.length > 0 && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  {editedPortfolio.images.map(
                                    (imageUrl, imgIndex) => (
                                      <div
                                        key={imgIndex}
                                        className="relative rounded-lg overflow-hidden border border-white/10"
                                      >
                                        <img
                                          src={imageUrl}
                                          alt={`Portfolio ${imgIndex + 1}`}
                                          className="w-full h-20 object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            updateEditedPortfolioImages(
                                              editedPortfolio.images.filter(
                                                (_, i) => i !== imgIndex
                                              )
                                            );
                                          }}
                                          className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>

                          {/* Features */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs text-white/70">
                                {isArabic ? "الميزات" : "Features"}
                              </label>
                              <Button
                                type="button"
                                onClick={addEditedFeature}
                                size="sm"
                                variant="outline"
                                className="rounded-full text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                {isArabic ? "إضافة" : "Add"}
                              </Button>
                            </div>
                            {editedPortfolio.features.map((feature, idx) => (
                              <div
                                key={idx}
                                className="mb-2 p-2 rounded-lg border border-white/10 bg-white/[0.02]"
                              >
                                <div className="grid gap-2 md:grid-cols-3 mb-2">
                                  <div>
                                    <label className="block text-xs text-white/70 mb-1">
                                      {isArabic ? "الأيقونة" : "Icon"}
                                    </label>
                                    <Input
                                      value={feature.icon}
                                      onChange={(e) =>
                                        updateEditedFeature(
                                          idx,
                                          "icon",
                                          e.target.value
                                        )
                                      }
                                      className={inputStyles}
                                      placeholder="ShieldCheck"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-white/70 mb-1">
                                      {isArabic ? "الاسم (EN)" : "Name (EN)"}
                                    </label>
                                    <Input
                                      value={feature.nameEn}
                                      onChange={(e) =>
                                        updateEditedFeature(
                                          idx,
                                          "nameEn",
                                          e.target.value
                                        )
                                      }
                                      className={inputStyles}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-white/70 mb-1">
                                      {isArabic ? "الاسم (AR)" : "Name (AR)"}
                                    </label>
                                    <div className="flex gap-1">
                                      <Input
                                        value={feature.nameAr}
                                        onChange={(e) =>
                                          updateEditedFeature(
                                            idx,
                                            "nameAr",
                                            e.target.value
                                          )
                                        }
                                        className={inputStyles}
                                      />
                                      <Button
                                        type="button"
                                        onClick={() => removeEditedFeature(idx)}
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                            <Button
                              type="button"
                              onClick={cancelEditingPortfolio}
                              variant="ghost"
                              size="sm"
                              className="rounded-full"
                            >
                              {isArabic ? "إلغاء" : "Cancel"}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => savePortfolio(latestPortfolio._id)}
                              disabled={submitting}
                              size="sm"
                              className="rounded-full bg-primary text-black hover:bg-primary/90 disabled:opacity-50"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              {submitting
                                ? isArabic
                                  ? "جاري الحفظ..."
                                  : "Saving..."
                                : isArabic
                                ? "حفظ"
                                : "Save"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-white/60 text-center py-4">
                      {isArabic ? "لا يوجد مشروع" : "No project yet"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode - Similar to LatestProjects component */
          <div className="p-6 md:p-8 lg:p-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto rtl:text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {sectionTitle}
              </h2>

              {sectionDescription && (
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {sectionDescription}
                </p>
              )}
            </div>

            {portfoliosLoading ? (
              <div className="mt-12 text-center text-gray-600">
                {isArabic ? "جاري التحميل..." : "Loading project..."}
              </div>
            ) : latestPortfolio ? (
              <div className="mt-12 rounded-[32px] border border-gray-200 bg-white shadow-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="relative lg:w-1/2">
                    <Image
                      src={
                        latestPortfolio.images &&
                        latestPortfolio.images.length > 0
                          ? latestPortfolio.images[0]
                          : "/images/skils.jpg"
                      }
                      alt={latestPortfolio.title?.[locale] || ""}
                      width={640}
                      height={420}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 1024px) 100vw, 640px"
                    />
                    {latestPortfolio.features &&
                      latestPortfolio.features.length > 0 && (
                        <span className="absolute top-6 left-6 flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow">
                          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                            {(() => {
                              const iconKey =
                                latestPortfolio.features[0].icon ||
                                "ShieldCheck";
                              const Icon =
                                iconKey in serviceIconComponents
                                  ? serviceIconComponents[
                                      iconKey as ServiceIconKey
                                    ]
                                  : serviceIconComponents["ShieldCheck"];
                              return <Icon className="h-4 w-4" />;
                            })()}
                          </span>
                          {latestPortfolio.title?.[locale]
                            ?.split(" ")
                            .slice(0, 2)
                            .join(" ") || "Project"}
                        </span>
                      )}
                  </div>

                  <div className="lg:w-1/2 p-8 md:p-12 flex flex-col gap-6 text-center md:text-left md:rtl:text-right">
                    {latestPortfolio.completionDate && (
                      <div className="flex items-center justify-center md:justify-start gap-3 text-sm font-semibold text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Completed{" "}
                        {new Date(
                          latestPortfolio.completionDate
                        ).toLocaleDateString(
                          locale === "ar" ? "ar-SA" : "en-US",
                          {
                            year: "numeric",
                            month: "short",
                          }
                        )}
                      </div>
                    )}
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-gray-900">
                        {latestPortfolio.title?.[locale] ||
                          latestPortfolio.title?.en ||
                          ""}
                      </h3>
                      {latestPortfolio.description && (
                        <p className="text-base text-gray-600 leading-relaxed">
                          {latestPortfolio.description?.[locale] ||
                            latestPortfolio.description?.en ||
                            ""}
                        </p>
                      )}
                    </div>
                    {latestPortfolio.features &&
                      latestPortfolio.features.length > 0 && (
                        <ul className="space-y-4">
                          {latestPortfolio.features
                            .slice(0, 3)
                            .map((item, idx) => {
                              const Icon =
                                (item.icon in serviceIconComponents &&
                                  serviceIconComponents[
                                    item.icon as ServiceIconKey
                                  ]) ||
                                serviceIconComponents["ShieldCheck"];
                              return (
                                <li
                                  key={idx}
                                  className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 justify-center md:justify-start"
                                >
                                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" />
                                  </span>
                                  <span className="text-base text-gray-900">
                                    {item.name?.[locale] || item.name?.en || ""}
                                  </span>
                                </li>
                              );
                            })}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-12 text-center text-gray-600">
                {isArabic ? "لا يوجد مشروع للعرض" : "No project to display"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
