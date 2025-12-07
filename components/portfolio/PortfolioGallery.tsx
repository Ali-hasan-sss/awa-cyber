"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PortfolioGallery({ portfolio }: { portfolio: any }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const images = portfolio.images || [];

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
      } else if (e.key === "ArrowRight" && images.length > 1) {
        setSelectedImage((prev) => {
          if (prev === null) return null;
          return (prev + 1) % images.length;
        });
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        setSelectedImage((prev) => {
          if (prev === null) return null;
          return prev === 0 ? images.length - 1 : prev - 1;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, images.length]);

  // Early return after all hooks
  if (images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  };

  const nextImage = () => {
    if (selectedImage !== null && images.length > 1) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null && images.length > 1) {
      setSelectedImage(
        selectedImage === 0 ? images.length - 1 : selectedImage - 1
      );
    }
  };

  return (
    <>
      <section className="relative bg-white py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {images.map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={image}
                    alt={`Portfolio image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              ))}
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

          {/* Navigation Buttons - Only show if more than one image */}
          {images.length > 1 && (
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

          {/* Image */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 99999 }}
          >
            <Image
              src={images[selectedImage]}
              alt={`Portfolio image ${selectedImage + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Image Counter - Only show if more than one image */}
          {images.length > 1 && (
            <div
              className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm md:text-base font-medium shadow-lg border-2 border-white/30"
              style={{ zIndex: 100000 }}
            >
              {selectedImage + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
