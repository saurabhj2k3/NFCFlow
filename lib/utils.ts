import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random short URL-safe slug (6-8 characters)
 * Uses high-entropy alphanumeric characters (avoiding easily confused chars like 0/O, 1/l)
 */
export function generateSlug(length: number = 6): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

/**
 * Format date in friendly human-readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Get base app URL for main website and landing pages (e.g. https://nfcflow.in)
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://nfcflow.in";
}

/**
 * Get base URL specifically for physical NFC cards and QR code redirects
 * Points to https://nfcflow.in or NEXT_PUBLIC_CARD_BASE_URL
 */
export function getCardBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_CARD_BASE_URL) {
    return process.env.NEXT_PUBLIC_CARD_BASE_URL.replace(/\/$/, "");
  }
  return "https://nfcflow.in";
}

/**
 * Construct public redirect URL for a smart card (e.g. https://nfcflow.in/r/WD0100)
 */
export function getCardRedirectUrl(slug: string, source?: "nfc" | "qr"): string {
  const base = getCardBaseUrl();
  const url = `${base}/r/${slug}`;
  return source ? `${url}?source=${source}` : url;
}

