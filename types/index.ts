export type DestinationType =
  | "google_review"
  | "whatsapp"
  | "website"
  | "instagram"
  | "custom";

export type CardStatus = "draft" | "active" | "suspended" | "archived";

export type UserRole = "super_admin" | "business_owner" | "manager";

export type ScanSource = "nfc" | "qr" | "direct" | "unknown";

export type DeviceCategory = "android" | "iphone" | "desktop" | "tablet" | "other";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  address?: string;
  google_review_url: string;
  website_url?: string;
  whatsapp_number?: string;
  instagram_handle?: string;
  brand_color?: string;
  logo_url?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface BusinessUser {
  id: string;
  business_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Card {
  id: string;
  business_id: string;
  slug: string; // e.g. "X7k29P"
  name: string; // e.g. "Billing Counter 01"
  destination_type: DestinationType;
  destination_url: string;
  status: CardStatus;
  nfc_programmed?: boolean;
  qr_tested?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Joined fields for display
  business_name?: string;
  total_scans?: number;
  nfc_scans?: number;
  qr_scans?: number;
}

export interface RedirectEvent {
  id: string;
  card_id: string;
  slug: string;
  business_id: string;
  source: ScanSource;
  device_type: DeviceCategory;
  user_agent?: string;
  referrer?: string;
  ip_hash?: string;
  scanned_at: string;
}

export interface AnalyticsSummary {
  total_scans: number;
  today_scans: number;
  week_scans: number;
  month_scans: number;
  nfc_scans: number;
  qr_scans: number;
  device_breakdown: {
    android: number;
    iphone: number;
    desktop: number;
    other: number;
  };
  source_breakdown: {
    nfc: number;
    qr: number;
    direct: number;
  };
  daily_trends: Array<{
    date: string;
    total: number;
    nfc: number;
    qr: number;
  }>;
}
