import { DeviceCategory, ScanSource } from "@/types";

/**
 * Determine device category from user-agent string
 */
export function parseDeviceCategory(userAgent: string | null): DeviceCategory {
  if (!userAgent) return "other";

  const ua = userAgent.toLowerCase();

  // iPad / Tablets
  if (ua.includes("ipad") || (ua.includes("tablet") && !ua.includes("phone"))) {
    return "tablet";
  }

  // iPhone / iOS
  if (ua.includes("iphone") || ua.includes("ipod")) {
    return "iphone";
  }

  // Android
  if (ua.includes("android")) {
    return "android";
  }

  // Desktop OSes (Windows, Mac, Linux)
  if (
    ua.includes("windows nt") ||
    ua.includes("macintosh") ||
    (ua.includes("linux") && !ua.includes("android")) ||
    ua.includes("cros")
  ) {
    return "desktop";
  }

  return "other";
}

/**
 * Parse scan source from query parameter or referrer
 */
export function parseScanSource(
  sourceParam: string | null,
  referrer: string | null
): ScanSource {
  if (sourceParam) {
    const s = sourceParam.toLowerCase();
    if (s === "nfc") return "nfc";
    if (s === "qr") return "qr";
    if (s === "direct") return "direct";
  }

  // If no source param is passed, we default to direct
  return "direct";
}
