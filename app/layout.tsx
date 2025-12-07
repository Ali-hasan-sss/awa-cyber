import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";
import PageTransition from "@/components/layout/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import { Cairo, Inter } from "next/font/google";

// Load fonts
const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "AWA CYBER - Your Digital Fortress",
  description: "Enterprise-grade cybersecurity solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
