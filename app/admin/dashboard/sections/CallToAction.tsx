"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import { Pencil, Save, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { getSections, updateSection, Section } from "@/lib/api/sections";
import Link from "next/link";

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

export default function CallToActionSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [ctaSection, setCtaSection] = useState<Section | null>(null);
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
    loadCtaSection();
  }, []);

  const loadCtaSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "about" });
      // Get the third section (index 2) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 2) {
        const section = sortedData[2];
        setCtaSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          image: section.images?.[0] || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Call to Action section");
      console.error("Error loading Call to Action section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!ctaSection) return;

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

      await updateSection(ctaSection._id, payload);
      await loadCtaSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (ctaSection) {
      loadCtaSection();
    }
    setIsEditing(false);
    setError(null);
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get section content
  const sectionTitle = isEditing
    ? form.titleEn || form.titleAr
    : ctaSection?.title?.[locale] || "";
  const sectionDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(ctaSection?.description?.[locale] || "");
  const sectionImage = isEditing
    ? form.image || "/images/publicContain.jpg"
    : ctaSection?.images?.[0] || "/images/publicContain.jpg";

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading section..."}
        </div>
      </div>
    );
  }

  if (!ctaSection && !isEditing) {
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
          {isArabic ? "قسم دعوة للعمل" : "Call to Action Section"}
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
            {/* Image Upload */}
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">
                {isArabic ? "الصورة" : "Image"}
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
                    alt="Section"
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
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
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
        ) : (
          /* View Mode */
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[90vh]">
            {/* Left Side - Image (Full Height) */}
            <div className="relative order-2 lg:order-1 w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-full">
              <Image
                src={sectionImage}
                alt={sectionTitle || "Call to Action"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-primary/5" />
            </div>

            {/* Right Side - Content */}
            <div className="order-1 lg:order-2 flex items-center bg-gray-50 py-12 sm:py-16 md:py-20 lg:py-28">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:px-12 w-full">
                <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                  {/* Title with dot */}
                  {sectionTitle && (
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                      {sectionTitle}
                      <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary ml-2 align-middle" />
                    </h2>
                  )}

                  {/* Accent Line */}
                  <div className="h-1 w-16 sm:w-20 bg-primary rounded-full" />

                  {/* Description */}
                  {sectionDescription && (
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                      {sectionDescription}
                    </p>
                  )}

                  {/* CTA Button */}
                  <div className="pt-2 sm:pt-4">
                    <Button
                      size="lg"
                      className="bg-primary text-black hover:bg-primary/90 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold group w-full sm:w-auto"
                      asChild
                    >
                      <Link
                        href="/quote"
                        className="flex items-center justify-center"
                      >
                        {locale === "ar" ? "اطلب عرض سعر" : "Get a Quote"}
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ltr:ml-2 rtl:mr-2 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
