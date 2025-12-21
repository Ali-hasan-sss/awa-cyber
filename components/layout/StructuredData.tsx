"use client";

export default function StructuredData() {
  // LocalBusiness schema (more specific than Organization for local SEO)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://awacyber.com/#organization",
    name: "AWA Cyber",
    alternateName: ["اوا سايبر", "awacyber"],
    url: "https://awacyber.com",
    logo: "https://awacyber.com/images/logo.png",
    image: "https://awacyber.com/images/logo.png",
    description:
      "شركة متخصصة في بناء وتصميم تطبيقات الويب والموبايل، إدارة الحملات الإعلانية والتسويق الرقمي، وإدارة صفحات التواصل الاجتماعي. نقدم حلولاً شاملة للشركات والمؤسسات لتعزيز وجودها الرقمي. Web and mobile app development, digital marketing campaigns, social media management, and comprehensive digital solutions.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "OM",
      addressLocality: "Muscat",
      addressRegion: "Muscat",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+96879185790",
        contactType: "customer service",
        areaServed: ["OM", "العالم العربي"],
        availableLanguage: ["Arabic", "English", "ar", "en"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+96879185790",
        contactType: "sales",
        areaServed: ["OM", "العالم العربي"],
        availableLanguage: ["Arabic", "English", "ar", "en"],
      },
    ],
    sameAs: [
      // Add your social media profiles here if you have them
      // "https://www.facebook.com/awacyber",
      // "https://www.twitter.com/awacyber",
      // "https://www.linkedin.com/company/awacyber",
    ],
  };

  // Organization schema (fallback and additional info)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://awacyber.com/#organization",
    name: "AWA Cyber",
    alternateName: ["اوا سايبر", "awacyber"],
    url: "https://awacyber.com",
    logo: "https://awacyber.com/images/logo.png",
    description:
      "شركة متخصصة في بناء وتصميم تطبيقات الويب والموبايل، إدارة الحملات الإعلانية والتسويق الرقمي، وإدارة صفحات التواصل الاجتماعي. نقدم حلولاً شاملة للشركات والمؤسسات لتعزيز وجودها الرقمي.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "OM",
      addressLocality: "Muscat",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+96879185790",
      contactType: "customer service",
      areaServed: "OM",
      availableLanguage: ["Arabic", "English"],
    },
  };

  // Website schema with search functionality
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://awacyber.com/#website",
    url: "https://awacyber.com",
    name: "AWA Cyber | اوا سايبر",
    alternateName: ["اوا سايبر", "awacyber"],
    description:
      "AWA Cyber (اوا سايبر) - شركة متخصصة في بناء وتصميم تطبيقات الويب والموبايل، إدارة الحملات الإعلانية والتسويق الرقمي، وإدارة صفحات التواصل الاجتماعي.",
    publisher: {
      "@id": "https://awacyber.com/#organization",
    },
    inLanguage: ["ar", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://awacyber.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Service schema - Main services offered
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Digital Solutions",
    provider: {
      "@id": "https://awacyber.com/#organization",
    },
    areaServed: {
      "@type": "Country",
      name: "Oman",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AWA Cyber Services",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Web Development",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Web App Development",
                description: "تطوير تطبيقات الويب",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Web Design",
                description: "تصميم المواقع",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Mobile Development",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Mobile App Development",
                description: "تطوير تطبيقات الموبايل",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Digital Marketing",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Digital Marketing",
                description: "التسويق الرقمي",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Advertising Campaigns",
                description: "الحملات الإعلانية",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Social Media Management",
                description: "إدارة وسائل التواصل الاجتماعي",
              },
            },
          ],
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
    </>
  );
}
