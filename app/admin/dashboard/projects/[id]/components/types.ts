export type PaymentStatus = "due" | "due_soon" | "paid" | "upcoming";
export type ModificationPriority = "low" | "medium" | "high" | "critical";
export type ModificationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "needs_extra_payment";

export interface PhaseForm {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  duration: number;
  phaseNumber: number;
  status: "upcoming" | "in_progress" | "completed";
  progress: number;
}

export const inputStyles =
  "rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400 focus:border-transparent focus:bg-white/[0.05] transition";
