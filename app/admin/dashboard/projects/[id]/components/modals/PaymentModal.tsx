"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentStatus } from "../types";
import { inputStyles } from "../types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    amount: number;
    dueDate: string;
    status: PaymentStatus;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      titleEn: string;
      titleAr: string;
      descriptionEn: string;
      descriptionAr: string;
      amount: number;
      dueDate: string;
      status: PaymentStatus;
    }>
  >;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  submitting,
}: PaymentModalProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const copy = {
    addPayment: isArabic ? "إضافة دفعة" : "Add Payment",
    amount: isArabic ? "المبلغ" : "Amount",
    dueDate: isArabic ? "تاريخ الاستحقاق" : "Due Date",
    status: isArabic ? "الحالة" : "Status",
    cancel: isArabic ? "إلغاء" : "Cancel",
    save: isArabic ? "حفظ" : "Save",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold">{copy.addPayment}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
            className={inputStyles}
            value={form.titleEn}
            onChange={(e) =>
              setForm({ ...form, titleEn: e.target.value })
            }
          />
          <Input
            placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
            className={inputStyles}
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          />
          <Textarea
            placeholder={isArabic ? "الوصف (EN)" : "Description (EN)"}
            className={inputStyles}
            value={form.descriptionEn}
            onChange={(e) =>
              setForm({ ...form, descriptionEn: e.target.value })
            }
          />
          <Textarea
            placeholder={isArabic ? "الوصف (AR)" : "Description (AR)"}
            className={inputStyles}
            value={form.descriptionAr}
            onChange={(e) =>
              setForm({ ...form, descriptionAr: e.target.value })
            }
          />
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.amount} <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              placeholder={copy.amount}
              className={inputStyles}
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.dueDate} <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              placeholder={copy.dueDate}
              className={inputStyles}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <select
            className={inputStyles}
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as PaymentStatus,
              })
            }
          >
            <option value="upcoming">
              {isArabic ? "قادمة" : "Upcoming"}
            </option>
            <option value="due_soon">
              {isArabic ? "مستحقة قريباً" : "Due Soon"}
            </option>
            <option value="due">{isArabic ? "مستحقة" : "Due"}</option>
            <option value="paid">{isArabic ? "مدفوعة" : "Paid"}</option>
          </select>
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

