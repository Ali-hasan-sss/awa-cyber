"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Pencil,
  Save,
  X,
  Trash2,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { getSections, updateSection, Section } from "@/lib/api/sections";

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

export default function HeroSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [heroSection, setHeroSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    images: [] as string[],
  });

  useEffect(() => {
    loadHeroSection();
  }, []);

  const loadHeroSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "home" });
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
          images: section.images || [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load hero section");
      console.error("Error loading hero section:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare slides from section images
  const slides = useMemo(() => {
    const images = isEditing ? form.images : heroSection?.images || [];
    if (images.length === 0) {
      return [
        {
          image: "/images/publicContain.jpg",
          title: isEditing
            ? form.titleEn || form.titleAr
            : heroSection?.title?.[locale] || "",
          description: isEditing
            ? stripHtml(form.descriptionEn || form.descriptionAr)
            : stripHtml(heroSection?.description?.[locale] || ""),
          index: 0,
        },
      ];
    }
    return images.map((image: string, index: number) => ({
      image,
      title: isEditing
        ? form.titleEn || form.titleAr
        : heroSection?.title?.[locale] || "",
      description: isEditing
        ? stripHtml(form.descriptionEn || form.descriptionAr)
        : stripHtml(heroSection?.description?.[locale] || ""),
      index,
    }));
  }, [heroSection, form, isEditing, locale]);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance slides (only in view mode)
  useEffect(() => {
    if (isEditing || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isEditing]);

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
        images: form.images.filter(Boolean),
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
        images: heroSection.images || [],
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const images = [...prev.images];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= images.length) return prev;

      const temp = images[index];
      images[index] = images[newIndex];
      images[newIndex] = temp;

      return { ...prev, images };
    });
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get hero content
  const heroTitle = isEditing
    ? form.titleEn || form.titleAr
    : heroSection?.title?.[locale] ||
      (locale === "ar" ? "أهلاً بك" : "Welcome");
  const heroDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(heroSection?.description?.[locale] || "");

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

  const currentSlideData = slides[currentSlide] || slides[0];

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "قسم الهيرو" : "Hero Section"}
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
        {/* Background Images with transitions */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          {/* Slides container */}
          <div className="relative w-full h-full">
            {slides.map(
              (
                slide: {
                  image: string;
                  title: string;
                  description: string;
                  index: number;
                },
                index: number
              ) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100 z-0" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={slide.image || "/images/publicContain.jpg"}
                    alt={`${heroTitle} - Slide ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover"
                  />
                </div>
              )
            )}
          </div>

          {/* Simple overlay for text readability */}
          <div className="absolute inset-0 bg-black/10 z-[5]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-0 relative z-20">
            {/* Yellow Accent Bar */}
            <div className="mb-6 flex justify-center md:justify-start">
              <div className="h-1.5 w-24 bg-primary rounded-full" />
            </div>

            {/* Edit Mode Layout - Grid for large screens */}
            {isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Title and Description */}
                <div className="space-y-6">
                  {/* Main Headline */}
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
                    </div>
                  </div>

                  {/* Description */}
                  <div className="backdrop-blur-md bg-black/30 rounded-2xl p-6 border border-white/10">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {isArabic
                            ? "الوصف (إنجليزي)"
                            : "Description (English)"}
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

                {/* Right Column - Images Management */}
                <div className="lg:sticky lg:top-6 lg:self-start">
                  <div className="backdrop-blur-md bg-black/40 rounded-2xl p-6 border-2 border-primary/30 shadow-xl h-full">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <span className="text-primary">📷</span>
                        {isArabic
                          ? "إدارة صور الهيرو"
                          : "Hero Images Management"}
                      </h3>
                      <p className="text-xs text-white/60">
                        {isArabic
                          ? "أضف أو احذف أو رتب صور الهيرو"
                          : "Add, delete, or reorder hero images"}
                      </p>
                    </div>
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
                    {form.images.length > 0 ? (
                      <div className="mt-4 space-y-3 max-h-[600px] overflow-y-auto">
                        <p className="text-sm font-semibold text-white mb-3">
                          {isArabic ? "الصور المرفوعة" : "Uploaded Images"} (
                          {form.images.length})
                        </p>
                        <div className="grid gap-3 grid-cols-2">
                          {form.images.map((imageUrl, index) => (
                            <div
                              key={`image-${index}`}
                              className="group relative rounded-2xl border-2 border-white/20 bg-white/[0.05] overflow-hidden hover:border-primary/50 transition-all"
                            >
                              <div className="absolute top-2 left-2 z-20">
                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-primary text-black shadow-lg">
                                  {index + 1}
                                </span>
                              </div>
                              <img
                                src={imageUrl}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              {/* Always visible controls */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveImage(index, "up")}
                                    disabled={index === 0}
                                    className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    title={isArabic ? "نقل لأعلى" : "Move up"}
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveImage(index, "down")}
                                    disabled={index === form.images.length - 1}
                                    className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    title={isArabic ? "نقل لأسفل" : "Move down"}
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                  <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full bg-primary/30 backdrop-blur-sm p-1.5 text-primary hover:bg-primary/40 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                    title={isArabic ? "عرض" : "View"}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="rounded-full bg-red-500/30 backdrop-blur-sm p-1.5 text-red-300 hover:bg-red-500/40 transition-all"
                                    title={isArabic ? "حذف" : "Delete"}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-white/70 mt-3 backdrop-blur-sm bg-black/20 rounded-lg p-2 border border-white/10">
                          {isArabic
                            ? "💡 نصيحة: استخدم أزرار السهم لترتيب الصور. الصورة الأولى ستكون هي الصورة الافتراضية."
                            : "💡 Tip: Use arrow buttons to reorder images. The first image will be the default."}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                        <p className="text-sm text-white/60">
                          {isArabic
                            ? "لا توجد صور حالياً. استخدم الزر أعلاه لإضافة صور."
                            : "No images yet. Use the button above to add images."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode - Original Layout */
              <div className="max-w-3xl mx-auto md:mx-0 md:ltr:mr-auto md:rtl:ml-auto text-center md:text-left md:rtl:text-right md:ltr:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-500">
                  <span className="text-primary">{heroTitle}</span>
                </h1>
                {heroDescription && (
                  <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0 transition-all duration-500">
                    {heroDescription}
                  </p>
                )}
              </div>
            )}

            {/* CTA Buttons - Only show in view mode */}
            {!isEditing && (
              <div className="flex flex-col sm:flex-row gap-4 mb-12 transition-all duration-500 items-center md:items-start">
                <Button size="lg" className="group text-base px-8 py-6" asChild>
                  <a href="/quote">
                    {locale === "ar" ? "اطلب عرض سعر" : "Get a Quote"}
                    <ArrowRight className="ltr:ml-2 rtl:mr-2 rtl:rotate-180 w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-black"
                  asChild
                >
                  <a href="#services">
                    {locale === "ar"
                      ? "استكشف خدماتنا"
                      : "Explore Our Services"}
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows - Only show if more than one slide and not editing */}
        {!isEditing && slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute ltr:left-4 rtl:right-4 md:ltr:left-8 md:rtl:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform rtl:rotate-180" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute ltr:right-4 rtl:left-4 md:ltr:right-8 md:rtl:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform rtl:rotate-180" />
            </button>
          </>
        )}

        {/* Slide Indicators - Only show if more than one slide and not editing */}
        {!isEditing && slides.length > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
