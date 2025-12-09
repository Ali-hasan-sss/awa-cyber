"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  Section,
  Feature,
} from "@/lib/api/sections";
import { X, Plus, Trash2, Pencil, Check } from "lucide-react";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

export interface AdminServiceSectionsManagerProps {
  serviceId: string;
  sections: any[];
  onUpdated: () => void;
  onCancel: () => void;
}

function AdminServiceSectionsManager({
  serviceId,
  sections: initialSections,
  onUpdated,
  onCancel,
}: AdminServiceSectionsManagerProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [sections, setSections] = useState<any[]>(initialSections);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    images: [] as string[],
    features: [] as Array<{
      nameEn: string;
      nameAr: string;
      descriptionEn: string;
      descriptionAr: string;
      icon: string;
      order: number;
    }>,
    order: 0,
    isActive: true,
  });
  const [draftFeature, setDraftFeature] = useState<any>(null);
  const [iconPickerIndex, setIconPickerIndex] = useState<
    number | string | null
  >(null);

  const inputStyles =
    "rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary focus:border-transparent transition";

  useEffect(() => {
    loadSections();
  }, [serviceId]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const allSections = await getSections({ isActive: true });
      const serviceSections = allSections.filter(
        (s: any) => s.serviceId === serviceId
      );
      setSections(serviceSections);
    } catch (error) {
      console.error("Error loading sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (section?: any) => {
    if (section) {
      setEditingId(section._id);
      setForm({
        titleEn: section.title?.en || "",
        titleAr: section.title?.ar || "",
        descriptionEn: section.description?.en || "",
        descriptionAr: section.description?.ar || "",
        images: section.images || [],
        features:
          section.features?.map((f: any) => ({
            nameEn: f.name?.en || "",
            nameAr: f.name?.ar || "",
            descriptionEn: f.description?.en || "",
            descriptionAr: f.description?.ar || "",
            icon: f.icon || "",
            order: f.order || 0,
          })) || [],
        order: section.order || 0,
        isActive: section.isActive !== undefined ? section.isActive : true,
      });
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setForm({
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      images: [],
      features: [],
      order: sections.length,
      isActive: true,
    });
    setEditingId(null);
    setDraftFeature(null);
    setIconPickerIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        page: "services" as const,
        serviceId: serviceId,
        images: form.images.filter(Boolean),
        features: form.features
          .filter(
            (f) =>
              f.nameEn.trim() ||
              f.nameAr.trim() ||
              f.descriptionEn.trim() ||
              f.descriptionAr.trim()
          )
          .map((f, idx) => ({
            name: {
              en: f.nameEn.trim(),
              ar: f.nameAr.trim(),
            },
            description: {
              en: f.descriptionEn.trim(),
              ar: f.descriptionAr.trim(),
            },
            icon: f.icon.trim(),
            order: f.order || idx,
          })),
        order: form.order,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateSection(editingId, payload);
      } else {
        await createSection(payload);
      }

      resetForm();
      loadSections();
      onUpdated();
    } catch (error: any) {
      console.error("Error saving section:", error);
      alert(error.message || (isArabic ? "حدث خطأ" : "Error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? "هل أنت متأكد من الحذف؟" : "Are you sure?")) return;

    try {
      await deleteSection(id);
      loadSections();
      onUpdated();
    } catch (error: any) {
      console.error("Error deleting section:", error);
      alert(error.message || (isArabic ? "حدث خطأ" : "Error occurred"));
    }
  };

  const addFeature = () => {
    setDraftFeature({
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      icon: "",
      order: form.features.length,
    });
    setIconPickerIndex(null);
  };

  const saveDraftFeature = () => {
    if (!draftFeature) return;
    const hasContent =
      draftFeature.nameEn ||
      draftFeature.nameAr ||
      draftFeature.descriptionEn ||
      draftFeature.descriptionAr;

    if (!hasContent) return;

    setForm((prev) => ({
      ...prev,
      features: [...prev.features, draftFeature],
    }));
    setDraftFeature(null);
    setIconPickerIndex(null);
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== index),
    }));
  };

  const updateDraftFeature = (field: string, value: any) => {
    if (!draftFeature) return;
    setDraftFeature({ ...draftFeature, [field]: value });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isArabic ? "إدارة الأقسام" : "Manage Sections"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isArabic
              ? "أضف أو عدّل الأقسام المرتبطة بهذه الخدمة"
              : "Add or edit sections linked to this service"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {isArabic ? "إضافة قسم" : "Add Section"}
          </Button>
        </div>
      </div>

      {/* Sections List */}
      {sections.length > 0 && (
        <div className="space-y-4">
          {sections
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((section) => (
              <div
                key={section._id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {typeof section.title === "object"
                        ? section.title[locale]
                        : section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {typeof section.description === "object"
                        ? section.description[locale]
                        : section.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {isArabic ? "الترتيب" : "Order"}: {section.order || 0}
                      </span>
                      <span>
                        {isArabic ? "الميزات" : "Features"}:{" "}
                        {section.features?.length || 0}
                      </span>
                      <span>
                        {isArabic ? "الصور" : "Images"}:{" "}
                        {section.images?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openForm(section)}
                    >
                      <Pencil className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {isArabic ? "تعديل" : "Edit"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(section._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Form */}
      {(editingId || (!editingId && form.titleEn)) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {editingId
                ? isArabic
                  ? "تعديل القسم"
                  : "Edit Section"
                : isArabic
                ? "قسم جديد"
                : "New Section"}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={resetForm}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
              className={inputStyles}
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              required
            />
            <Input
              placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
              className={inputStyles}
              value={form.titleAr}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              {isArabic ? "الوصف (EN)" : "Description (EN)"}
            </label>
            <RichTextEditor
              value={form.descriptionEn}
              onChange={(value) => setForm({ ...form, descriptionEn: value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              {isArabic ? "الوصف (AR)" : "Description (AR)"}
            </label>
            <RichTextEditor
              value={form.descriptionAr}
              onChange={(value) => setForm({ ...form, descriptionAr: value })}
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-900">
              {isArabic ? "الصور" : "Images"}
            </p>
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {form.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="group relative rounded-2xl border border-gray-200 overflow-hidden"
                  >
                    <img
                      src={imageUrl}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images.filter(
                              (_, idx) => idx !== index
                            ),
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {isArabic ? "الميزات" : "Features"}
              </p>
              <Button type="button" variant="outline" onClick={addFeature}>
                <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {isArabic ? "إضافة ميزة" : "Add Feature"}
              </Button>
            </div>

            {form.features.length > 0 && (
              <div className="space-y-2">
                {form.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    {feature.icon &&
                      serviceIconComponents[feature.icon as ServiceIconKey] && (
                        <div className="text-primary">
                          {serviceIconComponents[
                            feature.icon as ServiceIconKey
                          ]({
                            className: "h-5 w-5",
                          })}
                        </div>
                      )}
                    <span className="flex-1 text-sm">
                      {feature.nameEn ||
                        feature.nameAr ||
                        `Feature ${index + 1}`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {draftFeature && (
              <div className="rounded-2xl border border-primary/30 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                    {isArabic ? "ميزة جديدة" : "New Feature"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDraftFeature(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const IconPreview =
                        draftFeature.icon &&
                        serviceIconComponents[
                          draftFeature.icon as ServiceIconKey
                        ];
                      return IconPreview ? (
                        <div className="text-primary">
                          {IconPreview({ className: "h-5 w-5" })}
                        </div>
                      ) : (
                        <div className="text-gray-400">No icon</div>
                      );
                    })()}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setIconPickerIndex(
                        iconPickerIndex === "draft" ? null : "draft"
                      )
                    }
                  >
                    {isArabic ? "اختيار أيقونة" : "Choose icon"}
                  </Button>
                </div>
                {iconPickerIndex === "draft" && (
                  <div className="grid gap-2 rounded-2xl border border-gray-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3 max-h-60 overflow-y-auto">
                    {serviceIconOptions.map((option) => {
                      const Icon = option.Icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                            draftFeature.icon === option.value
                              ? "border-primary text-primary"
                              : "border-gray-200 text-gray-700"
                          }`}
                          onClick={() => {
                            updateDraftFeature("icon", option.value);
                            setIconPickerIndex(null);
                          }}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{option.label[locale]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder={isArabic ? "اسم (EN)" : "Name (EN)"}
                    className={inputStyles}
                    value={draftFeature.nameEn}
                    onChange={(e) =>
                      updateDraftFeature("nameEn", e.target.value)
                    }
                  />
                  <Input
                    placeholder={isArabic ? "اسم (AR)" : "Name (AR)"}
                    className={inputStyles}
                    value={draftFeature.nameAr}
                    onChange={(e) =>
                      updateDraftFeature("nameAr", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Textarea
                    placeholder={isArabic ? "الوصف (EN)" : "Description (EN)"}
                    className={inputStyles}
                    value={draftFeature.descriptionEn}
                    onChange={(e) =>
                      updateDraftFeature("descriptionEn", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder={isArabic ? "الوصف (AR)" : "Description (AR)"}
                    className={inputStyles}
                    value={draftFeature.descriptionAr}
                    onChange={(e) =>
                      updateDraftFeature("descriptionAr", e.target.value)
                    }
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraftFeature(null)}
                  >
                    {isArabic ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button type="button" onClick={saveDraftFeature}>
                    <Check className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {isArabic ? "إضافة" : "Add"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-900">
                {isArabic ? "الترتيب" : "Order"}
              </label>
              <Input
                type="number"
                className="w-20"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-900">
                {isArabic ? "نشط" : "Active"}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={resetForm}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isArabic
                  ? "جارٍ الحفظ..."
                  : "Saving..."
                : editingId
                ? isArabic
                  ? "حفظ التغييرات"
                  : "Save Changes"
                : isArabic
                ? "إضافة القسم"
                : "Add Section"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminServiceSectionsManager;
