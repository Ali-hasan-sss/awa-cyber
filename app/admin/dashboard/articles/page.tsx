"use client";

import { useEffect, useMemo, useState } from "react";
import { useArticles, AdminArticle } from "@/contexts/ArticleContext";
import { useServices } from "@/contexts/ServiceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { FileText, Plus, Pencil, Trash2, X, Eye, Calendar } from "lucide-react";
import Link from "next/link";

type ArticleFormState = {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  bodyEn: string;
  bodyAr: string;
  serviceId: string;
  mainImage: string;
  publishedAt: string;
};

const emptyForm: ArticleFormState = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  bodyEn: "",
  bodyAr: "",
  serviceId: "",
  mainImage: "",
  publishedAt: "",
};

const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

export default function ArticlesManagementPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const {
    articles,
    loading,
    error,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  } = useArticles();
  const { services, fetchServices } = useServices();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cardLocale, setCardLocale] = useState<"en" | "ar">(
    isArabic ? "ar" : "en"
  );
  const [serviceFilter, setServiceFilter] = useState<string>("");

  useEffect(() => {
    fetchServices();
    fetchArticles(serviceFilter || undefined);
  }, [fetchServices, fetchArticles, serviceFilter]);

  const copy = useMemo(
    () => ({
      title: isArabic ? "إدارة المقالات" : "Articles Management",
      subtitle: isArabic
        ? "أنشئ المقالات وعدّلها لتعرض للعملاء باللغتين."
        : "Create and manage articles shown to your audience.",
      addArticle: isArabic ? "إضافة مقالة" : "Add Article",
      editArticle: isArabic ? "تعديل المقالة" : "Edit Article",
      mainImage: isArabic ? "الصورة الرئيسية" : "Main Image",
      service: isArabic ? "الخدمة" : "Service",
      selectService: isArabic ? "اختر خدمة" : "Select Service",
      publishedAt: isArabic ? "تاريخ النشر" : "Published Date",
      cardSectionTitle: isArabic ? "المقالات" : "Articles",
      cardSectionSubtitle: isArabic
        ? "استعرض المقالات واختر لغة العرض."
        : "Browse articles and switch the display language.",
      cardLanguageLabel: isArabic ? "لغة البطاقات" : "Card language",
      filterByService: isArabic ? "تصفية حسب الخدمة" : "Filter by Service",
      allServices: isArabic ? "جميع الخدمات" : "All Services",
      noArticles: isArabic
        ? "لا توجد مقالات للعرض حالياً."
        : "There are no articles to display yet.",
      actionEdit: isArabic ? "تعديل" : "Edit",
      actionDelete: isArabic ? "حذف" : "Delete",
      actionView: isArabic ? "عرض" : "View",
      readingTime: isArabic ? "دقائق قراءة" : "min read",
    }),
    [isArabic]
  );

  const filteredArticles = useMemo(() => {
    return articles;
  }, [articles]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
  };

  const openModal = (article?: AdminArticle) => {
    if (article) {
      setEditingId(article._id);
      const serviceId =
        typeof article.serviceId === "object"
          ? article.serviceId._id
          : article.serviceId;
      setForm({
        titleEn: article.title.en,
        titleAr: article.title.ar,
        descriptionEn: article.description.en,
        descriptionAr: article.description.ar,
        bodyEn: article.body.en,
        bodyAr: article.body.ar,
        serviceId,
        mainImage: article.mainImage || "",
        publishedAt: article.publishedAt
          ? new Date(article.publishedAt).toISOString().slice(0, 16)
          : "",
      });
    } else {
      resetForm();
    }
    setFormModalOpen(true);
  };

  const closeModal = () => {
    setFormModalOpen(false);
    resetForm();
  };

  const updateFormField = (field: keyof ArticleFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const calculateReadingTime = (html: string): number => {
    const text = html.replace(/<[^>]*>/g, "").trim();
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordsPerMinute = 200;
    return Math.ceil(words.length / wordsPerMinute) || 1;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.serviceId) {
      setFormError(isArabic ? "يرجى اختيار خدمة." : "Please select a service.");
      return;
    }

    if (!form.mainImage) {
      setFormError(isArabic ? "أضف صورة رئيسية." : "Add a main image.");
      return;
    }

    const payload = {
      title: { en: form.titleEn.trim(), ar: form.titleAr.trim() },
      description: {
        en: form.descriptionEn.trim(),
        ar: form.descriptionAr.trim(),
      },
      body: { en: form.bodyEn.trim(), ar: form.bodyAr.trim() },
      serviceId: form.serviceId,
      mainImage: form.mainImage,
      publishedAt: editingId
        ? form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : undefined
        : new Date().toISOString(), // Use current date for new articles
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateArticle(editingId, payload);
      } else {
        await createArticle(payload);
      }
      closeModal();
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (
      !confirm(
        isArabic
          ? "هل أنت متأكد من حذف هذه المقالة؟"
          : "Are you sure you want to delete this article?"
      )
    ) {
      return;
    }
    await deleteArticle(articleId);
  };

  return (
    <div className="space-y-8 text-slate-100">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <FileText className="h-9 w-9 text-primary" />
          {copy.title}
        </h1>
        <p className="text-slate-300">{copy.subtitle}</p>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button
          onClick={() => openModal()}
          className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {copy.addArticle}
          </div>
        </Button>
        {error && (
          <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold text-white">
              {copy.cardSectionTitle}
            </p>
            <p className="text-sm text-white/60">{copy.cardSectionSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-white/70">
                {copy.filterByService}
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className={inputStyles}
              >
                <option value="">{copy.allServices}</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.title[cardLocale] || service.title.en}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/70">
                {copy.cardLanguageLabel}
              </span>
              <div className="inline-flex rounded-full border border-white/15 bg-white/[0.04] p-1">
                {(["en", "ar"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setCardLocale(lang)}
                    className={`px-3 py-1 text-xs font-semibold uppercase rounded-full transition ${
                      cardLocale === lang
                        ? "bg-primary text-slate-900"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {lang === "en" ? "EN" : "AR"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-white/60">
            {isArabic ? "جاري التحميل..." : "Loading articles..."}
          </p>
        )}

        {!loading && filteredArticles.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
            {copy.noArticles}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => {
              const serviceTitle =
                typeof article.serviceId === "object"
                  ? article.serviceId.title
                  : null;
              const localizedTitle =
                article.title[cardLocale] || article.title.en || "";
              const localizedDescription =
                article.description[cardLocale] || article.description.en || "";
              const readingTime = calculateReadingTime(
                article.body[cardLocale] || article.body.en || ""
              );
              const publishedDate = formatDate(article.publishedAt);

              return (
                <div
                  key={`article-card-${article._id}`}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden"
                >
                  <div className="relative mb-4">
                    {article.mainImage ? (
                      <div className="relative h-48 overflow-hidden rounded-2xl border border-white/10">
                        <img
                          src={article.mainImage}
                          alt={localizedTitle}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm text-white/60">
                        {isArabic ? "بدون صورة" : "No image"}
                      </div>
                    )}
                    {serviceTitle && (
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-900">
                          {serviceTitle[cardLocale] || serviceTitle.en}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white flex-1 line-clamp-2">
                        {localizedTitle}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                          onClick={() => openModal(article)}
                          title={copy.actionEdit}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          onClick={() => handleDelete(article._id)}
                          title={copy.actionDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-3">
                      {localizedDescription}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      {publishedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{publishedDate}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>{readingTime}</span>
                        <span>{copy.readingTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <form
            onSubmit={handleSubmit}
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {editingId ? copy.editArticle : copy.addArticle}
                </p>
                <p className="text-sm text-slate-400">
                  {isArabic
                    ? "أدخل التفاصيل لكل من اللغتين."
                    : "Provide bilingual content for this article."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/70 hover:bg-white/10"
                onClick={closeModal}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {formError && (
              <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {formError}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
                className={inputStyles}
                value={form.titleEn}
                onChange={(e) => updateFormField("titleEn", e.target.value)}
                required
              />
              <Input
                placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
                className={inputStyles}
                value={form.titleAr}
                onChange={(e) => updateFormField("titleAr", e.target.value)}
                required
              />
              <Textarea
                placeholder={isArabic ? "الوصف (EN)" : "Description (EN)"}
                className={inputStyles}
                value={form.descriptionEn}
                onChange={(e) =>
                  updateFormField("descriptionEn", e.target.value)
                }
                rows={3}
                required
              />
              <Textarea
                placeholder={isArabic ? "الوصف (AR)" : "Description (AR)"}
                className={inputStyles}
                value={form.descriptionAr}
                onChange={(e) =>
                  updateFormField("descriptionAr", e.target.value)
                }
                rows={3}
                required
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-white/80">
                {isArabic ? "جسم المقالة (EN)" : "Article Body (EN)"}
              </p>
              <RichTextEditor
                value={form.bodyEn}
                onChange={(value) => updateFormField("bodyEn", value)}
                placeholder={
                  isArabic
                    ? "اكتب محتوى المقالة بالإنجليزية..."
                    : "Write article content in English..."
                }
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-white/80">
                {isArabic ? "جسم المقالة (AR)" : "Article Body (AR)"}
              </p>
              <RichTextEditor
                value={form.bodyAr}
                onChange={(value) => updateFormField("bodyAr", value)}
                placeholder={
                  isArabic
                    ? "اكتب محتوى المقالة بالعربية..."
                    : "Write article content in Arabic..."
                }
              />
            </div>

            <div
              className={`grid gap-4 ${
                editingId ? "md:grid-cols-2" : "md:grid-cols-1"
              }`}
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">
                  {copy.service}
                </label>
                <select
                  value={form.serviceId}
                  onChange={(e) => updateFormField("serviceId", e.target.value)}
                  className={inputStyles}
                  required
                >
                  <option value="">{copy.selectService}</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.title[isArabic ? "ar" : "en"]}
                    </option>
                  ))}
                </select>
              </div>
              {editingId && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/80">
                    {copy.publishedAt}
                  </label>
                  <Input
                    type="datetime-local"
                    className={inputStyles}
                    value={form.publishedAt}
                    onChange={(e) =>
                      updateFormField("publishedAt", e.target.value)
                    }
                  />
                </div>
              )}
              {!editingId && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/80">
                    {copy.publishedAt}
                  </label>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                    {isArabic
                      ? `سيتم استخدام التاريخ الحالي: ${new Date().toLocaleDateString(
                          "ar-SA",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}`
                      : `Current date will be used: ${new Date().toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}`}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-white/80">
                {copy.mainImage}
              </p>

              {!form.mainImage ? (
                <FileUpload
                  accept="image/*"
                  maxSize={10}
                  onUploadComplete={(url) => {
                    updateFormField("mainImage", url);
                  }}
                />
              ) : (
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  <img
                    src={form.mainImage}
                    alt="Main"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <a
                        href={form.mainImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-primary/20 p-2 text-primary hover:bg-primary/30"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        onClick={() => updateFormField("mainImage", "")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
                onClick={closeModal}
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-gradient-to-r from-primary to-cyan-400 px-6 text-slate-950 shadow-lg"
              >
                {submitting
                  ? isArabic
                    ? "جارٍ الحفظ..."
                    : "Saving..."
                  : isArabic
                  ? "حفظ المقالة"
                  : "Save article"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
