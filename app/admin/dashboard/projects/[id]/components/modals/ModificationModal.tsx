"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Paperclip } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { inputStyles } from "../types";
import { useRef } from "react";

interface ModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    title: string;
    description: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
    }>
  >;
  attachedFiles: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

export default function ModificationModal({
  isOpen,
  onClose,
  form,
  setForm,
  attachedFiles,
  onFileSelect,
  onRemoveFile,
  onSubmit,
  submitting,
}: ModificationModalProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copy = {
    addModification: isArabic ? "إضافة تعديل" : "Add Modification",
    modificationTitle: isArabic ? "عنوان التعديل" : "Modification Title",
    description: isArabic ? "الوصف" : "Description",
    cancel: isArabic ? "إلغاء" : "Cancel",
    save: isArabic ? "حفظ" : "Save",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold">{copy.addModification}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.modificationTitle} <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder={copy.modificationTitle}
              className={inputStyles}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.description} <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder={copy.description}
              className={inputStyles}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {isArabic
                ? "رفع ملفات مرفقة (اختياري)"
                : "Upload attached files (optional)"}
            </label>
            <div
              className={`border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-white/5 ${
                isArabic ? "rtl" : "ltr"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={onFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Paperclip className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-white/70">
                  {isArabic
                    ? "اسحب الملفات هنا أو انقر للتصفح"
                    : "Drag files here or click to browse"}
                </p>
                <p className="text-xs text-white/50">
                  {isArabic
                    ? "PDF, JPG, PNG, ZIP, DOC, DOCX (الحد الأقصى 5 ملفات)"
                    : "PDF, JPG, PNG, ZIP, DOC, DOCX (Maximum 5 files)"}
                </p>
              </div>
            </div>

            {attachedFiles.length > 0 && (
              <>
                <p className="mt-2 text-sm text-white/60 text-center">
                  {isArabic
                    ? `${attachedFiles.length} / 5 ملفات`
                    : `${attachedFiles.length} / 5 files`}
                </p>
                <div className="mt-4 space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <span className="text-sm text-white/80 truncate flex-1">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveFile(index)}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
          >
            {copy.cancel}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
          >
            {copy.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
