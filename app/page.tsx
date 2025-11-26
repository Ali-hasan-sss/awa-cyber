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

export default function Home() {
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
      <Footer />
    </main>
  );
}
