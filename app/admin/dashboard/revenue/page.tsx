"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getAllPaymentsApi,
  deletePaymentApi,
  PaymentPayload,
} from "@/lib/actions/projectActions";
import {
  fetchExpenses,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
  ExpensePayload,
  ExpenseType,
  ExpenseStatus,
} from "@/lib/actions/expenseActions";
import {
  fetchIncomes,
  createIncomeApi,
  updateIncomeApi,
  deleteIncomeApi,
  IncomePayload,
  IncomeType,
  IncomeStatus,
} from "@/lib/actions/incomeActions";
import { useUsers } from "@/contexts/UserContext";

interface Payment {
  _id: string;
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  projectId: { _id: string; name: { en: string; ar: string }; logo?: string };
  userId: { _id: string; name: string; companyName: string };
  amount: number;
  dueDate: string;
  status: "due" | "due_soon" | "paid" | "upcoming";
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  _id: string;
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  amount: number;
  type: ExpenseType;
  status: ExpenseStatus;
  dueDate: string;
  paidDate?: string;
  recurring: boolean;
  recurringInterval?: "monthly" | "yearly";
  createdAt: string;
  updatedAt: string;
}

interface Income {
  _id: string;
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  userId: { _id: string; name: string; companyName: string };
  projectId?: { _id: string; name: { en: string; ar: string }; logo?: string };
  amount: number;
  type: IncomeType;
  status: IncomeStatus;
  dueDate: string;
  paidDate?: string;
  recurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RevenuePage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const { projects } = useProjects();
  const { users, fetchUsers } = useUsers();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    dueSoonCount: 0,
    totalPayments: 0,
    paidPayments: 0,
  });

  // Filters
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"month" | "year" | "custom">(
    "month"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState<ExpensePayload>({
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    amount: 0,
    type: "one_time",
    status: "pending",
    dueDate: new Date().toISOString().split("T")[0],
    recurring: false,
  });

  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeForm, setIncomeForm] = useState<IncomePayload>({
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    userId: "",
    projectId: undefined,
    amount: 0,
    type: "one_time",
    status: "pending",
    dueDate: new Date().toISOString().split("T")[0],
    recurring: false,
  });

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "expense" | "income" | "payment" | null
  >(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Initialize dates - default to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);
  }, []);

  // Update dates when dateRange changes
  useEffect(() => {
    const now = new Date();
    if (dateRange === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(lastDay.toISOString().split("T")[0]);
    } else if (dateRange === "year") {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(lastDay.toISOString().split("T")[0]);
    }
  }, [dateRange]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const paymentParams: any = {
        startDate,
        endDate,
        page: 1,
        limit: 1000,
      };
      if (selectedProject !== "all") {
        paymentParams.projectId = selectedProject;
      }

      const [paymentsRes, expensesRes, incomesRes] = await Promise.all([
        getAllPaymentsApi(paymentParams),
        fetchExpenses({
          startDate,
          endDate,
          page: 1,
          limit: 1000,
        }),
        fetchIncomes({
          startDate,
          endDate,
          page: 1,
          limit: 1000,
        }),
      ]);

      // Get all payments (not just paid ones) for the merged table
      const allPayments = paymentsRes?.data || [];
      // Keep all payments for the merged incoming payments table
      setPayments(allPayments);

      // Handle expenses response - check multiple possible response structures
      let expensesArray: Expense[] = [];
      if (Array.isArray(expensesRes)) {
        expensesArray = expensesRes;
      } else if (Array.isArray(expensesRes?.data)) {
        expensesArray = expensesRes.data;
      } else if (
        expensesRes?.data?.data &&
        Array.isArray(expensesRes.data.data)
      ) {
        expensesArray = expensesRes.data.data;
      }

      console.log("Expenses response:", expensesRes);
      console.log("Expenses array:", expensesArray);

      // Store original expenses (for editing/deleting)
      setExpenses(expensesArray);

      // Handle incomes response
      let incomesArray: Income[] = [];
      if (Array.isArray(incomesRes)) {
        incomesArray = incomesRes;
      } else if (Array.isArray(incomesRes?.data)) {
        incomesArray = incomesRes.data;
      } else if (
        incomesRes?.data?.data &&
        Array.isArray(incomesRes.data.data)
      ) {
        incomesArray = incomesRes.data.data;
      }

      console.log("Incomes response:", incomesRes);
      console.log("Incomes array:", incomesArray);

      setIncomes(incomesArray);

      // Calculate statistics from all payments
      if (paymentsRes?.statistics) {
        setStatistics(paymentsRes.statistics);
      } else {
        // Calculate statistics manually if not provided
        const paidPayments = allPayments.filter(
          (p: Payment) => p.status === "paid"
        );
        const pendingPayments = allPayments.filter(
          (p: Payment) => p.status === "due" || p.status === "due_soon"
        );
        const totalPaid = paidPayments.reduce(
          (sum: number, p: Payment) => sum + p.amount,
          0
        );
        const totalPending = pendingPayments.reduce(
          (sum: number, p: Payment) => sum + p.amount,
          0
        );
        setStatistics({
          totalRevenue: totalPaid,
          pendingAmount: totalPending,
          dueSoonCount: allPayments.filter(
            (p: Payment) => p.status === "due_soon"
          ).length,
          totalPayments: allPayments.length,
          paidPayments: paidPayments.length,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
      console.error("Failed to load revenue data:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedProject]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copy = useMemo(
    () => ({
      title: isArabic ? "الإيرادات والمصاريف" : "Revenue & Expenses",
      subtitle: isArabic
        ? "إدارة الإيرادات والمصاريف والأرباح"
        : "Manage revenue, expenses, and profits",
      totalRevenue: isArabic ? "إجمالي الإيرادات" : "Total Revenue",
      totalExpenses: isArabic ? "إجمالي المصاريف" : "Total Expenses",
      profit: isArabic ? "الأرباح" : "Profit",
      pendingPayments: isArabic ? "الدفعات المعلقة" : "Pending Payments",
      dueSoon: isArabic ? "مستحقة قريباً" : "Due Soon",
      filterByProject: isArabic ? "فلترة حسب المشروع" : "Filter by Project",
      allProjects: isArabic ? "جميع المشاريع" : "All Projects",
      dateRange: isArabic ? "الفترة الزمنية" : "Date Range",
      thisMonth: isArabic ? "هذا الشهر" : "This Month",
      thisYear: isArabic ? "هذا العام" : "This Year",
      custom: isArabic ? "مخصص" : "Custom",
      from: isArabic ? "من" : "From",
      to: isArabic ? "إلى" : "To",
      payments: isArabic ? "الدفعات الواردة" : "Incoming Payments",
      addIncome: isArabic ? "إضافة دفعة واردة" : "Add Income",
      editIncome: isArabic ? "تعديل دفعة واردة" : "Edit Income",
      deleteIncome: isArabic ? "حذف دفعة واردة" : "Delete Income",
      incomeTitle: isArabic ? "عنوان الدفعة" : "Payment Title",
      selectClient: isArabic ? "اختر العميل" : "Select Client",
      selectProject: isArabic
        ? "اختر المشروع (اختياري)"
        : "Select Project (Optional)",
      oneTimeIncome: isArabic ? "دفعة لمرة واحدة" : "One-time Payment",
      monthlyContract: isArabic ? "عقد شهري" : "Monthly Contract",
      noProject: isArabic ? "غير مرتبط بمشروع" : "Not linked to project",
      projectPayment: isArabic ? "دفعة مشروع" : "Project Payment",
      upcoming: isArabic ? "قادمة" : "Upcoming",
      deleteIncomeConfirm: isArabic
        ? "هل أنت متأكد من حذف هذه الدفعة الواردة؟"
        : "Are you sure you want to delete this income?",
      deletePaymentConfirm: isArabic
        ? "هل أنت متأكد من حذف هذه الدفعة من المشروع؟"
        : "Are you sure you want to delete this payment?",
      deletePayment: isArabic ? "حذف دفعة" : "Delete Payment",
      confirmDelete: isArabic ? "تأكيد الحذف" : "Confirm Delete",
      expenses: isArabic ? "المصاريف" : "Expenses",
      addExpense: isArabic ? "إضافة مصروف" : "Add Expense",
      editExpense: isArabic ? "تعديل مصروف" : "Edit Expense",
      deleteExpense: isArabic ? "حذف مصروف" : "Delete Expense",
      expenseTitle: isArabic ? "عنوان المصروف" : "Expense Title",
      amount: isArabic ? "المبلغ" : "Amount",
      type: isArabic ? "النوع" : "Type",
      status: isArabic ? "الحالة" : "Status",
      dueDate: isArabic ? "تاريخ الاستحقاق" : "Due Date",
      paidDate: isArabic ? "تاريخ الدفع" : "Paid Date",
      recurring: isArabic ? "متكرر" : "Recurring",
      description: isArabic ? "الوصف" : "Description",
      save: isArabic ? "حفظ" : "Save",
      cancel: isArabic ? "إلغاء" : "Cancel",
      project: isArabic ? "المشروع" : "Project",
      client: isArabic ? "العميل" : "Client",
      date: isArabic ? "التاريخ" : "Date",
      actions: isArabic ? "الإجراءات" : "Actions",
      subscriptionMonthly: isArabic ? "اشتراك شهري" : "Monthly Subscription",
      subscriptionYearly: isArabic ? "اشتراك سنوي" : "Yearly Subscription",
      utility: isArabic ? "فاتورة كهرباء/خدمات" : "Utility Bill",
      oneTime: isArabic ? "دفعة لمرة واحدة" : "One-time Payment",
      paid: isArabic ? "مدفوع" : "Paid",
      pending: isArabic ? "معلق" : "Pending",
      overdue: isArabic ? "متأخر" : "Overdue",
      monthly: isArabic ? "شهري" : "Monthly",
      yearly: isArabic ? "سنوي" : "Yearly",
      deleteConfirm: isArabic
        ? "هل أنت متأكد من حذف هذا المصروف؟"
        : "Are you sure you want to delete this expense?",
      loading: isArabic ? "جاري التحميل..." : "Loading...",
    }),
    [isArabic]
  );

  // Process recurring expenses to display in table
  const processedExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [];
    }

    const result: Expense[] = [];
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // Include end date

    expenses.forEach((expense) => {
      // Check if expense is recurring type (subscription_monthly, subscription_yearly, or utility)
      const isRecurringType =
        expense.type === "subscription_monthly" ||
        expense.type === "subscription_yearly" ||
        expense.type === "utility";

      if (isRecurringType && expense.recurring && expense.recurringInterval) {
        // For recurring expenses, show the original expense once
        // but it will be counted multiple times in calculations based on the date range
        result.push(expense);
      } else {
        // One-time expense - only show if within date range
        const expenseDate = new Date(expense.dueDate);
        if (expenseDate >= startDateObj && expenseDate <= endDateObj) {
          result.push(expense);
        }
      }
    });

    return result.sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  }, [expenses, startDate, endDate]);

  // Calculate total expenses with recurring expenses counted multiple times
  const calculateExpenseTotal = useCallback(
    (expensesList: Expense[]) => {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      let total = 0;

      expensesList.forEach((expense) => {
        const isRecurringType =
          expense.type === "subscription_monthly" ||
          expense.type === "subscription_yearly" ||
          expense.type === "utility";

        if (isRecurringType && expense.recurring && expense.recurringInterval) {
          // Calculate how many times this recurring expense occurs in the date range
          const baseDate = new Date(expense.dueDate);
          const baseDay = baseDate.getDate();

          let currentDate = new Date(startDateObj);
          currentDate.setDate(baseDay);

          // If the day doesn't exist in this month, use the last day of the month
          if (currentDate.getDate() !== baseDay) {
            currentDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            );
          }

          let count = 0;
          while (currentDate <= endDateObj) {
            if (currentDate >= startDateObj) {
              count++;
            }

            // Move to next interval
            if (expense.recurringInterval === "monthly") {
              currentDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                baseDay
              );
              if (currentDate.getDate() !== baseDay) {
                currentDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  0
                );
              }
            } else if (expense.recurringInterval === "yearly") {
              currentDate = new Date(
                currentDate.getFullYear() + 1,
                currentDate.getMonth(),
                baseDay
              );
            } else {
              break;
            }
          }

          total += expense.amount * count;
        } else {
          // One-time expense - count once
          total += expense.amount;
        }
      });

      return total;
    },
    [startDate, endDate]
  );

  // Calculate paid expenses with recurring expenses counted multiple times
  const calculatePaidExpenses = useCallback(
    (expensesList: Expense[]) => {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      let total = 0;

      expensesList.forEach((expense) => {
        // Only count paid expenses
        if (expense.status !== "paid") return;

        const isRecurringType =
          expense.type === "subscription_monthly" ||
          expense.type === "subscription_yearly" ||
          expense.type === "utility";

        if (isRecurringType && expense.recurring && expense.recurringInterval) {
          // Calculate how many times this recurring expense occurs in the date range
          const baseDate = new Date(expense.dueDate);
          const baseDay = baseDate.getDate();

          let currentDate = new Date(startDateObj);
          currentDate.setDate(baseDay);

          if (currentDate.getDate() !== baseDay) {
            currentDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            );
          }

          let count = 0;
          while (currentDate <= endDateObj) {
            if (currentDate >= startDateObj) {
              count++;
            }

            if (expense.recurringInterval === "monthly") {
              currentDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                baseDay
              );
              if (currentDate.getDate() !== baseDay) {
                currentDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  0
                );
              }
            } else if (expense.recurringInterval === "yearly") {
              currentDate = new Date(
                currentDate.getFullYear() + 1,
                currentDate.getMonth(),
                baseDay
              );
            } else {
              break;
            }
          }

          total += expense.amount * count;
        } else {
          // One-time expense - count once
          total += expense.amount;
        }
      });

      return total;
    },
    [startDate, endDate]
  );

  // Calculate total income with recurring incomes counted multiple times
  const calculateIncomeTotal = useCallback(
    (incomesList: Income[]) => {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      let total = 0;

      incomesList.forEach((income) => {
        if (income.recurring && income.type === "monthly_contract") {
          // Calculate how many times this recurring income occurs in the date range
          const baseDate = new Date(income.dueDate);
          const baseDay = baseDate.getDate();

          let currentDate = new Date(startDateObj);
          currentDate.setDate(baseDay);

          if (currentDate.getDate() !== baseDay) {
            currentDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            );
          }

          let count = 0;
          while (currentDate <= endDateObj) {
            if (currentDate >= startDateObj) {
              count++;
            }

            currentDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              baseDay
            );
            if (currentDate.getDate() !== baseDay) {
              currentDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
              );
            }
          }

          total += income.amount * count;
        } else {
          // One-time income - count once if within date range
          const incomeDate = new Date(income.dueDate);
          if (incomeDate >= startDateObj && incomeDate <= endDateObj) {
            total += income.amount;
          }
        }
      });

      return total;
    },
    [startDate, endDate]
  );

  // Calculate paid incomes with recurring incomes counted multiple times
  const calculatePaidIncomes = useCallback(
    (incomesList: Income[]) => {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      let total = 0;

      incomesList.forEach((income) => {
        // Only count paid incomes
        if (income.status !== "paid") return;

        if (income.recurring && income.type === "monthly_contract") {
          // Calculate how many times this recurring income occurs in the date range
          const baseDate = new Date(income.dueDate);
          const baseDay = baseDate.getDate();

          let currentDate = new Date(startDateObj);
          currentDate.setDate(baseDay);

          if (currentDate.getDate() !== baseDay) {
            currentDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            );
          }

          let count = 0;
          while (currentDate <= endDateObj) {
            if (currentDate >= startDateObj) {
              count++;
            }

            currentDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              baseDay
            );
            if (currentDate.getDate() !== baseDay) {
              currentDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
              );
            }
          }

          total += income.amount * count;
        } else {
          // One-time income - count once if within date range
          const incomeDate = new Date(income.dueDate);
          if (incomeDate >= startDateObj && incomeDate <= endDateObj) {
            total += income.amount;
          }
        }
      });

      return total;
    },
    [startDate, endDate]
  );

  const totalExpenses = useMemo(
    () => calculateExpenseTotal(expenses),
    [expenses, calculateExpenseTotal]
  );
  const paidExpenses = useMemo(
    () => calculatePaidExpenses(expenses),
    [expenses, calculatePaidExpenses]
  );

  const totalIncomes = useMemo(
    () => calculateIncomeTotal(incomes),
    [incomes, calculateIncomeTotal]
  );
  const paidIncomes = useMemo(
    () => calculatePaidIncomes(incomes),
    [incomes, calculatePaidIncomes]
  );

  // Calculate total revenue from paid project payments and paid incomes
  const paidProjectPayments = useMemo(() => {
    return payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // Total revenue includes both paid project payments and paid incomes
  const totalRevenue = paidProjectPayments + paidIncomes;
  const profit = totalRevenue - paidExpenses;

  const handleSaveExpense = async () => {
    if (!expenseForm.title.en || !expenseForm.title.ar || !expenseForm.amount) {
      alert(
        isArabic
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingExpense) {
        await updateExpenseApi(editingExpense._id, expenseForm);
      } else {
        await createExpenseApi(expenseForm);
      }
      setExpenseModalOpen(false);
      setEditingExpense(null);
      setExpenseForm({
        title: { en: "", ar: "" },
        description: { en: "", ar: "" },
        amount: 0,
        type: "one_time",
        status: "pending",
        dueDate: new Date().toISOString().split("T")[0],
        recurring: false,
      });
      // Reload all data to ensure both tables are updated
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to save expense");
      console.error("Error saving expense:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setDeleteType("expense");
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteExpense = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setError(null);
    try {
      // Extract original expense ID (remove date suffix for recurring expenses)
      const originalId = itemToDelete.split("_")[0];
      await deleteExpenseApi(originalId);
      // Reload all data to ensure both tables are updated
      await loadData();
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    } catch (err: any) {
      setError(err?.message || "Failed to delete expense");
      console.error("Error deleting expense:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    // Extract original expense ID (remove date suffix for recurring expenses)
    const originalId = expense._id.split("_")[0];
    const originalExpense =
      expenses.find((exp) => exp._id === originalId) || expense;

    setEditingExpense(originalExpense);
    setExpenseForm({
      title: originalExpense.title,
      description: originalExpense.description || { en: "", ar: "" },
      amount: originalExpense.amount,
      type: originalExpense.type,
      status: originalExpense.status,
      dueDate: originalExpense.dueDate.split("T")[0],
      paidDate: originalExpense.paidDate?.split("T")[0],
      recurring: originalExpense.recurring,
      recurringInterval: originalExpense.recurringInterval,
    });
    setExpenseModalOpen(true);
  };

  const handleSaveIncome = async () => {
    if (
      !incomeForm.title.en ||
      !incomeForm.title.ar ||
      !incomeForm.amount ||
      !incomeForm.userId
    ) {
      alert(
        isArabic
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingIncome) {
        await updateIncomeApi(editingIncome._id, incomeForm);
      } else {
        await createIncomeApi(incomeForm);
      }
      setIncomeModalOpen(false);
      setEditingIncome(null);
      setIncomeForm({
        title: { en: "", ar: "" },
        description: { en: "", ar: "" },
        userId: "",
        projectId: undefined,
        amount: 0,
        type: "one_time",
        status: "pending",
        dueDate: new Date().toISOString().split("T")[0],
        recurring: false,
      });
      // Reload all data to ensure both tables are updated
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to save income");
      console.error("Error saving income:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncome = (id: string) => {
    setDeleteType("income");
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteIncome = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setError(null);
    try {
      await deleteIncomeApi(itemToDelete);
      // Reload all data to ensure both tables are updated
      await loadData();
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    } catch (err: any) {
      setError(err?.message || "Failed to delete income");
      console.error("Error deleting income:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = (id: string) => {
    setDeleteType("payment");
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setError(null);
    try {
      await deletePaymentApi(itemToDelete);
      // Reload all data to ensure both tables are updated
      await loadData();
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    } catch (err: any) {
      setError(err?.message || "Failed to delete payment");
      console.error("Error deleting payment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeForm({
      title: income.title,
      description: income.description || { en: "", ar: "" },
      userId:
        typeof income.userId === "object" && income.userId !== null
          ? income.userId._id
          : income.userId,
      projectId:
        income.projectId &&
        typeof income.projectId === "object" &&
        income.projectId !== null
          ? income.projectId._id
          : income.projectId || undefined,
      amount: income.amount,
      type: income.type,
      status: income.status,
      dueDate: income.dueDate.split("T")[0],
      paidDate: income.paidDate?.split("T")[0],
      recurring: income.recurring,
    });
    setIncomeModalOpen(true);
  };

  // Process recurring incomes to display in table
  const processedIncomes = useMemo(() => {
    if (!incomes || incomes.length === 0) {
      return [];
    }

    const result: Income[] = [];
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    incomes.forEach((income) => {
      if (income.recurring && income.type === "monthly_contract") {
        // For recurring incomes, show the original income once
        result.push(income);
      } else {
        // One-time income - only show if within date range
        const incomeDate = new Date(income.dueDate);
        if (incomeDate >= startDateObj && incomeDate <= endDateObj) {
          result.push(income);
        }
      }
    });

    return result.sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  }, [incomes, startDate, endDate]);

  // Combine project payments and incomes for display
  const allIncomingPayments = useMemo(() => {
    const combined: Array<{
      _id: string;
      title: { en: string; ar: string };
      description?: { en?: string; ar?: string };
      userId: { _id: string; name: string; companyName?: string } | string;
      projectId?:
        | { _id: string; name: { en: string; ar: string }; logo?: string }
        | string;
      amount: number;
      type: "project_payment" | "one_time" | "monthly_contract";
      status: "due" | "due_soon" | "paid" | "upcoming" | "pending" | "overdue";
      dueDate: string;
      paidDate?: string;
      recurring: boolean;
      source: "project" | "income";
    }> = [];

    // Filter payments by date range
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    // Add project payments (filtered by date range)
    payments.forEach((payment) => {
      const paymentDate = new Date(payment.dueDate);
      if (paymentDate >= startDateObj && paymentDate <= endDateObj) {
        combined.push({
          _id: payment._id,
          title: payment.title,
          description: payment.description,
          userId: payment.userId,
          projectId: payment.projectId,
          amount: payment.amount,
          type: "project_payment",
          status: payment.status,
          dueDate: payment.dueDate,
          recurring: false,
          source: "project",
        });
      }
    });

    // Add incomes
    processedIncomes.forEach((income) => {
      combined.push({
        _id: income._id,
        title: income.title,
        description: income.description,
        userId: income.userId,
        projectId: income.projectId,
        amount: income.amount,
        type: income.type,
        status: income.status,
        dueDate: income.dueDate,
        paidDate: income.paidDate,
        recurring: income.recurring,
        source: "income",
      });
    });

    return combined.sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  }, [payments, processedIncomes, startDate, endDate]);

  return (
    <div className="space-y-8 text-slate-100">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white drop-shadow">
          <DollarSign className="h-9 w-9 text-primary" />
          {copy.title}
        </h1>
        <p className="text-slate-300">{copy.subtitle}</p>
      </header>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">{copy.totalRevenue}</p>
              <p className="mt-2 text-2xl font-bold text-green-400">
                {totalRevenue.toLocaleString()} {isArabic ? "ر.ع" : "OMR"}
              </p>
            </div>
            <div className="rounded-full bg-green-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">{copy.totalExpenses}</p>
              <p className="mt-2 text-2xl font-bold text-red-400">
                {paidExpenses.toLocaleString()} {isArabic ? "ر.ع" : "OMR"}
              </p>
            </div>
            <div className="rounded-full bg-red-500/20 p-3">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">{copy.profit}</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  profit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {profit.toLocaleString()} {isArabic ? "ر.ع" : "OMR"}
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${
                profit >= 0 ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              {profit >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">{copy.pendingPayments}</p>
              <p className="mt-2 text-2xl font-bold text-yellow-400">
                {statistics.pendingAmount.toLocaleString()}{" "}
                {isArabic ? "ر.ع" : "OMR"}
              </p>
              <p className="mt-1 text-xs text-white/60">
                {statistics.dueSoonCount} {copy.dueSoon}
              </p>
            </div>
            <div className="rounded-full bg-yellow-500/20 p-3">
              <Calendar className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.filterByProject}
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <option value="all">{copy.allProjects}</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {isArabic ? project.name.ar : project.name.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">
              {copy.dateRange}
            </label>
            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value as "month" | "year" | "custom")
              }
              className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <option value="month">{copy.thisMonth}</option>
              <option value="year">{copy.thisYear}</option>
              <option value="custom">{copy.custom}</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <>
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {copy.from}
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {copy.to}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{copy.expenses}</h2>
          <Button
            onClick={() => {
              setEditingExpense(null);
              setExpenseForm({
                title: { en: "", ar: "" },
                description: { en: "", ar: "" },
                amount: 0,
                type: "one_time",
                status: "pending",
                dueDate: new Date().toISOString().split("T")[0],
                recurring: false,
              });
              setExpenseModalOpen(true);
            }}
            className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {copy.addExpense}
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-white/60">{copy.loading}</p>
        ) : expenses.length === 0 ? (
          <p className="text-center text-white/60">
            {isArabic ? "لا توجد مصاريف" : "No expenses"}
          </p>
        ) : processedExpenses.length === 0 ? (
          <p className="text-center text-white/60">
            {isArabic
              ? "لا توجد مصاريف في الفترة المحددة"
              : "No expenses in the selected period"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.35em] text-white/50 sticky top-0 bg-white/[0.03] z-10">
                <tr>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.expenseTitle}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.amount}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.type}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.status}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.dueDate}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedExpenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="text-white/90 hover:bg-white/5"
                  >
                    <td className="py-4">
                      {isArabic ? expense.title.ar : expense.title.en}
                    </td>
                    <td className="py-4">
                      {expense.amount.toLocaleString()}{" "}
                      {isArabic ? "ر.ع" : "OMR"}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span>
                          {expense.type === "subscription_monthly"
                            ? copy.subscriptionMonthly
                            : expense.type === "subscription_yearly"
                            ? copy.subscriptionYearly
                            : expense.type === "utility"
                            ? copy.utility
                            : copy.oneTime}
                        </span>
                        {expense.recurring && (
                          <span className="text-xs text-white/50">
                            (
                            {expense.recurringInterval === "monthly"
                              ? copy.monthly
                              : copy.yearly}
                            )
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          expense.status === "paid"
                            ? "bg-green-500/20 text-green-300"
                            : expense.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {expense.status === "paid"
                          ? copy.paid
                          : expense.status === "pending"
                          ? copy.pending
                          : copy.overdue}
                      </span>
                    </td>
                    <td className="py-4">
                      {new Date(expense.dueDate).toLocaleDateString(
                        isArabic ? "ar-EG-u-ca-gregory" : "en-US"
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditExpense(expense)}
                          className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incoming Payments Section */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{copy.payments}</h2>
          <Button
            onClick={() => {
              setEditingIncome(null);
              setIncomeForm({
                title: { en: "", ar: "" },
                description: { en: "", ar: "" },
                userId: "",
                projectId: undefined,
                amount: 0,
                type: "one_time",
                status: "pending",
                dueDate: new Date().toISOString().split("T")[0],
                recurring: false,
              });
              setIncomeModalOpen(true);
            }}
            className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {copy.addIncome}
          </Button>
        </div>
        {loading ? (
          <p className="text-center text-white/60">{copy.loading}</p>
        ) : allIncomingPayments.length === 0 ? (
          <p className="text-center text-white/60">
            {isArabic ? "لا توجد دفعات واردة" : "No incoming payments"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.35em] text-white/50 sticky top-0 bg-white/[0.03] z-10">
                <tr>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.incomeTitle}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.client}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.project}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.amount}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.type}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.status}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.date}
                  </th>
                  <th className="py-3 ltr:text-left rtl:text-right">
                    {copy.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allIncomingPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="text-white/90 hover:bg-white/5"
                  >
                    <td className="py-4">
                      {isArabic ? payment.title.ar : payment.title.en}
                    </td>
                    <td className="py-4">
                      {typeof payment.userId === "object" &&
                      payment.userId !== null
                        ? payment.userId.name
                        : "-"}
                    </td>
                    <td className="py-4">
                      {payment.projectId &&
                      typeof payment.projectId === "object" &&
                      payment.projectId !== null
                        ? isArabic
                          ? payment.projectId.name.ar
                          : payment.projectId.name.en
                        : copy.noProject}
                    </td>
                    <td className="py-4">
                      {payment.amount.toLocaleString()}{" "}
                      {isArabic ? "ر.ع" : "OMR"}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span>
                          {payment.type === "project_payment"
                            ? isArabic
                              ? "دفعة مشروع"
                              : "Project Payment"
                            : payment.type === "monthly_contract"
                            ? copy.monthlyContract
                            : copy.oneTimeIncome}
                        </span>
                        {payment.recurring && (
                          <span className="text-xs text-white/50">
                            ({copy.monthly})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          payment.status === "paid"
                            ? "bg-green-500/20 text-green-300"
                            : payment.status === "pending" ||
                              payment.status === "upcoming"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : payment.status === "due_soon"
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {payment.status === "paid"
                          ? copy.paid
                          : payment.status === "pending"
                          ? copy.pending
                          : payment.status === "upcoming"
                          ? copy.upcoming || "Upcoming"
                          : payment.status === "due_soon"
                          ? copy.dueSoon
                          : payment.status === "due"
                          ? copy.overdue
                          : copy.overdue}
                      </span>
                    </td>
                    <td className="py-4">
                      {new Date(payment.dueDate).toLocaleDateString(
                        isArabic ? "ar-EG-u-ca-gregory" : "en-US"
                      )}
                    </td>
                    <td className="py-4">
                      {payment.source === "income" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const income = processedIncomes.find(
                                (i) => i._id === payment._id
                              );
                              if (income) handleEditIncome(income);
                            }}
                            className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteIncome(payment._id)}
                            className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePayment(payment._id)}
                            className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                            title={copy.deletePayment}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#060e1f] p-6 text-slate-100">
            <h3 className="mb-6 text-xl font-bold text-white">
              {editingExpense ? copy.editExpense : copy.addExpense}
            </h3>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.expenseTitle} (EN)
                  </label>
                  <Input
                    value={expenseForm.title.en}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        title: { ...expenseForm.title, en: e.target.value },
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.expenseTitle} (AR)
                  </label>
                  <Input
                    value={expenseForm.title.ar}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        title: { ...expenseForm.title, ar: e.target.value },
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.amount}
                  </label>
                  <Input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: Number(e.target.value),
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.type}
                  </label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        type: e.target.value as ExpenseType,
                        recurring:
                          e.target.value === "subscription_monthly" ||
                          e.target.value === "subscription_yearly",
                        recurringInterval:
                          e.target.value === "subscription_monthly"
                            ? "monthly"
                            : e.target.value === "subscription_yearly"
                            ? "yearly"
                            : undefined,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  >
                    <option value="one_time">{copy.oneTime}</option>
                    <option value="subscription_monthly">
                      {copy.subscriptionMonthly}
                    </option>
                    <option value="subscription_yearly">
                      {copy.subscriptionYearly}
                    </option>
                    <option value="utility">{copy.utility}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.status}
                  </label>
                  <select
                    value={expenseForm.status}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        status: e.target.value as ExpenseStatus,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  >
                    <option value="pending">{copy.pending}</option>
                    <option value="paid">{copy.paid}</option>
                    <option value="overdue">{copy.overdue}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.dueDate}
                  </label>
                  <Input
                    type="date"
                    value={expenseForm.dueDate}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        dueDate: e.target.value,
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
              </div>

              {expenseForm.status === "paid" && (
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.paidDate}
                  </label>
                  <Input
                    type="date"
                    value={expenseForm.paidDate || ""}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        paidDate: e.target.value,
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.description} (EN)
                  </label>
                  <textarea
                    value={expenseForm.description?.en || ""}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        description: {
                          ...expenseForm.description,
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.description} (AR)
                  </label>
                  <textarea
                    value={expenseForm.description?.ar || ""}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        description: {
                          ...expenseForm.description,
                          ar: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setExpenseModalOpen(false);
                  setEditingExpense(null);
                }}
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
              >
                {copy.cancel}
              </Button>
              <Button
                onClick={handleSaveExpense}
                disabled={loading}
                className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
              >
                {copy.save}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {incomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#060e1f] p-6 text-slate-100">
            <h3 className="mb-6 text-xl font-bold text-white">
              {editingIncome ? copy.editIncome : copy.addIncome}
            </h3>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.incomeTitle} (EN)
                  </label>
                  <Input
                    value={incomeForm.title.en}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        title: { ...incomeForm.title, en: e.target.value },
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.incomeTitle} (AR)
                  </label>
                  <Input
                    value={incomeForm.title.ar}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        title: { ...incomeForm.title, ar: e.target.value },
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.selectClient} *
                  </label>
                  <select
                    value={incomeForm.userId}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        userId: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  >
                    <option value="">
                      {isArabic ? "اختر العميل" : "Select Client"}
                    </option>
                    {users
                      .filter((u) => u.role === "client")
                      .map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}{" "}
                          {user.companyName ? `(${user.companyName})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.selectProject}
                  </label>
                  <select
                    value={incomeForm.projectId || ""}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        projectId: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  >
                    <option value="">{copy.noProject}</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {isArabic ? project.name.ar : project.name.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.amount}
                  </label>
                  <Input
                    type="number"
                    value={incomeForm.amount}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        amount: Number(e.target.value),
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.type}
                  </label>
                  <select
                    value={incomeForm.type}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        type: e.target.value as IncomeType,
                        recurring: e.target.value === "monthly_contract",
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  >
                    <option value="one_time">{copy.oneTimeIncome}</option>
                    <option value="monthly_contract">
                      {copy.monthlyContract}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.status}
                  </label>
                  <select
                    value={incomeForm.status}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        status: e.target.value as IncomeStatus,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  >
                    <option value="pending">{copy.pending}</option>
                    <option value="paid">{copy.paid}</option>
                    <option value="overdue">{copy.overdue}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.dueDate}
                  </label>
                  <Input
                    type="date"
                    value={incomeForm.dueDate}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        dueDate: e.target.value,
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
              </div>

              {incomeForm.status === "paid" && (
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.paidDate}
                  </label>
                  <Input
                    type="date"
                    value={incomeForm.paidDate || ""}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        paidDate: e.target.value,
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.description} (EN)
                  </label>
                  <textarea
                    value={incomeForm.description?.en || ""}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        description: {
                          ...incomeForm.description,
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    {copy.description} (AR)
                  </label>
                  <textarea
                    value={incomeForm.description?.ar || ""}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        description: {
                          ...incomeForm.description,
                          ar: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIncomeModalOpen(false);
                  setEditingIncome(null);
                }}
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
              >
                {copy.cancel}
              </Button>
              <Button
                onClick={handleSaveIncome}
                disabled={loading}
                className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
              >
                {copy.save}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-3xl border border-white/10 bg-[#060e1f] p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-6">
              <div className="rounded-full bg-red-500/20 p-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {copy.confirmDelete}
                </h3>
                <p className="text-white/70 text-sm">
                  {deleteType === "expense"
                    ? copy.deleteConfirm
                    : deleteType === "income"
                    ? copy.deleteIncomeConfirm
                    : copy.deletePaymentConfirm}
                </p>
              </div>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                  setDeleteType(null);
                }}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                  setDeleteType(null);
                }}
                className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
              >
                {copy.cancel}
              </Button>
              <Button
                onClick={() => {
                  if (deleteType === "expense") {
                    confirmDeleteExpense();
                  } else if (deleteType === "income") {
                    confirmDeleteIncome();
                  } else if (deleteType === "payment") {
                    confirmDeletePayment();
                  }
                }}
                disabled={loading}
                className="rounded-full bg-red-500 px-6 text-white shadow-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading
                  ? copy.loading
                  : copy.deleteExpense ||
                    copy.deleteIncome ||
                    copy.deletePayment}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
