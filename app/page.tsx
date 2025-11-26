import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhoWeAre from "@/components/WhoWeAre";
import TrustedClients from "@/components/TrustedClients";
import SecurityServices from "@/components/SecurityServices";
import LatestProjects from "@/components/LatestProjects";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import SecurityTechnologies from "@/components/SecurityTechnologies";
import HowItWorks from "@/components/HowItWorks";
import SecurityModal from "@/components/SecurityModal";
import Footer from "@/components/Footer";

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
