"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { inputStyles } from "../types";

interface ExtraPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  setAmount: (amount: number) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

export default function ExtraPaymentModal({
  isOpen,
  onClose,
  amount,
  setAmount,
  onSubmit,
  submitting,
}: ExtraPaymentModalProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const copy = {
    requestExtraPayment: isArabic
      ? "يحتاج دفعة إضافية"
      : "Request Extra Payment",
    extraPaymentAmount: isArabic
      ? "مبلغ الدفعة الإضافية"
      : "Extra Payment Amount",
    cancel: isArabic ? "إلغاء" : "Cancel",
    save: isArabic ? "حفظ" : "Save",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold">{copy.requestExtraPayment}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.extraPaymentAmount} <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              min="0"
              placeholder={copy.extraPaymentAmount}
              className={inputStyles}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
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
            disabled={submitting || amount <= 0}
            className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
          >
            {copy.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
