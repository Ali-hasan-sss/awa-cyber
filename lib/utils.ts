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

  // If already a complete URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Convert HTTP + IP to HTTPS + domain
    if (
      url.startsWith("http://72.60.208.192") ||
      url.includes("72.60.208.192")
    ) {
      return url.replace("http://72.60.208.192", "https://awacyber.com");
    }
    // Convert HTTP domain to HTTPS
    if (url.startsWith("http://awacyber.com")) {
      return url.replace("http://", "https://");
    }
    // Already HTTPS, return as is
    return url;
  }

  // Relative URL - prepend API_BASE_URL
  // Ensure API_BASE_URL uses HTTPS in production
  const baseUrl = API_BASE_URL.replace("http://", "https://");
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}
