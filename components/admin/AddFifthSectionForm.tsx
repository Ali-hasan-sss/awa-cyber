"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { createSection, updateSection } from "@/lib/api/sections";
import { X } from "lucide-react";

interface AddFifthSectionFormProps {
  serviceId: string;
  section?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddFifthSectionForm({
  serviceId,
  section,
  onSuccess,
  onCancel,
}: AddFifthSectionFormProps) {
  const { locale, isArabic } = useLanguage();
  const [loading, setLoading] = useState(false);
  const isEditing = !!section;

  const initialFormData = useMemo(() => {
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
      };
    }
    return {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
    };
  }, [section?._id, section?.title, section?.description]);

  const [form, setForm] = useState(initialFormData);

  useEffect(() => {
    setForm(initialFormData);
  }, [initialFormData]);

  // Memoize onChange handlers to prevent infinite loops
  const handleDescriptionEnChange = useCallback((value: string) => {
    setForm((prev) => {
      if (prev.descriptionEn === value) return prev;
      return { ...prev, descriptionEn: value };
    });
  }, []);

  const handleDescriptionArChange = useCallback((value: string) => {
    setForm((prev) => {
      if (prev.descriptionAr === value) return prev;
      return { ...prev, descriptionAr: value };
    });
  }, []);

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
        order: 4, // القسم الخامس
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
              ? "تعديل القسم الخامس"
              : "Edit Fifth Section"
            : isArabic
            ? "إضافة القسم الخامس"
            : "Add Fifth Section"}
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
          <RichTextEditor
            value={form.descriptionEn}
            onChange={handleDescriptionEnChange}
            placeholder={
              isArabic
                ? "أدخل الوصف بالإنجليزية"
                : "Enter description in English"
            }
            className="rounded-lg border border-gray-600 bg-gray-700 text-white"
          />
        </div>

        {/* Description AR */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isArabic ? "الوصف (AR)" : "Description (AR)"}
          </label>
          <RichTextEditor
            value={form.descriptionAr}
            onChange={handleDescriptionArChange}
            placeholder={
              isArabic ? "أدخل الوصف بالعربية" : "Enter description in Arabic"
            }
            className="rounded-lg border border-gray-600 bg-gray-700 text-white"
          />
        </div>

        {/* Info Note */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            {isArabic
              ? "ملاحظة: الأزرار ثابتة - الزر الأول يوجه إلى صفحة طلب عرض السعر (/quote) والثاني يوجه إلى صفحة الاتصال (/contact)."
              : "Note: The buttons are fixed - the first button links to the quote page (/quote) and the second button links to the contact page (/contact)."}
          </p>
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
