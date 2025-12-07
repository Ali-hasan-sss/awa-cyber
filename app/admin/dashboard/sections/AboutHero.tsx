"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import { Pencil, Save, X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { getSections, updateSection, Section } from "@/lib/api/sections";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";
import { Shield, Users, Award, Clock } from "lucide-react";

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

const getIconComponent = (iconName: string) => {
  const IconComponent =
    serviceIconComponents[iconName as ServiceIconKey] || Shield;
  return <IconComponent className="h-5 w-5" />;
};

export default function AboutHeroSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [heroSection, setHeroSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    subtitleEn: "",
    subtitleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    image: "",
    features: [] as Array<{
      icon: string;
      nameEn: string;
      nameAr: string;
      valueEn: string;
      valueAr: string;
      order: number;
    }>,
  });

  useEffect(() => {
    loadHeroSection();
  }, []);

  const loadHeroSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "about" });
      // Get the first section (hero section) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 0) {
        const section = sortedData[0];
        setHeroSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          subtitleEn: (section as any).subtitle?.en || "",
          subtitleAr: (section as any).subtitle?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          image: section.images?.[0] || "",
          features:
            section.features?.map((feature) => ({
              icon: feature.icon,
              nameEn: feature.name?.en || "",
              nameAr: feature.name?.ar || "",
              valueEn: feature.description?.en || "",
              valueAr: feature.description?.ar || "",
              order: feature.order,
            })) || [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load hero section");
      console.error("Error loading hero section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!heroSection) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: {
          en: form.titleEn.trim(),
          ar: form.titleAr.trim(),
        },
        subtitle: {
          en: form.subtitleEn.trim(),
          ar: form.subtitleAr.trim(),
        },
        description: {
          en: form.descriptionEn.trim(),
          ar: form.descriptionAr.trim(),
        },
        images: form.image ? [form.image] : [],
        features: form.features.map((feature) => ({
          icon: feature.icon,
          name: {
            en: feature.nameEn.trim(),
            ar: feature.nameAr.trim(),
          },
          description: {
            en: feature.valueEn.trim(),
            ar: feature.valueAr.trim(),
          },
          order: feature.order,
        })),
      };

      await updateSection(heroSection._id, payload);
      await loadHeroSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save hero section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (heroSection) {
      setForm({
        titleEn: heroSection.title?.en || "",
        titleAr: heroSection.title?.ar || "",
        subtitleEn: (heroSection as any).subtitle?.en || "",
        subtitleAr: (heroSection as any).subtitle?.ar || "",
        descriptionEn: heroSection.description?.en || "",
        descriptionAr: heroSection.description?.ar || "",
        image: heroSection.images?.[0] || "",
        features:
          heroSection.features?.map((feature) => ({
            icon: feature.icon,
            nameEn: feature.name?.en || "",
            nameAr: feature.name?.ar || "",
            valueEn: feature.description?.en || "",
            valueAr: feature.description?.ar || "",
            order: feature.order,
          })) || [],
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const addFeature = () => {
    const maxOrder =
      form.features.length > 0
        ? Math.max(...form.features.map((f) => f.order))
        : -1;
    setForm((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          icon: "Shield",
          nameEn: "",
          nameAr: "",
          valueEn: "",
          valueAr: "",
          order: maxOrder + 1,
        },
      ],
    }));
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== index),
    }));
  };

  const updateFeature = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, features };
    });
  };

  const moveFeature = (index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const features = [...prev.features];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= features.length) return prev;

      const temp = features[index];
      features[index] = features[newIndex];
      features[newIndex] = temp;

      return { ...prev, features };
    });
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get hero content
  const heroTitle = isEditing
    ? form.titleEn || form.titleAr
    : heroSection?.title?.[locale] || (locale === "ar" ? "من نحن" : "About Us");
  const heroSubtitle = isEditing
    ? form.subtitleEn || form.subtitleAr
    : (heroSection as any)?.subtitle?.[locale] || "";
  const heroDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(heroSection?.description?.[locale] || "");
  const heroImage = isEditing
    ? form.image || "/images/publicContain.jpg"
    : heroSection?.images?.[0] || "/images/publicContain.jpg";
  const heroFeatures = isEditing ? form.features : heroSection?.features || [];

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading hero section..."}
        </div>
      </div>
    );
  }

  if (!heroSection && !isEditing) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "لا يوجد قسم هيرو للعرض" : "No hero section found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "هيرو صفحة من نحن" : "About Page Hero"}
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

      {/* Hero Display/Edit Section */}
      <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="About Us"
            fill
            priority
            className="object-cover"
            style={{
              filter: "brightness(0.4)",
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        {/* Content Container */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-5xl mx-auto">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-6">
                {/* Background Image Upload */}
                <div className="backdrop-blur-md bg-black/30 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {isArabic ? "صورة الخلفية" : "Background Image"}
                  </h3>
                  <FileUpload
                    accept="image/*"
                    maxSize={10}
                    hideUploadedFiles={true}
                    onUploadComplete={(url) => {
                      setForm((prev) => ({ ...prev, image: url }));
                    }}
                  />
                  {form.image && (
                    <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-primary/30">
                      <img
                        src={form.image}
                        alt="Background"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, image: "" }))
                        }
                        className="absolute top-2 right-2 rounded-full bg-red-500/80 backdrop-blur-sm p-2 text-white hover:bg-red-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title and Subtitle */}
                <div className="backdrop-blur-md bg-black/30 rounded-2xl p-6 border border-white/10">
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
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {isArabic
                          ? "العنوان الفرعي (إنجليزي)"
                          : "Subtitle (English)"}
                      </label>
                      <Input
                        value={form.subtitleEn}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            subtitleEn: e.target.value,
                          }))
                        }
                        className={inputStyles}
                        placeholder={
                          isArabic
                            ? "أدخل العنوان الفرعي بالإنجليزية"
                            : "Enter subtitle in English"
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {isArabic
                          ? "العنوان الفرعي (عربي)"
                          : "Subtitle (Arabic)"}
                      </label>
                      <Input
                        value={form.subtitleAr}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            subtitleAr: e.target.value,
                          }))
                        }
                        className={inputStyles}
                        placeholder={
                          isArabic
                            ? "أدخل العنوان الفرعي بالعربية"
                            : "Enter subtitle in Arabic"
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="backdrop-blur-md bg-black/30 rounded-2xl p-6 border border-white/10">
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

                {/* Features */}
                <div className="backdrop-blur-md bg-black/30 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      {isArabic ? "الميزات" : "Features"}
                    </h3>
                    <Button
                      type="button"
                      onClick={addFeature}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      {isArabic ? "إضافة ميزة" : "Add Feature"}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {form.features
                      .sort((a, b) => a.order - b.order)
                      .map((feature, index) => {
                        const originalIndex = form.features.findIndex(
                          (f) => f === feature
                        );
                        return (
                          <div
                            key={index}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-primary">
                                  {getIconComponent(feature.icon)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {feature.nameEn ||
                                      feature.nameAr ||
                                      `Feature ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-white/60">
                                    {isArabic ? "الترتيب" : "Order"}:{" "}
                                    {feature.order}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveFeature(originalIndex, "up")
                                  }
                                  disabled={originalIndex === 0}
                                  className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  title={isArabic ? "نقل لأعلى" : "Move up"}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveFeature(originalIndex, "down")
                                  }
                                  disabled={
                                    originalIndex === form.features.length - 1
                                  }
                                  className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  title={isArabic ? "نقل لأسفل" : "Move down"}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeFeature(originalIndex)}
                                  className="rounded-full bg-red-500/30 backdrop-blur-sm p-1.5 text-red-300 hover:bg-red-500/40 transition-all"
                                  title={isArabic ? "حذف" : "Delete"}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
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
                                  className="mt-2 rounded-full"
                                >
                                  {iconPickerIndex === originalIndex
                                    ? isArabic
                                      ? "إغلاق"
                                      : "Close"
                                    : isArabic
                                    ? "اختر الأيقونة"
                                    : "Choose Icon"}
                                </Button>
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

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="block text-xs text-white/70 mb-1">
                                  {isArabic
                                    ? "اسم الميزة (إنجليزي)"
                                    : "Feature Name (EN)"}
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
                                  {isArabic
                                    ? "اسم الميزة (عربي)"
                                    : "Feature Name (AR)"}
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

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="block text-xs text-white/70 mb-1">
                                  {isArabic ? "القيمة (إنجليزي)" : "Value (EN)"}
                                </label>
                                <Input
                                  value={feature.valueEn}
                                  onChange={(e) =>
                                    updateFeature(
                                      originalIndex,
                                      "valueEn",
                                      e.target.value
                                    )
                                  }
                                  className={inputStyles}
                                  placeholder={
                                    isArabic ? "مثال: 500+" : "Example: 500+"
                                  }
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-white/70 mb-1">
                                  {isArabic ? "القيمة (عربي)" : "Value (AR)"}
                                </label>
                                <Input
                                  value={feature.valueAr}
                                  onChange={(e) =>
                                    updateFeature(
                                      originalIndex,
                                      "valueAr",
                                      e.target.value
                                    )
                                  }
                                  className={inputStyles}
                                  placeholder={
                                    isArabic ? "مثال: 500+" : "Example: 500+"
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {form.features.length === 0 && (
                      <div className="text-center py-8 text-white/60">
                        {isArabic
                          ? "لا توجد ميزات. اضغط على 'إضافة ميزة' لإضافة ميزة جديدة."
                          : "No features yet. Click 'Add Feature' to add a new feature."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="text-center">
                {/* Subtitle */}
                {heroSubtitle && (
                  <span className="inline-block text-sm md:text-base font-semibold tracking-[0.2em] text-primary uppercase mb-4">
                    {heroSubtitle}
                  </span>
                )}

                {/* Main Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
                  {heroTitle}
                </h1>

                {/* Description */}
                {heroDescription && (
                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-12">
                    {heroDescription}
                  </p>
                )}

                {/* Stats Grid */}
                {heroFeatures.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12">
                    {heroFeatures
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((feature: any, index) => {
                        const IconComponent = getIconComponent(feature.icon);
                        // Type guard: check if it's form feature (has nameEn/nameAr) or section feature (has name object)
                        const isFormFeature = "nameEn" in feature;
                        const featureValue = isFormFeature
                          ? (locale === "ar"
                              ? feature.valueAr
                              : feature.valueEn) ||
                            (locale === "ar" ? feature.nameAr : feature.nameEn)
                          : (typeof feature.description === "object"
                              ? feature.description?.[locale]
                              : feature.description) ||
                            (typeof feature.name === "object"
                              ? feature.name?.[locale]
                              : feature.name);
                        const featureLabel = isFormFeature
                          ? locale === "ar"
                            ? feature.nameAr
                            : feature.nameEn
                          : typeof feature.name === "object"
                          ? feature.name?.[locale]
                          : feature.name;
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                          >
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                              {IconComponent}
                            </div>
                            <div className="text-3xl md:text-4xl font-bold text-white">
                              {featureValue}
                            </div>
                            <div className="text-sm md:text-base text-white/80 text-center">
                              {featureLabel}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
