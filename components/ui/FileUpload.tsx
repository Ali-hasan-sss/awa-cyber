"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config/api";

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  onMultipleUploadComplete?: (urls: string[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  hideUploadedFiles?: boolean; // Hide the uploaded files list
}

interface UploadedFile {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

export default function FileUpload({
  onUploadComplete,
  onMultipleUploadComplete,
  multiple = false,
  accept = "image/*",
  maxSize = 10,
  className = "",
  hideUploadedFiles = false,
}: FileUploadProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();

      if (multiple) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      } else {
        formData.append("file", files[0]);
      }

      const response = await apiClient.post(
        multiple ? "/api/upload/multiple" : "/api/upload/single",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const uploaded = multiple ? response.data.data : [response.data.data];

        // Convert relative URLs to absolute URLs
        const uploadedWithFullUrls = uploaded.map((f: UploadedFile) => ({
          ...f,
          url: f.url.startsWith("http") ? f.url : `${API_BASE_URL}${f.url}`,
        }));

        setUploadedFiles((prev) => [...prev, ...uploadedWithFullUrls]);

        if (multiple && onMultipleUploadComplete) {
          onMultipleUploadComplete(
            uploadedWithFullUrls.map((f: UploadedFile) => f.url)
          );
        } else if (!multiple && onUploadComplete) {
          onUploadComplete(uploadedWithFullUrls[0].url);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        (isArabic ? "فشل رفع الملف" : "Failed to upload file");
      setError(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isImage = (mimetype: string) => mimetype.startsWith("image/");

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition ${
          uploading
            ? "border-primary/50 bg-primary/5"
            : "border-white/20 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-white/70">
              {isArabic ? "جاري الرفع..." : "Uploading..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {isArabic
                  ? "انقر أو اسحب الملفات هنا"
                  : "Click or drag files here"}
              </p>
              <p className="mt-1 text-xs text-white/60">
                {isArabic ? `الحد الأقصى ${maxSize}MB` : `Max ${maxSize}MB`}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {!hideUploadedFiles && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            {isArabic ? "الملفات المرفوعة" : "Uploaded Files"}
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  {isImage(file.mimetype) ? (
                    <ImageIcon className="h-5 w-5 text-primary" />
                  ) : (
                    <File className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-white/60">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {isArabic ? "عرض" : "View"}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/60 hover:text-red-300"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
