import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactMap from "@/components/contact/ContactMap";
import ContactInfo from "@/components/contact/ContactInfo";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ContactHero />

      {/* Map and Contact Info Side by Side */}
      <section className="relative bg-gradient-to-b from-white to-gray-100 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
              {/* Map */}
              <div className="order-2 lg:order-1 flex flex-col">
                <ContactMap />
              </div>

              {/* Contact Information */}
              <div className="order-1 lg:order-2 flex flex-col">
                <ContactInfo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Centered */}
      <ContactForm />

      <Footer />
    </main>
  );
}
