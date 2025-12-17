import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "./config/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts image URLs from old IP/HTTP format to HTTPS domain format
 * This fixes Mixed Content issues when serving images over HTTPS
 * @param url - The image URL (can be relative, absolute HTTP, or already HTTPS)
 * @returns The converted HTTPS URL with domain
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";

  // Don't modify local paths that start with /
  if (url.startsWith("/") && !url.startsWith("//")) {
    // Local image paths like /images/logo.png - return as is
    if (url.startsWith("/images/") || url.startsWith("/_next/")) {
      return url;
    }
  }

  // If already a complete URL
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  ) {
    // Handle protocol-relative URLs (//example.com)
    if (url.startsWith("//")) {
      url = "https:" + url;
    }

    // Convert HTTP + IP to HTTPS + domain
    if (url.includes("72.60.208.192")) {
      return url.replace(/http:\/\/72\.60\.208\.192/g, "https://awacyber.com");
    }
    // Convert HTTP domain to HTTPS
    if (
      url.startsWith("http://awacyber.com") ||
      url.includes("http://awacyber.com")
    ) {
      return url.replace(/http:\/\//g, "https://");
    }
    // Already HTTPS, return as is
    return url;
  }

  // Relative URL - prepend API_BASE_URL
  // Ensure API_BASE_URL uses HTTPS in production
  let baseUrl = API_BASE_URL;
  if (typeof window !== "undefined") {
    // In browser, always use HTTPS for production
    baseUrl = baseUrl.replace(/^http:\/\//, "https://");
  } else {
    // On server, check if we're in production
    if (process.env.NODE_ENV === "production") {
      baseUrl = baseUrl.replace(/^http:\/\//, "https://");
    }
  }
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}
