"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import { Pencil, Save, X, Play } from "lucide-react";
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

export default function VideoSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [videoSection, setVideoSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form state
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    image: "",
    videoUrl: "",
  });

  useEffect(() => {
    loadVideoSection();
  }, []);

  const loadVideoSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "about" });
      // Get the fourth section (index 3) sorted by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 3) {
        const section = sortedData[3];
        setVideoSection(section);
        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          image: section.images?.[0] || "",
          videoUrl: (section as any).videoUrl || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Video section");
      console.error("Error loading Video section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!videoSection) return;

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
      };

      // Add videoUrl if provided
      if (form.videoUrl.trim()) {
        payload.videoUrl = form.videoUrl.trim();
      }

      await updateSection(videoSection._id, payload);
      await loadVideoSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (videoSection) {
      loadVideoSection();
    }
    setIsEditing(false);
    setError(null);
  };

  const inputStyles =
    "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

  // Check if the image is actually a video file
  const isVideoFile = (url: string) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  // Get section content
  const sectionTitle = isEditing
    ? form.titleEn || form.titleAr
    : videoSection?.title?.[locale] || "";
  const sectionDescription = isEditing
    ? stripHtml(form.descriptionEn || form.descriptionAr)
    : stripHtml(videoSection?.description?.[locale] || "");
  const sectionImage = isEditing
    ? form.image || "/images/publicContain.jpg"
    : videoSection?.images?.[0] || "/images/publicContain.jpg";
  const videoUrl = isEditing
    ? form.videoUrl
    : (videoSection as any)?.videoUrl || "";

  const isVideo = isVideoFile(sectionImage) || isVideoFile(videoUrl);
  const videoSource = isVideoFile(sectionImage) ? sectionImage : videoUrl;

  const handlePlay = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoUrl && !isVideo) {
      window.open(videoUrl, "_blank");
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading section..."}
        </div>
      </div>
    );
  }

  if (!videoSection && !isEditing) {
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
          {isArabic ? "قسم الفيديو" : "Video Section"}
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
            {/* Image/Video Upload */}
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">
                {isArabic ? "الصورة أو الفيديو" : "Image or Video"}
              </h3>
              <FileUpload
                accept="image/*,video/*"
                maxSize={50}
                hideUploadedFiles={true}
                onUploadComplete={(url) => {
                  setForm((prev) => ({ ...prev, image: url }));
                }}
              />
              {form.image && (
                <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-primary/30">
                  {isVideoFile(form.image) ? (
                    <video
                      src={form.image}
                      className="w-full h-64 object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={form.image}
                      alt="Section"
                      className="w-full h-64 object-cover"
                    />
                  )}
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

            {/* Video URL */}
            <div className="backdrop-blur-md bg-black/60 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">
                {isArabic ? "رابط الفيديو (اختياري)" : "Video URL (Optional)"}
              </h3>
              <Input
                value={form.videoUrl}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    videoUrl: e.target.value,
                  }))
                }
                className={inputStyles}
                placeholder={
                  isArabic
                    ? "أدخل رابط الفيديو (YouTube, Vimeo, etc.)"
                    : "Enter video URL (YouTube, Vimeo, etc.)"
                }
              />
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
            {/* Left Side - Content */}
            <div className="order-1 lg:order-1 flex items-center bg-white py-12 sm:py-16 md:py-20 lg:py-28">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:px-12 w-full">
                <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                  {/* Title */}
                  {sectionTitle && (
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                      {sectionTitle}
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
                </div>
              </div>
            </div>

            {/* Right Side - Video/Image with Play Button */}
            <div
              className="relative order-2 lg:order-2 w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-full overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isVideo && videoSource ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoSource}
                    className="w-full h-full max-h-full object-contain bg-black"
                    onEnded={handleVideoEnd}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    playsInline
                    style={{ maxHeight: "100%" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-primary/5 pointer-events-none" />
                </>
              ) : (
                <>
                  <Image
                    src={sectionImage}
                    alt={sectionTitle || "Video Section"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-primary/5 pointer-events-none" />
                </>
              )}

              {/* Play Button Overlay - Show when not playing, always show for non-video, or when hovered during playback */}
              {(!isVideo || !isPlaying || isHovered) && (
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    isVideo && isPlaying && !isHovered
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                >
                  <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="group relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/90 hover:bg-primary transition-all duration-300 hover:scale-110"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {!isPlaying ? (
                      <Play
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-foreground group-hover:text-white ml-1 transition-colors"
                        fill="currentColor"
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-6 bg-foreground group-hover:bg-white rounded-sm"></div>
                        <div className="w-2 h-6 bg-foreground group-hover:bg-white rounded-sm"></div>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
