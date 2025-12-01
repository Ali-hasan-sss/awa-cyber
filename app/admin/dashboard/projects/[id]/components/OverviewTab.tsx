"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { Save, MessageCircle, Key, Copy, Phone } from "lucide-react";
import { AdminProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";

interface OverviewTabProps {
  project: AdminProject;
  isEditing: boolean;
  form: {
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    logo: string;
    totalCost: number;
    startDate: string;
    progress: number;
    whatsappGroupLink: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      nameEn: string;
      nameAr: string;
      descriptionEn: string;
      descriptionAr: string;
      logo: string;
      totalCost: number;
      startDate: string;
      progress: number;
      whatsappGroupLink: string;
    }>
  >;
  onSave: () => void;
  onCancel: () => void;
  submitting: boolean;
  generatePortalCode: (projectId: string) => Promise<any>;
  loadProject: () => Promise<void>;
  submittingPortalCode: boolean;
  setSubmittingPortalCode: (value: boolean) => void;
}

export default function OverviewTab({
  project,
  isEditing,
  form,
  setForm,
  onSave,
  onCancel,
  submitting,
  generatePortalCode,
  loadProject,
  submittingPortalCode,
  setSubmittingPortalCode,
}: OverviewTabProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const { admin } = useAuth();
  const isAdmin = admin?.role === "admin";

  const copy = {
    projectName: isArabic ? "اسم المشروع" : "Project Name",
    description: isArabic ? "الوصف" : "Description",
    logo: isArabic ? "شعار المشروع" : "Project Logo",
    totalCost: isArabic ? "التكلفة الإجمالية" : "Total Cost",
    startDate: isArabic ? "تاريخ البدء" : "Start Date",
    progress: isArabic ? "مستوى التقدم" : "Progress",
    client: isArabic ? "العميل" : "Client",
    company: isArabic ? "الشركة" : "Company",
    whatsappGroupLink: isArabic ? "رابط مجموعة واتساب" : "WhatsApp Group Link",
    openWhatsApp: isArabic ? "فتح واتساب" : "Open WhatsApp",
    portalCode: isArabic ? "رمز الدخول للبورتال" : "Portal Access Code",
    generateCode: isArabic ? "توليد رمز" : "Generate Code",
    copyCode: isArabic ? "نسخ الرمز" : "Copy Code",
    codeCopied: isArabic ? "تم نسخ الرمز" : "Code Copied",
    portalLink: isArabic ? "رابط البورتال" : "Portal Link",
    save: isArabic ? "حفظ" : "Save",
    cancel: isArabic ? "إلغاء" : "Cancel",
  };

  const getUserName = (userId: AdminProject["userId"]): string => {
    if (typeof userId === "object" && userId !== null && "name" in userId) {
      return userId.name;
    }
    return "-";
  };

  const getCompanyName = (userId: AdminProject["userId"]): string => {
    if (
      typeof userId === "object" &&
      userId !== null &&
      "companyName" in userId
    ) {
      return userId.companyName || "-";
    }
    return "-";
  };

  const getPhoneNumber = (userId: AdminProject["userId"]): string | null => {
    if (typeof userId === "object" && userId !== null && "phone" in userId) {
      return userId.phone || null;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-white/80">
            {copy.projectName} (EN)
          </label>
          {isEditing ? (
            <Input
              className={inputStyles}
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            />
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
              {project.name.en}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/80">
            {copy.projectName} (AR)
          </label>
          {isEditing ? (
            <Input
              className={inputStyles}
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
            />
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
              {project.name.ar}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-white/80">
            {copy.description} (EN)
          </label>
          {isEditing ? (
            <Textarea
              className={inputStyles}
              value={form.descriptionEn}
              onChange={(e) =>
                setForm({ ...form, descriptionEn: e.target.value })
              }
            />
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
              {project.description.en}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-white/80">
            {copy.description} (AR)
          </label>
          {isEditing ? (
            <Textarea
              className={inputStyles}
              value={form.descriptionAr}
              onChange={(e) =>
                setForm({ ...form, descriptionAr: e.target.value })
              }
            />
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
              {project.description.ar}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/80">
            {copy.logo}
          </label>
          {isEditing ? (
            <FileUpload
              accept="image/*"
              maxSize={5}
              hideUploadedFiles={true}
              onUploadComplete={(url) => setForm({ ...form, logo: url })}
            />
          ) : (
            project.logo && (
              <div className="relative h-24 w-24">
                <img
                  src={project.logo}
                  alt={project.name.en}
                  className="h-24 w-24 rounded-lg object-cover border border-white/10"
                  onError={(e) => {
                    console.error("Failed to load logo:", project.logo);
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            )
          )}
        </div>
        {isAdmin && (
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.totalCost}
            </label>
            {isEditing ? (
              <Input
                type="number"
                className={inputStyles}
                value={form.totalCost}
                onChange={(e) =>
                  setForm({ ...form, totalCost: Number(e.target.value) })
                }
              />
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                {project.totalCost.toLocaleString()} {isArabic ? "ريال" : "SAR"}
              </p>
            )}
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm text-white/80">
            {copy.startDate}
          </label>
          {isEditing ? (
            <Input
              type="date"
              className={inputStyles}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString(
                    isArabic ? "ar-EG-u-ca-gregory" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "-"}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/80">
            {copy.progress} ({form.progress}%)
            {!isAdmin && (
              <span className="text-xs text-white/60 block mt-1">
                {isArabic
                  ? "(محسوب تلقائياً حسب المراحل)"
                  : "(Auto-calculated based on phases)"}
              </span>
            )}
          </label>
          {isEditing && isAdmin ? (
            <div className="space-y-2">
              <Input
                type="range"
                min="0"
                max="100"
                className="w-full"
                value={form.progress}
                onChange={(e) =>
                  setForm({ ...form, progress: Number(e.target.value) })
                }
              />
              <p className="text-xs text-white/60 text-center">
                {form.progress}%
              </p>
            </div>
          ) : (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${form.progress}%` }}
              />
            </div>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/80">
            {copy.client}
          </label>
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
            {getUserName(project.userId)}
          </p>
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/80">
            {copy.company}
          </label>
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
            {getCompanyName(project.userId)}
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-white/80">
            {copy.whatsappGroupLink}
          </label>
          {isEditing ? (
            <Input
              type="url"
              placeholder={
                isArabic
                  ? "https://chat.whatsapp.com/..."
                  : "https://chat.whatsapp.com/..."
              }
              className={inputStyles}
              value={form.whatsappGroupLink}
              onChange={(e) =>
                setForm({ ...form, whatsappGroupLink: e.target.value })
              }
            />
          ) : (
            <div className="flex items-center gap-3">
              <p className="flex-1 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                {project.whatsappGroupLink || "-"}
              </p>
              <div className="flex items-center gap-2">
                {project.whatsappGroupLink && (
                  <Button
                    onClick={() =>
                      window.open(project.whatsappGroupLink, "_blank")
                    }
                    className="rounded-full bg-green-500/20 px-6 py-3 text-green-300 hover:bg-green-500/30"
                  >
                    <MessageCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {copy.openWhatsApp}
                  </Button>
                )}
                {(() => {
                  const phoneNumber = getPhoneNumber(project.userId);
                  if (phoneNumber) {
                    // Remove any non-digit characters and format for WhatsApp
                    const cleanPhone = phoneNumber.replace(/\D/g, "");
                    const whatsappUrl = `https://wa.me/${cleanPhone}`;
                    return (
                      <Button
                        onClick={() => window.open(whatsappUrl, "_blank")}
                        className="rounded-full bg-green-500/20 p-3 text-green-300 hover:bg-green-500/30"
                        title={
                          isArabic ? "فتح محادثة واتساب" : "Open WhatsApp Chat"
                        }
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>
        {isAdmin && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-white/80">
              {copy.portalCode}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm flex items-center justify-between">
                <code className="text-primary font-mono text-lg">
                  {project.portalCode || "---"}
                </code>
                {project.portalCode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/portal?code=${project.portalCode}`
                      );
                      alert(copy.codeCopied);
                    }}
                    className="h-8 w-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                    title={copy.copyCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={async () => {
                  if (!project) return;
                  setSubmittingPortalCode(true);
                  try {
                    const result = await generatePortalCode(project._id);
                    await loadProject();
                    if (result?.portalCode) {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/portal?code=${result.portalCode}`
                      );
                      alert(copy.codeCopied);
                    }
                  } catch (err) {
                    console.error("Failed to generate portal code:", err);
                  } finally {
                    setSubmittingPortalCode(false);
                  }
                }}
                disabled={submittingPortalCode}
                className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
              >
                <Key className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {copy.generateCode}
              </Button>
            </div>
            {project.portalCode && (
              <p className="mt-2 text-xs text-white/60">
                {copy.portalLink}:{" "}
                <a
                  href={`/portal?code=${project.portalCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {window.location.origin}/portal?code={project.portalCode}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
          >
            {copy.cancel}
          </Button>
          <Button
            onClick={onSave}
            disabled={submitting}
            className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
          >
            <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {copy.save}
          </Button>
        </div>
      )}
    </div>
  );
}
