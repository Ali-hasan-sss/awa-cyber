import { MetadataRoute } from "next";

// Use the API base URL - ensure it points to the backend API
// In production, this should be set in environment variables
const getApiBaseUrl = () => {
  // In build/runtime, use environment variable or default to production API
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) {
    // Ensure it doesn't have trailing slash
    return envUrl.replace(/\/$/, "");
  }
  // Default fallback - adjust based on your backend URL
  // For production, this should typically be https://awacyber.com/api or your backend domain
  return process.env.NODE_ENV === "production"
    ? "https://awacyber.com"
    : "http://localhost:4000";
};

async function getServices(): Promise<string[]> {
  const API_BASE_URL = getApiBaseUrl();
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/public`, {
      headers: { "x-lang": "en" },
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!response.ok) return [];
    const data = await response.json();
    const services = Array.isArray(data) ? data : data?.data || [];
    return services.map((service: any) => `/services/${service._id}`);
  } catch (error) {
    console.error("Error fetching services for sitemap:", error);
    return [];
  }
}

async function getPortfolios(): Promise<string[]> {
  const API_BASE_URL = getApiBaseUrl();
  try {
    const response = await fetch(`${API_BASE_URL}/api/portfolios/public`, {
      headers: { "x-lang": "en" },
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!response.ok) return [];
    const data = await response.json();
    const portfolios = Array.isArray(data) ? data : data?.data || [];
    return portfolios.map((portfolio: any) => `/portfolio/${portfolio._id}`);
  } catch (error) {
    console.error("Error fetching portfolios for sitemap:", error);
    return [];
  }
}

async function getArticles(): Promise<string[]> {
  const API_BASE_URL = getApiBaseUrl();
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/public`, {
      headers: { "x-lang": "en" },
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!response.ok) return [];
    const data = await response.json();
    const articles = Array.isArray(data) ? data : data?.data || [];
    return articles.map((article: any) => `/articles/${article._id}`);
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://awacyber.com";

  // Static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quote`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
  ];

  // Fetch dynamic routes
  const [serviceRoutes, portfolioRoutes, articleRoutes] = await Promise.all([
    getServices(),
    getPortfolios(),
    getArticles(),
  ]);

  // Dynamic service pages
  const servicePages = serviceRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic portfolio pages
  const portfolioPages = portfolioRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic article pages
  const articlePages = articleRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...servicePages, ...portfolioPages, ...articlePages];
}
