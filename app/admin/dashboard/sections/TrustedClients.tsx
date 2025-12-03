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
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

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

export default function TrustedClientsSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [trustedClientsSection, setTrustedClientsSection] =
    useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(
    null
  );
  const [draftFeature, setDraftFeature] = useState<{
    icon: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    order: number;
  } | null>(null);

  // Form state
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    features: [] as Array<{
      icon: string;
      nameEn: string;
      nameAr: string;
      descriptionEn: string;
      descriptionAr: string;
      order: number;
    }>,
  });

  useEffect(() => {
    loadTrustedClientsSection();
  }, []);

  const loadTrustedClientsSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "home" });
      // Get the third section (index 2) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 2) {
        const section = sortedData[2];
        setTrustedClientsSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          features:
            section.features && section.features.length > 0
              ? section.features.map((feature) => ({
                  icon: feature.icon || "",
                  nameEn: feature.name?.en || "",
                  nameAr: feature.name?.ar || "",
                  descriptionEn: feature.description?.en || "",
                  descriptionAr: feature.description?.ar || "",
                  order: feature.order || 0,
                }))
              : [],
        });
        setActiveFeatureIndex(
          section.features && section.features.length > 0 ? 0 : null
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Trusted Clients section");
      console.error("Error loading Trusted Clients section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!trustedClientsSection) return;

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
        features: form.features
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
            description: {
              en: feature.descriptionEn.trim() || "",
              ar: feature.descriptionAr.trim() || "",
            },
            order: feature.order || 0,
          })),
      };

      await updateSection(trustedClientsSection._id, payload);
      await loadTrustedClientsSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save Trusted Clients section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (trustedClientsSection) {
      setForm({
        titleEn: trustedClientsSection.title?.en || "",
        titleAr: trustedClientsSection.title?.ar || "",
        descriptionEn: trustedClientsSection.description?.en || "",
        descriptionAr: trustedClientsSection.description?.ar || "",
        features:
          trustedClientsSection.features &&
          trustedClientsSection.features.length > 0
            ? trustedClientsSection.features.map((feature) => ({
                icon: feature.icon || "",
                nameEn: feature.name?.en || "",
                nameAr: feature.name?.ar || "",
                descriptionEn: feature.description?.en || "",
                descriptionAr: feature.description?.ar || "",
                order: feature.order || 0,
              }))
            : [],
      });
      setActiveFeatureIndex(
        trustedClientsSection.features &&
          trustedClientsSection.features.length > 0
          ? 0
          : null
      );
    }
    setIsEditing(false);
    setError(null);
    setDraftFeature(null);
    setIconPickerIndex(null);
  };

  const updateFeature = (
    index: number,
    field: keyof (typeof form.features)[number],
    value: string | number
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
    const maxOrder =
      form.features.length > 0
        ? Math.max(...form.features.map((f) => f.order))
        : -1;
    setDraftFeature({
      icon: "",
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      order: maxOrder + 1,
    });
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

    if (!hasContent) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      features: [...prev.features, draftFeature],
    }));

    setDraftFeature(null);
    setIconPickerIndex(null);
  };

  const cancelDraftFeature = () => {
    setDraftFeature(null);
    setIconPickerIndex(null);
  };

  const updateDraftFeature = (
    field:
      | "icon"
      | "nameEn"
      | "nameAr"
      | "descriptionEn"
      | "descriptionAr"
      | "order",
    value: string | number
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

  const moveFeature = (index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const features = [...prev.features];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= features.length) return prev;

      const temp = features[index].order;
      features[index].order = features[newIndex].order;
      features[newIndex].order = temp;

      features.sort((a, b) => a.order - b.order);
      return { ...prev, features };
    });
  };

  const getIconComponent = (iconName: string) => {
    if (iconName in serviceIconComponents) {
      const Icon = serviceIconComponents[iconName as ServiceIconKey];
      return <Icon className="h-5 w-5" />;
    }
    return null;
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get section content
  const sectionTitle = isEditing
    ? form.titleEn || form.titleAr
    : trustedClientsSection?.title?.[locale] ||
      (locale === "ar" ? "عملاؤنا الموثوقون" : "Trusted Clients");
  const sectionDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(trustedClientsSection?.description?.[locale] || "");

  const brands = useMemo(() => {
    if (isEditing) {
      return form.features
        .sort((a, b) => a.order - b.order)
        .map((feature) => ({
          name: feature.nameEn || feature.nameAr,
          tagline: feature.descriptionEn || feature.descriptionAr,
          icon: feature.icon || "Building2",
        }));
    }
    if (
      trustedClientsSection?.features &&
      trustedClientsSection.features.length > 0
    ) {
      return trustedClientsSection.features
        .sort((a, b) => a.order - b.order)
        .map((feature) => ({
          name: feature.name?.[locale] || "",
          tagline: feature.description?.[locale] || "",
          icon: feature.icon || "Building2",
        }));
    }
    return [];
  }, [isEditing, form.features, trustedClientsSection, locale]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading Trusted Clients section..."}
        </div>
      </div>
    );
  }

  if (!trustedClientsSection && !isEditing) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic
            ? "لا يوجد قسم عملاء موثوقون للعرض"
            : "No Trusted Clients section found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "قسم العملاء الموثوقون" : "Trusted Clients Section"}
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

      {/* Trusted Clients Display/Edit Section */}
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

              {/* Right Column - Features */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border-2 border-primary/30 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <span className="text-primary">🏢</span>
                        {isArabic ? "العلامات التجارية" : "Brands/Features"}
                      </h3>
                      <p className="text-xs text-white/60">
                        {isArabic
                          ? "أضف أو عدّل العلامات التجارية"
                          : "Add or edit brands"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={addFeature}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                    </Button>
                  </div>

                  {/* Draft Feature Form */}
                  {draftFeature && (
                    <div className="mb-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-cyan-300">
                          {isArabic ? "إضافة علامة تجارية" : "Add Brand"}
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={saveDraftFeature}
                            size="sm"
                            className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
                          >
                            {isArabic ? "حفظ" : "Save"}
                          </Button>
                          <Button
                            type="button"
                            onClick={cancelDraftFeature}
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
                            {isArabic ? "الأيقونة" : "Icon"}
                          </label>
                          <div className="relative">
                            <Input
                              value={draftFeature.icon}
                              onChange={(e) =>
                                updateDraftFeature("icon", e.target.value)
                              }
                              className={inputStyles}
                              placeholder="Icon name"
                            />
                            {draftFeature.icon &&
                              getIconComponent(draftFeature.icon) && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                                  {getIconComponent(draftFeature.icon)}
                                </div>
                              )}
                          </div>
                          <Button
                            type="button"
                            onClick={() =>
                              setIconPickerIndex(
                                iconPickerIndex === -1 ? null : -1
                              )
                            }
                            variant="outline"
                            size="sm"
                            className="mt-2 rounded-full w-full"
                          >
                            {iconPickerIndex === -1
                              ? isArabic
                                ? "إغلاق"
                                : "Close"
                              : isArabic
                              ? "اختر الأيقونة"
                              : "Choose Icon"}
                          </Button>
                          {iconPickerIndex === -1 && (
                            <div className="mt-2 grid grid-cols-6 gap-2 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                              {serviceIconOptions.map((option) => {
                                const Icon = option.Icon;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      updateDraftFeature("icon", option.value);
                                      setIconPickerIndex(null);
                                    }}
                                    className="p-2 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-white/[0.05] transition"
                                  >
                                    <Icon className="h-5 w-5 text-white/70" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "الاسم (EN)" : "Name (EN)"}
                            </label>
                            <Input
                              value={draftFeature.nameEn}
                              onChange={(e) =>
                                updateDraftFeature("nameEn", e.target.value)
                              }
                              className={inputStyles}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "الاسم (AR)" : "Name (AR)"}
                            </label>
                            <Input
                              value={draftFeature.nameAr}
                              onChange={(e) =>
                                updateDraftFeature("nameAr", e.target.value)
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
                              value={draftFeature.descriptionEn}
                              onChange={(e) =>
                                updateDraftFeature(
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
                              value={draftFeature.descriptionAr}
                              onChange={(e) =>
                                updateDraftFeature(
                                  "descriptionAr",
                                  e.target.value
                                )
                              }
                              className={inputStyles}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Features */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {form.features.length === 0 && !draftFeature && (
                      <p className="text-sm text-white/60 text-center py-4">
                        {isArabic ? "لا توجد علامات تجارية" : "No brands yet"}
                      </p>
                    )}
                    {form.features
                      .sort((a, b) => a.order - b.order)
                      .map((feature, index) => {
                        const originalIndex = form.features.findIndex(
                          (f) => f === feature
                        );
                        return (
                          <div
                            key={index}
                            className="rounded-2xl border border-white/20 bg-white/[0.05] p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-primary">
                                  {getIconComponent(feature.icon) || (
                                    <div className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {feature.nameEn || feature.nameAr}
                                  </p>
                                  <p className="text-xs text-white/60">
                                    {isArabic ? "الترتيب" : "Order"}:{" "}
                                    {feature.order}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  onClick={() =>
                                    moveFeature(originalIndex, "up")
                                  }
                                  variant="ghost"
                                  size="sm"
                                  disabled={originalIndex === 0}
                                  className="text-white/60 hover:text-white h-7 w-7 p-0"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() =>
                                    moveFeature(originalIndex, "down")
                                  }
                                  variant="ghost"
                                  size="sm"
                                  disabled={
                                    originalIndex === form.features.length - 1
                                  }
                                  className="text-white/60 hover:text-white h-7 w-7 p-0"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => removeFeature(originalIndex)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs text-white/70 mb-1">
                                  {isArabic ? "الأيقونة" : "Icon"}
                                </label>
                                <div className="relative">
                                  <Input
                                    value={feature.icon}
                                    onChange={(e) =>
                                      updateFeature(
                                        originalIndex,
                                        "icon",
                                        e.target.value
                                      )
                                    }
                                    className={inputStyles}
                                    placeholder="Icon name"
                                  />
                                  {feature.icon &&
                                    getIconComponent(feature.icon) && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                                        {getIconComponent(feature.icon)}
                                      </div>
                                    )}
                                </div>
                                <Button
                                  type="button"
                                  onClick={() =>
                                    setIconPickerIndex(
                                      iconPickerIndex === originalIndex
                                        ? null
                                        : originalIndex
                                    )
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 rounded-full w-full"
                                >
                                  {iconPickerIndex === originalIndex
                                    ? isArabic
                                      ? "إغلاق"
                                      : "Close"
                                    : isArabic
                                    ? "اختر الأيقونة"
                                    : "Choose Icon"}
                                </Button>
                                {iconPickerIndex === originalIndex && (
                                  <div className="mt-2 grid grid-cols-6 gap-2 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                                    {serviceIconOptions.map((option) => {
                                      const Icon = option.Icon;
                                      return (
                                        <button
                                          key={option.value}
                                          type="button"
                                          onClick={() => {
                                            updateFeature(
                                              originalIndex,
                                              "icon",
                                              option.value
                                            );
                                            setIconPickerIndex(null);
                                          }}
                                          className="p-2 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-white/[0.05] transition"
                                        >
                                          <Icon className="h-5 w-5 text-white/70" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                  <label className="block text-xs text-white/70 mb-1">
                                    {isArabic ? "الاسم (EN)" : "Name (EN)"}
                                  </label>
                                  <Input
                                    value={feature.nameEn}
                                    onChange={(e) =>
                                      updateFeature(
                                        originalIndex,
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
                                  <Input
                                    value={feature.nameAr}
                                    onChange={(e) =>
                                      updateFeature(
                                        originalIndex,
                                        "nameAr",
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
                                    value={feature.descriptionEn}
                                    onChange={(e) =>
                                      updateFeature(
                                        originalIndex,
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
                                    value={feature.descriptionAr}
                                    onChange={(e) =>
                                      updateFeature(
                                        originalIndex,
                                        "descriptionAr",
                                        e.target.value
                                      )
                                    }
                                    className={inputStyles}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode */
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

            {brands.length > 0 && (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {brands.map((brand, idx) => {
                  const Icon =
                    (brand.icon in serviceIconComponents
                      ? serviceIconComponents[brand.icon as ServiceIconKey]
                      : null) || serviceIconComponents["ShieldCheck"];
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-gray-200 bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-7 w-7" />
                      </div>
                      <p className="font-semibold text-lg text-gray-900">
                        {brand.name}
                      </p>
                      {brand.tagline && (
                        <p className="text-sm text-gray-600 mt-1">
                          {brand.tagline}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
