"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import {
  Pencil,
  Save,
  X,
  Trash2,
  Eye,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { getSections, updateSection, Section } from "@/lib/api/sections";
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

export default function WhoWeAreSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [whoWeAreSection, setWhoWeAreSection] = useState<Section | null>(null);
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
    image: "",
    stats: [
      { value: "", descriptionEn: "", descriptionAr: "" },
      { value: "", descriptionEn: "", descriptionAr: "" },
      { value: "", descriptionEn: "", descriptionAr: "" },
      { value: "", descriptionEn: "", descriptionAr: "" },
    ],
  });

  useEffect(() => {
    loadWhoWeAreSection();
  }, []);

  const loadWhoWeAreSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "home" });
      // Get the second section (index 1) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 1) {
        const section = sortedData[1];
        setWhoWeAreSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          image:
            section.images && section.images.length > 0
              ? section.images[0]
              : "",
          stats:
            section.features && section.features.length > 0
              ? section.features.slice(0, 4).map((feature) => ({
                  value: feature.name?.en || feature.name?.ar || "",
                  descriptionEn: feature.description?.en || "",
                  descriptionAr: feature.description?.ar || "",
                }))
              : [
                  { value: "", descriptionEn: "", descriptionAr: "" },
                  { value: "", descriptionEn: "", descriptionAr: "" },
                  { value: "", descriptionEn: "", descriptionAr: "" },
                  { value: "", descriptionEn: "", descriptionAr: "" },
                ],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Who We Are section");
      console.error("Error loading Who We Are section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!whoWeAreSection) return;

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
        images: form.image ? [form.image] : [],
        features: form.stats
          .filter(
            (stat) =>
              stat.value.trim() ||
              stat.descriptionEn.trim() ||
              stat.descriptionAr.trim()
          )
          .map((stat) => ({
            name: {
              en: stat.value.trim(),
              ar: stat.value.trim(),
            },
            description: {
              en: stat.descriptionEn.trim(),
              ar: stat.descriptionAr.trim(),
            },
            icon: "Cpu", // Fixed icon for all stats
            order: 0,
          })),
      };

      await updateSection(whoWeAreSection._id, payload);
      await loadWhoWeAreSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save Who We Are section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (whoWeAreSection) {
      setForm({
        titleEn: whoWeAreSection.title?.en || "",
        titleAr: whoWeAreSection.title?.ar || "",
        descriptionEn: whoWeAreSection.description?.en || "",
        descriptionAr: whoWeAreSection.description?.ar || "",
        image:
          whoWeAreSection.images && whoWeAreSection.images.length > 0
            ? whoWeAreSection.images[0]
            : "",
        stats:
          whoWeAreSection.features && whoWeAreSection.features.length > 0
            ? whoWeAreSection.features.slice(0, 4).map((feature) => ({
                value: feature.name?.en || feature.name?.ar || "",
                descriptionEn: feature.description?.en || "",
                descriptionAr: feature.description?.ar || "",
              }))
            : [
                { value: "", descriptionEn: "", descriptionAr: "" },
                { value: "", descriptionEn: "", descriptionAr: "" },
                { value: "", descriptionEn: "", descriptionAr: "" },
                { value: "", descriptionEn: "", descriptionAr: "" },
              ],
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const updateStat = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const stats = [...prev.stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, stats };
    });
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get section content
  const sectionTitle = isEditing
    ? form.titleEn || form.titleAr
    : whoWeAreSection?.title?.[locale] ||
      (locale === "ar" ? "من نحن" : "Who We Are");
  const sectionDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(whoWeAreSection?.description?.[locale] || "");
  const sectionImage = isEditing
    ? form.image || "/images/cyber.jpg"
    : whoWeAreSection?.images && whoWeAreSection.images.length > 0
    ? whoWeAreSection.images[0]
    : "/images/cyber.jpg";

  const stats = useMemo(() => {
    if (isEditing) {
      return form.stats.map((stat) => ({
        value: stat.value,
        label: stat.descriptionEn || stat.descriptionAr,
      }));
    }
    if (whoWeAreSection?.features && whoWeAreSection.features.length > 0) {
      return whoWeAreSection.features.slice(0, 4).map((feature) => ({
        value: feature.name?.[locale] || "",
        label: feature.description?.[locale] || "",
      }));
    }
    return [
      { value: "500+", label: locale === "ar" ? "مشروع" : "Projects" },
      { value: "10+", label: locale === "ar" ? "سنوات" : "Years" },
      { value: "24/7", label: locale === "ar" ? "دعم" : "Support" },
      { value: "100%", label: locale === "ar" ? "رضا" : "Satisfied" },
    ];
  }, [isEditing, form.stats, whoWeAreSection, locale]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading Who We Are section..."}
        </div>
      </div>
    );
  }

  if (!whoWeAreSection && !isEditing) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic
            ? "لا يوجد قسم من نحن للعرض"
            : "No Who We Are section found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "قسم من نحن" : "Who We Are Section"}
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

      {/* Who We Are Display/Edit Section */}
      <div className="relative bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
        {isEditing ? (
          <div className="p-6 space-y-6">
            {/* Grid Layout for Large Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Title, Description, Stats */}
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

                {/* Stats */}
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/20 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-primary">📊</span>
                    {isArabic ? "الإحصائيات" : "Statistics"}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {form.stats.map((stat, index) => (
                      <div
                        key={index}
                        className="space-y-2 p-3 rounded-xl border border-white/20 bg-white/[0.05]"
                      >
                        <label className="block text-xs text-white/80 mb-1 font-medium">
                          {isArabic
                            ? `إحصائية ${index + 1}`
                            : `Stat ${index + 1}`}
                        </label>
                        <Input
                          value={stat.value}
                          onChange={(e) =>
                            updateStat(index, "value", e.target.value)
                          }
                          className={inputStyles}
                          placeholder={
                            isArabic
                              ? "القيمة (نفسها للغتين)"
                              : "Value (same for both languages)"
                          }
                        />
                        <Input
                          value={stat.descriptionEn}
                          onChange={(e) =>
                            updateStat(index, "descriptionEn", e.target.value)
                          }
                          className={inputStyles}
                          placeholder={
                            isArabic
                              ? "الوصف (إنجليزي)"
                              : "Description (English)"
                          }
                        />
                        <Input
                          value={stat.descriptionAr}
                          onChange={(e) =>
                            updateStat(index, "descriptionAr", e.target.value)
                          }
                          className={inputStyles}
                          placeholder={
                            isArabic ? "الوصف (عربي)" : "Description (Arabic)"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border-2 border-primary/30 shadow-xl">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      {isArabic ? "صورة القسم" : "Section Image"}
                    </h3>
                    <p className="text-xs text-white/60">
                      {isArabic
                        ? "ارفع صورة جديدة للقسم"
                        : "Upload a new image for the section"}
                    </p>
                  </div>
                  <FileUpload
                    accept="image/*"
                    maxSize={10}
                    hideUploadedFiles={true}
                    onUploadComplete={(url) => {
                      setForm((prev) => ({ ...prev, image: url }));
                    }}
                  />
                  {form.image && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/70 mb-3 font-semibold">
                        {isArabic ? "الصورة الحالية" : "Current Image"}
                      </p>
                      <div className="relative rounded-2xl border-2 border-white/20 bg-white/[0.05] overflow-hidden group">
                        <img
                          src={normalizeImageUrl(form.image)}
                          alt="Section image"
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex gap-2">
                            <a
                              href={form.image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-primary/20 p-2 text-primary hover:bg-primary/30"
                              onClick={(e) => e.stopPropagation()}
                              title={isArabic ? "عرض" : "View"}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({ ...prev, image: "" }))
                              }
                              className="rounded-full bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                              title={isArabic ? "حذف" : "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="p-6 md:p-8 lg:p-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-8 text-center md:rtl:text-right md:ltr:text-left">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                  <span className="text-primary">{sectionTitle}</span>
                </h2>

                <div className="space-y-5 text-base md:text-lg text-gray-600 leading-relaxed">
                  {Array.isArray(sectionDescription) ? (
                    sectionDescription.map((paragraph, idx) => (
                      <p key={idx} className="text-balance">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-balance">{sectionDescription}</p>
                  )}
                </div>

                {stats.length > 0 && (
                  <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-4 border-t border-gray-200 text-center sm:text-left rtl:sm:text-right">
                    {stats.map(
                      (stat: { value: string; label: string }, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <span className="block text-3xl font-bold text-gray-900">
                            {stat.value}
                          </span>
                          <span className="text-sm uppercase tracking-wide text-gray-500">
                            {stat.label}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="relative overflow-hidden">
                  <Image
                    src={normalizeImageUrl(sectionImage)}
                    alt={sectionTitle || "About us"}
                    width={640}
                    height={480}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 600px"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-primary/10" />
                </div>
                {stats.length > 0 && (
                  <div className="absolute -bottom-6 ltr:-right-6 rtl:-left-6 hidden sm:block bg-white px-6 py-4 shadow-lg border border-gray-100">
                    <p className="text-sm font-semibold text-gray-600">
                      {locale === "ar"
                        ? "موثوق به عالمياً"
                        : "Trusted by global enterprises"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats[0]?.value || "99.7%"}{" "}
                      {locale === "ar" ? "رضا" : "Satisfaction"}
                    </p>
                  </div>
                )}
                <span className="absolute -top-6 ltr:-left-6 rtl:-right-6 hidden md:block h-28 w-28 rounded-full border-4 border-primary/40" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
