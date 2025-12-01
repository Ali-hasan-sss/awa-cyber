"use client";

import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminProject } from "@/contexts/ProjectContext";
import { inputStyles } from "../types";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: AdminProject;
  users: any[];
  selectedEmployeeId: string;
  setSelectedEmployeeId: (id: string) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  project,
  users,
  selectedEmployeeId,
  setSelectedEmployeeId,
  onSubmit,
  submitting,
}: AddEmployeeModalProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const copy = {
    addEmployee: isArabic ? "إضافة موظف" : "Add Employee",
    selectEmployee: isArabic ? "اختر الموظف" : "Select Employee",
    cancel: isArabic ? "إلغاء" : "Cancel",
    save: isArabic ? "حفظ" : "Save",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-[#040812] via-[#050a18] to-[#01030a] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] space-y-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold">{copy.addEmployee}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/80">
            {copy.selectEmployee}
          </label>
          <select
            className={inputStyles}
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
          >
            <option value="" className="bg-slate-900 text-white">
              {isArabic ? "اختر موظف..." : "Select employee..."}
            </option>
            {users
              .filter((user: any) => user.role === "employee")
              .filter((user: any) => {
                if (!project?.employees) return true;
                const assignedIds = project.employees.map((e: any) =>
                  typeof e === "object" && e !== null && "_id" in e
                    ? e._id
                    : e
                );
                return !assignedIds.includes(user._id);
              })
              .map((user: any) => (
                <option
                  key={user._id}
                  value={user._id}
                  className="bg-slate-900 text-white"
                >
                  {user.name} {user.companyName ? `- ${user.companyName}` : ""}
                </option>
              ))}
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
            disabled={submitting || !selectedEmployeeId}
            className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
          >
            <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {copy.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

