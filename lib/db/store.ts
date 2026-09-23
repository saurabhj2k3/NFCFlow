import { AnalyticsSummary, Business, Card, DestinationType, RedirectEvent, User } from "@/types";
import { INITIAL_BUSINESSES, INITIAL_CARDS, INITIAL_USERS, generateSeedScanEvents } from "@/lib/mock-data";
import { getActiveSupabaseClient, isSupabaseConfigured } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

// ==========================================
// LOCAL STORAGE FALLBACK ENGINE
// ==========================================
const LOCAL_DB_DIR = path.join(process.cwd(), "data");
const LOCAL_DB_PATH = path.join(LOCAL_DB_DIR, "store.json");

interface DbData {
  users: User[];
  businesses: Business[];
  cards: Card[];
  events: RedirectEvent[];
}

let inMemoryDb: DbData | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
  } catch {
    // Ignore error in serverless environments
  }
}

function loadDb(): DbData {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  try {
    ensureDataDir();
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      inMemoryDb = JSON.parse(content);
      if (inMemoryDb && Array.isArray(inMemoryDb.cards) && inMemoryDb.cards.length > 0) {
        return inMemoryDb;
      }
    }
  } catch (err) {
    console.warn("Failed reading local DB file, initializing default seed data:", err);
  }

  // Initialize with seed data
  inMemoryDb = {
    users: [...INITIAL_USERS],
    businesses: [...INITIAL_BUSINESSES],
    cards: [...INITIAL_CARDS],
    events: generateSeedScanEvents(),
  };

  saveDb();
  return inMemoryDb;
}

function saveDb(): void {
  if (!inMemoryDb) return;
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(inMemoryDb, null, 2), "utf-8");
  } catch {
    // In read-only serverless environment, memory cache is maintained
  }
}

// ==========================================
// BUSINESS OPERATIONS
// ==========================================

export async function getBusinesses(): Promise<Business[]> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("businesses")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data as Business[];
        }
        console.warn("Supabase getBusinesses error, falling back to local storage:", error?.message);
      } catch (e) {
        console.warn("Supabase query failed, using local storage fallback:", e);
      }
    }
  }

  const db = loadDb();
  return db.businesses;
}

export async function getBusinessById(id: string): Promise<Business | null> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("businesses")
          .select("*")
          .or(`id.eq.${id},slug.eq.${id}`)
          .maybeSingle();

        if (!error && data) {
          return data as Business;
        }
      } catch (e) {
        console.warn("Supabase getBusinessById failed:", e);
      }
    }
  }

  const db = loadDb();
  return db.businesses.find((b) => b.id === id || b.slug === id) || null;
}

export async function createBusiness(input: Omit<Business, "id" | "created_at" | "updated_at">): Promise<Business> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("businesses")
          .insert({
            name: input.name,
            slug: input.slug,
            phone: input.phone || null,
            email: input.email || null,
            address: input.address || null,
            google_review_url: input.google_review_url,
            website_url: input.website_url || null,
            whatsapp_number: input.whatsapp_number || null,
            instagram_handle: input.instagram_handle || null,
            brand_color: input.brand_color || "#4f46e5",
            logo_url: input.logo_url || null,
            status: input.status || "active",
          })
          .select()
          .single();

        if (!error && data) {
          return data as Business;
        }
        console.warn("Supabase createBusiness error, saving locally:", error?.message);
      } catch (e) {
        console.warn("Supabase createBusiness exception:", e);
      }
    }
  }

  const db = loadDb();
  const newBiz: Business = {
    ...input,
    id: `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.businesses.unshift(newBiz);
  saveDb();
  return newBiz;
}

export async function updateBusiness(id: string, updates: Partial<Business>): Promise<Business | null> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("businesses")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .maybeSingle();

        if (!error && data) {
          return data as Business;
        }
      } catch (e) {
        console.warn("Supabase updateBusiness exception:", e);
      }
    }
  }

  const db = loadDb();
  const index = db.businesses.findIndex((b) => b.id === id);
  if (index === -1) return null;

  db.businesses[index] = {
    ...db.businesses[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveDb();
  return db.businesses[index];
}

export async function deleteBusiness(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from("businesses").delete().eq("id", id);
        if (!error) return true;
      } catch (e) {
        console.warn("Supabase deleteBusiness exception:", e);
      }
    }
  }

  const db = loadDb();
  const initialLength = db.businesses.length;
  db.businesses = db.businesses.filter((b) => b.id !== id);
  db.cards = db.cards.filter((c) => c.business_id !== id);
  db.events = db.events.filter((e) => e.business_id !== id);
  saveDb();
  return db.businesses.length < initialLength;
}

// ==========================================
// CARD OPERATIONS
// ==========================================

export async function getCards(businessId?: string): Promise<Card[]> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        let query = client
          .from("cards")
          .select("*, businesses(name)")
          .order("created_at", { ascending: false });

        if (businessId && businessId !== "all") {
          query = query.eq("business_id", businessId);
        }

        const { data: cardsData, error: cardsError } = await query;

        if (!cardsError && cardsData) {
          // Fetch event counts for aggregated totals
          const { data: eventsData } = await client
            .from("redirect_events")
            .select("card_id, slug, source");

          const eventsList = (eventsData || []) as Array<{ card_id: string; slug: string; source: string }>;

          return cardsData.map((c: any) => {
            const cardEvents = eventsList.filter(
              (e) => e.card_id === c.id || (e.slug && e.slug.toLowerCase() === c.slug.toLowerCase())
            );
            return {
              ...c,
              business_name: c.businesses?.name || "Business Location",
              total_scans: cardEvents.length,
              nfc_scans: cardEvents.filter((e) => e.source === "nfc").length,
              qr_scans: cardEvents.filter((e) => e.source === "qr").length,
            };
          });
        }
      } catch (e) {
        console.warn("Supabase getCards exception:", e);
      }
    }
  }

  const db = loadDb();
  let cards = db.cards;
  if (businessId && businessId !== "all") {
    cards = cards.filter((c) => c.business_id === businessId);
  }

  return cards.map((c) => {
    const biz = db.businesses.find((b) => b.id === c.business_id);
    const cardEvents = db.events.filter((e) => e.card_id === c.id || e.slug.toLowerCase() === c.slug.toLowerCase());
    const nfcScans = cardEvents.filter((e) => e.source === "nfc").length;
    const qrScans = cardEvents.filter((e) => e.source === "qr").length;

    return {
      ...c,
      business_name: biz ? biz.name : "Unknown Business",
      total_scans: cardEvents.length,
      nfc_scans: nfcScans,
      qr_scans: qrScans,
    };
  });
}

export async function getCardBySlug(slug: string): Promise<Card | null> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("cards")
          .select("*, businesses(name)")
          .ilike("slug", slug)
          .maybeSingle();

        if (!error && data) {
          const { data: eventsData } = await client
            .from("redirect_events")
            .select("source")
            .or(`card_id.eq.${data.id},slug.ilike.${slug}`);

          const cardEvents = (eventsData || []) as Array<{ source: string }>;

          return {
            ...data,
            business_name: data.businesses?.name || "Business Location",
            total_scans: cardEvents.length,
            nfc_scans: cardEvents.filter((e) => e.source === "nfc").length,
            qr_scans: cardEvents.filter((e) => e.source === "qr").length,
          };
        }
      } catch (e) {
        console.warn("Supabase getCardBySlug exception:", e);
      }
    }
  }

  const db = loadDb();
  const card = db.cards.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
  if (!card) return null;

  const biz = db.businesses.find((b) => b.id === card.business_id);
  const cardEvents = db.events.filter((e) => e.card_id === card.id || e.slug.toLowerCase() === slug.toLowerCase());

  return {
    ...card,
    business_name: biz ? biz.name : "Unknown Business",
    total_scans: cardEvents.length,
    nfc_scans: cardEvents.filter((e) => e.source === "nfc").length,
    qr_scans: cardEvents.filter((e) => e.source === "qr").length,
  };
}

export async function getCardById(id: string): Promise<Card | null> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("cards")
          .select("*, businesses(name)")
          .or(`id.eq.${id},slug.ilike.${id}`)
          .maybeSingle();

        if (!error && data) {
          const { data: eventsData } = await client
            .from("redirect_events")
            .select("source")
            .or(`card_id.eq.${data.id},slug.ilike.${data.slug}`);

          const cardEvents = (eventsData || []) as Array<{ source: string }>;

          return {
            ...data,
            business_name: data.businesses?.name || "Business Location",
            total_scans: cardEvents.length,
            nfc_scans: cardEvents.filter((e) => e.source === "nfc").length,
            qr_scans: cardEvents.filter((e) => e.source === "qr").length,
          };
        }
      } catch (e) {
        console.warn("Supabase getCardById exception:", e);
      }
    }
  }

  const db = loadDb();
  const card = db.cards.find((c) => c.id === id || c.slug.toLowerCase() === id.toLowerCase()) || null;
  if (!card) return null;

  const biz = db.businesses.find((b) => b.id === card.business_id);
  const cardEvents = db.events.filter((e) => e.card_id === card.id);

  return {
    ...card,
    business_name: biz ? biz.name : "Unknown Business",
    total_scans: cardEvents.length,
    nfc_scans: cardEvents.filter((e) => e.source === "nfc").length,
    qr_scans: cardEvents.filter((e) => e.source === "qr").length,
  };
}

export async function createCard(input: {
  business_id: string;
  slug: string;
  name: string;
  destination_type: DestinationType;
  destination_url: string;
  status?: Card["status"];
  notes?: string;
}): Promise<Card> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("cards")
          .insert({
            business_id: input.business_id,
            slug: input.slug,
            name: input.name,
            destination_type: input.destination_type,
            destination_url: input.destination_url,
            status: input.status || "draft",
            nfc_programmed: false,
            qr_tested: false,
            notes: input.notes || null,
          })
          .select()
          .single();

        if (!error && data) {
          return data as Card;
        }
        if (error && error.code === "23505") {
          throw new Error(`Card slug '${input.slug}' is already in use. Please choose another.`);
        }
      } catch (e: any) {
        if (e.message?.includes("already in use")) throw e;
        console.warn("Supabase createCard exception:", e);
      }
    }
  }

  const db = loadDb();

  // Check slug collision
  const existing = db.cards.find((c) => c.slug.toLowerCase() === input.slug.toLowerCase());
  if (existing) {
    throw new Error(`Card slug '${input.slug}' is already in use. Please choose another.`);
  }

  const newCard: Card = {
    id: `crd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    business_id: input.business_id,
    slug: input.slug,
    name: input.name,
    destination_type: input.destination_type,
    destination_url: input.destination_url,
    status: input.status || "draft",
    nfc_programmed: false,
    qr_tested: false,
    notes: input.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.cards.unshift(newCard);
  saveDb();
  return newCard;
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<Card | null> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("cards")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${id},slug.ilike.${id}`)
          .select()
          .maybeSingle();

        if (!error && data) {
          return data as Card;
        }
      } catch (e) {
        console.warn("Supabase updateCard exception:", e);
      }
    }
  }

  const db = loadDb();
  const index = db.cards.findIndex((c) => c.id === id || c.slug.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  db.cards[index] = {
    ...db.cards[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveDb();
  return db.cards[index];
}

export async function deleteCard(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from("cards").delete().or(`id.eq.${id},slug.ilike.${id}`);
        if (!error) return true;
      } catch (e) {
        console.warn("Supabase deleteCard exception:", e);
      }
    }
  }

  const db = loadDb();
  const initialLength = db.cards.length;
  db.cards = db.cards.filter((c) => c.id !== id && c.slug.toLowerCase() !== id.toLowerCase());
  saveDb();
  return db.cards.length < initialLength;
}

// ==========================================
// REDIRECT EVENT & SCAN LOGGING
// ==========================================

export async function recordScanEvent(event: Omit<RedirectEvent, "id">): Promise<RedirectEvent> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("redirect_events")
          .insert({
            card_id: event.card_id,
            slug: event.slug,
            business_id: event.business_id,
            source: event.source,
            device_type: event.device_type,
            user_agent: event.user_agent || null,
            referrer: event.referrer || null,
            ip_hash: event.ip_hash || null,
            scanned_at: event.scanned_at || new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          return data as RedirectEvent;
        }
      } catch (e) {
        console.warn("Supabase recordScanEvent exception:", e);
      }
    }
  }

  const db = loadDb();
  const newEvent: RedirectEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };

  db.events.unshift(newEvent);
  saveDb();
  return newEvent;
}

export async function getScanEvents(params?: {
  business_id?: string;
  card_id?: string;
  limit?: number;
}): Promise<RedirectEvent[]> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        let query = client
          .from("redirect_events")
          .select("*")
          .order("scanned_at", { ascending: false });

        if (params?.business_id && params.business_id !== "all") {
          query = query.eq("business_id", params.business_id);
        }

        if (params?.card_id && params.card_id !== "all") {
          query = query.or(`card_id.eq.${params.card_id},slug.ilike.${params.card_id}`);
        }

        if (params?.limit) {
          query = query.limit(params.limit);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as RedirectEvent[];
        }
      } catch (e) {
        console.warn("Supabase getScanEvents exception:", e);
      }
    }
  }

  const db = loadDb();
  let events = db.events;

  if (params?.business_id && params.business_id !== "all") {
    events = events.filter((e) => e.business_id === params.business_id);
  }

  if (params?.card_id && params.card_id !== "all") {
    events = events.filter((e) => e.card_id === params.card_id || e.slug.toLowerCase() === params.card_id?.toLowerCase());
  }

  if (params?.limit) {
    events = events.slice(0, params.limit);
  }

  return events;
}

// ==========================================
// ANALYTICS AGGREGATIONS
// ==========================================

export async function getAnalyticsSummary(businessId?: string, cardId?: string): Promise<AnalyticsSummary> {
  const events = await getScanEvents({ business_id: businessId, card_id: cardId });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = now.getTime() - 7 * 86400000;
  const monthAgo = now.getTime() - 30 * 86400000;

  let todayScans = 0;
  let weekScans = 0;
  let monthScans = 0;
  let nfcScans = 0;
  let qrScans = 0;
  let directScans = 0;

  const deviceBreakdown = {
    android: 0,
    iphone: 0,
    desktop: 0,
    other: 0,
  };

  // 14-day timeline map
  const dailyMap: { [dateStr: string]: { total: number; nfc: number; qr: number } } = {};
  for (let d = 13; d >= 0; d--) {
    const dt = new Date(now.getTime() - d * 86400000);
    const key = dt.toISOString().split("T")[0];
    dailyMap[key] = { total: 0, nfc: 0, qr: 0 };
  }

  events.forEach((ev) => {
    const scanTime = new Date(ev.scanned_at).getTime();

    if (scanTime >= todayStart) todayScans++;
    if (scanTime >= weekAgo) weekScans++;
    if (scanTime >= monthAgo) monthScans++;

    if (ev.source === "nfc") nfcScans++;
    else if (ev.source === "qr") qrScans++;
    else directScans++;

    const dev = ev.device_type;
    if (dev === "android") deviceBreakdown.android++;
    else if (dev === "iphone" || dev === "tablet") deviceBreakdown.iphone++;
    else if (dev === "desktop") deviceBreakdown.desktop++;
    else deviceBreakdown.other++;

    const dayKey = ev.scanned_at.split("T")[0];
    if (dailyMap[dayKey]) {
      dailyMap[dayKey].total++;
      if (ev.source === "nfc") dailyMap[dayKey].nfc++;
      if (ev.source === "qr") dailyMap[dayKey].qr++;
    }
  });

  const daily_trends = Object.entries(dailyMap).map(([date, counts]) => ({
    date,
    total: counts.total,
    nfc: counts.nfc,
    qr: counts.qr,
  }));

  return {
    total_scans: events.length,
    today_scans: todayScans,
    week_scans: weekScans,
    month_scans: monthScans,
    nfc_scans: nfcScans,
    qr_scans: qrScans,
    device_breakdown: deviceBreakdown,
    source_breakdown: {
      nfc: nfcScans,
      qr: qrScans,
      direct: directScans,
    },
    daily_trends,
  };
}
