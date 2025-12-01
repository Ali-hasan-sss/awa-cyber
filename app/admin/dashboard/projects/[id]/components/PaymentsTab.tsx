"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { AdminPayment } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaymentsTabProps {
  payments: AdminPayment[];
  onAddPayment: () => void;
  onDeletePayment: (paymentId: string) => Promise<void>;
}

export default function PaymentsTab({
  payments,
  onAddPayment,
  onDeletePayment,
}: PaymentsTabProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const copy = {
    addPayment: isArabic ? "إضافة دفعة" : "Add Payment",
    amount: isArabic ? "المبلغ" : "Amount",
    dueDate: isArabic ? "تاريخ الاستحقاق" : "Due Date",
    status: isArabic ? "الحالة" : "Status",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={onAddPayment}
          className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {copy.addPayment}
        </Button>
      </div>
      <div className="space-y-2">
        {payments.length === 0 ? (
          <p className="text-white/60 text-center py-8">
            {isArabic ? "لا توجد دفعات" : "No payments"}
          </p>
        ) : (
          payments.map((payment) => {
            const paymentData = typeof payment === "object" ? payment : null;
            if (!paymentData) return null;

            return (
              <div
                key={paymentData._id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">
                      {paymentData.title[isArabic ? "ar" : "en"]}
                    </h4>
                    {paymentData.description && (
                      <p className="text-sm text-white/70 mt-1">
                        {paymentData.description[isArabic ? "ar" : "en"]}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-white/60">
                      <span>
                        {copy.amount}: {paymentData.amount.toLocaleString()}{" "}
                        {isArabic ? "ريال" : "SAR"}
                      </span>
                      <span>
                        {copy.dueDate}:{" "}
                        {new Date(paymentData.dueDate).toLocaleDateString(
                          isArabic ? "ar-EG-u-ca-gregory" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span
                        className={`${
                          paymentData.status === "paid"
                            ? "text-green-400"
                            : paymentData.status === "due"
                            ? "text-red-400"
                            : paymentData.status === "due_soon"
                            ? "text-yellow-400"
                            : "text-blue-400"
                        }`}
                      >
                        {copy.status}:{" "}
                        {paymentData.status === "paid"
                          ? isArabic
                            ? "مدفوعة"
                            : "Paid"
                          : paymentData.status === "due"
                          ? isArabic
                            ? "مستحقة"
                            : "Due"
                          : paymentData.status === "due_soon"
                          ? isArabic
                            ? "مستحقة قريباً"
                            : "Due Soon"
                          : isArabic
                          ? "قادمة"
                          : "Upcoming"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    onClick={async () => {
                      if (
                        confirm(
                          isArabic ? "حذف هذه الدفعة؟" : "Delete this payment?"
                        )
                      ) {
                        await onDeletePayment(paymentData._id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
