"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Pencil, Save, X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { getSections, updateSection, Section } from "@/lib/api/sections";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";
import { Shield } from "lucide-react";

// Helper function to strip HTML tags
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
  return IconComponent;
};

// Donut Chart Component
const DonutChart = ({
  percentage,
  size = 120,
  strokeWidth = 20,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ width: size, height: size }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          className="text-primary transition-all duration-1000 ease-out"
          style={{
            strokeDashoffset: offset,
          }}
        />
      </svg>
    </div>
  );
};

export default function WhatWeOfferSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [offerSection, setOfferSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      percentage: number;
      order: number;
    }>,
  });

  useEffect(() => {
    loadOfferSection();
  }, []);

  const loadOfferSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "about" });
      // Get the second section (index 1) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 1) {
        const section = sortedData[1];
        setOfferSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          features:
            section.features?.map((feature) => {
              // Extract percentage from icon field (icon contains only percentage now)
              let percentage = 0;
              if (feature.icon) {
                const iconValue = feature.icon.toString();
                const match = iconValue.match(/\d+/);
                if (match) {
                  percentage = parseInt(match[0], 10);
                } else {
                  // If it's just a number, parse it directly
                  const numValue = parseInt(iconValue, 10);
                  percentage = isNaN(numValue) ? 75 : numValue;
                }
              } else {
                percentage = 75; // Default
              }
              return {
                icon: percentage.toString(), // Store only percentage
                nameEn: feature.name?.en || "",
                nameAr: feature.name?.ar || "",
                descriptionEn: feature.description?.en || "",
                descriptionAr: feature.description?.ar || "",
                percentage,
                order: feature.order,
              };
            }) || [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load What We Offer section");
      console.error("Error loading What We Offer section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!offerSection) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: {
          en: form.titleEn.trim(),
          ar: form.titleAr.trim(),
        },
        description: {
          en: form.descriptionEn.trim(),
          ar: form.descriptionAr.trim(),
        },
        features: form.features.map((feature) => ({
          icon: feature.percentage.toString(), // Store only percentage
          name: {
            en: feature.nameEn.trim(),
            ar: feature.nameAr.trim(),
          },
          description: {
            en: feature.descriptionEn.trim(),
            ar: feature.descriptionAr.trim(),
          },
          order: feature.order,
        })),
      };

      await updateSection(offerSection._id, payload);
      await loadOfferSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (offerSection) {
      loadOfferSection();
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
          icon: "75", // Store only percentage
          nameEn: "",
          nameAr: "",
          descriptionEn: "",
          descriptionAr: "",
          percentage: 75,
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

  // Get section content
  const sectionTitle = isEditing
    ? form.titleEn || form.titleAr
    : offerSection?.title?.[locale] || "";
  const features = isEditing ? form.features : offerSection?.features || [];

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading section..."}
        </div>
      </div>
    );
  }

  if (!offerSection && !isEditing) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "لا يوجد قسم للعرض" : "No section found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "قسم ماذا نقدم لك" : "What We Offer Section"}
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

      {/* Display/Edit Section */}
      <div className="relative bg-white rounded-3xl border border-white/10 p-8 md:p-12">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Title */}
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
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

            {/* Features */}
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
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
                        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
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
                              onClick={() => moveFeature(originalIndex, "up")}
                              disabled={originalIndex === 0}
                              className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFeature(originalIndex, "down")}
                              disabled={
                                originalIndex === form.features.length - 1
                              }
                              className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFeature(originalIndex)}
                              className="rounded-full bg-red-500/30 backdrop-blur-sm p-1.5 text-red-300 hover:bg-red-500/40 transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-white/70 mb-2">
                            {isArabic ? "النسبة المئوية" : "Percentage"}:{" "}
                            {feature.percentage}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={feature.percentage}
                            onChange={(e) => {
                              const percentage = parseInt(e.target.value) || 0;
                              updateFeature(
                                originalIndex,
                                "icon",
                                percentage.toString()
                              );
                              updateFeature(
                                originalIndex,
                                "percentage",
                                percentage
                              );
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            dir={isArabic ? "rtl" : "ltr"}
                            style={{
                              background: isArabic
                                ? `linear-gradient(to left, rgb(234, 179, 8) 0%, rgb(234, 179, 8) ${feature.percentage}%, rgba(255, 255, 255, 0.1) ${feature.percentage}%, rgba(255, 255, 255, 0.1) 100%)`
                                : `linear-gradient(to right, rgb(234, 179, 8) 0%, rgb(234, 179, 8) ${feature.percentage}%, rgba(255, 255, 255, 0.1) ${feature.percentage}%, rgba(255, 255, 255, 0.1) 100%)`,
                            }}
                          />
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
                              {isArabic
                                ? "الوصف (إنجليزي)"
                                : "Description (EN)"}
                            </label>
                            <Textarea
                              value={feature.descriptionEn}
                              onChange={(e) =>
                                updateFeature(
                                  originalIndex,
                                  "descriptionEn",
                                  e.target.value
                                )
                              }
                              className={inputStyles}
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {isArabic ? "الوصف (عربي)" : "Description (AR)"}
                            </label>
                            <Textarea
                              value={feature.descriptionAr}
                              onChange={(e) =>
                                updateFeature(
                                  originalIndex,
                                  "descriptionAr",
                                  e.target.value
                                )
                              }
                              className={inputStyles}
                              rows={3}
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
          <div className="space-y-8">
            {/* Section Title */}
            {sectionTitle && (
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  {sectionTitle}
                </h2>
              </div>
            )}

            {/* Donut Charts Grid */}
            {features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                {features
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                  .slice(0, 4)
                  .map((feature: any, index: number) => {
                    // Extract percentage from icon (icon contains only percentage now)
                    let percentage = 0;
                    if (feature.icon) {
                      const iconValue = feature.icon.toString();
                      const match = iconValue.match(/\d+/);
                      if (match) {
                        percentage = parseInt(match[0], 10);
                      } else {
                        // If it's just a number, parse it directly
                        const numValue = parseInt(iconValue, 10);
                        percentage = isNaN(numValue) ? 75 : numValue;
                      }
                    } else {
                      percentage = 75;
                    }

                    const name =
                      typeof feature.name === "string"
                        ? feature.name
                        : feature.name?.[locale] || "";
                    const description =
                      typeof feature.description === "string"
                        ? feature.description
                        : feature.description?.[locale] || "";

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center text-center space-y-4"
                      >
                        {/* Donut Chart */}
                        <DonutChart percentage={percentage} />

                        {/* Title */}
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">
                          {name}
                        </h3>

                        {/* Description */}
                        {description && (
                          <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
                            {stripHtml(description)}
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
