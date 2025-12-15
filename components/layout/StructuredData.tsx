"use client";

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AWA Cyber",
    alternateName: ["اوا سايبر", "awacyber"],
    url: "https://awacyber.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://awacyber.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
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
    </>
  );
}

