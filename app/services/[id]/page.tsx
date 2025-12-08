import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServiceDetail from "@/components/services/ServiceDetail";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="min-h-screen">
      <Navbar />
      <ServiceDetail serviceId={id} />
      <Footer />
    </main>
  );
}
