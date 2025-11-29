"use client";

import { useEffect, useMemo, useState } from "react";
import { useServices, AdminService } from "@/contexts/ServiceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { Layers, Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

type ServiceFormState = {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  images: string[];
  features: Array<{
    icon: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
  }>;
};

const emptyForm: ServiceFormState = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  images: [],
  features: [],
};

const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

export default function ServicesManagementPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useServices();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
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
  const [cardLocale, setCardLocale] = useState<"en" | "ar">(
    isArabic ? "ar" : "en"
  );
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const copy = useMemo(
    () => ({
      title: isArabic ? "إدارة الخدمات" : "Service Management",
      subtitle: isArabic
        ? "أنشئ الخدمات وعدّلها لتعرض للعملاء باللغتين."
        : "Create and manage the services shown to your audience.",
      addService: isArabic ? "إضافة خدمة" : "Add Service",
      editService: isArabic ? "تعديل الخدمة" : "Edit Service",
      images: isArabic ? "الصور" : "Images",
      features: isArabic ? "المزايا" : "Features",
      noFeatures: isArabic ? "لا توجد مزايا" : "No features yet",
      deleteConfirm: isArabic
        ? "هل تريد حذف هذه الخدمة؟"
        : "Delete this service?",
      cardSectionTitle: isArabic ? "بطاقات الخدمات" : "Service cards",
      cardSectionSubtitle: isArabic
        ? "استعرض الخدمات واختر لغة العرض لكل بطاقة."
        : "Browse your services and switch the display language.",
      cardLanguageLabel: isArabic ? "لغة البطاقات" : "Card language",
      noServicesCards: isArabic
        ? "لا توجد خدمات للعرض حالياً."
        : "There are no services to display yet.",
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
  };

  const openModal = (service?: AdminService) => {
    if (service) {
      setEditingId(service._id);
      setForm({
        titleEn: service.title.en,
        titleAr: service.title.ar,
        descriptionEn: service.description?.en ?? "",
        descriptionAr: service.description?.ar ?? "",
        images:
          service.images && service.images.length > 0 ? service.images : [],
        features:
          service.features?.map((feature) => ({
            icon: feature.icon,
            nameEn: feature.name.en,
            nameAr: feature.name.ar,
            descriptionEn: feature.description?.en ?? "",
            descriptionAr: feature.description?.ar ?? "",
          })) ?? [],
      });
      setActiveFeatureIndex(
        service.features && service.features.length ? 0 : null
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
    field: keyof ServiceFormState,
    value: string | string[] | ServiceFormState["features"]
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
    serviceId: string,
    direction: "next" | "prev",
    imagesLength: number
  ) => {
    if (imagesLength <= 1) return;
    setCarouselIndex((prev) => {
      const currentIndex = prev[serviceId] ?? 0;
      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % imagesLength
          : (currentIndex - 1 + imagesLength) % imagesLength;
      return { ...prev, [serviceId]: nextIndex };
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
    // Close any active feature form first
    if (activeFeatureIndex !== null) {
      setActiveFeatureIndex(null);
    }
    // Open draft feature form
    setDraftFeature({
      icon: "",
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
    });
    setIconPickerIndex(null);
  };

  const saveDraftFeature = () => {
    if (!draftFeature) return;

    // Check if at least one field is filled
    const hasContent =
      draftFeature.icon ||
      draftFeature.nameEn ||
      draftFeature.nameAr ||
      draftFeature.descriptionEn ||
      draftFeature.descriptionAr;

    if (!hasContent) {
      return; // Don't save empty feature
    }

    // Add the draft feature to the form
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, draftFeature],
    }));

    // Close draft form
    setDraftFeature(null);
    setIconPickerIndex(null);
  };

  const cancelDraftFeature = () => {
    setDraftFeature(null);
    setIconPickerIndex(null);
  };

  const updateDraftFeature = (
    field: "icon" | "nameEn" | "nameAr" | "descriptionEn" | "descriptionAr",
    value: string
  ) => {
    if (!draftFeature) return;
    setDraftFeature({ ...draftFeature, [field]: value });
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
    const payload = {
      title: { en: form.titleEn.trim(), ar: form.titleAr.trim() },
      description:
        form.descriptionEn.trim() || form.descriptionAr.trim()
          ? {
              en: form.descriptionEn.trim(),
              ar: form.descriptionAr.trim(),
            }
          : undefined,
      images: cleanImages,
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
        await updateService(editingId, payload);
      } else {
        await createService(payload);
      }
      closeModal();
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (
      !confirm(
        isArabic
          ? "هل أنت متأكد من حذف هذه الخدمة؟"
          : "Are you sure you want to delete this service?"
      )
    ) {
      return;
    }
    await deleteService(serviceId);
  };

  return (
    <div className="space-y-8 text-slate-100">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <Layers className="h-9 w-9 text-primary" />
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
            {copy.addService}
          </div>
        </Button>
        {error && (
          <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold text-white">
              {copy.cardSectionTitle}
            </p>
            <p className="text-sm text-white/60">{copy.cardSectionSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">
              {copy.cardLanguageLabel}
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

        {loading && (
          <p className="text-sm text-white/60">
            {isArabic ? "جاري التحميل..." : "Loading services..."}
          </p>
        )}

        {!loading && services.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
            {copy.noServicesCards}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const currentIndex = carouselIndex[service._id] ?? 0;
              const activeImage =
                service.images && service.images.length > 0
                  ? service.images[
                      Math.min(currentIndex, service.images.length - 1)
                    ]
                  : null;
              const localizedTitle = service.title[cardLocale] || "";
              const localizedDescription =
                service.description?.[cardLocale] ||
                (cardLocale === "ar"
                  ? "لا يوجد وصف لهذه الخدمة."
                  : "No description available.");
              return (
                <div
                  key={`service-card-${service._id}`}
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
                        {service.images.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                              onClick={() =>
                                handleCarouselNav(
                                  service._id,
                                  "prev",
                                  service.images.length
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
                                  service._id,
                                  "next",
                                  service.images.length
                                )
                              }
                            >
                              {">"}
                            </button>
                          </>
                        )}
                        {service.images.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80">
                            {currentIndex + 1}/{service.images.length}
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
                      <h3 className="text-lg font-semibold text-white flex-1">
                      {localizedTitle}
                    </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                          onClick={() => openModal(service)}
                          title={copy.actionEdit}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          onClick={() => handleDelete(service._id)}
                          title={copy.actionDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-3">
                      {localizedDescription}
                    </p>
                    {service.features && service.features.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                          {copy.features}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {service.features.slice(0, 4).map((feature, idx) => (
                            <span
                              key={`${service._id}-feat-${idx}`}
                              className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80"
                            >
                              {feature.name[cardLocale] ||
                                feature.name.en ||
                                feature.name.ar}
                            </span>
                          ))}
                          {service.features.length > 4 && (
                            <span className="text-xs text-white/60">
                              +{service.features.length - 4}{" "}
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
                  {editingId ? copy.editService : copy.addService}
                </p>
                <p className="text-sm text-slate-400">
                  {isArabic
                    ? "أدخل التفاصيل لكل من اللغتين."
                    : "Provide bilingual content for this service."}
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
              {form.features.length === 0 && (
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
                          <Layers className="h-4 w-4" />
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
                        return <Layers className="h-5 w-5 text-white/40" />;
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
                                  <Layers className="h-5 w-5 text-white/40" />
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
                  ? "حفظ الخدمة"
                  : "Save service"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
