"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AboutHero from "@/components/about/Hero";
import WhatWeOffer from "@/components/about/WhatWeOffer";
import CallToAction from "@/components/about/CallToAction";
import VideoSection from "@/components/about/VideoSection";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <AboutHero />
      {/* Content that appears above the fixed background */}
      <div className="relative z-10 bg-white">
        <WhatWeOffer />
        <CallToAction />
        <VideoSection />
        <Footer />
      </div>
    </main>
  );
}
