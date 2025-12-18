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
import { normalizeImageUrl } from "@/lib/utils";
import FileUpload from "@/components/ui/FileUpload";
import Image from "next/image";

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
  };

  const cancelDraftFeature = () => {
    setDraftFeature(null);
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
                            {isArabic ? "صورة الشعار" : "Brand Logo"}
                          </label>
                          <FileUpload
                            accept="image/*"
                            maxSize={5}
                            hideUploadedFiles={true}
                            onUploadComplete={(url: string) => {
                              updateDraftFeature("icon", url);
                            }}
                          />
                          {draftFeature.icon && (
                            <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                              <Image
                                src={normalizeImageUrl(draftFeature.icon)}
                                alt="Brand Logo"
                                fill
                                className="object-contain"
                              />
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
                                <div className="text-primary relative w-10 h-10 flex items-center justify-center">
                                  {feature.icon ? (
                                    <Image
                                      src={normalizeImageUrl(feature.icon)}
                                      alt={feature.nameEn || feature.nameAr}
                                      fill
                                      className="object-contain rounded"
                                    />
                                  ) : (
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
                                  {isArabic ? "صورة الشعار" : "Brand Logo"}
                                </label>
                                <FileUpload
                                  accept="image/*"
                                  maxSize={5}
                                  hideUploadedFiles={true}
                                  onUploadComplete={(url: string) => {
                                    updateFeature(originalIndex, "icon", url);
                                  }}
                                />
                                {feature.icon && (
                                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                                    <Image
                                      src={normalizeImageUrl(feature.icon)}
                                      alt="Brand Logo"
                                      fill
                                      className="object-contain"
                                    />
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

            {/* Infinite Scrolling Cards */}
            {brands.length > 0 && (
              <div className="mt-12 overflow-hidden relative group">
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes scroll-trusted-clients {
                      0% {
                        transform: translateX(0);
                      }
                      100% {
                        transform: translateX(-50%);
                      }
                    }
                    @keyframes scroll-trusted-clients-rtl {
                      0% {
                        transform: translateX(0);
                      }
                      100% {
                        transform: translateX(50%);
                      }
                    }
                    .scrolling-wrapper-trusted-clients-preview {
                      animation: scroll-trusted-clients 60s linear infinite;
                      will-change: transform;
                    }
                    [dir="rtl"] .scrolling-wrapper-trusted-clients-preview {
                      animation: scroll-trusted-clients-rtl 60s linear infinite;
                    }
                    .group:hover .scrolling-wrapper-trusted-clients-preview {
                      animation-play-state: paused;
                    }
                  `,
                  }}
                />
                <div
                  className={`scrolling-wrapper-trusted-clients-preview flex gap-4 md:gap-6 w-max select-none ${
                    locale === "ar" ? "rtl" : ""
                  }`}
                  style={{
                    userSelect: "none",
                  }}
                >
                  {/* Duplicate brands for seamless infinite scroll */}
                  {[...brands, ...brands].map((brand, idx) => {
                    // Check if icon is a URL/image path
                    const isImageUrl =
                      brand.icon &&
                      (brand.icon.startsWith("http") ||
                        brand.icon.startsWith("/") ||
                        brand.icon.includes(".") ||
                        brand.icon.includes("72.60.208.192") ||
                        brand.icon.includes("awacyber.com"));
                    
                    return (
                      <div
                        key={`${brand.name}-${idx}`}
                        className="text-center transition-all duration-300 hover:-translate-y-1 w-[250px] h-[250px] flex flex-col flex-shrink-0 grayscale hover:grayscale-0"
                      >
                        <div className="mx-auto mb-4 flex items-center justify-center h-32 w-full">
                          {isImageUrl ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={normalizeImageUrl(brand.icon!)}
                                alt={brand.name || ""}
                                fill
                                className="object-contain transition-all duration-300"
                              />
                            </div>
                          ) : (
                            <div className="h-14 w-14" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="font-semibold text-lg text-gray-900 mb-1">
                            {brand.name}
                          </p>
                          {brand.tagline && (
                            <p className="text-sm text-gray-600">
                              {brand.tagline}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
