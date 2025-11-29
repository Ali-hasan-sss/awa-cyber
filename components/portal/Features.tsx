"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  Clock,
  Settings,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  CheckCircle,
  Circle,
  Pencil,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects, AdminProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

type SectionContent = {
  title?: string;
  subtitle?: string;
  projectName?: string;
  serviceType?: string;
  clientName?: string;
  remainingDays?: string;
  currentStage?: string;
  expectedDelivery?: string;
  startDate?: string;
  overallProgress?: string;
  timeline?: string;
  complete?: string;
  days?: string;
  viewFullDetails?: string;
};

const fallbackContent: SectionContent = {
  title: "Track Your Project",
  subtitle: "Follow all your project details in one place",
  projectName: "Project Name",
  serviceType: "Service Type",
  clientName: "Client Name",
  remainingDays: "Remaining Free Modification Days",
  currentStage: "Current Stage",
  expectedDelivery: "Expected Delivery Date",
  startDate: "Start Date",
  overallProgress: "Overall Project Progress",
  timeline: "Project Timeline",
  complete: "Complete",
  days: "days",
};

export default function PortalFeatures() {
  const { locale, messages } = useLanguage();
  const isArabic = locale === "ar";
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { user } = useAuth();
  const { loading, getProjectByPortalCode, projects, fetchProjects } =
    useProjects();
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(
    null
  );
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const section: SectionContent = {
    ...fallbackContent,
    ...(messages?.portalDashboard ?? {}),
  };

  useEffect(() => {
    if (code) {
      loadByCode();
    } else if (user?.id) {
      // If user is already logged in, load their projects
      loadUserProjects();
    }
  }, [code, user]);

  const loadByCode = async () => {
    if (!code) return;
    setIsLoadingCode(true);
    setError(null);

    try {
      // Load project by portal code
      const project = await getProjectByPortalCode(code);
      // Check if we got a valid project
      if (project && project._id) {
        setSelectedProject(project);
        setIsLoadingCode(false);
        return;
      }
    } catch (err: any) {
      // Show error if portal code is invalid
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        (isArabic ? "رمز الدخول غير صحيح" : "Invalid portal code");
      setError(errorMessage);
      setSelectedProject(null);
    } finally {
      setIsLoadingCode(false);
    }
  };

  const loadUserProjects = async () => {
    if (!user?.id) return;
    try {
      await fetchProjects();
      // Get first project for the logged-in user
      const userProject = projects.find((p) => {
        const userId = typeof p.userId === "object" ? p.userId._id : p.userId;
        return userId === user.id;
      });
      setSelectedProject(userProject || projects[0] || null);
    } catch (err) {
      console.error("Failed to load user projects:", err);
    }
  };

  // Update selected project when projects change
  useEffect(() => {
    if (user?.id && projects.length > 0 && !selectedProject) {
      const userProject = projects.find((p) => {
        const userId = typeof p.userId === "object" ? p.userId._id : p.userId;
        return userId === user.id;
      });
      setSelectedProject(userProject || projects[0] || null);
    }
  }, [projects, user, selectedProject]);

  if (loading || isLoadingCode) {
    return (
      <section className="relative bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              {isArabic ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!code && !user) {
    return (
      <section className="relative bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              {isArabic
                ? "يرجى إدخال رمز الدخول للبورتال"
                : "Please enter portal access code"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!selectedProject) {
    return (
      <section className="relative bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              {isArabic ? "لا توجد مشاريع متاحة" : "No projects available"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const projectName = isArabic
    ? selectedProject.name.ar
    : selectedProject.name.en;
  const clientName =
    typeof selectedProject.userId === "object" && selectedProject.userId
      ? selectedProject.userId.name
      : "-";
  const currentPhase = selectedProject.phases?.find(
    (p) => p.status === "in_progress"
  );
  const currentPhaseTitle = currentPhase
    ? isArabic
      ? currentPhase.title.ar
      : currentPhase.title.en
    : section.currentStage || "";

  // Calculate expected delivery date (start date + sum of phase durations)
  const totalDays =
    selectedProject.phases?.reduce(
      (sum, phase) => sum + (phase.duration || 0),
      0
    ) || 0;
  const startDate = selectedProject.startDate
    ? new Date(selectedProject.startDate)
    : new Date();
  const expectedDeliveryDate = new Date(startDate);
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + totalDays);

  // Free modification days (example: 10 days total, 7 remaining)
  const freeModificationDays = 10;
  const usedModificationDays = 3;
  const remainingModificationDays = freeModificationDays - usedModificationDays;

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 space-y-2 ${isArabic ? "rtl" : "ltr"}`}
        >
          <div className="flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {section.title || ""}
            </h2>
          </div>
          <p className="text-lg text-gray-600">{section.subtitle || ""}</p>
        </div>

        {/* Yellow Banner - Project Info */}
        <div className="bg-primary rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
              isArabic ? "rtl text-right" : "ltr text-left"
            }`}
          >
            <div>
              <p className="text-sm text-gray-700 mb-2">
                {section.projectName}
              </p>
              <p className="text-xl font-bold text-gray-900">{projectName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-2">
                {section.serviceType}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {isArabic ? "تطوير موقع إلكتروني" : "Website Development"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-2">{section.clientName}</p>
              <p className="text-xl font-bold text-gray-900">{clientName}</p>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Remaining Free Modification Days */}
          <div
            className={`bg-white rounded-xl border border-gray-200 p-6 shadow-md ${
              isArabic ? "rtl text-right" : "ltr text-left"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-gray-600">{section.remainingDays}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {remainingModificationDays} / {freeModificationDays}{" "}
              {section.days}
            </p>
          </div>

          {/* Current Stage */}
          <div
            className={`bg-white rounded-xl border border-gray-200 p-6 shadow-md ${
              isArabic ? "rtl text-right" : "ltr text-left"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-gray-600">{section.currentStage}</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {currentPhaseTitle}
            </p>
          </div>

          {/* Expected Delivery Date */}
          <div
            className={`bg-white rounded-xl border border-gray-200 p-6 shadow-md ${
              isArabic ? "rtl text-right" : "ltr text-left"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <CalendarCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-gray-600">
                {section.expectedDelivery}
              </p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {expectedDeliveryDate.toLocaleDateString(
                isArabic ? "ar-SA" : "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>

          {/* Start Date */}
          <div
            className={`bg-white rounded-xl border border-gray-200 p-6 shadow-md ${
              isArabic ? "rtl text-right" : "ltr text-left"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-gray-600">{section.startDate}</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {selectedProject.startDate
                ? new Date(selectedProject.startDate).toLocaleDateString(
                    isArabic ? "ar-SA" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "-"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300 my-8" />

        {/* Overall Project Progress */}
        <div
          className={`mb-12 space-y-6 ${
            isArabic ? "rtl text-right" : "ltr text-left"
          }`}
        >
          <h3 className="text-2xl font-bold text-gray-900">
            {section.overallProgress}
          </h3>
          <div className="relative">
            <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${selectedProject.progress || 0}%` }}
              >
                <span className="text-sm font-semibold text-gray-900">
                  {selectedProject.progress || 0}% {section.complete}
                </span>
              </div>
            </div>
            <div className="mt-2 text-right">
              <span className="text-3xl font-bold text-gray-900">
                {selectedProject.progress || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300 my-8" />

        {/* Project Timeline */}
        <div
          className={`space-y-6 ${
            isArabic ? "rtl text-right" : "ltr text-left"
          }`}
        >
          <h3 className="text-2xl font-bold text-gray-900">
            {section.timeline}
          </h3>
          <div className="relative">
            {/* Vertical line connecting phases */}
            <div
              className={`absolute top-0 bottom-0 w-0.5 bg-gray-300 ${
                isArabic ? "right-6" : "left-6"
              }`}
              style={{
                height: `${(selectedProject.phases?.length || 0) * 120 - 60}px`,
              }}
            />

            <div className="space-y-6">
              {selectedProject.phases?.map((phase, index) => {
                const phaseTitle = isArabic ? phase.title.ar : phase.title.en;
                const phaseDescription = isArabic
                  ? phase.description?.ar || ""
                  : phase.description?.en || "";
                const isCompleted = phase.status === "completed";
                const isInProgress = phase.status === "in_progress";
                const isUpcoming = phase.status === "upcoming";

                return (
                  <div
                    key={index}
                    className={`relative flex items-start gap-4 ${
                      isArabic ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Icon Circle */}
                    <div
                      className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                        isCompleted
                          ? "bg-white border-primary"
                          : isInProgress
                          ? "bg-white border-primary border-dashed"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      ) : isInProgress ? (
                        <Circle className="w-6 h-6 text-primary fill-primary" />
                      ) : isUpcoming ? (
                        <Pencil className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Rocket className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Phase Content */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <div
                        className={`flex items-start justify-between gap-4 ${
                          isArabic ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {phaseTitle}
                          </h4>
                          {phaseDescription && (
                            <p className="text-sm text-gray-600 mb-3">
                              {phaseDescription}
                            </p>
                          )}
                          {isInProgress && phase.progress !== undefined && (
                            <div className="mt-3">
                              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full transition-all"
                                  style={{ width: `${phase.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                              isCompleted
                                ? "bg-primary text-gray-900"
                                : isInProgress
                                ? "bg-primary text-gray-900"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isCompleted
                              ? section.complete
                              : isInProgress
                              ? isArabic
                                ? "قيد التنفيذ"
                                : "In Progress"
                              : isArabic
                              ? "قادم"
                              : "Upcoming"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
