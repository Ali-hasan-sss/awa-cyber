"use client";

import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CompanyFilesTabProps {
  files: any[];
  onUpload: () => void;
  onDelete: (fileId: string) => Promise<void>;
}

export default function CompanyFilesTab({
  files,
  onUpload,
  onDelete,
}: CompanyFilesTabProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const copy = {
    uploadFile: isArabic ? "رفع ملف" : "Upload File",
    fileType: isArabic ? "نوع الملف" : "File Type",
    noFiles: isArabic ? "لا توجد ملفات" : "No files",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={onUpload}
          className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
        >
          <Upload className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {copy.uploadFile}
        </Button>
      </div>
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-white/60 text-center py-8">{copy.noFiles}</p>
        ) : (
          files.map((file) => (
            <div
              key={file._id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{file.fileName}</h4>
                  <p className="text-xs text-white/60 mt-1">
                    {copy.fileType}: {file.fileType}
                  </p>
                  {file.fileSize && (
                    <p className="text-xs text-white/60">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(file.fileUrl, "_blank")}
                    className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      if (
                        confirm(
                          isArabic ? "حذف هذا الملف؟" : "Delete this file?"
                        )
                      ) {
                        await onDelete(file._id);
                      }
                    }}
                    className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
