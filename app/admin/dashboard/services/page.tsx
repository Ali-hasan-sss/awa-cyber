"use client";

import { useEffect, useMemo, useState } from "react";
import { useServices, AdminService } from "@/contexts/ServiceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Pencil, Trash2, X } from "lucide-react";
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
  images: [""],
  features: [],
};

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
  const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const copy = useMemo(
    () => ({
      title: isArabic ? "إدارة الخدمات" : "Service Management",
      subtitle: isArabic
        ? "أنشئ الخدمات وعدّلها لتظهر للعملاء بحسب لغتهم."
        : "Create and maintain the catalog of services served to users per language.",
      addService: isArabic ? "إضافة خدمة" : "Add Service",
      editService: isArabic ? "تعديل الخدمة" : "Edit Service",
      images: isArabic ? "روابط الصور" : "Image URLs",
      features: isArabic ? "المزايا" : "Features",
      noFeatures: isArabic ? "لا توجد مزايا" : "No features yet",
      deleteConfirm: isArabic
        ? "هل تريد حذف هذه الخدمة؟"
        : "Delete this service?",
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
          service.images && service.images.length > 0 ? service.images : [""],
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

  const updateImage = (index: number, value: string) => {
    setForm((prev) => {
      const images = [...prev.images];
      images[index] = value;
      return { ...prev, images };
    });
  };

  const addImageField = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index: number) => {
    setForm((prev) => {
      const images = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images: images.length ? images : [""] };
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
    const newFeature = {
      icon: "",
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
    };
    setForm((prev) => {
      const features = [...prev.features, newFeature];
      setActiveFeatureIndex(features.length - 1);
      return { ...prev, features };
    });
    setIconPickerIndex(null);
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
    const cleanImages = form.images.map((img) => img.trim()).filter(Boolean);
    if (!cleanImages.length) {
      setFormError(
        isArabic
          ? "أضف رابط صورة واحد على الأقل."
          : "Add at least one image URL."
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

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
        {loading && (
          <p className="mb-4 text-sm text-white/60">
            {isArabic ? "جاري التحميل..." : "Loading services..."}
          </p>
        )}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.35em] text-white/50">
              <tr>
                <th className="py-2 ltr:text-left rtl:text-right">#</th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "العنوان (EN/AR)" : "Title (EN/AR)"}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "الصور" : "Images"}
                </th>
                <th className="py-2 ltr:text-left rtl:text-right">
                  {isArabic ? "المزايا" : "Features"}
                </th>
                <th className="py-2">{isArabic ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {services.map((service, index) => (
                <tr key={service._id} className="text-white/90">
                  <td className="py-4">{index + 1}</td>
                  <td className="py-4 space-y-1">
                    <p className="font-semibold text-white">
                      {service.title.en}
                    </p>
                    <p className="text-sm text-white/60">{service.title.ar}</p>
                  </td>
                  <td className="py-4">{service.images.length}</td>
                  <td className="py-4">{service.features?.length ?? 0}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                        onClick={() => openModal(service)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="text-xs">
                          {isArabic ? "تعديل" : "Edit"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-red-400/40 text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(service._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">
                          {isArabic ? "حذف" : "Delete"}
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 lg:hidden">
          {services.map((service) => (
            <div
              key={service._id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80"
            >
              <div className="mb-3">
                <p className="text-white font-semibold">{service.title.en}</p>
                <p className="text-white/60">{service.title.ar}</p>
              </div>
              <p className="text-white/60">
                {isArabic ? "عدد الصور: " : "Images: "}
                {service.images.length}
              </p>
              <p className="text-white/60">
                {isArabic ? "عدد المزايا: " : "Features: "}
                {service.features?.length ?? 0}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                  onClick={() => openModal(service)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="text-xs">{isArabic ? "تعديل" : "Edit"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-red-400/40 text-red-300 hover:bg-red-500/10"
                  onClick={() => handleDelete(service._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-xs">{isArabic ? "حذف" : "Delete"}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
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
                className="text-black"
                value={form.titleEn}
                onChange={(e) => updateFormField("titleEn", e.target.value)}
                required
              />
              <Input
                placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
                className="text-black"
                value={form.titleAr}
                onChange={(e) => updateFormField("titleAr", e.target.value)}
                required
              />
              <Textarea
                placeholder={
                  isArabic ? "الوصف (EN) اختياري" : "Description (EN, optional)"
                }
                className="text-black"
                value={form.descriptionEn}
                onChange={(e) =>
                  updateFormField("descriptionEn", e.target.value)
                }
              />
              <Textarea
                placeholder={
                  isArabic ? "الوصف (AR) اختياري" : "Description (AR, optional)"
                }
                className="text-black"
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
              {form.images.map((image, index) => (
                <div key={`image-${index}`} className="flex gap-3">
                  <Input
                    type="url"
                    placeholder={isArabic ? "رابط الصورة" : "Image URL"}
                    className="flex-1 text-black"
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-red-400/40 text-red-300 hover:bg-red-500/10"
                    onClick={() => removeImageField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                onClick={addImageField}
              >
                <Plus className="h-4 w-4" />
                <span>{isArabic ? "إضافة صورة" : "Add image"}</span>
              </Button>
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
              {activeFeatureIndex !== null &&
                form.features[activeFeatureIndex] && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    {(() => {
                      const feature = form.features[activeFeatureIndex];
                      return (
                        <>
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
                              className="text-black"
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
                              className="text-black"
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
                              className="text-black"
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
                              className="text-black"
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
