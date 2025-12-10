import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticlesHero from "@/components/articles/ArticlesHero";
import ArticlesList from "@/components/articles/ArticlesList";

export default function ArticlesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ArticlesHero />
      {/* Content that appears above the fixed background */}
      <div className="relative z-10 bg-white">
        <ArticlesList />
        <Footer />
      </div>
    </main>
  );
}
