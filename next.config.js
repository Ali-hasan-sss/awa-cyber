/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "https",
        hostname: "awacyber.com",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "http",
        hostname: "awacyber.com",
        pathname: "/api/uploads/**",
      },
    ],
    unoptimized: true,
  },
  // Register service worker
  async headers() {
    return [
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
