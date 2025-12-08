"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortfolios, AdminPortfolio } from "@/contexts/PortfolioContext";
import { useServices } from "@/contexts/ServiceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  Calendar,
} from "lucide-react";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

type PortfolioFormState = {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  serviceId: string;
  completionDate: string;
  images: string[];
  url: string;
  features: Array<{
    icon: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
  }>;
};

const emptyForm: PortfolioFormState = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  serviceId: "",
  completionDate: "",
  images: [],
  url: "",
  features: [],
};

const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

export default function PortfoliosManagementPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const {
    portfolios,
    loading,
    error,
    fetchPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  } = usePortfolios();
  const { services, fetchServices } = useServices();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PortfolioFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [iconPickerIndex, setIconPickerIndex] = useState<
    number | string | null
  >(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(
    null
  );
  const [draftFeature, setDraftFeature] = useState<{
    icon: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
  } | null>(null);
  const [featureFormError, setFeatureFormError] = useState<string | null>(null);
  const [cardLocale, setCardLocale] = useState<"en" | "ar">(
    isArabic ? "ar" : "en"
  );
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    fetchPortfolios();
    fetchServices();
  }, [fetchPortfolios, fetchServices]);

  const copy = useMemo(
    () => ({
      title: isArabic ? "معرض الأعمال" : "Portfolio Management",
      subtitle: isArabic
        ? "أنشئ أعمالك وعدّلها لتظهر للعملاء بحسب لغتهم."
        : "Create and maintain your portfolio works to show to clients per language.",
      addPortfolio: isArabic ? "إضافة عمل" : "Add Portfolio",
      editPortfolio: isArabic ? "تعديل العمل" : "Edit Portfolio",
      images: isArabic ? "روابط الصور" : "Image URLs",
      features: isArabic ? "المزايا" : "Features",
      noFeatures: isArabic ? "لا توجد مزايا" : "No features yet",
      deleteConfirm: isArabic
        ? "هل تريد حذف هذا العمل؟"
        : "Delete this portfolio?",
      service: isArabic ? "الخدمة" : "Service",
      completionDate: isArabic ? "تاريخ الإنجاز" : "Completion Date",
      cardPreviewTitle: isArabic ? "عرض البطاقات" : "Card preview",
      cardPreviewSubtitle: isArabic
        ? "استعرض كيف سيظهر معرض الأعمال لكل لغة."
        : "Preview how portfolio entries look in each language.",
      previewLanguage: isArabic ? "لغة العرض" : "Preview language",
      noPortfoliosCards: isArabic
        ? "لا توجد أعمال للعرض."
        : "No portfolio entries to display.",
      actionEdit: isArabic ? "تعديل" : "Edit",
      actionDelete: isArabic ? "حذف" : "Delete",
    }),
    [isArabic]
  );
  const localeKey = isArabic ? "ar" : "en";
  const activeFeature =
    activeFeatureIndex !== null ? form.features[activeFeatureIndex] : null;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setDraftFeature(null);
    setActiveFeatureIndex(null);
    setIconPickerIndex(null);
    setFeatureFormError(null);
  };

  const openModal = (portfolio?: AdminPortfolio) => {
    if (portfolio) {
      setEditingId(portfolio._id);
      const completionDate = portfolio.completionDate
        ? new Date(portfolio.completionDate).toISOString().split("T")[0]
        : "";
      setForm({
        titleEn: portfolio.title.en,
        titleAr: portfolio.title.ar,
        descriptionEn: portfolio.description?.en ?? "",
        descriptionAr: portfolio.description?.ar ?? "",
        serviceId:
          typeof portfolio.serviceId === "string"
            ? portfolio.serviceId
            : (portfolio.serviceId as any)?._id || "",
        completionDate,
        images:
          portfolio.images && portfolio.images.length > 0
            ? portfolio.images
            : [],
        url: portfolio.url || "",
        features:
          portfolio.features?.map((feature) => ({
            icon: feature.icon,
            nameEn: feature.name.en,
            nameAr: feature.name.ar,
            descriptionEn: feature.description?.en ?? "",
            descriptionAr: feature.description?.ar ?? "",
          })) ?? [],
      });
      setActiveFeatureIndex(
        portfolio.features && portfolio.features.length ? 0 : null
      );
      setIconPickerIndex(null);
    } else {
      resetForm();
    }
    setFormModalOpen(true);
  };

  const closeModal = () => {
    setFormModalOpen(false);
    resetForm();
  };

  const updateFormField = (
    field: keyof PortfolioFormState,
    value: string | string[] | PortfolioFormState["features"]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const images = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images };
    });
  };

  const handleCarouselNav = (
    portfolioId: string,
    direction: "next" | "prev",
    imagesLength: number
  ) => {
    if (imagesLength <= 1) return;
    setCarouselIndex((prev) => {
      const currentIndex = prev[portfolioId] ?? 0;
      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % imagesLength
          : (currentIndex - 1 + imagesLength) % imagesLength;
      return { ...prev, [portfolioId]: nextIndex };
    });
  };

  const updateFeature = (
    index: number,
    field: keyof (typeof form.features)[number],
    value: string
  ) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    if (activeFeatureIndex !== null) {
      setActiveFeatureIndex(null);
    }
    setDraftFeature({
      icon: "",
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
    });
    setIconPickerIndex(null);
    setFeatureFormError(null);
  };

  const saveDraftFeature = () => {
    if (!draftFeature) return;
    const missingFields: string[] = [];
    if (!draftFeature.icon.trim()) {
      missingFields.push(isArabic ? "الأيقونة مطلوبة" : "Icon is required");
    }
    if (!draftFeature.nameEn.trim()) {
      missingFields.push(
        isArabic
          ? "اسم الميزة بالإنجليزية مطلوب"
          : "Feature name (EN) is required"
      );
    }
    if (!draftFeature.nameAr.trim()) {
      missingFields.push(
        isArabic ? "اسم الميزة بالعربية مطلوب" : "Feature name (AR) is required"
      );
    }
    if (missingFields.length > 0) {
      setFeatureFormError(missingFields[0]);
      return;
    }

    setForm((prev) => ({
      ...prev,
      features: [...prev.features, draftFeature],
    }));

    setDraftFeature(null);
    setIconPickerIndex(null);
    setFeatureFormError(null);
  };

  const cancelDraftFeature = () => {
    setDraftFeature(null);
    setIconPickerIndex(null);
    setFeatureFormError(null);
  };

  const updateDraftFeature = (
    field: "icon" | "nameEn" | "nameAr" | "descriptionEn" | "descriptionAr",
    value: string
  ) => {
    if (!draftFeature) return;
    setDraftFeature({ ...draftFeature, [field]: value });
    if (featureFormError) {
      setFeatureFormError(null);
    }
  };

  const removeFeature = (index: number) => {
    setForm((prev) => {
      const features = prev.features.filter((_, idx) => idx !== index);
      setIconPickerIndex((prevIdx) =>
        prevIdx !== null && prevIdx === index ? null : prevIdx
      );
      setActiveFeatureIndex((prevIdx) => {
        if (prevIdx === null) return prevIdx;
        if (prevIdx === index) return null;
        if (prevIdx > index) return prevIdx - 1;
        return prevIdx;
      });
      return { ...prev, features };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const cleanImages = form.images.filter(Boolean);
    if (!cleanImages.length) {
      setFormError(
        isArabic ? "أضف صورة واحدة على الأقل." : "Add at least one image."
      );
      return;
    }
    if (!form.serviceId) {
      setFormError(isArabic ? "اختر الخدمة." : "Select a service.");
      return;
    }
    if (!form.completionDate) {
      setFormError(isArabic ? "أدخل تاريخ الإنجاز." : "Enter completion date.");
      return;
    }
    const payload = {
      title: { en: form.titleEn.trim(), ar: form.titleAr.trim() },
      description:
        form.descriptionEn.trim() || form.descriptionAr.trim()
          ? {
              en: form.descriptionEn.trim(),
              ar: form.descriptionAr.trim(),
            }
          : undefined,
      serviceId: form.serviceId.trim(),
      completionDate: form.completionDate,
      images: cleanImages,
      url: form.url.trim() || undefined,
      features:
        form.features.length > 0
          ? form.features
              .filter(
                (feature) =>
                  feature.icon.trim() &&
                  feature.nameEn.trim() &&
                  feature.nameAr.trim()
              )
              .map((feature) => ({
                icon: feature.icon.trim(),
                name: {
                  en: feature.nameEn.trim(),
                  ar: feature.nameAr.trim(),
                },
                description:
                  feature.descriptionEn.trim() || feature.descriptionAr.trim()
                    ? {
                        en: feature.descriptionEn.trim(),
                        ar: feature.descriptionAr.trim(),
                      }
                    : undefined,
              }))
          : undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updatePortfolio(editingId, payload);
      } else {
        await createPortfolio(payload);
      }
      closeModal();
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (portfolioId: string) => {
    if (
      !confirm(
        isArabic
          ? "هل أنت متأكد من حذف هذا العمل؟"
          : "Are you sure you want to delete this portfolio?"
      )
    ) {
      return;
    }
    await deletePortfolio(portfolioId);
  };

  const getServiceName = (
    serviceId:
      | string
      | { _id: string; title: { en: string; ar: string } }
      | undefined
  ): string => {
    if (!serviceId) return "-";
    // If serviceId is an object (populated service), use it directly
    if (typeof serviceId === "object" && "title" in serviceId) {
      return isArabic ? serviceId.title.ar : serviceId.title.en;
    }
    // If serviceId is a string, find the service
    const service = services.find((s) => s._id === serviceId);
    if (!service) return String(serviceId);
    return isArabic ? service.title.ar : service.title.en;
  };

  return (
    <div className="space-y-8 text-slate-100">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <Briefcase className="h-9 w-9 text-primary" />
          {copy.title}
        </h1>
        <p className="text-slate-300">{copy.subtitle}</p>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button
          onClick={() => openModal()}
          className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {copy.addPortfolio}
          </div>
        </Button>
        {error && (
          <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {loading && (
          <p className="text-sm text-white/60">
            {isArabic ? "جاري التحميل..." : "Loading portfolios..."}
          </p>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold text-white">
              {copy.cardPreviewTitle}
            </p>
            <p className="text-sm text-white/60">{copy.cardPreviewSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">
              {copy.previewLanguage}
            </span>
            <div className="inline-flex rounded-full border border-white/15 bg-white/[0.04] p-1">
              {(["en", "ar"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setCardLocale(lang)}
                  className={`px-3 py-1 text-xs font-semibold uppercase rounded-full transition ${
                    cardLocale === lang
                      ? "bg-primary text-slate-900"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {lang === "en" ? "EN" : "AR"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!loading && (!Array.isArray(portfolios) || portfolios.length === 0) ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
            {copy.noPortfoliosCards}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {portfolios.map((portfolio) => {
              const currentIndex = carouselIndex[portfolio._id] ?? 0;
              const activeImage =
                portfolio.images && portfolio.images.length > 0
                  ? portfolio.images[
                      Math.min(currentIndex, portfolio.images.length - 1)
                    ]
                  : null;
              const localizedTitle =
                typeof portfolio.title === "string"
                  ? portfolio.title
                  : portfolio.title[cardLocale] || portfolio.title.en;
              const localizedDescription =
                typeof portfolio.description === "string"
                  ? portfolio.description
                  : portfolio.description?.[cardLocale] ||
                    (cardLocale === "ar"
                      ? "لا يوجد وصف لهذا العمل."
                      : "No description available.");
              const serviceLabel = getServiceName(
                typeof portfolio.service === "object" && portfolio.service
                  ? portfolio.service
                  : portfolio.serviceId
              );
              return (
                <div
                  key={`portfolio-card-${portfolio._id}`}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                >
                  <div className="relative mb-4">
                    {activeImage ? (
                      <div className="relative h-48 overflow-hidden rounded-2xl border border-white/10">
                        <img
                          src={activeImage}
                          alt={localizedTitle}
                          className="h-full w-full object-cover"
                        />
                        {portfolio.images.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                              onClick={() =>
                                handleCarouselNav(
                                  portfolio._id,
                                  "prev",
                                  portfolio.images.length
                                )
                              }
                            >
                              {"<"}
                            </button>
                            <button
                              type="button"
                              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                              onClick={() =>
                                handleCarouselNav(
                                  portfolio._id,
                                  "next",
                                  portfolio.images.length
                                )
                              }
                            >
                              {">"}
                            </button>
                          </>
                        )}
                        {portfolio.images.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80">
                            {currentIndex + 1}/{portfolio.images.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm text-white/60">
                        {isArabic ? "بدون صورة" : "No image"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                          <span className="inline-flex items-center gap-2 text-white/70">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {portfolio.completionDate
                              ? new Date(
                                  portfolio.completionDate
                                ).toLocaleDateString()
                              : "-"}
                          </span>
                          <span>{serviceLabel}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          {localizedTitle}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                          onClick={() => openModal(portfolio)}
                          title={copy.actionEdit}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          onClick={() => handleDelete(portfolio._id)}
                          title={copy.actionDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-3">
                      {localizedDescription}
                    </p>
                    {portfolio.features && portfolio.features.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                          {copy.features}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {portfolio.features
                            .slice(0, 4)
                            .map((feature, idx) => (
                              <span
                                key={`${portfolio._id}-feature-${idx}`}
                                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80"
                              >
                                {feature.name[cardLocale] ||
                                  feature.name.en ||
                                  feature.name.ar}
                              </span>
                            ))}
                          {portfolio.features.length > 4 && (
                            <span className="text-xs text-white/60">
                              +{portfolio.features.length - 4}{" "}
                              {isArabic ? "أخرى" : "more"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <form
            onSubmit={handleSubmit}
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {editingId ? copy.editPortfolio : copy.addPortfolio}
                </p>
                <p className="text-sm text-slate-400">
                  {isArabic
                    ? "أدخل التفاصيل لكل من اللغتين."
                    : "Provide bilingual content for this portfolio."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/70 hover:bg-white/10"
                onClick={closeModal}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {formError && (
              <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {formError}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
                className={inputStyles}
                value={form.titleEn}
                onChange={(e) => updateFormField("titleEn", e.target.value)}
                required
              />
              <Input
                placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
                className={inputStyles}
                value={form.titleAr}
                onChange={(e) => updateFormField("titleAr", e.target.value)}
                required
              />
              <Textarea
                placeholder={
                  isArabic ? "الوصف (EN) اختياري" : "Description (EN, optional)"
                }
                className={inputStyles}
                value={form.descriptionEn}
                onChange={(e) =>
                  updateFormField("descriptionEn", e.target.value)
                }
              />
              <Textarea
                placeholder={
                  isArabic ? "الوصف (AR) اختياري" : "Description (AR, optional)"
                }
                className={inputStyles}
                value={form.descriptionAr}
                onChange={(e) =>
                  updateFormField("descriptionAr", e.target.value)
                }
              />
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {copy.service}
                </label>
                <select
                  className={inputStyles}
                  value={form.serviceId}
                  onChange={(e) => updateFormField("serviceId", e.target.value)}
                  required
                >
                  <option value="" className="bg-slate-900 text-white">
                    {isArabic ? "اختر الخدمة" : "Select service"}
                  </option>
                  {services.map((service) => (
                    <option
                      key={service._id}
                      value={service._id}
                      className="bg-slate-900 text-white"
                    >
                      {isArabic ? service.title.ar : service.title.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {copy.completionDate}
                </label>
                <Input
                  type="date"
                  className={inputStyles}
                  value={form.completionDate}
                  onChange={(e) =>
                    updateFormField("completionDate", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/80">
                {isArabic ? "رابط العمل" : "Project URL"}
              </label>
              <Input
                type="url"
                className={inputStyles}
                value={form.url}
                onChange={(e) => updateFormField("url", e.target.value)}
                placeholder={
                  isArabic ? "https://example.com" : "https://example.com"
                }
              />
              <p className="mt-1 text-xs text-white/50">
                {isArabic
                  ? "رابط اختياري للعمل (مثل موقع الويب أو المشروع)"
                  : "Optional URL for the project (e.g., website or project link)"}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-white/80">
                {copy.images}
              </p>

              <FileUpload
                multiple
                accept="image/*"
                maxSize={10}
                hideUploadedFiles={true}
                onMultipleUploadComplete={(urls) => {
                  setForm((prev) => ({
                    ...prev,
                    images: [...prev.images, ...urls],
                  }));
                }}
              />

              {form.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                    {isArabic ? "الصور المرفوعة" : "Uploaded Images"}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {form.images.map((imageUrl, index) => (
                      <div
                        key={`image-${index}`}
                        className="group relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex gap-2">
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-primary/20 p-2 text-primary hover:bg-primary/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs text-white/60">
                            {imageUrl.split("/").pop()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/80">
                  {copy.features}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                  onClick={addFeature}
                >
                  <Plus className="h-4 w-4" />
                  <span>{isArabic ? "إضافة ميزة" : "Add feature"}</span>
                </Button>
              </div>
              {form.features.length === 0 && !draftFeature && (
                <p className="text-sm text-white/50">{copy.noFeatures}</p>
              )}
              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.features.map((feature, index) => {
                    const IconPreview =
                      feature.icon &&
                      serviceIconComponents[feature.icon as ServiceIconKey];
                    return (
                      <button
                        key={`feature-pill-${index}`}
                        type="button"
                        className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                          activeFeatureIndex === index
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/15 text-white/70 hover:bg-white/10"
                        }`}
                        onClick={() => {
                          setActiveFeatureIndex(index);
                          setIconPickerIndex(null);
                        }}
                      >
                        {IconPreview ? (
                          <IconPreview className="h-4 w-4" />
                        ) : (
                          <Briefcase className="h-4 w-4" />
                        )}
                        <span>
                          {feature.nameEn ||
                            feature.nameAr ||
                            `${isArabic ? "ميزة" : "Feature"} ${index + 1}`}
                        </span>
                        <button
                          type="button"
                          className="rounded-full bg-black/20 p-1 text-white/60 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFeature(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Draft Feature Form */}
              {draftFeature && (
                <div className="rounded-2xl border border-primary/30 bg-white/[0.03] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.35em] text-primary">
                      {isArabic ? "ميزة جديدة" : "New Feature"}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:bg-white/10"
                      onClick={cancelDraftFeature}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {featureFormError && (
                    <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                      {featureFormError}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">
                      {(() => {
                        const IconPreview =
                          draftFeature.icon &&
                          serviceIconComponents[
                            draftFeature.icon as ServiceIconKey
                          ];
                        if (IconPreview) {
                          return (
                            <IconPreview className="h-5 w-5 text-primary" />
                          );
                        }
                        return <Briefcase className="h-5 w-5 text-white/40" />;
                      })()}
                      <span className="text-sm text-white/70">
                        {draftFeature.icon ||
                          (isArabic
                            ? "لم يتم اختيار أيقونة"
                            : "No icon selected")}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                      onClick={() =>
                        setIconPickerIndex(draftFeature ? "draft" : null)
                      }
                    >
                      {isArabic ? "اختيار أيقونة" : "Choose icon"}
                    </Button>
                  </div>
                  {iconPickerIndex === "draft" && draftFeature && (
                    <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-2 lg:grid-cols-3">
                      {serviceIconOptions.map((option) => {
                        const Icon = option.Icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition hover:bg-white/10 ${
                              draftFeature.icon === option.value
                                ? "border-primary/60 text-primary"
                                : "border-white/10 text-white/70"
                            }`}
                            onClick={() => {
                              updateDraftFeature("icon", option.value);
                              setIconPickerIndex(null);
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{option.label[localeKey]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      placeholder={isArabic ? "اسم (EN)" : "Name (EN)"}
                      className={inputStyles}
                      value={draftFeature.nameEn}
                      onChange={(e) =>
                        updateDraftFeature("nameEn", e.target.value)
                      }
                    />
                    <Input
                      placeholder={isArabic ? "اسم (AR)" : "Name (AR)"}
                      className={inputStyles}
                      value={draftFeature.nameAr}
                      onChange={(e) =>
                        updateDraftFeature("nameAr", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Textarea
                      placeholder={
                        isArabic
                          ? "الوصف (EN) اختياري"
                          : "Description (EN, optional)"
                      }
                      className={inputStyles}
                      value={draftFeature.descriptionEn}
                      onChange={(e) =>
                        updateDraftFeature("descriptionEn", e.target.value)
                      }
                    />
                    <Textarea
                      placeholder={
                        isArabic
                          ? "الوصف (AR) اختياري"
                          : "Description (AR, optional)"
                      }
                      className={inputStyles}
                      value={draftFeature.descriptionAr}
                      onChange={(e) =>
                        updateDraftFeature("descriptionAr", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                      onClick={cancelDraftFeature}
                    >
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button
                      type="button"
                      className="rounded-full bg-gradient-to-r from-primary to-cyan-400 px-6 text-slate-950 shadow-lg"
                      onClick={saveDraftFeature}
                    >
                      <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {isArabic ? "إضافة" : "Add"}
                    </Button>
                  </div>
                </div>
              )}
              {/* Active Feature Form (for editing existing features) */}
              {activeFeatureIndex !== null &&
                form.features[activeFeatureIndex] && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    {(() => {
                      const feature = form.features[activeFeatureIndex];
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                              {isArabic ? "تعديل الميزة" : "Edit Feature"}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-white/70 hover:bg-white/10"
                              onClick={() => setActiveFeatureIndex(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-white">
                              {(() => {
                                const IconPreview =
                                  feature.icon &&
                                  serviceIconComponents[
                                    feature.icon as ServiceIconKey
                                  ];
                                if (IconPreview) {
                                  return (
                                    <IconPreview className="h-5 w-5 text-primary" />
                                  );
                                }
                                return (
                                  <Briefcase className="h-5 w-5 text-white/40" />
                                );
                              })()}
                              <span className="text-sm text-white/70">
                                {feature.icon ||
                                  (isArabic
                                    ? "لم يتم اختيار أيقونة"
                                    : "No icon selected")}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                              onClick={() =>
                                setIconPickerIndex(
                                  iconPickerIndex === activeFeatureIndex
                                    ? null
                                    : activeFeatureIndex
                                )
                              }
                            >
                              {isArabic ? "اختيار أيقونة" : "Choose icon"}
                            </Button>
                          </div>
                          {iconPickerIndex === activeFeatureIndex && (
                            <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-2 lg:grid-cols-3">
                              {serviceIconOptions.map((option) => {
                                const Icon = option.Icon;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition hover:bg-white/10 ${
                                      feature.icon === option.value
                                        ? "border-primary/60 text-primary"
                                        : "border-white/10 text-white/70"
                                    }`}
                                    onClick={() => {
                                      updateFeature(
                                        activeFeatureIndex,
                                        "icon",
                                        option.value
                                      );
                                      setIconPickerIndex(null);
                                    }}
                                  >
                                    <Icon className="h-4 w-4" />
                                    <span>{option.label[localeKey]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              placeholder={isArabic ? "اسم (EN)" : "Name (EN)"}
                              className={inputStyles}
                              value={feature.nameEn}
                              onChange={(e) =>
                                updateFeature(
                                  activeFeatureIndex,
                                  "nameEn",
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              placeholder={isArabic ? "اسم (AR)" : "Name (AR)"}
                              className={inputStyles}
                              value={feature.nameAr}
                              onChange={(e) =>
                                updateFeature(
                                  activeFeatureIndex,
                                  "nameAr",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Textarea
                              placeholder={
                                isArabic
                                  ? "الوصف (EN) اختياري"
                                  : "Description (EN, optional)"
                              }
                              className={inputStyles}
                              value={feature.descriptionEn}
                              onChange={(e) =>
                                updateFeature(
                                  activeFeatureIndex,
                                  "descriptionEn",
                                  e.target.value
                                )
                              }
                            />
                            <Textarea
                              placeholder={
                                isArabic
                                  ? "الوصف (AR) اختياري"
                                  : "Description (AR, optional)"
                              }
                              className={inputStyles}
                              value={feature.descriptionAr}
                              onChange={(e) =>
                                updateFeature(
                                  activeFeatureIndex,
                                  "descriptionAr",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              {activeFeatureIndex === null && form.features.length > 0 && (
                <p className="text-sm text-white/60">
                  {isArabic
                    ? "انقر على إحدى المزايا لعرض تفاصيلها."
                    : "Click a feature badge to edit its details."}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
                onClick={closeModal}
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-gradient-to-r from-primary to-cyan-400 px-6 text-slate-950 shadow-lg"
              >
                {submitting
                  ? isArabic
                    ? "جارٍ الحفظ..."
                    : "Saving..."
                  : isArabic
                  ? "حفظ العمل"
                  : "Save portfolio"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
