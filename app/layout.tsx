import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
