"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import WhoWeAre from "@/components/home/WhoWeAre";
import TrustedClients from "@/components/home/TrustedClients";
import SecurityServices from "@/components/home/SecurityServices";
import LatestProjects from "@/components/home/LatestProjects";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import SecurityTechnologies from "@/components/home/SecurityTechnologies";
import HowItWorks from "@/components/home/HowItWorks";
import SecurityModal from "@/components/home/SecurityModal";
import Footer from "@/components/layout/Footer";
import SectionRenderer from "@/components/sections/SectionRenderer";
import HomePageLoader from "@/components/home/HomePageLoader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loader for minimum time to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Also check when page is fully loaded
    if (typeof window !== "undefined") {
      const handleLoad = () => {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      };

      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        return () => {
          window.removeEventListener("load", handleLoad);
          clearTimeout(timer);
        };
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <HomePageLoader />
        <Footer />
      </>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <WhoWeAre />
      <TrustedClients />
      <SecurityServices />
      <LatestProjects />
      <WhyChooseUs />
      <Testimonials />
      <HowItWorks />
      <SecurityTechnologies />
      <SecurityModal />
      <SectionRenderer page="home" />
      <Footer />
    </main>
  );
}
