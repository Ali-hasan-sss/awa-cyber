"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const { t, messages } = useLanguage();
  const slides = (messages?.hero?.slides || []) as any[];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) {
    return null; // أو يمكن إرجاع fallback content
  }

  const currentSlideData = slides[currentSlide] || slides[0];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Images with transitions */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        {/* Slides container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100 z-0" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={slide.image || slide.img || "/images/publicContain.jpg"}
                alt={`Hero Slide ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Simple overlay for text readability - subtle like first image */}
        <div className="absolute inset-0 bg-black/10 z-[5]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto md:mx-0 md:ltr:mr-auto md:rtl:ml-auto px-4 sm:px-0 text-center md:text-left md:rtl:text-right md:ltr:text-left relative z-20">
          {/* Yellow Accent Bar */}
          <div className="mb-6 flex justify-center md:justify-start">
            <div className="h-1.5 w-24 bg-primary rounded-full" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-500">
            <span>{currentSlideData.accent}</span>{" "}
            <span className="text-primary">{currentSlideData.title}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0 transition-all duration-500">
            {currentSlideData.description}{" "}
            <span className="text-primary font-semibold">
              {currentSlideData.highlight}
            </span>
            {currentSlideData.description2 && (
              <> {currentSlideData.description2}</>
            )}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 transition-all duration-500 items-center md:items-start">
            <Button size="lg" className="group text-base px-8 py-6">
              {currentSlideData.cta1}
              <ArrowRight className="ltr:ml-2 rtl:mr-2 rtl:rotate-180 w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-black"
            >
              {currentSlideData.cta2}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute ltr:left-4 rtl:right-4 md:ltr:left-8 md:rtl:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform rtl:rotate-180" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute ltr:right-4 rtl:left-4 md:ltr:right-8 md:rtl:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform rtl:rotate-180" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
