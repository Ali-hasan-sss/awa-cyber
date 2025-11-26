import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";
import PageTransition from "@/components/layout/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";

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
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
