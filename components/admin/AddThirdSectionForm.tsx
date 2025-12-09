"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSection, updateSection } from "@/lib/api/sections";
import { X, Plus, Trash2 } from "lucide-react";

interface AddThirdSectionFormProps {
  serviceId: string;
  section?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddThirdSectionForm({
  serviceId,
  section,
  onSuccess,
  onCancel,
}: AddThirdSectionFormProps) {
  const { locale, isArabic } = useLanguage();
  const [loading, setLoading] = useState(false);
  const isEditing = !!section;

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
            icon: f.icon || "", // رقم الخطوة مثل "01"
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
          icon: String(prev.features.length + 1).padStart(2, "0"), // رقم افتراضي
          nameEn: "",
          nameAr: "",
          descriptionEn: "",
          descriptionAr: "",
        },
      ],
    }));
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_: any, idx: number) => idx !== index),
    }));
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
        features: form.features.map((f: any, idx: number) => ({
          icon: f.icon || String(idx + 1).padStart(2, "0"), // رقم الخطوة
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
        order: 2, // القسم الثالث
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
              ? "تعديل القسم الثالث"
              : "Edit Third Section"
            : isArabic
            ? "إضافة القسم الثالث"
            : "Add Third Section"}
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
              {isArabic ? "خطوات العملية" : "Process Steps"}
            </label>
            <Button
              type="button"
              onClick={addFeature}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {isArabic ? "إضافة خطوة" : "Add Step"}
            </Button>
          </div>

          <div className="space-y-4">
            {form.features.map((feature: any, index: number) => (
              <div
                key={index}
                className="bg-gray-700 rounded-lg border border-gray-600 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    {isArabic ? `خطوة ${index + 1}` : `Step ${index + 1}`}
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

                {/* Step Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isArabic ? "رقم الخطوة" : "Step Number"} (مثل: 01)
                  </label>
                  <Input
                    value={feature.icon}
                    onChange={(e) =>
                      updateFeature(index, "icon", e.target.value)
                    }
                    placeholder="01"
                    className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                  />
                </div>

                {/* Step Name EN */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isArabic ? "اسم الخطوة (EN)" : "Step Name (EN)"}
                  </label>
                  <Input
                    value={feature.nameEn}
                    onChange={(e) =>
                      updateFeature(index, "nameEn", e.target.value)
                    }
                    placeholder={
                      isArabic
                        ? "أدخل اسم الخطوة بالإنجليزية"
                        : "Enter step name in English"
                    }
                    className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                  />
                </div>

                {/* Step Name AR */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isArabic ? "اسم الخطوة (AR)" : "Step Name (AR)"}
                  </label>
                  <Input
                    value={feature.nameAr}
                    onChange={(e) =>
                      updateFeature(index, "nameAr", e.target.value)
                    }
                    placeholder={
                      isArabic
                        ? "أدخل اسم الخطوة بالعربية"
                        : "Enter step name in Arabic"
                    }
                    className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                  />
                </div>

                {/* Step Description EN */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isArabic ? "وصف الخطوة (EN)" : "Step Description (EN)"}
                  </label>
                  <Input
                    value={feature.descriptionEn}
                    onChange={(e) =>
                      updateFeature(index, "descriptionEn", e.target.value)
                    }
                    placeholder={
                      isArabic
                        ? "أدخل وصف الخطوة بالإنجليزية"
                        : "Enter step description in English"
                    }
                    className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                  />
                </div>

                {/* Step Description AR */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isArabic ? "وصف الخطوة (AR)" : "Step Description (AR)"}
                  </label>
                  <Input
                    value={feature.descriptionAr}
                    onChange={(e) =>
                      updateFeature(index, "descriptionAr", e.target.value)
                    }
                    placeholder={
                      isArabic
                        ? "أدخل وصف الخطوة بالعربية"
                        : "Enter step description in Arabic"
                    }
                    className="rounded-lg border border-gray-600 bg-gray-600 text-white placeholder:text-gray-400 px-4 py-2"
                  />
                </div>
              </div>
            ))}
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
