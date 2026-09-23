import { Business, Card, RedirectEvent, User } from "@/types";

export const INITIAL_USERS: User[] = [
  {
    id: "usr_superadmin",
    email: "admin@nfcflow.in",
    name: "Platform Administrator",
    role: "super_admin",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "usr_swasthya_owner",
    email: "owner@swasthyamedical.com",
    name: "Dr. Rajesh Sharma",
    role: "business_owner",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "usr_swasthya_mgr",
    email: "manager@swasthyamedical.com",
    name: "Amit Patil",
    role: "manager",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: "biz_swasthya_medical",
    name: "Swasthya Medical & General Store",
    slug: "swasthya-medical",
    phone: "+91 98765 43210",
    email: "contact@swasthyamedical.in",
    address: "Shop 4, Phoenix Complex, Viman Nagar, Pune, Maharashtra 411014",
    google_review_url: "https://g.page/r/CbXx_swasthya_review/review",
    website_url: "https://swasthyamedical.in",
    whatsapp_number: "919876543210",
    instagram_handle: "swasthyamedical",
    brand_color: "#059669",
    status: "active",
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "biz_artisan_brew",
    name: "Artisan Brew Specialty Cafe",
    slug: "artisan-brew",
    phone: "+91 91234 56780",
    email: "hello@artisanbrew.com",
    address: "12 Lane 6, Koregaon Park, Pune, Maharashtra 411001",
    google_review_url: "https://g.page/r/CdYy_artisan_review/review",
    website_url: "https://artisanbrew.in",
    whatsapp_number: "919123456780",
    instagram_handle: "artisanbrewcafe",
    brand_color: "#d97706",
    status: "active",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "biz_glamour_salon",
    name: "Glamour Luxe Hair & Spa Lounge",
    slug: "glamour-luxe",
    phone: "+91 99887 76655",
    email: "info@glamourluxe.com",
    address: "Galleria Mall, 2nd Floor, FC Road, Pune 411004",
    google_review_url: "https://g.page/r/CeZz_glamour_review/review",
    website_url: "https://glamourluxe.com",
    whatsapp_number: "919988776655",
    instagram_handle: "glamourluxepune",
    brand_color: "#ec4899",
    status: "active",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_CARDS: Card[] = [
  {
    id: "crd_1",
    business_id: "biz_swasthya_medical",
    slug: "X7k29P",
    name: "Billing Counter 01 (Front Entrance)",
    destination_type: "google_review",
    destination_url: "https://g.page/r/CbXx_swasthya_review/review",
    status: "active",
    nfc_programmed: true,
    qr_tested: true,
    notes: "Main acrylic counter display with NTAG213 PVC Card",
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "crd_2",
    business_id: "biz_swasthya_medical",
    slug: "MED002",
    name: "Prescription Delivery Counter",
    destination_type: "whatsapp",
    destination_url: "https://wa.me/919876543210?text=Hello%20Swasthya%20Medical%2C%20I%20want%20to%20order%20medicines",
    status: "active",
    nfc_programmed: true,
    qr_tested: true,
    notes: "Direct WhatsApp ordering card",
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "crd_3",
    business_id: "biz_swasthya_medical",
    slug: "MED003",
    name: "Consultation & Health Desk",
    destination_type: "google_review",
    destination_url: "https://g.page/r/CbXx_swasthya_review/review",
    status: "draft",
    nfc_programmed: false,
    qr_tested: false,
    notes: "Waiting for physical PVC card delivery",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "crd_4",
    business_id: "biz_artisan_brew",
    slug: "BREW01",
    name: "Coffee Counter Standee",
    destination_type: "google_review",
    destination_url: "https://g.page/r/CdYy_artisan_review/review",
    status: "active",
    nfc_programmed: true,
    qr_tested: true,
    notes: "Wood-mounted NFC review card at pickup point",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "crd_5",
    business_id: "biz_glamour_salon",
    slug: "GLAM01",
    name: "Styling Station #3",
    destination_type: "instagram",
    destination_url: "https://instagram.com/glamourluxepune",
    status: "active",
    nfc_programmed: true,
    qr_tested: true,
    notes: "Mirror sticker NFC card",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

// Generate realistic historical scan events for testing analytics charts
export function generateSeedScanEvents(): RedirectEvent[] {
  const events: RedirectEvent[] = [];
  const sources = ["nfc", "nfc", "qr", "qr", "nfc", "qr", "direct"] as const;
  const devices = ["android", "android", "iphone", "iphone", "iphone", "desktop", "other"] as const;

  const cards = [
    { card_id: "crd_1", slug: "X7k29P", business_id: "biz_swasthya_medical", weight: 60 },
    { card_id: "crd_2", slug: "MED002", business_id: "biz_swasthya_medical", weight: 25 },
    { card_id: "crd_4", slug: "BREW01", business_id: "biz_artisan_brew", weight: 45 },
    { card_id: "crd_5", slug: "GLAM01", business_id: "biz_glamour_salon", weight: 30 },
  ];

  const now = Date.now();

  for (let day = 30; day >= 0; day--) {
    const dayTimestamp = now - day * 86400000;
    // Vary scans with realistic weekend/weekday patterns
    const isWeekend = new Date(dayTimestamp).getDay() === 0 || new Date(dayTimestamp).getDay() === 6;
    const baseCount = isWeekend ? 35 : 22;

    cards.forEach((card) => {
      const count = Math.max(2, Math.floor((baseCount * card.weight) / 50 + (Math.random() * 8 - 4)));
      for (let i = 0; i < count; i++) {
        const randomHour = Math.floor(Math.random() * 14) + 9; // between 9 AM and 11 PM
        const randomMinute = Math.floor(Math.random() * 60);
        const eventDate = new Date(dayTimestamp);
        eventDate.setHours(randomHour, randomMinute, Math.floor(Math.random() * 60));

        events.push({
          id: `evt_${events.length + 1}`,
          card_id: card.card_id,
          slug: card.slug,
          business_id: card.business_id,
          source: sources[Math.floor(Math.random() * sources.length)],
          device_type: devices[Math.floor(Math.random() * devices.length)],
          scanned_at: eventDate.toISOString(),
          user_agent: "Mozilla/5.0 (Mobile Sample Device)",
          referrer: "Direct NFC Tap / QR Scanner",
        });
      }
    });
  }

  return events;
}
