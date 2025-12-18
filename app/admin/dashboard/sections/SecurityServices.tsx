"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  Pencil,
  Save,
  X,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { getSections, updateSection, Section } from "@/lib/api/sections";
import {
  fetchAdminServices,
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
  ServicePayload,
} from "@/lib/actions/serviceActions";
import FileUpload from "@/components/ui/FileUpload";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";

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

type Service = {
  _id: string;
  title: { en: string; ar: string };
  description?: { en: string; ar: string };
  images: string[];
  features?: Array<{
    icon: string;
    name: { en: string; ar: string };
    description?: { en: string; ar: string };
  }>;
  createdAt: string;
  updatedAt: string;
};

export default function SecurityServicesSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [securityServicesSection, setSecurityServicesSection] =
    useState<Section | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(
    null
  );
  const [draftService, setDraftService] = useState<{
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    images: string[];
  } | null>(null);
  const [editedService, setEditedService] = useState<{
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    images: string[];
  } | null>(null);

  // Form state for section (title and description only)
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
  });

  useEffect(() => {
    loadSecurityServicesSection();
    loadServices();
  }, []);

  const loadSecurityServicesSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "home" });
      // Get the fourth section (index 3) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 3) {
        const section = sortedData[3];
        setSecurityServicesSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Security Services section");
      console.error("Error loading Security Services section:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const data = await fetchAdminServices();
      // Sort by createdAt descending and take latest 4
      const sortedServices = Array.isArray(data)
        ? data
            .sort(
              (a: Service, b: Service) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 4)
        : [];
      setServices(sortedServices);
    } catch (err: any) {
      console.error("Error loading services:", err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!securityServicesSection) return;

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

      await updateSection(securityServicesSection._id, payload);
      await loadSecurityServicesSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save Security Services section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (securityServicesSection) {
      setForm({
        titleEn: securityServicesSection.title?.en || "",
        titleAr: securityServicesSection.title?.ar || "",
        descriptionEn: securityServicesSection.description?.en || "",
        descriptionAr: securityServicesSection.description?.ar || "",
      });
    }
    setIsEditing(false);
    setError(null);
    setDraftService(null);
    setActiveServiceIndex(null);
    setEditedService(null);
  };

  const addService = () => {
    if (activeServiceIndex !== null) {
      setActiveServiceIndex(null);
    }
    setDraftService({
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      images: [],
    });
  };

  const saveDraftService = async () => {
    if (!draftService) return;

    const hasContent =
      draftService.titleEn ||
      draftService.titleAr ||
      draftService.descriptionEn ||
      draftService.descriptionAr;

    if (!hasContent) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: ServicePayload = {
        title: {
          en: draftService.titleEn.trim(),
          ar: draftService.titleAr.trim(),
        },
        description: {
          en: draftService.descriptionEn.trim(),
          ar: draftService.descriptionAr.trim(),
        },
        images: draftService.images,
      };

      await createServiceApi(payload);
      await loadServices();
      setDraftService(null);
    } catch (err: any) {
      setError(err.message || "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelDraftService = () => {
    setDraftService(null);
  };

  const updateDraftService = (
    field: "titleEn" | "titleAr" | "descriptionEn" | "descriptionAr",
    value: string
  ) => {
    if (!draftService) return;
    setDraftService({ ...draftService, [field]: value });
  };

  const updateDraftServiceImages = (images: string[]) => {
    if (!draftService) return;
    setDraftService({ ...draftService, images });
  };

  const removeService = async (serviceId: string) => {
    if (
      !confirm(isArabic ? "هل تريد حذف هذه الخدمة؟" : "Delete this service?")
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await deleteServiceApi(serviceId);
      await loadServices();
      if (activeServiceIndex !== null) {
        setActiveServiceIndex(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete service");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditingService = (service: Service) => {
    setEditedService({
      titleEn: service.title?.en || "",
      titleAr: service.title?.ar || "",
      descriptionEn: service.description?.en || "",
      descriptionAr: service.description?.ar || "",
      images: service.images || [],
    });
  };

  const updateEditedService = (
    field: "titleEn" | "titleAr" | "descriptionEn" | "descriptionAr",
    value: string
  ) => {
    if (!editedService) return;
    setEditedService({ ...editedService, [field]: value });
  };

  const updateEditedServiceImages = (images: string[]) => {
    if (!editedService) return;
    setEditedService({ ...editedService, images });
  };

  const saveService = async (serviceId: string) => {
    if (!editedService) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: ServicePayload = {
        title: {
          en: editedService.titleEn.trim(),
          ar: editedService.titleAr.trim(),
        },
        description: {
          en: editedService.descriptionEn.trim(),
          ar: editedService.descriptionAr.trim(),
        },
        images: editedService.images,
      };

      await updateServiceApi(serviceId, payload);
      await loadServices();
      setEditedService(null);
      setActiveServiceIndex(null);
    } catch (err: any) {
      setError(err.message || "Failed to update service");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEditingService = () => {
    setEditedService(null);
    setActiveServiceIndex(null);
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get section content
  const sectionTitle = isEditing
    ? form.titleEn || form.titleAr
    : securityServicesSection?.title?.[locale] ||
      (locale === "ar" ? "خدمات الأمن السيبراني" : "Security Services");
  const sectionDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(securityServicesSection?.description?.[locale] || "");

  // Get latest 4 services
  const displayedServices = useMemo(() => {
    return services.slice(0, 4);
  }, [services]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic
            ? "جاري التحميل..."
            : "Loading Security Services section..."}
        </div>
      </div>
    );
  }

  if (!securityServicesSection && !isEditing) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic
            ? "لا يوجد قسم خدمات أمنية للعرض"
            : "No Security Services section found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "قسم الخدمات " : " Services Section"}
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

      {/* Security Services Display/Edit Section */}
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

              {/* Right Column - Services Management */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border-2 border-primary/30 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <span className="text-primary">🔒</span>
                        {isArabic ? "الخدمات (أحدث 4)" : "Services (Latest 4)"}
                      </h3>
                      <p className="text-xs text-white/60">
                        {isArabic
                          ? "أضف أو عدّل الخدمات"
                          : "Add or edit services"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={addService}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                    </Button>
                  </div>

                  {/* Draft Service Form */}
                  {draftService && (
                    <div className="mb-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-cyan-300">
                          {isArabic ? "إضافة خدمة" : "Add Service"}
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={saveDraftService}
                            size="sm"
                            disabled={submitting}
                            className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
                          >
                            {isArabic ? "حفظ" : "Save"}
                          </Button>
                          <Button
                            type="button"
                            onClick={cancelDraftService}
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                          >
                            {isArabic ? "إلغاء" : "Cancel"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "العنوان (EN)" : "Title (EN)"}
                            </label>
                            <Input
                              value={draftService.titleEn}
                              onChange={(e) =>
                                updateDraftService("titleEn", e.target.value)
                              }
                              className={inputStyles}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "العنوان (AR)" : "Title (AR)"}
                            </label>
                            <Input
                              value={draftService.titleAr}
                              onChange={(e) =>
                                updateDraftService("titleAr", e.target.value)
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
                              value={draftService.descriptionEn}
                              onChange={(e) =>
                                updateDraftService(
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
                              value={draftService.descriptionAr}
                              onChange={(e) =>
                                updateDraftService(
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
                            {isArabic ? "الصور" : "Images"}
                          </label>
                          <FileUpload
                            multiple
                            accept="image/*"
                            maxSize={10}
                            hideUploadedFiles={true}
                            onMultipleUploadComplete={(urls) => {
                              updateDraftServiceImages([
                                ...draftService.images,
                                ...urls,
                              ]);
                            }}
                          />
                          {draftService.images.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {draftService.images.map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className="relative rounded-lg overflow-hidden border border-white/10"
                                >
                                  <img
                                    src={normalizeImageUrl(imageUrl)}
                                    alt={`Service ${index + 1}`}
                                    className="w-full h-20 object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDraftServiceImages(
                                        draftService.images.filter(
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
                      </div>
                    </div>
                  )}

                  {/* Existing Services */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {servicesLoading ? (
                      <p className="text-sm text-white/60 text-center py-4">
                        {isArabic ? "جاري التحميل..." : "Loading..."}
                      </p>
                    ) : displayedServices.length === 0 && !draftService ? (
                      <p className="text-sm text-white/60 text-center py-4">
                        {isArabic ? "لا توجد خدمات" : "No services yet"}
                      </p>
                    ) : (
                      displayedServices.map((service, index) => (
                        <div
                          key={service._id}
                          className="rounded-2xl border border-white/20 bg-white/[0.05] p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {service.title?.[locale] ||
                                  service.title?.en ||
                                  ""}
                              </p>
                              {service.images && service.images.length > 0 && (
                                <div className="mt-2 relative w-full h-20 rounded-lg overflow-hidden">
                                  <Image
                                    src={normalizeImageUrl(service.images[0])}
                                    alt={service.title?.[locale] || ""}
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
                                  if (activeServiceIndex === index) {
                                    cancelEditingService();
                                  } else {
                                    setActiveServiceIndex(index);
                                    startEditingService(service);
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
                                onClick={() => removeService(service._id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {activeServiceIndex === index && editedService && (
                            <div className="space-y-3 pt-3 border-t border-white/10">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                  <label className="block text-xs text-white/70 mb-1">
                                    {isArabic ? "العنوان (EN)" : "Title (EN)"}
                                  </label>
                                  <Input
                                    value={editedService.titleEn}
                                    onChange={(e) =>
                                      updateEditedService(
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
                                    value={editedService.titleAr}
                                    onChange={(e) =>
                                      updateEditedService(
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
                                    {isArabic
                                      ? "الوصف (EN)"
                                      : "Description (EN)"}
                                  </label>
                                  <Input
                                    value={editedService.descriptionEn}
                                    onChange={(e) =>
                                      updateEditedService(
                                        "descriptionEn",
                                        e.target.value
                                      )
                                    }
                                    className={inputStyles}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-white/70 mb-1">
                                    {isArabic
                                      ? "الوصف (AR)"
                                      : "Description (AR)"}
                                  </label>
                                  <Input
                                    value={editedService.descriptionAr}
                                    onChange={(e) =>
                                      updateEditedService(
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
                                  {isArabic ? "الصور" : "Images"}
                                </label>
                                <FileUpload
                                  multiple
                                  accept="image/*"
                                  maxSize={10}
                                  hideUploadedFiles={true}
                                  onMultipleUploadComplete={(urls) => {
                                    updateEditedServiceImages([
                                      ...editedService.images,
                                      ...urls,
                                    ]);
                                  }}
                                />
                                {editedService.images &&
                                  editedService.images.length > 0 && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      {editedService.images.map(
                                        (imageUrl, imgIndex) => (
                                          <div
                                            key={imgIndex}
                                            className="relative rounded-lg overflow-hidden border border-white/10"
                                          >
                                            <img
                                              src={normalizeImageUrl(imageUrl)}
                                              alt={`Service ${imgIndex + 1}`}
                                              className="w-full h-20 object-cover"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                updateEditedServiceImages(
                                                  editedService.images.filter(
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

                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                                <Button
                                  type="button"
                                  onClick={cancelEditingService}
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-full"
                                >
                                  {isArabic ? "إلغاء" : "Cancel"}
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => saveService(service._id)}
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
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="p-6 md:p-8 lg:p-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto rtl:text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-[2]">
                {sectionTitle}
              </h2>

              {sectionDescription && (
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {sectionDescription}
                </p>
              )}
            </div>

            {servicesLoading ? (
              <div className="mt-12 text-center text-gray-600">
                {isArabic ? "جاري التحميل..." : "Loading services..."}
              </div>
            ) : displayedServices.length > 0 ? (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedServices.map((service) => (
                  <div
                    key={service._id}
                    className="border border-gray-200 bg-white shadow-sm overflow-hidden h-full flex flex-col"
                  >
                    {service.images && service.images.length > 0 && (
                      <div className="relative w-full aspect-video">
                        <Image
                          src={normalizeImageUrl(service.images[0])}
                          alt={service.title?.[locale] || ""}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3 leading-relaxed">
                        {service.title?.[locale] || service.title?.en || ""}
                      </h3>
                      {service.description && (
                        <p className="text-base text-gray-600 leading-relaxed flex-grow">
                          {service.description?.[locale] ||
                            service.description?.en ||
                            ""}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-12 text-center text-gray-600">
                {isArabic ? "لا توجد خدمات للعرض" : "No services to display"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
