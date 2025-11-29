"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects, AdminProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Pencil,
  DollarSign,
  MessageCircle,
  Globe,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function HeroContent() {
  const { locale, messages } = useLanguage();
  const isArabic = locale === "ar";
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { getProjectByPortalCode } = useProjects();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [loading, setLoading] = useState(true);
  const portalHero = (messages?.portalHero || {}) as any;

  useEffect(() => {
    loadProject();
  }, [code]);

  const loadProject = async () => {
    if (!code) {
      setLoading(false);
      return;
    }
    try {
      const loadedProject = await getProjectByPortalCode(code);
      if (loadedProject) {
        setProject(loadedProject);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate current phase and progress
  const currentPhase =
    project?.phases?.find((phase) => phase.status === "in_progress") ||
    project?.phases?.find((phase) => phase.status === "upcoming");

  const progress = project?.progress || 0;
  const currentPhaseTitle = currentPhase
    ? isArabic
      ? currentPhase.title.ar
      : currentPhase.title.en
    : "";

  const features = [
    {
      icon: TrendingUp,
      title: portalHero.features?.[0]?.title || "",
      description: portalHero.features?.[0]?.description || "",
    },
    {
      icon: Pencil,
      title: portalHero.features?.[1]?.title || "",
      description: portalHero.features?.[1]?.description || "",
    },
    {
      icon: DollarSign,
      title: portalHero.features?.[2]?.title || "",
      description: portalHero.features?.[2]?.description || "",
    },
    {
      icon: MessageCircle,
      title: portalHero.features?.[3]?.title || "",
      description: portalHero.features?.[3]?.description || "",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Section - Order changes based on language */}
          <div
            className={`relative ${
              isArabic ? "lg:order-2" : "lg:order-1"
            } order-2`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/publicContain.webp"
                alt={portalHero.imageAlt || ""}
                width={400}
                height={600}
                className="object-cover w-full "
                priority
              />

              {/* Progress Overlay Box - Position based on language */}
              {!loading && project && (
                <div
                  className={`absolute top-4 ${
                    isArabic ? "left-4" : "right-4"
                  } bg-white rounded-xl border-2 border-primary p-4 shadow-lg`}
                >
                  <div
                    className={`flex items-center gap-3 ${
                      isArabic ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className={isArabic ? "text-right" : "text-left"}>
                      <p className="text-xs text-gray-600 mb-1">
                        {portalHero.overlay?.progress ||
                          (isArabic ? "نسبة التقدم" : "Progress")}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {progress}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </div>
              )}

              {/* Current Phase Overlay Box - Position based on language */}
              {!loading && project && currentPhaseTitle && (
                <div
                  className={`absolute bottom-4 ${
                    isArabic ? "right-4" : "left-4"
                  } bg-white rounded-xl border-2 border-primary p-4 shadow-lg`}
                >
                  <div
                    className={`flex items-center gap-3 ${
                      isArabic ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className={isArabic ? "text-right" : "text-left"}>
                      <p className="text-xs text-gray-600 mb-1">
                        {portalHero.overlay?.currentPhase ||
                          (isArabic ? "المرحلة الحالية" : "Current Phase")}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {currentPhaseTitle}
                      </p>
                    </div>
                    <Calendar className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Section - Order changes based on language */}
          <div
            className={`${
              isArabic ? "lg:order-1" : "lg:order-2"
            } order-1 space-y-8 text-center lg:text-left ${
              isArabic ? "lg:text-right" : ""
            }`}
          >
            {/* Yellow Banner */}
            <div className="inline-block bg-primary text-black px-6 py-2 rounded-full text-sm font-semibold">
              {portalHero.banner || ""}
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {portalHero.title?.line1 || ""}
              <br />
              <span className="text-primary">
                {portalHero.title?.highlight || ""}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {portalHero.description || ""}
            </p>

            {/* Feature Boxes */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div
                      className={`flex items-start gap-3 ${
                        isArabic ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`bg-primary/10 p-2 rounded-lg ${
                          isArabic ? "order-2" : ""
                        }`}
                      >
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div
                        className={`flex-1 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                          {feature.title}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 w-full pt-4 items-center lg:items-start">
              <Button
                className="group w-full  bg-primary text-black hover:bg-primary/90 px-8 py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!project?.projectUrl}
                asChild={!!project?.projectUrl}
              >
                {project?.projectUrl ? (
                  <Link
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full "
                  >
                    {isArabic ? (
                      <>
                        {portalHero.cta?.visitSite ||
                          (isArabic ? "زيارة الموقع" : "Visit Site")}
                        <Globe className="w-5 inline h-5 mr-2" />
                        <ArrowRight className="w-5 h-5 ml-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        <Globe className="w-5 inline h-5 mr-2" />
                        {portalHero.cta?.visitSite ||
                          (isArabic ? "زيارة الموقع" : "Visit Site")}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Link>
                ) : (
                  <span>
                    {isArabic ? (
                      <>
                        {portalHero.cta?.visitSite ||
                          (isArabic ? "زيارة الموقع" : "Visit Site")}
                        <Globe className="w-5 inline h-5 mr-2" />
                      </>
                    ) : (
                      <>
                        <Globe className="w-5 inline h-5 mr-2" />
                        {portalHero.cta?.visitSite ||
                          (isArabic ? "زيارة الموقع" : "Visit Site")}
                      </>
                    )}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PortalHero() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeroContent />
    </Suspense>
  );
}
