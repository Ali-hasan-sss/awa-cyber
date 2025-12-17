import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";
import PageTransition from "@/components/layout/PageTransition";
import FloatingButtons from "@/components/layout/FloatingButtons";
import StructuredData from "@/components/layout/StructuredData";
import { AuthProvider } from "@/contexts/AuthContext";
import { Cairo, Inter } from "next/font/google";
import Script from "next/script";
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
  applicationName: "awacyber",
  title: {
    default: "AWA Cyber | اوا سايبر - تطوير التطبيقات والتسويق الرقمي",
    template: "%s | AWA Cyber | اوا سايبر",
  },
  description:
    "AWA Cyber (اوا سايبر) - شركة متخصصة في بناء وتصميم تطبيقات الويب والموبايل، إدارة الحملات الإعلانية والتسويق الرقمي، وإدارة صفحات التواصل الاجتماعي. نقدم حلولاً شاملة للشركات والمؤسسات لتعزيز وجودها الرقمي. Web and mobile app development, digital marketing campaigns, social media management, and comprehensive digital solutions.",
  keywords: [
    "AWA Cyber",
    "اوا سايبر",
    "awacyber",
    "web development",
    "تطوير المواقع",
    "mobile app development",
    "تطوير تطبيقات الموبايل",
    "web design",
    "تصميم المواقع",
    "digital marketing",
    "التسويق الرقمي",
    "advertising campaigns",
    "الحملات الإعلانية",
    "social media management",
    "إدارة وسائل التواصل الاجتماعي",
    "web applications",
    "تطبيقات الويب",
    "mobile applications",
    "تطبيقات الموبايل",
    "digital solutions",
    "الحلول الرقمية",
    "online marketing",
    "التسويق الإلكتروني",
    "social media marketing",
    "التسويق عبر وسائل التواصل",
  ],
  authors: [{ name: "AWA Cyber", url: "https://awacyber.com" }],
  creator: "AWA Cyber",
  publisher: "AWA Cyber",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    siteName: "AWA Cyber | اوا سايبر",
    title: "AWA Cyber | اوا سايبر - تطوير التطبيقات والتسويق الرقمي",
    description:
      "شركة متخصصة في بناء وتصميم تطبيقات الويب والموبايل، إدارة الحملات الإعلانية والتسويق الرقمي، وإدارة صفحات التواصل الاجتماعي.",
    url: "https://awacyber.com",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "AWA Cyber Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AWA Cyber | اوا سايبر - تطوير التطبيقات والتسويق الرقمي",
    description:
      "شركة متخصصة في بناء وتصميم تطبيقات الويب والموبايل، إدارة الحملات الإعلانية والتسويق الرقمي، وإدارة صفحات التواصل الاجتماعي",
    images: ["/images/logo.png"],
  },
  alternates: {
    canonical: "https://awacyber.com",
    languages: {
      "ar-SA": "https://awacyber.com",
      "en-US": "https://awacyber.com",
    },
  },
  icons: {
    icon: [
      { url: "/images/logo.png", type: "image/png" },
      { url: "/images/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/images/logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "KGyuKsWHrQvGTx40NELaQSKDU7PmU28be4BEx4_Ykic",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} antialiased`}>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WC84G9FN');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WC84G9FN"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <StructuredData />
        <LanguageProvider>
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
            <FloatingButtons />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
