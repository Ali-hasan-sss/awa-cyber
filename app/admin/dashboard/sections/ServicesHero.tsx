"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import { Pencil, Save, X } from "lucide-react";
import Image from "next/image";
import { getSections, updateSection, Section } from "@/lib/api/sections";

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

export default function ServicesHeroSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [heroSection, setHeroSection] = useState<Section | null>(null);
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
  });

  useEffect(() => {
    loadHeroSection();
  }, []);

  const loadHeroSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "services" });
      // Get the first section (hero section) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 0) {
        const section = sortedData[0];
        setHeroSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          image: section.images?.[0] || "",
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
        description: {
          en: form.descriptionEn.trim(),
          ar: form.descriptionAr.trim(),
        },
        images: form.image ? [form.image] : [],
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
        descriptionEn: heroSection.description?.en || "",
        descriptionAr: heroSection.description?.ar || "",
        image: heroSection.images?.[0] || "",
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get hero content for view mode
  const heroTitle = isEditing
    ? form.titleEn || form.titleAr
    : heroSection?.title?.[locale] ||
      (locale === "ar" ? "خدماتنا" : "Our Services");
  const heroDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(heroSection?.description?.[locale] || "");
  const heroImage = isEditing
    ? form.image || "/images/publicContain.jpg"
    : heroSection?.images?.[0] || "/images/publicContain.jpg";

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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "هيرو صفحة الخدمات" : "Services Page Hero"}
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
              className="rounded-full bg-primary text-black hover:bg-primary/90"
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
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      {/* Display/Edit Section */}
      <div className="relative bg-white rounded-3xl border border-white/10 p-8 md:p-12">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
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
                    alt="Hero"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                    className="absolute top-2 right-2 rounded-full bg-red-500/80 backdrop-blur-sm p-2 text-white hover:bg-red-500 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

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
                      setForm((prev) => ({ ...prev, titleEn: e.target.value }))
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
                      setForm((prev) => ({ ...prev, titleAr: e.target.value }))
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
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {isArabic ? "الوصف (إنجليزي)" : "Description (English)"}
                  </label>
                  <RichTextEditor
                    value={form.descriptionEn}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, descriptionEn: value }))
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
                      setForm((prev) => ({ ...prev, descriptionAr: value }))
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
        ) : (
          /* View Mode (matches client/components/services/ServicesHero.tsx) */
          <div className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={heroImage}
                alt="Services"
                fill
                priority
                className="object-cover rounded-3xl"
                style={{
                  filter: "brightness(0.6)",
                }}
              />
              <div className="absolute inset-0 bg-black/25 z-10 rounded-3xl" />
            </div>

            {/* Content Container */}
            <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto text-center">
                {/* Main Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 md:mb-6 leading-tight">
                  {heroTitle}
                </h1>

                {/* Description */}
                {heroDescription && (
                  <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                    {heroDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
