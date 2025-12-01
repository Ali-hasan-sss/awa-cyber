"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Save, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhaseForm, inputStyles } from "./types";
import { AdminProject } from "@/contexts/ProjectContext";

interface TimelineTabProps {
  project: AdminProject;
  phases: PhaseForm[];
  setPhases: React.Dispatch<React.SetStateAction<PhaseForm[]>>;
  newPhase: PhaseForm | null;
  setNewPhase: React.Dispatch<React.SetStateAction<PhaseForm | null>>;
  editingPhaseIndex: number | null;
  setEditingPhaseIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onAddPhase: () => void;
  onSavePhase: (phase: PhaseForm) => Promise<void>;
  onUpdatePhase: (index: number) => Promise<void>;
  onDeletePhase: (index: number) => Promise<void>;
  onCancelEdit: () => void;
  submitting: boolean;
  loadProject: () => Promise<void>;
}

export default function TimelineTab({
  project,
  phases,
  setPhases,
  newPhase,
  setNewPhase,
  editingPhaseIndex,
  setEditingPhaseIndex,
  onAddPhase,
  onSavePhase,
  onUpdatePhase,
  onDeletePhase,
  onCancelEdit,
  submitting,
  loadProject,
}: TimelineTabProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const copy = {
    addPhase: isArabic ? "إضافة مرحلة" : "Add Phase",
    phaseTitle: isArabic ? "عنوان المرحلة" : "Phase Title",
    phaseDescription: isArabic ? "وصف المرحلة" : "Phase Description",
    duration: isArabic ? "المدة (أيام)" : "Duration (days)",
    phaseStatus: isArabic ? "حالة المرحلة" : "Phase Status",
    phaseProgress: isArabic ? "التقدم" : "Progress",
    phaseNumber: isArabic ? "رقم المرحلة" : "Phase Number",
    upcoming: isArabic ? "قادمة" : "Upcoming",
    inProgress: isArabic ? "قيد التنفيذ" : "In Progress",
    completed: isArabic ? "منجزة" : "Completed",
    cancel: isArabic ? "إلغاء" : "Cancel",
    save: isArabic ? "حفظ" : "Save",
    edit: isArabic ? "تعديل" : "Edit",
    delete: isArabic ? "حذف" : "Delete",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={onAddPhase}
          className="rounded-full bg-primary px-6 py-3 text-black shadow-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {copy.addPhase}
        </Button>
      </div>

      {/* New Phase Form */}
      {newPhase && (
        <div className="rounded-2xl border border-primary/30 bg-white/[0.03] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-primary">
              {isArabic ? "مرحلة جديدة" : "New Phase"}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setNewPhase(null)}
              className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
              className={inputStyles}
              value={newPhase.titleEn}
              onChange={(e) =>
                setNewPhase({ ...newPhase, titleEn: e.target.value })
              }
            />
            <Input
              placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
              className={inputStyles}
              value={newPhase.titleAr}
              onChange={(e) =>
                setNewPhase({ ...newPhase, titleAr: e.target.value })
              }
            />
            <Textarea
              placeholder={isArabic ? "الوصف (EN)" : "Description (EN)"}
              className={inputStyles}
              value={newPhase.descriptionEn}
              onChange={(e) =>
                setNewPhase({ ...newPhase, descriptionEn: e.target.value })
              }
            />
            <Textarea
              placeholder={isArabic ? "الوصف (AR)" : "Description (AR)"}
              className={inputStyles}
              value={newPhase.descriptionAr}
              onChange={(e) =>
                setNewPhase({ ...newPhase, descriptionAr: e.target.value })
              }
            />
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.duration} <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder={isArabic ? "المدة بالأيام" : "Duration in days"}
                className={inputStyles}
                value={newPhase.duration}
                onChange={(e) =>
                  setNewPhase({
                    ...newPhase,
                    duration: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                {copy.phaseNumber} <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => {
                  const usedNumbers = phases.map((p) => p.phaseNumber);
                  const isUsed = usedNumbers.includes(num);
                  const isSelected = newPhase.phaseNumber === num;

                  if (isUsed) return null;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setNewPhase({
                          ...newPhase,
                          phaseNumber: num,
                        });
                      }}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "bg-primary text-black border-primary font-bold"
                          : "bg-white/[0.02] text-white/70 border-white/20 hover:border-white/40 hover:bg-white/[0.05]"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
            <select
              className={inputStyles}
              value={newPhase.status}
              onChange={(e) =>
                setNewPhase({
                  ...newPhase,
                  status: e.target.value as
                    | "upcoming"
                    | "in_progress"
                    | "completed",
                })
              }
            >
              <option value="upcoming">{copy.upcoming}</option>
              <option value="in_progress">{copy.inProgress}</option>
              <option value="completed">{copy.completed}</option>
            </select>
            {newPhase.status === "in_progress" && (
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs text-white/60">
                  {copy.phaseProgress} ({newPhase.progress}%)
                </label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full"
                  value={newPhase.progress}
                  onChange={(e) =>
                    setNewPhase({
                      ...newPhase,
                      progress: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setNewPhase(null)}
              className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
            >
              {copy.cancel}
            </Button>
            <Button
              onClick={async () => {
                if (!newPhase.titleEn.trim() || !newPhase.titleAr.trim()) {
                  alert(
                    isArabic
                      ? "عنوان المرحلة مطلوب باللغتين"
                      : "Phase title is required in both languages"
                  );
                  return;
                }
                await onSavePhase(newPhase);
              }}
              disabled={submitting}
              className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
            >
              <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {copy.save}
            </Button>
          </div>
        </div>
      )}

      {/* Existing Phases */}
      <div className="space-y-4">
        {[...phases]
          .sort((a, b) => a.phaseNumber - b.phaseNumber)
          .map((phase, index) => {
            const originalIndex = phases.findIndex(
              (p) => p.phaseNumber === phase.phaseNumber
            );
            return (
              <div
                key={phase.phaseNumber}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                {editingPhaseIndex === originalIndex ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">
                        {copy.phaseTitle} {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onCancelEdit}
                        className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-white/80">
                          {copy.phaseTitle} (EN){" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <Input
                          placeholder={isArabic ? "العنوان (EN)" : "Title (EN)"}
                          className={inputStyles}
                          value={phase.titleEn}
                          onChange={(e) => {
                            const newPhases = [...phases];
                            newPhases[originalIndex].titleEn = e.target.value;
                            setPhases(newPhases);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-white/80">
                          {copy.phaseTitle} (AR){" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <Input
                          placeholder={isArabic ? "العنوان (AR)" : "Title (AR)"}
                          className={inputStyles}
                          value={phase.titleAr}
                          onChange={(e) => {
                            const newPhases = [...phases];
                            newPhases[originalIndex].titleAr = e.target.value;
                            setPhases(newPhases);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-white/80">
                          {copy.phaseDescription} (EN)
                        </label>
                        <Textarea
                          placeholder={
                            isArabic ? "الوصف (EN)" : "Description (EN)"
                          }
                          className={inputStyles}
                          value={phase.descriptionEn}
                          onChange={(e) => {
                            const newPhases = [...phases];
                            newPhases[originalIndex].descriptionEn =
                              e.target.value;
                            setPhases(newPhases);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-white/80">
                          {copy.phaseDescription} (AR)
                        </label>
                        <Textarea
                          placeholder={
                            isArabic ? "الوصف (AR)" : "Description (AR)"
                          }
                          className={inputStyles}
                          value={phase.descriptionAr}
                          onChange={(e) => {
                            const newPhases = [...phases];
                            newPhases[originalIndex].descriptionAr =
                              e.target.value;
                            setPhases(newPhases);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-white/80">
                          {copy.duration}{" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="number"
                          min="1"
                          placeholder={
                            isArabic ? "المدة بالأيام" : "Duration in days"
                          }
                          className={inputStyles}
                          value={phase.duration}
                          onChange={(e) => {
                            const newPhases = [...phases];
                            newPhases[originalIndex].duration = Number(
                              e.target.value
                            );
                            setPhases(newPhases);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-white/80">
                          {copy.phaseNumber}{" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((num) => {
                            const usedNumbers = phases
                              .map((p, i) =>
                                i !== originalIndex ? p.phaseNumber : null
                              )
                              .filter((n) => n !== null) as number[];
                            const isUsed = usedNumbers.includes(num);
                            const isSelected = phase.phaseNumber === num;

                            if (isUsed) return null;

                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => {
                                  const newPhases = [...phases];
                                  newPhases[originalIndex].phaseNumber = num;
                                  setPhases(newPhases);
                                }}
                                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? "bg-primary text-black border-primary font-bold"
                                    : "bg-white/[0.02] text-white/70 border-white/20 hover:border-white/40 hover:bg-white/[0.05]"
                                }`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-white/80">
                          {copy.phaseStatus}
                        </label>
                        <select
                          className={inputStyles}
                          value={phase.status}
                          onChange={(e) => {
                            const newPhases = [...phases];
                            newPhases[originalIndex].status = e.target.value as
                              | "upcoming"
                              | "in_progress"
                              | "completed";
                            setPhases(newPhases);
                          }}
                        >
                          <option value="upcoming">{copy.upcoming}</option>
                          <option value="in_progress">{copy.inProgress}</option>
                          <option value="completed">{copy.completed}</option>
                        </select>
                      </div>
                      {phase.status === "in_progress" && (
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm text-white/80">
                            {copy.phaseProgress} ({phase.progress}%)
                          </label>
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            className="w-full"
                            value={phase.progress}
                            onChange={(e) => {
                              const newPhases = [...phases];
                              newPhases[originalIndex].progress = Number(
                                e.target.value
                              );
                              setPhases(newPhases);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="ghost"
                        onClick={onCancelEdit}
                        className="rounded-full border border-white/20 px-6 text-white/70 hover:bg-white/5"
                      >
                        {copy.cancel}
                      </Button>
                      <Button
                        onClick={() => onUpdatePhase(originalIndex)}
                        disabled={submitting}
                        className="rounded-full bg-primary px-6 text-black shadow-lg hover:bg-primary/90"
                      >
                        <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {copy.save}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">
                          {phase.phaseNumber}.{" "}
                          {(() => {
                            const titleToShow = isArabic
                              ? phase.titleAr?.trim() ||
                                phase.titleEn?.trim() ||
                                `${copy.phaseTitle} ${index + 1}`
                              : phase.titleEn?.trim() ||
                                phase.titleAr?.trim() ||
                                `${copy.phaseTitle} ${index + 1}`;
                            return titleToShow;
                          })()}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            phase.status === "completed"
                              ? "bg-green-500/20 text-green-300"
                              : phase.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {phase.status === "completed"
                            ? copy.completed
                            : phase.status === "in_progress"
                            ? copy.inProgress
                            : copy.upcoming}
                        </span>
                      </div>
                      {(phase.descriptionEn || phase.descriptionAr) && (
                        <p className="text-sm text-white/70 mb-2">
                          {isArabic
                            ? phase.descriptionAr && phase.descriptionAr.trim()
                              ? phase.descriptionAr.trim()
                              : phase.descriptionEn &&
                                phase.descriptionEn.trim()
                              ? phase.descriptionEn.trim()
                              : ""
                            : phase.descriptionEn && phase.descriptionEn.trim()
                            ? phase.descriptionEn.trim()
                            : phase.descriptionAr && phase.descriptionAr.trim()
                            ? phase.descriptionAr.trim()
                            : ""}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-white/60">
                        <span>
                          {copy.duration}: {phase.duration}{" "}
                          {isArabic ? "يوم" : "days"}
                        </span>
                        {phase.status === "in_progress" && (
                          <span>
                            {copy.phaseProgress}: {phase.progress}%
                          </span>
                        )}
                      </div>
                      {phase.status === "in_progress" && (
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPhaseIndex(originalIndex)}
                        className="h-8 w-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                        title={copy.edit}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (
                            confirm(
                              isArabic
                                ? "حذف هذه المرحلة؟"
                                : "Delete this phase?"
                            )
                          ) {
                            await onDeletePhase(originalIndex);
                          }
                        }}
                        className="h-8 w-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        title={copy.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        {phases.length === 0 && !newPhase && (
          <p className="text-white/60 text-center py-8">
            {isArabic
              ? "لا توجد مراحل. اضغط على 'إضافة مرحلة' لإضافة مرحلة جديدة."
              : "No phases. Click 'Add Phase' to add a new phase."}
          </p>
        )}
      </div>
    </div>
  );
}
