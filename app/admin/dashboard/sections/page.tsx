"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import {
  FileCode,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  Section,
  PageType,
  Feature,
} from "@/lib/api/sections";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

type SectionFormState = {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  page: PageType;
  images: string[];
  features: Array<{
    icon: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    order: number;
  }>;
  order: number;
  isActive: boolean;
};

const emptyForm: SectionFormState = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  page: "home",
  images: [],
  features: [],
  order: 0,
  isActive: true,
};

const pageOptions: Array<{
  value: PageType;
  label: { en: string; ar: string };
}> = [
  { value: "home", label: { en: "Home", ar: "الرئيسية" } },
  { value: "about", label: { en: "About Us", ar: "من نحن" } },
  { value: "services", label: { en: "Services", ar: "خدماتنا" } },
  { value: "contact", label: { en: "Contact", ar: "اتصل بنا" } },
  { value: "portfolio", label: { en: "Portfolio", ar: "معرض الأعمال" } },
];

const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

export default function SectionsManagementPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SectionFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
  const [filterPage, setFilterPage] = useState<PageType>("home");
  const [viewLocale, setViewLocale] = useState<"en" | "ar">(
    isArabic ? "ar" : "en"
  );

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections();
      setSections(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  const copy = useMemo(
    () => ({
      title: isArabic ? "إدارة الأقسام" : "Sections Management",
      subtitle: isArabic
        ? "أنشئ الأقسام وعدّلها للصفحات المختلفة باللغتين."
        : "Create and manage sections for different pages in both languages.",
      addSection: isArabic ? "إضافة قسم" : "Add Section",
      editSection: isArabic ? "تعديل القسم" : "Edit Section",
      page: isArabic ? "الصفحة" : "Page",
      titleEn: isArabic ? "العنوان (إنجليزي)" : "Title (English)",
      titleAr: isArabic ? "العنوان (عربي)" : "Title (Arabic)",
      descriptionEn: isArabic ? "الوصف (إنجليزي)" : "Description (English)",
      descriptionAr: isArabic ? "الوصف (عربي)" : "Description (Arabic)",
      descriptionHint: isArabic
        ? "يمكنك استخدام HTML لتنسيق النص"
        : "You can use HTML to format the text",
      features: isArabic ? "الميزات" : "Features",
      noFeatures: isArabic ? "لا توجد ميزات" : "No features yet",
      order: isArabic ? "الترتيب" : "Order",
      isActive: isArabic ? "نشط" : "Active",
      deleteConfirm: isArabic
        ? "هل تريد حذف هذا القسم؟"
        : "Delete this section?",
      filterByPage: isArabic ? "تصفية حسب الصفحة" : "Filter by page",
      viewLanguage: isArabic ? "لغة العرض" : "View language",
      noSections: isArabic
        ? "لا توجد أقسام للعرض حالياً."
        : "There are no sections to display yet.",
      actionEdit: isArabic ? "تعديل" : "Edit",
      actionDelete: isArabic ? "حذف" : "Delete",
      actionView: isArabic ? "عرض" : "View",
      addFeature: isArabic ? "إضافة ميزة" : "Add Feature",
      featureName: isArabic ? "اسم الميزة" : "Feature Name",
      featureDescription: isArabic ? "وصف الميزة" : "Feature Description",
      featureIcon: isArabic ? "أيقونة الميزة" : "Feature Icon",
      save: isArabic ? "حفظ" : "Save",
      cancel: isArabic ? "إلغاء" : "Cancel",
      close: isArabic ? "إغلاق" : "Close",
    }),
    [isArabic]
  );

  const activeFeature =
    activeFeatureIndex !== null ? form.features[activeFeatureIndex] : null;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setDraftFeature(null);
    setActiveFeatureIndex(null);
    setIconPickerIndex(null);
  };

  const openModal = (section?: Section) => {
    if (section) {
      setEditingId(section._id);
      setForm({
        titleEn: section.title.en,
        titleAr: section.title.ar,
        descriptionEn: section.description.en,
        descriptionAr: section.description.ar,
        page: section.page,
        images: section.images || [],
        features:
          section.features?.map((feature) => ({
            icon: feature.icon,
            nameEn: feature.name.en,
            nameAr: feature.name.ar,
            descriptionEn: feature.description.en,
            descriptionAr: feature.description.ar,
            order: feature.order,
          })) ?? [],
        order: section.order,
        isActive: section.isActive,
      });
      setActiveFeatureIndex(
        section.features && section.features.length ? 0 : null
      );
      setIconPickerIndex(null);
    } else {
      resetForm();
    }
    setFormModalOpen(true);
  };

  const closeModal = () => {
    setFormModalOpen(false);
    resetForm();
  };

  const updateFormField = (field: keyof SectionFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const images = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images };
    });
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    // Validation
    const errors: string[] = [];

    if (!form.titleEn.trim()) {
      errors.push(
        isArabic ? "العنوان بالإنجليزية مطلوب" : "English title is required"
      );
    }

    if (!form.titleAr.trim()) {
      errors.push(
        isArabic ? "العنوان بالعربية مطلوب" : "Arabic title is required"
      );
    }

    if (!form.descriptionEn.trim()) {
      errors.push(
        isArabic ? "الوصف بالإنجليزية مطلوب" : "English description is required"
      );
    }

    if (!form.descriptionAr.trim()) {
      errors.push(
        isArabic ? "الوصف بالعربية مطلوب" : "Arabic description is required"
      );
    }

    if (!form.page) {
      errors.push(isArabic ? "يجب اختيار الصفحة" : "Page is required");
    }

    if (errors.length > 0) {
      setFormError(errors.join(". "));
      return;
    }

    // Build payload
    const payload: any = {
      title: {
        en: form.titleEn.trim(),
        ar: form.titleAr.trim(),
      },
      description: {
        en: form.descriptionEn.trim(),
        ar: form.descriptionAr.trim(),
      },
      page: form.page,
      order: form.order || 0,
      isActive: form.isActive !== undefined ? form.isActive : true,
    };

    // Add images if present
    const validImages = form.images.filter(Boolean);
    if (validImages.length > 0) {
      payload.images = validImages;
    }

    // Add features if present
    const validFeatures = form.features
      .filter(
        (feature) =>
          feature.icon.trim() && feature.nameEn.trim() && feature.nameAr.trim()
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
      }));

    if (validFeatures.length > 0) {
      payload.features = validFeatures;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateSection(editingId, payload);
      } else {
        await createSection(payload);
      }
      await loadSections();
      closeModal();
    } catch (err: any) {
      setFormError(err.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm(copy.deleteConfirm)) {
      return;
    }
    try {
      await deleteSection(sectionId);
      await loadSections();
    } catch (err: any) {
      setError(err.message || "Failed to delete section");
    }
  };

  const filteredSections = useMemo(() => {
    return sections
      .filter((s) => s.page === filterPage)
      .sort((a, b) => a.order - b.order);
  }, [sections, filterPage]);

  const getIconComponent = (iconName: string) => {
    if (iconName in serviceIconComponents) {
      const Icon = serviceIconComponents[iconName as ServiceIconKey];
      return <Icon className="h-5 w-5" />;
    }
    return null;
  };

  return (
    <div className="space-y-8 text-slate-100">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <FileCode className="h-9 w-9 text-primary" />
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
            {copy.addSection}
          </div>
        </Button>
        {error && (
          <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-sm text-white/70">{copy.filterByPage}</span>
          <div className="inline-flex rounded-full border border-white/15 bg-white/[0.04] p-1 gap-1">
            {pageOptions.map((page) => (
              <button
                key={page.value}
                type="button"
                onClick={() => setFilterPage(page.value)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  filterPage === page.value
                    ? "bg-primary text-slate-900 shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {page.label[viewLocale]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70">{copy.viewLanguage}</span>
          <div className="inline-flex rounded-full border border-white/15 bg-white/[0.04] p-1">
            {(["en", "ar"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setViewLocale(lang)}
                className={`px-3 py-1 text-xs font-semibold uppercase rounded-full transition ${
                  viewLocale === lang
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

      {loading && (
        <p className="text-sm text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading sections..."}
        </p>
      )}

      {!loading && filteredSections.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
          {copy.noSections}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredSections.map((section) => {
            const pageLabel = pageOptions.find((p) => p.value === section.page);
            return (
              <div
                key={section._id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {section.title[viewLocale]}
                      </h3>
                      {!section.isActive && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">
                          {isArabic ? "غير نشط" : "Inactive"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 mb-2">
                      {pageLabel?.label[viewLocale]} • {copy.order}:{" "}
                      {section.order}
                    </p>
                    <div
                      className="text-sm text-white/80 prose prose-invert max-w-none mb-4"
                      dangerouslySetInnerHTML={{
                        __html: section.description[viewLocale],
                      }}
                    />
                    {section.images && section.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                        {section.images.slice(0, 3).map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt={`Section image ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-white/10"
                          />
                        ))}
                        {section.images.length > 3 && (
                          <div className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-white/60 text-sm">
                            +{section.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => openModal(section)}
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(section._id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {section.features && section.features.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-white/80 mb-3">
                      {copy.features} ({section.features.length})
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {section.features
                        .sort((a, b) => a.order - b.order)
                        .map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                          >
                            <div className="mt-1 text-primary">
                              {getIconComponent(feature.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">
                                {feature.name[viewLocale]}
                              </p>
                              <p className="text-xs text-white/60 mt-1">
                                {feature.description[viewLocale]}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#060e1f] p-6 shadow-[0_25px_80px_rgba(2,6,23,0.65)]">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? copy.editSection : copy.addSection}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {formError}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {copy.page}
                  </label>
                  <select
                    value={form.page}
                    onChange={(e) =>
                      updateFormField("page", e.target.value as PageType)
                    }
                    className={inputStyles}
                    required
                  >
                    {pageOptions.map((page) => (
                      <option key={page.value} value={page.value}>
                        {page.label[isArabic ? "ar" : "en"]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {copy.order}
                  </label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      updateFormField("order", parseInt(e.target.value) || 0)
                    }
                    className={inputStyles}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {copy.titleEn}
                  </label>
                  <Input
                    value={form.titleEn}
                    onChange={(e) => updateFormField("titleEn", e.target.value)}
                    className={inputStyles}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {copy.titleAr}
                  </label>
                  <Input
                    value={form.titleAr}
                    onChange={(e) => updateFormField("titleAr", e.target.value)}
                    className={inputStyles}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {copy.descriptionEn}
                    <span className="text-xs text-white/50 ml-2">
                      ({copy.descriptionHint})
                    </span>
                  </label>
                  <RichTextEditor
                    value={form.descriptionEn}
                    onChange={(value) =>
                      updateFormField("descriptionEn", value)
                    }
                    placeholder={
                      isArabic
                        ? "أدخل الوصف بالإنجليزية..."
                        : "Enter description in English..."
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {copy.descriptionAr}
                    <span className="text-xs text-white/50 ml-2">
                      ({copy.descriptionHint})
                    </span>
                  </label>
                  <RichTextEditor
                    value={form.descriptionAr}
                    onChange={(value) =>
                      updateFormField("descriptionAr", value)
                    }
                    placeholder={
                      isArabic
                        ? "أدخل الوصف بالعربية..."
                        : "Enter description in Arabic..."
                    }
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {isArabic ? "الصور" : "Images"}
                  </label>
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
                  {form.images.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                        {isArabic ? "الصور المرفوعة" : "Uploaded Images"}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {form.images.map((imageUrl, index) => (
                          <div
                            key={`image-${index}`}
                            className="group relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                          >
                            <img
                              src={imageUrl}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="flex gap-2">
                                <a
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-full bg-primary/20 p-2 text-primary hover:bg-primary/30"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="rounded-full bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    updateFormField("isActive", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-white/20 bg-white/[0.02] text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-white/80"
                >
                  {copy.isActive}
                </label>
              </div>

              {/* Features Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {copy.features}
                  </h3>
                  <Button
                    type="button"
                    onClick={addFeature}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {copy.addFeature}
                  </Button>
                </div>

                {form.features.length === 0 && !draftFeature && (
                  <p className="text-sm text-white/60">{copy.noFeatures}</p>
                )}

                {/* Draft Feature Form */}
                {draftFeature && (
                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-cyan-300">
                        {copy.addFeature}
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={saveDraftFeature}
                          size="sm"
                          className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
                        >
                          {copy.save}
                        </Button>
                        <Button
                          type="button"
                          onClick={cancelDraftFeature}
                          size="sm"
                          variant="ghost"
                          className="rounded-full"
                        >
                          {copy.cancel}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          {copy.order}
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
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          {copy.featureIcon}
                        </label>
                        <div className="relative">
                          <Input
                            value={draftFeature.icon}
                            onChange={(e) =>
                              updateDraftFeature("icon", e.target.value)
                            }
                            className={inputStyles}
                            placeholder="Icon name"
                          />
                          {draftFeature.icon &&
                            getIconComponent(draftFeature.icon) && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                                {getIconComponent(draftFeature.icon)}
                              </div>
                            )}
                        </div>
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
                        <Button
                          type="button"
                          onClick={() =>
                            setIconPickerIndex(
                              iconPickerIndex === "draft" ? null : "draft"
                            )
                          }
                          variant="outline"
                          size="sm"
                          className="mt-2 rounded-full"
                        >
                          {iconPickerIndex === "draft"
                            ? copy.close
                            : "Choose Icon"}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          {copy.featureName} (EN)
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
                          {copy.featureName} (AR)
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          {copy.featureDescription} (EN)
                        </label>
                        <Textarea
                          value={draftFeature.descriptionEn}
                          onChange={(e) =>
                            updateDraftFeature("descriptionEn", e.target.value)
                          }
                          className={inputStyles}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          {copy.featureDescription} (AR)
                        </label>
                        <Textarea
                          value={draftFeature.descriptionAr}
                          onChange={(e) =>
                            updateDraftFeature("descriptionAr", e.target.value)
                          }
                          className={inputStyles}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Features */}
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
                                {feature.nameEn || feature.nameAr}
                              </p>
                              <p className="text-xs text-white/60">
                                {copy.order}: {feature.order}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              onClick={() => moveFeature(originalIndex, "up")}
                              variant="ghost"
                              size="sm"
                              disabled={originalIndex === 0}
                              className="text-white/60 hover:text-white"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => moveFeature(originalIndex, "down")}
                              variant="ghost"
                              size="sm"
                              disabled={
                                originalIndex === form.features.length - 1
                              }
                              className="text-white/60 hover:text-white"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => removeFeature(originalIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {copy.order}
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
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {copy.featureIcon}
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
                                ? copy.close
                                : "Choose Icon"}
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-xs text-white/70 mb-1">
                              {copy.featureName} (EN)
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
                              {copy.featureName} (AR)
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
                              {copy.featureDescription} (EN)
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
                              {copy.featureDescription} (AR)
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
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="ghost"
                  className="rounded-full"
                >
                  {copy.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-6 py-2 text-black hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting
                    ? isArabic
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : copy.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
