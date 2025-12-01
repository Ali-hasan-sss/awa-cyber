"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Download,
} from "lucide-react";
import { AdminModification } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface ModificationsTabProps {
  modifications: AdminModification[];
  onAddModification: () => void;
  onAcceptModification: (modificationId: string) => Promise<void>;
  onRejectModification: (modificationId: string) => Promise<void>;
  onRequestExtraPayment: (modificationId: string) => void;
  onAcceptExtraPayment: (modificationId: string) => Promise<void>;
  onDeleteModification: (modificationId: string) => Promise<void>;
}

export default function ModificationsTab({
  modifications,
  onAddModification,
  onAcceptModification,
  onRejectModification,
  onRequestExtraPayment,
  onAcceptExtraPayment,
  onDeleteModification,
}: ModificationsTabProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const { admin } = useAuth();
  const isAdmin = admin?.role === "admin";

  const copy = {
    addModification: isArabic ? "إضافة تعديل" : "Add Modification",
    accept: isArabic ? "موافق" : "Accept",
    reject: isArabic ? "مرفوض" : "Reject",
    requestExtraPayment: isArabic
      ? "يحتاج دفعة إضافية"
      : "Request Extra Payment",
    clientAcceptedPayment: isArabic
      ? "العميل موافق على الدفعة"
      : "Client Accepted Payment",
    extraPayment: isArabic ? "دفعة إضافية" : "Extra Payment",
    costAccepted: isArabic ? "قبول التكلفة" : "Cost Accepted",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={onAddModification}
          className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {copy.addModification}
        </Button>
      </div>
      <div className="space-y-2">
        {modifications.length === 0 ? (
          <p className="text-white/60 text-center py-8">
            {isArabic ? "لا توجد تعديلات" : "No modifications"}
          </p>
        ) : (
          modifications.map((mod) => {
            const modData = typeof mod === "object" ? mod : null;
            if (!modData) return null;

            return (
              <div
                key={modData._id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-white">
                        {modData.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          modData.priority === "critical"
                            ? "bg-red-500/20 text-red-300"
                            : modData.priority === "high"
                            ? "bg-orange-500/20 text-orange-300"
                            : modData.priority === "medium"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {modData.priority}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          modData.status === "completed"
                            ? "bg-green-500/20 text-green-300"
                            : modData.status === "accepted"
                            ? "bg-blue-500/20 text-blue-300"
                            : modData.status === "rejected"
                            ? "bg-red-500/20 text-red-300"
                            : modData.status === "needs_extra_payment"
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {modData.status === "completed"
                          ? isArabic
                            ? "مكتمل"
                            : "Completed"
                          : modData.status === "accepted"
                          ? isArabic
                            ? "موافق"
                            : "Accepted"
                          : modData.status === "needs_extra_payment"
                          ? isArabic
                            ? "يحتاج دفعة إضافية"
                            : "Needs Extra Payment"
                          : isArabic
                          ? "معلق"
                          : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mt-1">
                      {modData.description}
                    </p>
                    {/* Attached Files */}
                    {modData.attachedFiles &&
                      modData.attachedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-white/60 font-semibold">
                            {isArabic ? "الملفات المرفقة" : "Attached Files"}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {modData.attachedFiles.map((file, fileIndex) => (
                              <a
                                key={fileIndex}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="truncate max-w-[200px]">
                                  {file.fileName}
                                </span>
                                <Download className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    {modData.extraPaymentAmount && (
                      <p className="text-xs text-yellow-400 mt-2">
                        {copy.extraPayment}:{" "}
                        {modData.extraPaymentAmount.toLocaleString()}{" "}
                        {isArabic ? "ريال" : "SAR"}
                      </p>
                    )}
                    {modData.status === "needs_extra_payment" && (
                      <p className="text-xs text-white/60 mt-2">
                        {copy.costAccepted}:{" "}
                        {modData.costAccepted
                          ? isArabic
                            ? "نعم"
                            : "Yes"
                          : isArabic
                          ? "لا"
                          : "No"}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {modData.status === "pending" && isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAcceptModification(modData._id)}
                          className="rounded-full bg-green-500/20 px-4 py-2 text-green-300 hover:bg-green-500/30"
                          title={copy.accept}
                        >
                          <CheckCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                          {copy.accept}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRejectModification(modData._id)}
                          className="rounded-full bg-red-500/20 px-4 py-2 text-red-300 hover:bg-red-500/30"
                          title={copy.reject}
                        >
                          <XCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                          {copy.reject}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRequestExtraPayment(modData._id)}
                          className="rounded-full bg-orange-500/20 px-4 py-2 text-orange-300 hover:bg-orange-500/30"
                          title={copy.requestExtraPayment}
                        >
                          <DollarSign className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                          {copy.requestExtraPayment}
                        </Button>
                      </>
                    )}
                    {modData.status === "accepted" && isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRequestExtraPayment(modData._id)}
                        className="rounded-full bg-orange-500/20 px-4 py-2 text-orange-300 hover:bg-orange-500/30"
                        title={copy.requestExtraPayment}
                      >
                        <DollarSign className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {copy.requestExtraPayment}
                      </Button>
                    )}
                    {modData.status === "needs_extra_payment" &&
                      !modData.costAccepted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAcceptExtraPayment(modData._id)}
                          className="rounded-full bg-blue-500/20 px-4 py-2 text-blue-300 hover:bg-blue-500/30"
                          title={copy.clientAcceptedPayment}
                        >
                          <CheckCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                          {copy.clientAcceptedPayment}
                        </Button>
                      )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      onClick={async () => {
                        if (
                          confirm(
                            isArabic
                              ? "حذف هذا التعديل؟"
                              : "Delete this modification?"
                          )
                        ) {
                          await onDeleteModification(modData._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
