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

export default function WhyChooseUsSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [whyChooseUsSection, setWhyChooseUsSection] = useState<Section | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    order: number;
  } | null>(null);

  // Form state for section
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    images: [] as string[],
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
    loadWhyChooseUsSection();
  }, []);

  const loadWhyChooseUsSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "home" });
      // Get the sixth section (index 5) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 5) {
        const section = sortedData[5];
        setWhyChooseUsSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          images: section.images || [],
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
      setError(err.message || "Failed to load Why Choose Us section");
      console.error("Error loading Why Choose Us section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!whyChooseUsSection) return;

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
        images: form.images,
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

      await updateSection(whyChooseUsSection._id, payload);
      await loadWhyChooseUsSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save Why Choose Us section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (whyChooseUsSection) {
      setForm({
        titleEn: whyChooseUsSection.title?.en || "",
        titleAr: whyChooseUsSection.title?.ar || "",
        descriptionEn: whyChooseUsSection.description?.en || "",
        descriptionAr: whyChooseUsSection.description?.ar || "",
        images: whyChooseUsSection.images || [],
        features:
          whyChooseUsSection.features && whyChooseUsSection.features.length > 0
            ? whyChooseUsSection.features.map((feature) => ({
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
        whyChooseUsSection.features && whyChooseUsSection.features.length > 0
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
    : whyChooseUsSection?.title?.[locale] ||
      (locale === "ar" ? "لماذا تختارنا" : "Why Choose Us");
  const sectionDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(whyChooseUsSection?.description?.[locale] || "");

  // Get features sorted by order
  const sortedFeatures = useMemo(() => {
    return [...form.features].sort((a, b) => a.order - b.order);
  }, [form.features]);

  // First two features are for badges, rest for side display
  const badgeFeature = sortedFeatures.length > 0 ? sortedFeatures[0] : null;
  const experienceFeature =
    sortedFeatures.length > 1 ? sortedFeatures[1] : null;
  const sideFeatures = sortedFeatures.length > 2 ? sortedFeatures.slice(2) : [];

  // Get section image
  const sectionImage =
    form.images.length > 0
      ? form.images[0]
      : whyChooseUsSection?.images && whyChooseUsSection.images.length > 0
      ? whyChooseUsSection.images[0]
      : "/images/cyberhand.jpg";

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading Why Choose Us section..."}
        </div>
      </div>
    );
  }

  if (!whyChooseUsSection && !isEditing) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic
            ? "لا يوجد قسم لماذا تختارنا للعرض"
            : "No Why Choose Us section found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "قسم لماذا تختارنا" : "Why Choose Us Section"}
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

      {/* Why Choose Us Display/Edit Section */}
      <div className="relative bg-gradient-to-b from-black to-gray-900 rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
        {isEditing ? (
          <div className="p-6 space-y-6">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Title, Description, Image */}
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

                {/* Image */}
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      {isArabic ? "الصورة" : "Image"}
                    </label>
                    <FileUpload
                      multiple={false}
                      accept="image/*"
                      maxSize={10}
                      hideUploadedFiles={true}
                      onUploadComplete={(url) => {
                        setForm((prev) => ({
                          ...prev,
                          images: [url],
                        }));
                      }}
                    />
                    {form.images.length > 0 && (
                      <div className="mt-4 relative rounded-lg overflow-hidden border border-white/10">
                        <img
                          src={normalizeImageUrl(form.images[0])}
                          alt="Section image"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              images: [],
                            }));
                          }}
                          className="absolute top-2 right-2 rounded-full bg-red-500/80 p-2 text-white hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Features Management */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border-2 border-primary/30 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <span className="text-primary">⭐</span>
                        {isArabic ? "الميزات" : "Features"}
                      </h3>
                      <p className="text-xs text-white/60">
                        {isArabic
                          ? "أول ميزتين للبادجات، الباقي للقائمة"
                          : "First 2 for badges, rest for list"}
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
                          {isArabic ? "إضافة ميزة" : "Add Feature"}
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
                              placeholder="ShieldCheck"
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
                                iconPickerIndex === "draft" ? null : "draft"
                              )
                            }
                            variant="outline"
                            size="sm"
                            className="mt-2 rounded-full w-full"
                          >
                            {iconPickerIndex === "draft"
                              ? isArabic
                                ? "إغلاق"
                                : "Close"
                              : isArabic
                              ? "اختر الأيقونة"
                              : "Choose Icon"}
                          </Button>
                          {iconPickerIndex === "draft" && (
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

                        <div>
                          <label className="block text-xs text-white/70 mb-1">
                            {isArabic ? "الترتيب" : "Order"}
                          </label>
                          <Input
                            type="number"
                            value={draftFeature.order}
                            onChange={(e) =>
                              updateDraftFeature(
                                "order",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={inputStyles}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Features */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {form.features.length === 0 && !draftFeature && (
                      <p className="text-sm text-white/60 text-center py-4">
                        {isArabic ? "لا توجد ميزات" : "No features yet"}
                      </p>
                    )}
                    {sortedFeatures.map((feature, index) => {
                      const originalIndex = form.features.findIndex(
                        (f) => f === feature
                      );
                      const isBadgeFeature = index === 0 || index === 1;
                      return (
                        <div
                          key={index}
                          className={`rounded-2xl border p-4 space-y-3 ${
                            isBadgeFeature
                              ? "border-yellow-400/30 bg-yellow-500/10"
                              : "border-white/20 bg-white/[0.05]"
                          }`}
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
                                  {isBadgeFeature && (
                                    <span className="ml-2 text-xs text-yellow-300">
                                      (
                                      {index === 0
                                        ? "Badge Top"
                                        : "Badge Bottom"}
                                      )
                                    </span>
                                  )}
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
                                onClick={() => moveFeature(originalIndex, "up")}
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

                          {activeFeatureIndex === originalIndex && (
                            <div className="space-y-3 pt-3 border-t border-white/10">
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

                              <div>
                                <label className="block text-xs text-white/70 mb-1">
                                  {isArabic ? "الترتيب" : "Order"}
                                </label>
                                <Input
                                  type="number"
                                  value={feature.order}
                                  onChange={(e) =>
                                    updateFeature(
                                      originalIndex,
                                      "order",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className={inputStyles}
                                />
                              </div>
                            </div>
                          )}

                          {activeFeatureIndex !== originalIndex && (
                            <Button
                              type="button"
                              onClick={() =>
                                setActiveFeatureIndex(originalIndex)
                              }
                              variant="outline"
                              size="sm"
                              className="w-full rounded-full"
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              {isArabic ? "تعديل" : "Edit"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode - Similar to WhyChooseUs component */
          <div className="relative bg-gradient-to-b from-black to-gray-900 py-20 md:py-28 text-white overflow-hidden">
            {/* Yellow light spots */}
            <div className="absolute top-0 ltr:left-0 rtl:right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div className="relative">
                  <div className="relative shadow-2xl border border-white/10">
                    <Image
                      src={normalizeImageUrl(sectionImage)}
                      alt={sectionTitle}
                      width={640}
                      height={480}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 1024px) 100vw, 640px"
                    />
                    {badgeFeature && (
                      <div className="absolute -top-4 ltr:-left-4 rtl:-right-4 flex items-center gap-3 bg-white px-4 py-2 text-sm font-semibold text-black shadow-xl z-50">
                        <div className="flex h-10 w-10 items-center justify-center bg-primary/20 text-primary">
                          {(() => {
                            const Icon =
                              badgeFeature.icon &&
                              badgeFeature.icon in serviceIconComponents
                                ? serviceIconComponents[
                                    badgeFeature.icon as ServiceIconKey
                                  ]
                                : serviceIconComponents["ShieldCheck"];
                            return <Icon className="h-5 w-5" />;
                          })()}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide">
                            {badgeFeature.nameEn || badgeFeature.nameAr || ""}
                          </p>
                          <p className="text-base font-bold">
                            {badgeFeature.descriptionEn ||
                              badgeFeature.descriptionAr ||
                              badgeFeature.nameEn ||
                              badgeFeature.nameAr ||
                              ""}
                          </p>
                        </div>
                      </div>
                    )}
                    {experienceFeature && (
                      <div className="absolute -bottom-6 ltr:-right-6 rtl:-left-6 bg-primary text-black px-6 py-4 text-center shadow-xl z-20">
                        <p className="text-3xl font-bold">
                          {experienceFeature.nameEn ||
                            experienceFeature.nameAr ||
                            ""}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wide">
                          {experienceFeature.descriptionEn ||
                            experienceFeature.descriptionAr ||
                            experienceFeature.nameEn ||
                            experienceFeature.nameAr ||
                            ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 rtl:text-right">
                  {sectionTitle && (
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                      {sectionTitle}
                    </h2>
                  )}
                  {sectionDescription && (
                    <p className="text-base md:text-lg text-white/80 leading-relaxed">
                      {sectionDescription}
                    </p>
                  )}

                  {sideFeatures.length > 0 && (
                    <div className="grid gap-5">
                      {sideFeatures.map((feature, idx) => {
                        const Icon =
                          feature.icon && feature.icon in serviceIconComponents
                            ? serviceIconComponents[
                                feature.icon as ServiceIconKey
                              ]
                            : serviceIconComponents["ShieldCheck"];
                        return (
                          <div
                            key={idx}
                            className="flex gap-4 border border-white/10 bg-white/5 p-4 sm:p-5"
                          >
                            <span className="flex h-12 w-12 items-center justify-center bg-primary/15 text-primary">
                              <Icon className="h-6 w-6" />
                            </span>
                            <div className="space-y-1">
                              <p className="text-lg font-semibold text-white">
                                {feature.nameEn || feature.nameAr || ""}
                              </p>
                              <p className="text-sm text-white/70 leading-relaxed">
                                {feature.descriptionEn ||
                                  feature.descriptionAr ||
                                  ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
