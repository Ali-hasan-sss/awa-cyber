"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { createSection, updateSection } from "@/lib/api/sections";
import { X, Plus, Trash2 } from "lucide-react";
import {
  serviceIconOptions,
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";

interface Feature {
  icon: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

interface AddSecondSectionFormProps {
  serviceId: string;
  section?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddSecondSectionForm({
  serviceId,
  section,
  onSuccess,
  onCancel,
}: AddSecondSectionFormProps) {
  const { locale, isArabic } = useLanguage();
  const [loading, setLoading] = useState(false);
  const isEditing = !!section;
  const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);

  const initializeForm = () => {
    if (section) {
      return {
        titleEn:
          typeof section.title === "string"
            ? section.title
            : section.title?.en || "",
        titleAr:
          typeof section.title === "string"
            ? section.title
            : section.title?.ar || "",
        descriptionEn:
          typeof section.description === "string"
            ? section.description
            : section.description?.en || "",
        descriptionAr:
          typeof section.description === "string"
            ? section.description
            : section.description?.ar || "",
        features:
          section.features?.map((f: any) => ({
            icon: f.icon || "",
            nameEn: typeof f.name === "string" ? f.name : f.name?.en || "",
            nameAr: typeof f.name === "string" ? f.name : f.name?.ar || "",
            descriptionEn:
              typeof f.description === "string"
                ? f.description
                : f.description?.en || "",
            descriptionAr:
              typeof f.description === "string"
                ? f.description
                : f.description?.ar || "",
          })) || [],
      };
    }
    return {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      features: [],
    };
  };

  const [form, setForm] = useState(initializeForm);

  useEffect(() => {
    setForm(initializeForm());
  }, [section?._id]);

  const addFeature = () => {
    setForm((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          icon: "",
          nameEn: "",
          nameAr: "",
          descriptionEn: "",
          descriptionAr: "",
        },
      ],
    }));
    setIconPickerIndex(form.features.length);
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter(
        (_: Feature, idx: number) => idx !== index
      ),
    }));
    setIconPickerIndex(null);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, features };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleEn && !form.titleAr) {
      alert(isArabic ? "يرجى إدخال العنوان" : "Please enter a title");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: {
          en: form.titleEn,
          ar: form.titleAr,
        },
        description: {
          en: form.descriptionEn,
          ar: form.descriptionAr,
        },
        features: form.features.map((f: Feature, idx: number) => ({
          icon: f.icon,
          name: {
            en: f.nameEn,
            ar: f.nameAr,
          },
          description: {
            en: f.descriptionEn,
            ar: f.descriptionAr,
          },
          order: idx,
        })),
        order: 1, // القسم الثاني
        isActive: true,
      };

      if (isEditing && section?._id) {
        await updateSection(section._id, payload);
      } else {
        await createSection({
          ...payload,
          page: "services",
          serviceId: serviceId,
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error saving section:", error);
      alert(
        error.message ||
          (isArabic ? "حدث خطأ أثناء الحفظ" : "Error saving section")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isEditing
            ? isArabic
              ? "تعديل القسم الثاني"
              : "Edit Second Section"
            : isArabic
            ? "إضافة القسم الثاني"
            : "Add Second Section"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title EN */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isArabic ? "العنوان (EN)" : "Title (EN)"}
          </label>
          <Input
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            placeholder={
              isArabic ? "أدخل العنوان بالإنجليزية" : "Enter title in English"
            }
            className="rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 px-4 py-2"
          />
        </div>

        {/* Title AR */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isArabic ? "العنوان (AR)" : "Title (AR)"}
          </label>
          <Input
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
            placeholder={
              isArabic ? "أدخل العنوان بالعربية" : "Enter title in Arabic"
            }
            className="rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 px-4 py-2"
          />
        </div>

        {/* Description EN */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isArabic ? "الوصف (EN)" : "Description (EN)"}
          </label>
          <Input
            value={form.descriptionEn}
            onChange={(e) =>
              setForm({ ...form, descriptionEn: e.target.value })
            }
            placeholder={
              isArabic
                ? "أدخل الوصف بالإنجليزية"
                : "Enter description in English"
            }
            className="rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 px-4 py-2"
          />
        </div>

        {/* Description AR */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isArabic ? "الوصف (AR)" : "Description (AR)"}
          </label>
          <Input
            value={form.descriptionAr}
            onChange={(e) =>
              setForm({ ...form, descriptionAr: e.target.value })
            }
            placeholder={
              isArabic ? "أدخل الوصف بالعربية" : "Enter description in Arabic"
            }
            className="rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 px-4 py-2"
          />
        </div>

        {/* Features */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-300">
              {isArabic ? "الميزات" : "Features"}
            </label>
            <Button
              type="button"
              onClick={addFeature}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {isArabic ? "إضافة ميزة" : "Add Feature"}
            </Button>
          </div>

          <div className="space-y-4">
            {form.features.map((feature: Feature, index: number) => {
              const IconComponent = feature.icon
                ? serviceIconComponents[feature.icon as ServiceIconKey]
                : null;

              return (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg border border-gray-600 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">
                      {isArabic ? `ميزة ${index + 1}` : `Feature ${index + 1}`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-gray-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isArabic ? "الأيقونة" : "Icon"}
                    </label>
                    {iconPickerIndex === index ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-600 rounded-lg">
                          {serviceIconOptions.map((option) => {
                            const Icon =
                              serviceIconComponents[
                                option.value as ServiceIconKey
                              ];
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  updateFeature(index, "icon", option.value);
                                  setIconPickerIndex(null);
                                }}
                                className={`p-2 rounded-lg border-2 transition ${
                                  feature.icon === option.value
                                    ? "border-primary bg-primary/20"
                                    : "border-gray-500 hover:border-gray-400 bg-gray-700"
                                }`}
                              >
                                <Icon className="h-6 w-6 text-white" />
                              </button>
                            );
                          })}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIconPickerIndex(null)}
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-600"
                          size="sm"
                        >
                          {isArabic ? "إغلاق" : "Close"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {IconComponent ? (
                          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              {isArabic ? "لا يوجد" : "None"}
                            </span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIconPickerIndex(index)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-600"
                          size="sm"
                        >
                          {isArabic ? "اختيار أيقونة" : "Choose Icon"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Feature Name EN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isArabic ? "اسم الميزة (EN)" : "Feature Name (EN)"}
                    </label>
                    <Input
                      value={feature.nameEn}
                      onChange={(e) =>
                        updateFeature(index, "nameEn", e.target.value)
                      }
                      placeholder={
                        isArabic
                          ? "أدخل اسم الميزة بالإنجليزية"
                          : "Enter feature name in English"
                      }
                      className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                    />
                  </div>

                  {/* Feature Name AR */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isArabic ? "اسم الميزة (AR)" : "Feature Name (AR)"}
                    </label>
                    <Input
                      value={feature.nameAr}
                      onChange={(e) =>
                        updateFeature(index, "nameAr", e.target.value)
                      }
                      placeholder={
                        isArabic
                          ? "أدخل اسم الميزة بالعربية"
                          : "Enter feature name in Arabic"
                      }
                      className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                    />
                  </div>

                  {/* Feature Description EN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isArabic
                        ? "وصف الميزة (EN)"
                        : "Feature Description (EN)"}
                    </label>
                    <Input
                      value={feature.descriptionEn}
                      onChange={(e) =>
                        updateFeature(index, "descriptionEn", e.target.value)
                      }
                      placeholder={
                        isArabic
                          ? "أدخل وصف الميزة بالإنجليزية"
                          : "Enter feature description in English"
                      }
                      className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                    />
                  </div>

                  {/* Feature Description AR */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isArabic
                        ? "وصف الميزة (AR)"
                        : "Feature Description (AR)"}
                    </label>
                    <Input
                      value={feature.descriptionAr}
                      onChange={(e) =>
                        updateFeature(index, "descriptionAr", e.target.value)
                      }
                      placeholder={
                        isArabic
                          ? "أدخل وصف الميزة بالعربية"
                          : "Enter feature description in Arabic"
                      }
                      className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {loading
              ? isArabic
                ? "جاري الحفظ..."
                : "Saving..."
              : isArabic
              ? "حفظ"
              : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
