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
  if (!url || typeof url !== "string") return "";

  const trimmedUrl = url.trim();

  // Don't modify local paths that start with /
  if (trimmedUrl.startsWith("/") && !trimmedUrl.startsWith("//")) {
    // Local image paths like /images/logo.png - return as is
    if (
      trimmedUrl.startsWith("/images/") ||
      trimmedUrl.startsWith("/_next/") ||
      trimmedUrl.startsWith("/api/")
    ) {
      return trimmedUrl;
    }
  }

  // If already a complete URL
  if (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("//")
  ) {
    let processedUrl = trimmedUrl;

    // Handle protocol-relative URLs (//example.com)
    if (processedUrl.startsWith("//")) {
      processedUrl = "https:" + processedUrl;
    }

    // Convert HTTP + IP to HTTPS + domain (handle all variations)
    if (processedUrl.includes("72.60.208.192")) {
      processedUrl = processedUrl.replace(
        /http:\/\/72\.60\.208\.192/g,
        "https://awacyber.com"
      );
      // Also handle without protocol
      processedUrl = processedUrl.replace(/72\.60\.208\.192/g, "awacyber.com");
    }

    // Convert HTTP domain to HTTPS
    if (
      processedUrl.startsWith("http://awacyber.com") ||
      processedUrl.includes("http://awacyber.com")
    ) {
      processedUrl = processedUrl.replace(/http:\/\//g, "https://");
    }

    // Ensure no HTTP remains for IP addresses
    if (processedUrl.match(/http:\/\/\d+\.\d+\.\d+\.\d+/)) {
      processedUrl = processedUrl.replace(
        /http:\/\/(\d+\.\d+\.\d+\.\d+)/g,
        "https://awacyber.com"
      );
    }

    return processedUrl;
  }

  // Relative URL - prepend API_BASE_URL
  // Ensure API_BASE_URL uses HTTPS in production
  let baseUrl = API_BASE_URL;
  if (typeof window !== "undefined") {
    // In browser, always use HTTPS for production
    baseUrl = baseUrl.replace(/^http:\/\//, "https://");
    // Replace IP with domain in baseUrl
    if (baseUrl.includes("72.60.208.192")) {
      baseUrl = baseUrl.replace(/72\.60\.208\.192/g, "awacyber.com");
    }
  } else {
    // On server, check if we're in production
    if (process.env.NODE_ENV === "production") {
      baseUrl = baseUrl.replace(/^http:\/\//, "https://");
      if (baseUrl.includes("72.60.208.192")) {
        baseUrl = baseUrl.replace(/72\.60\.208\.192/g, "awacyber.com");
      }
    }
  }
  return trimmedUrl.startsWith("/")
    ? `${baseUrl}${trimmedUrl}`
    : `${baseUrl}/${trimmedUrl}`;
}
