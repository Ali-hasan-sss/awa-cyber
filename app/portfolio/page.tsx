import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PortfolioHero from "@/components/portfolio/PortfolioHero";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";

export default function PortfolioPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PortfolioHero />
      {/* Content that appears above the fixed background */}
      <div className="relative z-10 bg-gradient-to-b from-white to-gray-100">
        <PortfolioGrid />
      </div>
      <Footer />
    </main>
  );
}
