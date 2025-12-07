"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSectionsByPage } from "@/lib/api/sections";
import Image from "next/image";
import { Play } from "lucide-react";

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function VideoSection() {
  const { locale } = useLanguage();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadSections();
  }, [locale]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSectionsByPage("about", locale);
      setSections(data);
    } catch (error) {
      console.error("Error loading video sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get fourth section (video section)
  const videoSection = useMemo(() => {
    if (sections.length < 4) return null;
    return sections[3]; // Fourth section
  }, [sections]);

  if (loading) {
    return (
      <section className="relative bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[90vh]">
          {/* Left Side - Content Skeleton */}
          <div className="order-1 lg:order-1 flex items-center bg-white py-12 sm:py-16 md:py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:px-12 w-full">
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                {/* Title Skeleton */}
                <div className="space-y-2">
                  <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
                </div>

                {/* Accent Line Skeleton */}
                <div className="h-1 w-16 sm:w-20 bg-primary/30 rounded-full animate-pulse" />

                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Video/Image Skeleton */}
          <div className="relative order-2 lg:order-2 w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-full">
            <div className="w-full h-full bg-gray-300 animate-pulse relative">
              {/* Play Button Skeleton */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/80 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!videoSection) {
    return null;
  }

  const sectionTitle =
    typeof videoSection.title === "string"
      ? videoSection.title
      : videoSection.title?.[locale] || "";
  const sectionDescription =
    typeof videoSection.description === "string"
      ? videoSection.description
      : videoSection.description?.[locale] || "";
  const sectionImage = videoSection.images?.[0] || "/images/publicContain.jpg";
  const videoUrl = videoSection.videoUrl || "";

  // Check if the image is actually a video file
  const isVideoFile = (url: string) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isVideo = isVideoFile(sectionImage) || isVideoFile(videoUrl);
  const videoSource = isVideoFile(sectionImage) ? sectionImage : videoUrl;

  const handlePlay = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoUrl && !isVideo) {
      window.open(videoUrl, "_blank");
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <section className="relative bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[90vh]">
        {/* Left Side - Content */}
        <div className="order-1 lg:order-1 flex items-center bg-white py-12 sm:py-16 md:py-20 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:px-12 w-full">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {sectionTitle}
              </h2>

              {/* Accent Line */}
              <div className="h-1 w-16 sm:w-20 bg-primary rounded-full" />

              {/* Description */}
              {sectionDescription && (
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {stripHtml(sectionDescription)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Video/Image with Play Button */}
        <div
          className="relative order-2 lg:order-2 w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-full overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isVideo && videoSource ? (
            <>
              <video
                ref={videoRef}
                src={videoSource}
                className="w-full h-full max-h-full object-contain bg-black"
                onEnded={handleVideoEnd}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                playsInline
                style={{ maxHeight: "100%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-primary/5 pointer-events-none" />
            </>
          ) : (
            <>
              <Image
                src={sectionImage}
                alt={sectionTitle || "Video Section"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-primary/5 pointer-events-none" />
            </>
          )}

          {/* Play Button Overlay - Show when not playing, always show for non-video, or when hovered during playback */}
          {(!isVideo || !isPlaying || isHovered) && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isVideo && isPlaying && !isHovered ? "opacity-0" : "opacity-100"
              }`}
            >
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="group relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/90 hover:bg-primary transition-all duration-300 hover:scale-110"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {!isPlaying ? (
                  <Play
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-foreground group-hover:text-white ml-1 transition-colors"
                    fill="currentColor"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-6 bg-foreground group-hover:bg-white rounded-sm"></div>
                    <div className="w-2 h-6 bg-foreground group-hover:bg-white rounded-sm"></div>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
