"use client";

import { useEffect, useState, useRef } from "react";
import {
  Folder,
  User,
  Building2,
  Upload,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  Video,
  Archive,
  Loader2,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects } from "@/contexts/ProjectContext";
import { ProjectFile } from "@/lib/actions/projectActions";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config/api";

interface PortalFilesProps {
  projectId: string;
}

const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return FileText;
  if (type.includes("doc") || type.includes("word")) return FileText;
  if (type.includes("image") || type.includes("jpg") || type.includes("png"))
    return ImageIcon;
  if (type.includes("video") || type.includes("mp4")) return Video;
  if (type.includes("zip") || type.includes("rar")) return Archive;
  if (type.includes("fig")) return File;
  return File;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "0 B";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

const formatDate = (date: string, isArabic: boolean) => {
  const dateObj = new Date(date);
  // Force Gregorian calendar by using English locale for Arabic
  const locale = isArabic ? "ar-EG-u-ca-gregory" : "en-US";
  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function PortalFiles({ projectId }: PortalFilesProps) {
  const { locale, messages } = useLanguage();
  const isArabic = locale === "ar";
  const { getProjectFiles, createProjectFile, deleteProjectFile } =
    useProjects();
  const [clientFiles, setClientFiles] = useState<ProjectFile[]>([]);
  const [companyFiles, setCompanyFiles] = useState<ProjectFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"client" | "company">("client");
  const [uploadMode, setUploadMode] = useState<"file" | "link">("file");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = messages.portalFiles || {};

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    try {
      const allFiles = await getProjectFiles(projectId);
      setClientFiles(allFiles.filter((f) => f.uploadedBy === "client"));
      setCompanyFiles(allFiles.filter((f) => f.uploadedBy === "company"));
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        // Upload file to server
        const uploadResponse = await apiClient.post(
          `${API_BASE_URL}/api/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const fileUrl =
          uploadResponse.data.url || uploadResponse.data.data?.url;

        if (fileUrl) {
          // Create project file record
          // Don't send userId - backend will get it from project
          await createProjectFile({
            projectId,
            fileUrl,
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            fileSize: file.size,
            uploadedBy: uploadType,
          });
        }
      }

      await loadFiles();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Failed to upload file:", err);
      alert(
        err?.response?.data?.message ||
          (isArabic ? "فشل رفع الملف" : "Failed to upload file")
      );
    } finally {
      setUploading(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) {
      alert(isArabic ? "يرجى إدخال رابط" : "Please enter a link");
      return;
    }

    if (!validateUrl(linkUrl)) {
      alert(
        isArabic
          ? "يرجى إدخال رابط صحيح (يبدأ بـ http:// أو https://)"
          : "Please enter a valid URL (starting with http:// or https://)"
      );
      return;
    }

    setUploading(true);
    try {
      // Extract file name from URL or use provided name
      const fileName =
        linkName.trim() ||
        linkUrl.split("/").pop()?.split("?")[0] ||
        "External Link";

      // Create project file record with the link URL
      await createProjectFile({
        projectId,
        fileUrl: linkUrl.trim(),
        fileName: fileName,
        fileType: "application/link",
        fileSize: 0, // Links don't have a file size
        uploadedBy: uploadType,
      });

      // Reset form
      setLinkUrl("");
      setLinkName("");
      setShowLinkForm(false);
      setUploadMode("file");

      await loadFiles();
    } catch (err: any) {
      console.error("Failed to add link:", err);
      alert(
        err?.response?.data?.message ||
          (isArabic ? "فشل إضافة الرابط" : "Failed to add link")
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (
      !confirm(
        isArabic ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?"
      )
    ) {
      return;
    }
    try {
      await deleteProjectFile(fileId);
      await loadFiles();
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    window.open(fileUrl, "_blank");
  };

  return (
    <section id="files" className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 space-y-2 ${isArabic ? "rtl" : "ltr"}`}
        >
          <div className="flex items-center justify-center gap-3">
            <Folder className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t.title || (isArabic ? "إدارة الملفات" : "File Management")}
            </h2>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Files Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
            <div
              className={`flex items-center justify-between mb-6 ${
                isArabic ? "rtl flex-row-reverse" : "ltr"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t.clientFiles ||
                    (isArabic ? "ملفات العميل" : "Client Files")}
                </h3>
              </div>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                {clientFiles.length}{" "}
                {isArabic ? "ملف" : clientFiles.length === 1 ? "file" : "files"}
              </span>
            </div>

            {/* Upload Mode Toggle */}
            <div className="mb-4 flex gap-2">
              <Button
                variant={uploadMode === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setUploadMode("file");
                  setShowLinkForm(false);
                  setLinkUrl("");
                  setLinkName("");
                }}
                className="flex-1"
              >
                <Upload className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                {isArabic ? "رفع ملف" : "Upload File"}
              </Button>
              <Button
                variant={uploadMode === "link" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setUploadMode("link");
                  setShowLinkForm(true);
                  setUploadType("client");
                }}
                className="flex-1"
              >
                <LinkIcon className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                {isArabic ? "إضافة رابط" : "Add Link"}
              </Button>
            </div>

            {/* Upload File Area */}
            {uploadMode === "file" && (
              <div
                className={`mb-6 border-2 border-dashed border-primary rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-primary/5 ${
                  isArabic ? "rtl" : "ltr"
                }`}
                onClick={() => {
                  setUploadType("client");
                  fileInputRef.current?.click();
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {t.uploadNewFile ||
                        (isArabic ? "رفع ملف جديد" : "Upload new file")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t.dragDrop ||
                        (isArabic
                          ? "اسحب وأفلت الملف هنا أو انقر للتصفح"
                          : "Drag and drop the file here or click to browse")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Link Form */}
            {uploadMode === "link" && showLinkForm && (
              <div className="mb-6 border-2 border-dashed border-primary rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    <p className="font-semibold text-gray-900">
                      {isArabic ? "إضافة رابط خارجي" : "Add External Link"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowLinkForm(false);
                      setLinkUrl("");
                      setLinkName("");
                      setUploadMode("file");
                    }}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? "الرابط (مطلوب)" : "Link URL (Required)"}
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder={
                        isArabic
                          ? "https://drive.google.com/..."
                          : "https://drive.google.com/..."
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isArabic
                        ? "مثال: رابط Google Drive، Dropbox، OneDrive، إلخ"
                        : "Example: Google Drive link, Dropbox, OneDrive, etc."}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic
                        ? "اسم الملف (اختياري)"
                        : "File Name (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={linkName}
                      onChange={(e) => setLinkName(e.target.value)}
                      placeholder={
                        isArabic
                          ? "اسم الملف أو الوصف"
                          : "File name or description"
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={uploading}
                    />
                  </div>
                  <Button
                    onClick={handleAddLink}
                    disabled={uploading || !linkUrl.trim()}
                    className="w-full bg-primary text-white hover:bg-primary/90"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                        {isArabic ? "جاري الإضافة..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                        {isArabic ? "إضافة الرابط" : "Add Link"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Client Files List */}
            <div className="space-y-3">
              {clientFiles.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {t.noFiles || (isArabic ? "لا توجد ملفات" : "No files")}
                </p>
              ) : (
                clientFiles.map((file) => {
                  const FileIcon = getFileIcon(file.fileType);
                  return (
                    <div
                      key={file._id}
                      className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-200"
                    >
                      <div className="bg-gray-200 p-2 rounded-lg">
                        <FileIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">
                            {file.fileName}
                          </p>
                          {file.fileType === "application/link" && (
                            <LinkIcon className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {file.fileType === "application/link"
                            ? isArabic
                              ? "رابط خارجي"
                              : "External Link"
                            : formatFileSize(file.fileSize)}{" "}
                          • {formatDate(file.createdAt, isArabic)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDownload(file.fileUrl, file.fileName)
                          }
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          title={isArabic ? "فتح الرابط" : "Open Link"}
                        >
                          {file.fileType === "application/link" ? (
                            <LinkIcon className="w-5 h-5" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Company Files Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
            <div
              className={`flex items-center justify-between mb-6 ${
                isArabic ? "rtl flex-row-reverse" : "ltr"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t.companyFiles ||
                    (isArabic ? "ملفات الشركة" : "Company Files")}
                </h3>
              </div>
              <span className="bg-primary text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                {companyFiles.length}{" "}
                {isArabic
                  ? "ملف"
                  : companyFiles.length === 1
                  ? "file"
                  : "files"}
              </span>
            </div>

            {/* Company Files List */}
            <div className="space-y-3">
              {companyFiles.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {t.noFiles || (isArabic ? "لا توجد ملفات" : "No files")}
                </p>
              ) : (
                companyFiles.map((file) => {
                  const FileIcon = getFileIcon(file.fileType);
                  return (
                    <div
                      key={file._id}
                      className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-200"
                    >
                      <div className="bg-primary p-2 rounded-lg">
                        <FileIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {file.fileName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(file.fileSize)} •{" "}
                          {formatDate(file.createdAt, isArabic)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDownload(file.fileUrl, file.fileName)
                        }
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {uploading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex items-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-gray-900">
                {isArabic ? "جاري الرفع..." : "Uploading..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
