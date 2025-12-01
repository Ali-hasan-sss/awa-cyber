"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { AdminProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface TeamTabProps {
  project: AdminProject;
  onAddEmployee: () => void;
  onRemoveEmployee: (employeeId: string) => Promise<void>;
  submitting: boolean;
}

export default function TeamTab({
  project,
  onAddEmployee,
  onRemoveEmployee,
  submitting,
}: TeamTabProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const { admin } = useAuth();
  const isAdmin = admin?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">
          {isArabic ? "طاقم العمل" : "Team"}
        </h3>
        {isAdmin && (
          <Button
            onClick={onAddEmployee}
            className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {isArabic ? "إضافة موظف" : "Add Employee"}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {project?.employees &&
        Array.isArray(project.employees) &&
        project.employees.length > 0 ? (
          project.employees.map((emp: any) => {
            const employee =
              typeof emp === "object" && emp !== null && "_id" in emp
                ? emp
                : null;
            if (!employee) return null;

            return (
              <div
                key={employee._id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      {employee.name}
                    </h4>
                    <p className="text-sm text-white/70 mb-1">
                      {employee.email}
                    </p>
                    {employee.companyName && (
                      <p className="text-xs text-white/60">
                        {isArabic ? "المسمى الوظيفي" : "Job Title"}:{" "}
                        {employee.companyName}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (
                          confirm(
                            isArabic
                              ? "إزالة هذا الموظف من المشروع؟"
                              : "Remove this employee from the project?"
                          )
                        ) {
                          await onRemoveEmployee(employee._id);
                        }
                      }}
                      disabled={submitting}
                      className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      title={isArabic ? "حذف" : "Delete"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-white/60 text-center py-8">
            {isArabic
              ? "لا يوجد موظفين في هذا المشروع"
              : "No employees assigned to this project"}
          </p>
        )}
      </div>
    </div>
  );
}
