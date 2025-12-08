import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesList from "@/components/services/ServicesList";

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ServicesHero />
      {/* Content that appears above the fixed background */}
      <div className="relative z-10 bg-white">
        <ServicesList />
        <Footer />
      </div>
    </main>
  );
}
