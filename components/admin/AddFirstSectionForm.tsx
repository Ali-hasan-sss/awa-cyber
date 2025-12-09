"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { createSection, updateSection } from "@/lib/api/sections";
import { X } from "lucide-react";

interface AddFirstSectionFormProps {
  serviceId: string;
  section?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddFirstSectionForm({
  serviceId,
  section,
  onSuccess,
  onCancel,
}: AddFirstSectionFormProps) {
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
        image: section.images?.[0] || "",
      };
    }
    return {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      image: "",
    };
  };

  const [form, setForm] = useState(initializeForm);

  useEffect(() => {
    setForm(initializeForm());
  }, [section?._id]);

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
        images: form.image ? [form.image] : [],
        order: 0,
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
              ? "تعديل القسم الأول"
              : "Edit First Section"
            : isArabic
            ? "إضافة القسم الأول"
            : "Add First Section"}
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

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Text Fields */}
          <div className="space-y-4">
            {/* Title EN */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isArabic ? "العنوان (EN)" : "Title (EN)"}
              </label>
              <Input
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                placeholder={
                  isArabic
                    ? "أدخل العنوان بالإنجليزية"
                    : "Enter title in English"
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
              <div className="bg-gray-700 rounded-lg border border-gray-600">
                <RichTextEditor
                  value={form.descriptionEn}
                  onChange={(value) =>
                    setForm({ ...form, descriptionEn: value })
                  }
                  placeholder={
                    isArabic
                      ? "أدخل الوصف بالإنجليزية"
                      : "Enter description in English"
                  }
                />
              </div>
            </div>

            {/* Description AR */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isArabic ? "الوصف (AR)" : "Description (AR)"}
              </label>
              <div className="bg-gray-700 rounded-lg border border-gray-600">
                <RichTextEditor
                  value={form.descriptionAr}
                  onChange={(value) =>
                    setForm({ ...form, descriptionAr: value })
                  }
                  placeholder={
                    isArabic
                      ? "أدخل الوصف بالعربية"
                      : "Enter description in Arabic"
                  }
                />
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isArabic ? "الصورة" : "Image"}
              </label>
              <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                <FileUpload
                  onUploadComplete={(url) => {
                    setForm({ ...form, image: url });
                  }}
                  multiple={false}
                  accept="image/*"
                />
              </div>
              {form.image && (
                <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border border-gray-600">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
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
