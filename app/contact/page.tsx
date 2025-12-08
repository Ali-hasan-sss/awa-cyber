import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ContactHero />
      <ContactForm />
      <Footer />
    </main>
  );
}

