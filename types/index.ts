export type DestinationType =
  | "google_review"
  | "whatsapp"
  | "website"
  | "instagram"
  | "menu"
  | "vcard"
  | "custom";

export type CardStatus = "draft" | "active" | "suspended" | "archived" | "in_stock" | "sold";

export type InventoryStatus =
  | "GENERATED"
  | "PRINTED"
  | "IN_STOCK"
  | "SOLD"
  | "ASSIGNED"
  | "NFC_PROGRAMMED"
  | "TESTED"
  | "ACTIVE"
  | "SUSPENDED"
  | "LOST"
  | "ARCHIVED";

export type BatchStatus = "GENERATED" | "PRINTED" | "IN_STOCK" | "NFC_PROGRAMMED" | "COMPLETED";

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
  category?: string;
  google_review_url: string;
  website_url?: string;
  whatsapp_number?: string;
  instagram_handle?: string;
  brand_color?: string;
  logo_url?: string;
  status: "active" | "inactive";
  branch?: string;
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

export interface CardBatch {
  id: string;
  batch_name: string;
  quantity: number;
  prefix: string;
  product_type: string; // e.g. "NFCFlow CR80 NTAG213"
  business_id?: string;
  status: BatchStatus;
  created_at: string;
  updated_at: string;

  // Computed metrics
  cards_count?: number;
  activated_count?: number;
  in_stock_count?: number;
  sold_count?: number;
}

export interface Card {
  id: string;
  business_id: string;
  slug: string; // e.g. "NF001", "X7k29P"
  name: string; // e.g. "Billing Counter 01"
  destination_type: DestinationType;
  destination_url: string;
  status: CardStatus;
  inventory_status?: InventoryStatus;
  activation_code?: string; // e.g. "8XK4-P9Q2"
  batch_id?: string;
  branch?: string; // e.g. "Pune Branch - Table 1"
  nfc_programmed?: boolean;
  qr_tested?: boolean;
  notes?: string;
  activated_at?: string;
  sold_at?: string;
  programmed_at?: string;
  tested_at?: string;
  created_at: string;
  updated_at: string;

  // Joined fields for display
  business_name?: string;
  batch_name?: string;
  total_scans?: number;
  nfc_scans?: number;
  qr_scans?: number;
}

export interface DestinationHistory {
  id: string;
  card_id: string;
  destination_type: DestinationType;
  destination_url: string;
  changed_at: string;
  changed_by?: string;
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
