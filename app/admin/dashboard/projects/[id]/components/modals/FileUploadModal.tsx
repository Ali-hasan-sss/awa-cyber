"use client";

import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadType: "client" | "company";
  onUploadComplete: (url: string) => Promise<void>;
  submitting: boolean;
}

export default function FileUploadModal({
  isOpen,
  onClose,
  uploadType,
  onUploadComplete,
  submitting,
}: FileUploadModalProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const copy = {
    uploadFile: isArabic ? "رفع ملف" : "Upload File",
    uploadedBy: isArabic ? "رفع بواسطة" : "Uploaded By",
    cancel: isArabic ? "إلغاء" : "Cancel",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold">
            {uploadType === "client"
              ? isArabic
                ? "رفع ملف زبون"
                : "Upload Client File"
              : isArabic
              ? "رفع ملف شركة"
              : "Upload Company File"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm text-white/80">
              {copy.uploadedBy}:{" "}
              {uploadType === "client"
                ? isArabic
                  ? "الزبون"
                  : "Client"
                : isArabic
                ? "الشركة"
                : "Company"}
            </label>
          </div>
          <FileUpload
            accept="*/*"
            maxSize={50}
            onUploadComplete={onUploadComplete}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
          >
            {copy.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
