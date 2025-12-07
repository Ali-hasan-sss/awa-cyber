import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PortfolioDetail from "@/components/portfolio/PortfolioDetail";

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="min-h-screen">
      <Navbar />
      <PortfolioDetail portfolioId={id} />
      <Footer />
    </main>
  );
}
