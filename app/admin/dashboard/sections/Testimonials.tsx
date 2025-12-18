"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  Pencil,
  Save,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Star,
} from "lucide-react";
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

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function TestimonialsSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [testimonialsSection, setTestimonialsSection] =
    useState<Section | null>(null);
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
    testimonials: [] as Array<{
      icon: string; // Stores rating (1-5)
      nameEn: string;
      nameAr: string;
      descriptionEn: string;
      descriptionAr: string;
      rating: number;
      order: number;
    }>,
  });

  useEffect(() => {
    loadTestimonialsSection();
  }, []);

  const loadTestimonialsSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "home" });
      // Get the tenth section (index 9) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 9) {
        const section = sortedData[9];
        setTestimonialsSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          testimonials:
            section.features?.map((feature) => {
              let rating = 5;
              if (feature.icon) {
                const ratingValue = parseInt(feature.icon.toString(), 10);
                if (
                  !isNaN(ratingValue) &&
                  ratingValue >= 1 &&
                  ratingValue <= 5
                ) {
                  rating = ratingValue;
                }
              }
              return {
                icon: rating.toString(),
                nameEn: feature.name?.en || "",
                nameAr: feature.name?.ar || "",
                descriptionEn: feature.description?.en || "",
                descriptionAr: feature.description?.ar || "",
                rating,
                order: feature.order,
              };
            }) || [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Testimonials section");
      console.error("Error loading Testimonials section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!testimonialsSection) return;

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
        features: form.testimonials.map((testimonial) => ({
          icon: testimonial.rating.toString(), // Store rating in icon field
          name: {
            en: testimonial.nameEn.trim(),
            ar: testimonial.nameAr.trim(),
          },
          description: {
            en: testimonial.descriptionEn.trim(),
            ar: testimonial.descriptionAr.trim(),
          },
          order: testimonial.order,
        })),
      };

      await updateSection(testimonialsSection._id, payload);
      await loadTestimonialsSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (testimonialsSection) {
      loadTestimonialsSection();
    }
    setIsEditing(false);
    setError(null);
  };

  const addTestimonial = () => {
    const newOrder =
      form.testimonials.length > 0
        ? Math.max(...form.testimonials.map((t) => t.order)) + 1
        : 0;
    setForm((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        {
          icon: "5",
          nameEn: "",
          nameAr: "",
          descriptionEn: "",
          descriptionAr: "",
          rating: 5,
          order: newOrder,
        },
      ],
    }));
  };

  const removeTestimonial = (index: number) => {
    setForm((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }));
  };

  const updateTestimonial = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((testimonial, i) => {
        if (i === index) {
          if (field === "rating") {
            return {
              ...testimonial,
              rating: value as number,
              icon: value.toString(), // Update icon field with rating
            };
          }
          return { ...testimonial, [field]: value };
        }
        return testimonial;
      }),
    }));
  };

  const moveTestimonial = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === form.testimonials.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newTestimonials = [...form.testimonials];
    [newTestimonials[index], newTestimonials[newIndex]] = [
      newTestimonials[newIndex],
      newTestimonials[index],
    ];

    // Update orders
    newTestimonials.forEach((testimonial, i) => {
      testimonial.order = i;
    });

    setForm((prev) => ({
      ...prev,
      testimonials: newTestimonials,
    }));
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Get section content for view mode
  const sectionTitle = isEditing
    ? form.titleEn || form.titleAr
    : testimonialsSection?.title?.[locale] || "";
  const sectionDescription = isEditing
    ? form.descriptionEn || form.descriptionAr
    : testimonialsSection?.description?.[locale] || "";
  const sectionDescriptionText = sectionDescription
    ? stripHtml(sectionDescription)
    : "";

  const testimonials = isEditing
    ? form.testimonials.map((t) => ({
        name: t.nameEn || t.nameAr,
        quote: stripHtml(t.descriptionEn || t.descriptionAr),
        role: "",
        rating: t.rating,
      }))
    : testimonialsSection?.features
        ?.sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((feature) => {
          let rating = 5;
          if (feature.icon) {
            const ratingValue = parseInt(feature.icon.toString(), 10);
            if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
              rating = ratingValue;
            }
          }

          // Name is client name
          const name =
            typeof feature.name === "string"
              ? feature.name
              : feature.name?.[locale] || "";

          // Description is testimonial quote
          const quote =
            typeof feature.description === "string"
              ? feature.description
              : feature.description?.[locale] || "";

          // Extract role from quote (last part after comma)
          const quoteText = stripHtml(quote);
          const parts = quoteText.split(",");
          const role = parts.length > 1 ? parts[parts.length - 1].trim() : "";

          return {
            name,
            quote: quoteText,
            role,
            rating,
          };
        }) || [];

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading section..."}
        </div>
      </div>
    );
  }

  if (!testimonialsSection && !isEditing) {
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .testimonials-section-description h1,
          .testimonials-section-description h2,
          .testimonials-section-description h3,
          .testimonials-section-description h4,
          .testimonials-section-description h5,
          .testimonials-section-description h6 {
            color: rgb(0, 0, 0);
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          .testimonials-section-description h1 {
            font-size: 2rem;
            margin-top: 2rem;
            margin-bottom: 1.5rem;
          }
          .testimonials-section-description h2 {
            font-size: 1.75rem;
            margin-top: 1.75rem;
            margin-bottom: 1.25rem;
          }
          .testimonials-section-description h3 {
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }
          .testimonials-section-description h4 {
            font-size: 1.25rem;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
          }
          .testimonials-section-description h5,
          .testimonials-section-description h6 {
            font-size: 1.125rem;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          .testimonials-section-description p {
            color: rgb(102, 102, 102);
            margin-bottom: 1rem;
            line-height: 1.75;
          }
          .testimonials-section-description strong,
          .testimonials-section-description b {
            color: rgb(0, 0, 0);
            font-weight: 600;
          }
          .testimonials-section-description em,
          .testimonials-section-description i {
            color: rgb(0, 0, 0);
            font-style: italic;
          }
          .testimonials-section-description a {
            color: rgb(255, 215, 0);
            font-weight: 600;
            text-decoration: none;
          }
          .testimonials-section-description a:hover {
            text-decoration: underline;
          }
          .testimonials-section-description ul,
          .testimonials-section-description ol {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
            margin-top: 0.5rem;
          }
          .testimonials-section-description ul {
            list-style-type: disc;
          }
          .testimonials-section-description ol {
            list-style-type: decimal;
          }
          .testimonials-section-description li {
            color: rgb(102, 102, 102);
            margin-bottom: 0.5rem;
            line-height: 1.75;
          }
          .testimonials-section-description blockquote {
            border-left: 4px solid rgb(255, 215, 0);
            padding-left: 1rem;
            font-style: italic;
            color: rgb(102, 102, 102);
            margin: 1rem 0;
          }
          .testimonials-section-description code {
            color: rgb(255, 215, 0);
            background-color: rgb(243, 244, 246);
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
          }
          .testimonials-section-description pre {
            background-color: rgb(17, 24, 39);
            color: rgb(243, 244, 246);
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
          }
          .testimonials-section-description pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
          }
          .testimonials-section-description span[style*="color"],
          .testimonials-section-description p[style*="color"],
          .testimonials-section-description div[style*="color"] {
            /* Preserve inline color styles from editor */
          }
          .testimonials-section-description span[style*="color"] {
            /* Preserve inline color styles from editor */
          }
          @media (min-width: 640px) {
            .testimonials-section-description h1 {
              font-size: 2.25rem;
            }
            .testimonials-section-description h2 {
              font-size: 2rem;
            }
            .testimonials-section-description h3 {
              font-size: 1.75rem;
            }
            .testimonials-section-description h4 {
              font-size: 1.5rem;
            }
          }
          @media (min-width: 768px) {
            .testimonials-section-description h1 {
              font-size: 2.5rem;
            }
            .testimonials-section-description h2 {
              font-size: 2.25rem;
            }
            .testimonials-section-description h3 {
              font-size: 2rem;
            }
            .testimonials-section-description h4 {
              font-size: 1.75rem;
            }
          }
        `,
        }}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isArabic ? "قسم آراء العملاء" : "Testimonials Section"}
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
          /* Edit Mode - Two Column Layout for Desktop */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Title and Description */}
            <div className="space-y-6">
              {/* Title */}
              <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">
                  {isArabic ? "معلومات القسم" : "Section Information"}
                </h3>
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
                <h3 className="text-lg font-bold text-white mb-4">
                  {isArabic ? "الوصف" : "Description"}
                </h3>
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

            {/* Right Column - Testimonials */}
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  {isArabic ? "آراء العملاء" : "Testimonials"}
                </h3>
                <Button
                  onClick={addTestimonial}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة رأي" : "Add Testimonial"}
                </Button>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {form.testimonials
                  .sort((a, b) => a.order - b.order)
                  .map((testimonial, index) => {
                    const originalIndex = form.testimonials.findIndex(
                      (t) => t.order === testimonial.order
                    );
                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4"
                      >
                        {/* Header with Controls */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <span className="text-sm font-medium text-white/70">
                            {isArabic ? "رأي" : "Testimonial"} #{index + 1}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                moveTestimonial(originalIndex, "up")
                              }
                              disabled={originalIndex === 0}
                              title={isArabic ? "نقل لأعلى" : "Move up"}
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                moveTestimonial(originalIndex, "down")
                              }
                              disabled={
                                originalIndex === form.testimonials.length - 1
                              }
                              title={isArabic ? "نقل لأسفل" : "Move down"}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-300"
                              onClick={() => removeTestimonial(originalIndex)}
                              title={isArabic ? "حذف" : "Delete"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Rating - Prominent */}
                        <div className="bg-primary/10 rounded-xl p-4">
                          <label className="block text-sm font-semibold text-white mb-3">
                            {isArabic ? "التقييم" : "Rating"}
                          </label>
                          <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() =>
                                  updateTestimonial(
                                    originalIndex,
                                    "rating",
                                    rating
                                  )
                                }
                                className={`p-3 rounded-xl transition-all transform hover:scale-110 ${
                                  rating <= testimonial.rating
                                    ? "bg-primary text-black shadow-lg"
                                    : "bg-white/10 text-white/40 hover:bg-white/20"
                                }`}
                                title={`${rating} ${
                                  isArabic ? "نجمة" : "star"
                                }`}
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    rating <= testimonial.rating
                                      ? "fill-current"
                                      : ""
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <p className="text-center text-xs text-white/60 mt-2">
                            {testimonial.rating} / 5{" "}
                            {isArabic ? "نجمة" : "stars"}
                          </p>
                        </div>

                        {/* Client Name */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-white">
                            {isArabic ? "اسم العميل" : "Client Name"}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Input
                                value={testimonial.nameEn}
                                onChange={(e) =>
                                  updateTestimonial(
                                    originalIndex,
                                    "nameEn",
                                    e.target.value
                                  )
                                }
                                className={inputStyles}
                                placeholder={isArabic ? "إنجليزي" : "English"}
                              />
                            </div>
                            <div>
                              <Input
                                value={testimonial.nameAr}
                                onChange={(e) =>
                                  updateTestimonial(
                                    originalIndex,
                                    "nameAr",
                                    e.target.value
                                  )
                                }
                                className={inputStyles}
                                placeholder={isArabic ? "عربي" : "Arabic"}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Testimonial Quote */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-white">
                            {isArabic ? "رأي العميل" : "Testimonial"}
                          </label>
                          <div className="space-y-3">
                            <div>
                              <RichTextEditor
                                value={testimonial.descriptionEn}
                                onChange={(value) =>
                                  updateTestimonial(
                                    originalIndex,
                                    "descriptionEn",
                                    value
                                  )
                                }
                                placeholder={
                                  isArabic
                                    ? "أدخل رأي العميل بالإنجليزية..."
                                    : "Enter testimonial in English..."
                                }
                              />
                            </div>
                            <div>
                              <RichTextEditor
                                value={testimonial.descriptionAr}
                                onChange={(value) =>
                                  updateTestimonial(
                                    originalIndex,
                                    "descriptionAr",
                                    value
                                  )
                                }
                                placeholder={
                                  isArabic
                                    ? "أدخل رأي العميل بالعربية..."
                                    : "Enter testimonial in Arabic..."
                                }
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
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              {sectionTitle && (
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  {sectionTitle}
                </h2>
              )}
              {sectionDescription && (
                <div
                  className="testimonials-section-description text-base md:text-lg text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: sectionDescription,
                  }}
                  style={{
                    wordBreak: "break-word",
                  }}
                />
              )}
            </div>

            {/* Testimonials Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial: any, idx: number) => {
                const initials = getInitials(testimonial.name);
                return (
                  <div
                    key={idx}
                    className="border border-border/60 bg-gradient-to-br from-white to-primary/5 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Stars Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating
                              ? "fill-primary text-primary"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-base text-foreground leading-relaxed mb-6">
                      &quot;{stripHtml(testimonial.quote)}&quot;
                    </p>

                    {/* Client Info */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-sm shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {testimonial.name}
                        </p>
                        {testimonial.role && (
                          <p className="text-xs text-muted-foreground">
                            {testimonial.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
