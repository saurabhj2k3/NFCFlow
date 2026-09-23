/**
 * Validate that a URL is a valid, secure destination (HTTPS or HTTP)
 */
export function isValidDestinationUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    // Only allow http: and https: protocols
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    // Block suspicious localhost/internal redirection in production if needed
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean and format destination URL
 */
export function sanitizeDestinationUrl(url: string): string {
  let cleaned = url.trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}
