"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Helper function to check if a URL is a YouTube URL
const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  const patterns = [/youtube\.com\//, /youtu\.be\//];
  return patterns.some((pattern) => pattern.test(url));
};

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

export default function PortfolioGallery({ portfolio }: { portfolio: any }) {
  const { locale } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(
    null
  );
  const allItems = portfolio.images || []; // Can contain both images and YouTube URLs

  // Exclude first image (index 0) as it's used for Hero background and card thumbnail
  // Map gallery items: gallery index -> original index
  const galleryItems = allItems.slice(1); // Skip first item
  const getOriginalIndex = (galleryIndex: number) => galleryIndex + 1; // Add 1 because we skipped index 0

  // Notify parent that lightbox is open/closed and hide navbar
  useEffect(() => {
    if (selectedImage !== null) {
      document.body.setAttribute("data-lightbox-open", "true");
      // Hide navbar when lightbox is open
      const navbar = document.querySelector("nav");
      if (navbar) {
        (navbar as HTMLElement).style.display = "none";
      }
    } else {
      document.body.removeAttribute("data-lightbox-open");
      // Show navbar when lightbox is closed
      const navbar = document.querySelector("nav");
      if (navbar) {
        (navbar as HTMLElement).style.display = "";
      }
    }
    return () => {
      document.body.removeAttribute("data-lightbox-open");
      const navbar = document.querySelector("nav");
      if (navbar) {
        (navbar as HTMLElement).style.display = "";
      }
    };
  }, [selectedImage]);

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
        document.body.style.overflow = "unset";
      } else if (
        e.key === "ArrowRight" &&
        galleryItems.length > 1 &&
        selectedImage !== null
      ) {
        nextImage();
      } else if (
        e.key === "ArrowLeft" &&
        galleryItems.length > 1 &&
        selectedImage !== null
      ) {
        prevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, galleryItems.length]);

  // Early return after all hooks
  if (galleryItems.length === 0) {
    return null;
  }

  const openLightbox = (galleryIndex: number) => {
    const originalIndex = getOriginalIndex(galleryIndex);
    const item = allItems[originalIndex];
    const isYouTube = isYouTubeUrl(item);

    // If it's a YouTube video, play it inline instead of opening lightbox
    if (isYouTube) {
      setPlayingVideoIndex(originalIndex);
      return;
    }

    // For regular images, open lightbox (store gallery index)
    setSelectedImage(galleryIndex);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  };

  const nextImage = () => {
    if (selectedImage !== null && galleryItems.length > 1) {
      let nextGalleryIndex = (selectedImage + 1) % galleryItems.length;
      // Skip YouTube videos in lightbox navigation
      while (
        isYouTubeUrl(galleryItems[nextGalleryIndex]) &&
        nextGalleryIndex !== selectedImage
      ) {
        nextGalleryIndex = (nextGalleryIndex + 1) % galleryItems.length;
      }
      if (!isYouTubeUrl(galleryItems[nextGalleryIndex])) {
        setSelectedImage(nextGalleryIndex);
      }
    }
  };

  const prevImage = () => {
    if (selectedImage !== null && galleryItems.length > 1) {
      let prevGalleryIndex =
        selectedImage === 0 ? galleryItems.length - 1 : selectedImage - 1;
      // Skip YouTube videos in lightbox navigation
      while (
        isYouTubeUrl(galleryItems[prevGalleryIndex]) &&
        prevGalleryIndex !== selectedImage
      ) {
        prevGalleryIndex =
          prevGalleryIndex === 0
            ? galleryItems.length - 1
            : prevGalleryIndex - 1;
      }
      if (!isYouTubeUrl(galleryItems[prevGalleryIndex])) {
        setSelectedImage(prevGalleryIndex);
      }
    }
  };

  return (
    <>
      <section className="relative bg-white py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {galleryItems.map((item: string, galleryIndex: number) => {
                const originalIndex = getOriginalIndex(galleryIndex);
                const isYouTube = isYouTubeUrl(item);
                const youtubeVideoId = isYouTube
                  ? getYouTubeVideoId(item)
                  : null;
                const isPlaying = playingVideoIndex === originalIndex;

                if (isYouTube && youtubeVideoId) {
                  // YouTube Video - Show player if playing, thumbnail if not
                  return (
                    <div
                      key={originalIndex}
                      className={`relative ${
                        isPlaying ? "aspect-video" : "aspect-[4/3]"
                      } rounded-2xl overflow-hidden transition-all duration-300 ${
                        isPlaying
                          ? "shadow-2xl"
                          : "cursor-pointer group hover:shadow-2xl"
                      }`}
                    >
                      {isPlaying ? (
                        // Video Player
                        <div className="relative w-full h-full bg-black rounded-2xl">
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
                            title={`Portfolio video ${galleryIndex + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full rounded-2xl"
                          />
                          {/* Close button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingVideoIndex(null);
                            }}
                            className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                            aria-label={locale === "ar" ? "إغلاق" : "Close"}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        // Video Thumbnail
                        <>
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700"
                            onClick={() => openLightbox(galleryIndex)}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
                              alt={`YouTube video ${galleryIndex + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (
                                  e.target as HTMLImageElement
                                ).src = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
                              }}
                            />
                          </div>
                          <div
                            className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center"
                            onClick={() => openLightbox(galleryIndex)}
                          >
                            <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg
                                className="w-8 h-8 text-white ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            YouTube
                          </div>
                        </>
                      )}
                    </div>
                  );
                } else {
                  // Regular Image
                  return (
                    <div
                      key={originalIndex}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300"
                      onClick={() => openLightbox(galleryIndex)}
                    >
                      <Image
                        src={item}
                        alt={`Portfolio image ${galleryIndex + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          style={{ zIndex: 99999 }}
        >
          {/* Close Button - Always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="fixed top-4 right-4 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/40 hover:scale-110 transition-all duration-300 shadow-2xl border-2 border-white/50"
            aria-label="Close"
            style={{ zIndex: 100000 }}
          >
            <X className="h-7 w-7 md:h-8 md:w-8 font-bold" strokeWidth={3} />
          </button>

          {/* Navigation Buttons - Only show if more than one item */}
          {galleryItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 shadow-lg border-2 border-white/30"
                aria-label="Previous image"
                style={{ zIndex: 100000 }}
              >
                <ChevronLeft
                  className="h-6 w-6 md:h-7 md:w-7"
                  strokeWidth={3}
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 shadow-lg border-2 border-white/30"
                aria-label="Next image"
                style={{ zIndex: 100000 }}
              >
                <ChevronRight
                  className="h-6 w-6 md:h-7 md:w-7"
                  strokeWidth={3}
                />
              </button>
            </>
          )}

          {/* Content - Only Images in Lightbox (Videos play inline) */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 99999 }}
          >
            {selectedImage !== null && (
              <>
                {(() => {
                  const selectedItem = galleryItems[selectedImage];
                  // Lightbox should only show images, not YouTube videos
                  return (
                    <Image
                      src={selectedItem}
                      alt={`Portfolio item ${selectedImage + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority
                    />
                  );
                })()}
              </>
            )}
          </div>

          {/* Item Counter - Only show if more than one item */}
          {galleryItems.length > 1 && (
            <div
              className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm md:text-base font-medium shadow-lg border-2 border-white/30"
              style={{ zIndex: 100000 }}
            >
              {selectedImage !== null ? selectedImage + 1 : 0} /{" "}
              {galleryItems.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
