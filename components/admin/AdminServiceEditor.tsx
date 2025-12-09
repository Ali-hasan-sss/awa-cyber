"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { updateServiceApi } from "@/lib/actions/serviceActions";
import { X, Trash2, Plus, Layers } from "lucide-react";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

interface AdminServiceEditorProps {
  service: any;
  onUpdated: () => void;
  onCancel: () => void;
}

export default function AdminServiceEditor({
  service,
  onUpdated,
  onCancel,
}: AdminServiceEditorProps) {
  const { locale, isArabic } = useLanguage();

  const initializeForm = () => ({
    titleEn:
      typeof service.title === "string"
        ? service.title
        : service.title?.en || "",
    titleAr:
      typeof service.title === "string"
        ? service.title
        : service.title?.ar || "",
    descriptionEn:
      typeof service.description === "string"
        ? service.description
        : service.description?.en || "",
    descriptionAr:
      typeof service.description === "string"
        ? service.description
        : service.description?.ar || "",
    images: service.images || [],
    features:
      service.features?.map((f: any) => ({
        icon: f.icon || "",
        nameEn: typeof f.name === "string" ? f.name : f.name?.en || "",
        nameAr: typeof f.name === "string" ? f.name : f.name?.ar || "",
        descriptionEn:
          typeof f.description === "string"
            ? f.description
            : f.description?.en || "",
        descriptionAr:
          typeof f.description === "string"
            ? f.description
            : f.description?.ar || "",
      })) || [],
  });

  const [form, setForm] = useState(initializeForm);

  // تحديث الفورم عند تغيير service
  useEffect(() => {
    if (service && service._id) {
      setForm(initializeForm());
      setActiveFeatureIndex(null);
      setDraftFeature(null);
      setIconPickerIndex(null);
      setError(null);
    }
  }, [
    service?._id,
    JSON.stringify(service?.title),
    JSON.stringify(service?.description),
    JSON.stringify(service?.images),
    JSON.stringify(service?.features),
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iconPickerIndex, setIconPickerIndex] = useState<
    number | string | null
  >(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(
    null
  );
  const [draftFeature, setDraftFeature] = useState<any>(null);

  const inputStyles =
    "rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary focus:border-transparent transition";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanImages = form.images.filter(Boolean);
    if (!cleanImages.length) {
      setError(
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
                (feature: any) =>
                  feature.icon.trim() &&
                  feature.nameEn.trim() &&
                  feature.nameAr.trim()
              )
              .map((feature: any) => ({
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
      await updateServiceApi(service._id, payload);
      onUpdated();
    } catch (err: any) {
      setError(
        err.message || (isArabic ? "حدث خطأ أثناء الحفظ" : "Error saving")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_: string, idx: number) => idx !== index),
    }));
  };

  const addFeature = () => {
    setDraftFeature({
      icon: "",
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
    });
    setActiveFeatureIndex(null);
    setIconPickerIndex(null);
  };

  const saveDraftFeature = () => {
    if (!draftFeature) return;
    const hasContent =
      draftFeature.icon ||
      draftFeature.nameEn ||
      draftFeature.nameAr ||
      draftFeature.descriptionEn ||
      draftFeature.descriptionAr;

    if (!hasContent) return;

    setForm((prev) => ({
      ...prev,
      features: [...prev.features, draftFeature],
    }));
    setDraftFeature(null);
    setIconPickerIndex(null);
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_: any, idx: number) => idx !== index),
    }));
    if (activeFeatureIndex === index) setActiveFeatureIndex(null);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, features };
    });
  };

  const updateDraftFeature = (field: string, value: string) => {
    if (!draftFeature) return;
    setDraftFeature({ ...draftFeature, [field]: value });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isArabic ? "تعديل الخدمة" : "Edit Service"}
          </h2>
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
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
            placeholder={isArabic ? "الوصف (EN)" : "Description (EN)"}
            className={inputStyles}
            value={form.descriptionEn}
            onChange={(e) => updateFormField("descriptionEn", e.target.value)}
          />
          <Textarea
            placeholder={isArabic ? "الوصف (AR)" : "Description (AR)"}
            className={inputStyles}
            value={form.descriptionAr}
            onChange={(e) => updateFormField("descriptionAr", e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-900">
            {isArabic ? "الصور" : "Images"}
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {form.images.map((imageUrl: string, index: number) => (
                <div
                  key={index}
                  className="group relative rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <img
                    src={imageUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              {isArabic ? "المزايا" : "Features"}
            </p>
            <Button type="button" variant="outline" onClick={addFeature}>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {isArabic ? "إضافة ميزة" : "Add Feature"}
            </Button>
          </div>

          {form.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.features.map((feature: any, index: number) => {
                const IconPreview =
                  feature.icon &&
                  serviceIconComponents[feature.icon as ServiceIconKey];
                return (
                  <button
                    key={index}
                    type="button"
                    className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      activeFeatureIndex === index
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setActiveFeatureIndex(index);
                      setIconPickerIndex(null);
                      setDraftFeature(null);
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
                      className="rounded-full bg-gray-200 p-1 text-gray-600 hover:text-red-500"
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
            <div className="rounded-2xl border border-primary/30 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                  {isArabic ? "ميزة جديدة" : "New Feature"}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDraftFeature(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconPreview =
                      draftFeature.icon &&
                      serviceIconComponents[
                        draftFeature.icon as ServiceIconKey
                      ];
                    return IconPreview ? (
                      <IconPreview className="h-5 w-5 text-primary" />
                    ) : (
                      <Layers className="h-5 w-5 text-gray-400" />
                    );
                  })()}
                  <span className="text-sm text-gray-600">
                    {draftFeature.icon ||
                      (isArabic ? "لم يتم اختيار أيقونة" : "No icon selected")}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setIconPickerIndex(
                      iconPickerIndex === "draft" ? null : "draft"
                    )
                  }
                >
                  {isArabic ? "اختيار أيقونة" : "Choose icon"}
                </Button>
              </div>
              {iconPickerIndex === "draft" && (
                <div className="grid gap-2 rounded-2xl border border-gray-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {serviceIconOptions.map((option) => {
                    const Icon = option.Icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                          draftFeature.icon === option.value
                            ? "border-primary text-primary"
                            : "border-gray-200 text-gray-700"
                        }`}
                        onClick={() => {
                          updateDraftFeature("icon", option.value);
                          setIconPickerIndex(null);
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{option.label[locale]}</span>
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
                  onChange={(e) => updateDraftFeature("nameEn", e.target.value)}
                />
                <Input
                  placeholder={isArabic ? "اسم (AR)" : "Name (AR)"}
                  className={inputStyles}
                  value={draftFeature.nameAr}
                  onChange={(e) => updateDraftFeature("nameAr", e.target.value)}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Textarea
                  placeholder={isArabic ? "الوصف (EN)" : "Description (EN)"}
                  className={inputStyles}
                  value={draftFeature.descriptionEn}
                  onChange={(e) =>
                    updateDraftFeature("descriptionEn", e.target.value)
                  }
                />
                <Textarea
                  placeholder={isArabic ? "الوصف (AR)" : "Description (AR)"}
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
                  onClick={() => setDraftFeature(null)}
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="button" onClick={saveDraftFeature}>
                  <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {isArabic ? "إضافة" : "Add"}
                </Button>
              </div>
            </div>
          )}

          {/* Active Feature Form */}
          {activeFeatureIndex !== null && form.features[activeFeatureIndex] && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold">
                  {isArabic ? "تعديل الميزة" : "Edit Feature"}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveFeatureIndex(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {(() => {
                const feature = form.features[activeFeatureIndex];
                return (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconPreview =
                            feature.icon &&
                            serviceIconComponents[
                              feature.icon as ServiceIconKey
                            ];
                          return IconPreview ? (
                            <IconPreview className="h-5 w-5 text-primary" />
                          ) : (
                            <Layers className="h-5 w-5 text-gray-400" />
                          );
                        })()}
                        <span className="text-sm text-gray-600">
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
                      <div className="grid gap-2 rounded-2xl border border-gray-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
                        {serviceIconOptions.map((option) => {
                          const Icon = option.Icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                                feature.icon === option.value
                                  ? "border-primary text-primary"
                                  : "border-gray-200 text-gray-700"
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
                              <span>{option.label[locale]}</span>
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
                          isArabic ? "الوصف (EN)" : "Description (EN)"
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
                          isArabic ? "الوصف (AR)" : "Description (AR)"
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
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? isArabic
                ? "جارٍ الحفظ..."
                : "Saving..."
              : isArabic
              ? "حفظ التغييرات"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
