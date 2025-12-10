import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleDetail from "@/components/articles/ArticleDetail";

export default function ArticleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ArticleDetail articleId={params.id} />
      <Footer />
    </main>
  );
}
