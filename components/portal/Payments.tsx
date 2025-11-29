"use client";

import { useEffect, useState } from "react";
import {
  Hourglass,
  CheckCircle,
  Wallet,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  Download,
  History,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects, AdminPayment } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";

interface PaymentsProps {
  projectId: string;
}

const getStatusBadge = (status: string, isArabic: boolean) => {
  const statusMap: Record<
    string,
    { text: string; className: string; icon: any }
  > = {
    paid: {
      text: isArabic ? "مدفوع" : "Paid",
      className: "text-green-600 bg-green-50",
      icon: CheckCircle,
    },
    due_soon: {
      text: isArabic ? "مستحق قريباً" : "Due Soon",
      className: "text-orange-600 bg-orange-50",
      icon: AlertCircle,
    },
    upcoming: {
      text: isArabic ? "قادم" : "Upcoming",
      className: "text-gray-600 bg-gray-50",
      icon: Calendar,
    },
    due: {
      text: isArabic ? "مستحق" : "Due",
      className: "text-red-600 bg-red-50",
      icon: AlertCircle,
    },
  };
  return statusMap[status] || statusMap.upcoming;
};

const formatDate = (date: string, isArabic: boolean) => {
  return new Date(date).toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount: number, isArabic: boolean) => {
  return `${amount.toLocaleString()} ${isArabic ? "ر.ع" : "OMR"}`;
};

export default function Payments({ projectId }: PaymentsProps) {
  const { locale, messages } = useLanguage();
  const isArabic = locale === "ar";
  const { getProject } = useProjects();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);

  const t = messages.portalPayments || {};

  useEffect(() => {
    loadPayments();
  }, [projectId]);

  const loadPayments = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const loadedProject = await getProject(projectId);
      if (loadedProject) {
        setProject(loadedProject);
        const projectPayments = loadedProject.payments || [];
        // Check if payments is an array of objects (AdminPayment) or strings (IDs)
        if (Array.isArray(projectPayments) && projectPayments.length > 0) {
          const isPaymentObjects =
            typeof projectPayments[0] === "object" &&
            projectPayments[0] !== null &&
            "_id" in projectPayments[0];
          setPayments(
            isPaymentObjects ? (projectPayments as AdminPayment[]) : []
          );
        } else {
          setPayments([]);
        }
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary values
  const totalCost = project?.totalCost || 0;
  const paidAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalCost - paidAmount;

  return (
    <section id="payments" className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-12 text-center ${isArabic ? "rtl" : "ltr"}`}>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {t.title || (isArabic ? "جدول الدفعات" : "Payment Schedule")}
          </h2>
          <p className="text-lg text-gray-600">
            {t.subtitle ||
              (isArabic
                ? "تابع حالة دفعاتك ومدفوعاتك"
                : "Track your payment schedule and payments")}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Remaining Amount Card */}
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <Hourglass className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              {t.remainingAmount ||
                (isArabic ? "المبلغ المتبقي" : "Amount Remaining")}
            </h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(remainingAmount, isArabic)}
            </p>
          </div>

          {/* Paid Amount Card */}
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              {t.paidAmount || (isArabic ? "المبلغ المدفوع" : "Amount Paid")}
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(paidAmount, isArabic)}
            </p>
          </div>

          {/* Total Cost Card */}
          <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <Wallet className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              {t.totalCost || (isArabic ? "التكلفة الإجمالية" : "Total Cost")}
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalCost, isArabic)}
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="mb-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-md">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  #
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  {t.paymentName || (isArabic ? "اسم الدفعة" : "Payment Name")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  {t.amount || (isArabic ? "المبلغ" : "Amount")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  {t.dueDate || (isArabic ? "تاريخ الاستحقاق" : "Due Date")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  {t.status || (isArabic ? "الحالة" : "Status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {isArabic ? "جاري التحميل..." : "Loading..."}
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {t.noPayments ||
                      (isArabic ? "لا توجد دفعات" : "No payments found")}
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => {
                  const statusBadge = getStatusBadge(payment.status, isArabic);
                  const StatusIcon = statusBadge.icon;
                  const isDueSoon = payment.status === "due_soon";
                  const paymentTitle = isArabic
                    ? payment.title.ar
                    : payment.title.en;
                  const invoiceNumber = `00${index + 1}-INV`;

                  return (
                    <tr
                      key={payment._id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                        isDueSoon ? "bg-yellow-50" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {paymentTitle}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {t.invoiceNumber ||
                              (isArabic ? "رقم الفاتورة" : "Invoice No")}
                            : {invoiceNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount, isArabic)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(payment.dueDate, isArabic)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {statusBadge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div
          className={`mb-8 flex flex-wrap gap-4 ${
            isArabic ? "justify-start" : "justify-end"
          }`}
        >
          <Button
            variant="outline"
            className="rounded-xl border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {t.downloadInvoices ||
              (isArabic ? "تحميل الفواتير" : "Download Invoices")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <History className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {t.paymentHistory ||
              (isArabic ? "سجل المدفوعات" : "Payment History")}
          </Button>
        </div>

        {/* Important Note */}
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t.importantNote ||
                (isArabic ? "ملاحظة هامة:" : "Important Note:")}
            </h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <span className="text-sm text-gray-700">
                {t.note1 ||
                  (isArabic
                    ? "يمكنك الدفع عبر التحويل البنكي"
                    : "You can pay via bank transfer")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <span className="text-sm text-gray-700">
                {t.note2 ||
                  (isArabic
                    ? "سيتم إرسال الفاتورة الضريبية بعد كل دفعة"
                    : "The tax invoice will be sent after each payment")}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
