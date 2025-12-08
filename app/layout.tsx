import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";
import PageTransition from "@/components/layout/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import { Cairo, Inter } from "next/font/google";
import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "AWA CYBER - Your Digital Fortress",
  description: "Enterprise-grade cybersecurity solutions",
  icons: {
    icon: [
      { url: "/images/logo.png", type: "image/png" },
      { url: "/images/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/images/logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
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
