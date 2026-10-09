import { AnalyticsSummary, BatchStatus, Business, Card, CardBatch, CardDailyAnalytics, CardPurpose, DestinationType, InventoryStatus, RedirectEvent, User } from "@/types";
import { INITIAL_BATCHES, INITIAL_BUSINESSES, INITIAL_CARDS, INITIAL_USERS, generateSeedScanEvents } from "@/lib/mock-data";
import { getActiveSupabaseClient, isSupabaseConfigured } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// ==========================================
// LOCAL STORAGE & SERVERLESS HYBRID ENGINE
// ==========================================
const LOCAL_DB_DIR = path.join(process.cwd(), "data");
const LOCAL_DB_PATH = path.join(LOCAL_DB_DIR, "store.json");
const TMP_DB_PATH = path.join("/tmp", "nfcflow_store.json");

interface DbData {
  users: User[];
  businesses: Business[];
  cards: Card[];
  batches: CardBatch[];
  events: RedirectEvent[];
  daily_analytics?: CardDailyAnalytics[];
}

let inMemoryDb: DbData | null = null;

export function generateActivationCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 32 characters, no ambiguous 0, O, 1, I
  let p1 = "";
  let p2 = "";
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${p1}-${p2}`;
}

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
  try {
    // 1. Try reading from writable /tmp store first
    if (fs.existsSync(TMP_DB_PATH)) {
      const content = fs.readFileSync(TMP_DB_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.cards)) {
        inMemoryDb = {
          users: parsed.users || [],
          businesses: parsed.businesses || [],
          cards: parsed.cards || [],
          batches: parsed.batches || [],
          events: parsed.events || [],
          daily_analytics: parsed.daily_analytics || [],
        };
        return inMemoryDb;
      }
    }
  } catch {
    // Fallthrough
  }

  try {
    // 2. Try reading from bundled LOCAL_DB_PATH
    ensureDataDir();
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.cards)) {
        inMemoryDb = {
          users: parsed.users || [],
          businesses: parsed.businesses || [],
          cards: parsed.cards || [],
          batches: parsed.batches || [],
          events: parsed.events || [],
          daily_analytics: parsed.daily_analytics || [],
        };
        return inMemoryDb;
      }
    }
  } catch (err) {
    console.warn("Failed reading local DB file:", err);
  }

  if (inMemoryDb) {
    return inMemoryDb;
  }

  inMemoryDb = {
    users: [],
    businesses: [],
    cards: [],
    batches: [],
    events: [],
    daily_analytics: [],
  };

  saveDb();
  return inMemoryDb;
}

function saveDb(): void {
  if (!inMemoryDb) return;
  const dataStr = JSON.stringify(inMemoryDb, null, 2);

  // Try writing to local repo directory (development)
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_DB_PATH, dataStr, "utf-8");
  } catch {
    // Read-only serverless filesystem
  }

  // Try writing to /tmp directory (production serverless / Vercel container persistence)
  try {
    fs.writeFileSync(TMP_DB_PATH, dataStr, "utf-8");
  } catch {
    // In read-only serverless environment, memory cache is maintained
  }
}

// Helper to sanitize destination type for legacy Supabase check constraints
function sanitizeSupabaseDestinationType(type: DestinationType): string {
  if (type === "menu" || type === "vcard") {
    return "website";
  }
  return type;
}

// Helper to parse embedded tags from notes
function parseCardNotes(notes?: string | null): {
  activationCode?: string;
  batchId?: string;
  inventoryStatus?: InventoryStatus;
  branch?: string;
  originalType?: DestinationType;
  cardPurpose?: CardPurpose;
} {
  if (!notes) return {};
  const codeMatch = notes.match(/\[CODE:([A-Z0-9-]+)\]/i);
  const batchMatch = notes.match(/\[BATCH:([^\]]+)\]/i);
  const statusMatch = notes.match(/\[STATUS:([^\]]+)\]/i);
  const branchMatch = notes.match(/\[BRANCH:([^\]]+)\]/i);
  const typeMatch = notes.match(/\[TYPE:([^\]]+)\]/i);
  const purposeMatch = notes.match(/\[PURPOSE:([^\]]+)\]/i);

  return {
    activationCode: codeMatch ? codeMatch[1] : undefined,
    batchId: batchMatch ? batchMatch[1] : undefined,
    inventoryStatus: statusMatch ? (statusMatch[1] as InventoryStatus) : undefined,
    branch: branchMatch ? branchMatch[1] : undefined,
    originalType: typeMatch ? (typeMatch[1] as DestinationType) : undefined,
    cardPurpose: purposeMatch ? (purposeMatch[1] as CardPurpose) : (typeMatch ? (typeMatch[1] as CardPurpose) : undefined),
  };
}

// ==========================================
// BUSINESS OPERATIONS
// ==========================================

export const SYSTEM_UNASSIGNED_BUSINESS_ID = "00000000-0000-0000-0000-000000000000";

async function ensureSystemInventoryBusiness(client: any): Promise<void> {
  try {
    const { data } = await client
      .from("businesses")
      .select("id")
      .eq("id", SYSTEM_UNASSIGNED_BUSINESS_ID)
      .maybeSingle();

    if (!data) {
      await client.from("businesses").insert({
        id: SYSTEM_UNASSIGNED_BUSINESS_ID,
        name: "Unassigned Inventory Warehouse",
        slug: "unassigned-warehouse",
        google_review_url: "https://google.com",
        status: "active",
      });
    }
  } catch (err) {
    // Ignore error
  }
}

export async function getBusinesses(): Promise<Business[]> {
  const db = loadDb();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("businesses")
          .select("*")
          .neq("id", SYSTEM_UNASSIGNED_BUSINESS_ID)
          .neq("slug", "unassigned-warehouse")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data as Business[];
        }
      } catch (e) {
        console.warn("Supabase query failed, using local storage fallback:", e);
      }
    }
  }

  return [...db.businesses].filter(
    (b) => b.id !== SYSTEM_UNASSIGNED_BUSINESS_ID && b.slug !== "unassigned-warehouse"
  );
}

export async function getBusinessById(id: string): Promise<Business | null> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const query = isUuid
          ? client.from("businesses").select("*").or(`id.eq.${id},slug.eq.${id}`).maybeSingle()
          : client.from("businesses").select("*").eq("slug", id).maybeSingle();

        const { data, error } = await query;

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
  const db = loadDb();
  const validUuid = crypto.randomUUID();
  const newBusiness: Business = {
    ...input,
    id: validUuid,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("businesses")
          .insert({
            id: validUuid,
            name: input.name,
            slug: input.slug,
            phone: input.phone || null,
            email: input.email || null,
            address: input.address || null,
            google_review_url: input.google_review_url || "",
            website_url: input.website_url || null,
            whatsapp_number: input.whatsapp_number || null,
            instagram_handle: input.instagram_handle || null,
            brand_color: input.brand_color || "#059669",
            logo_url: input.logo_url || null,
            status: input.status || "active",
          })
          .select()
          .single();

        if (!error && data) {
          db.businesses.unshift({ ...newBusiness, ...data });
          saveDb();
          return { ...newBusiness, ...data };
        }
      } catch (e) {
        console.warn("Supabase createBusiness exception:", e);
      }
    }
  }

  db.businesses.unshift(newBusiness);
  saveDb();
  return newBusiness;
}

export async function updateBusiness(id: string, updates: Partial<Business>): Promise<Business | null> {
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const query = isUuid
          ? client.from("businesses").update({ ...updates, updated_at: new Date().toISOString() }).or(`id.eq.${id},slug.eq.${id}`).select().maybeSingle()
          : client.from("businesses").update({ ...updates, updated_at: new Date().toISOString() }).eq("slug", id).select().maybeSingle();

        const { data, error } = await query;

        if (!error && data) {
          const db = loadDb();
          const idx = db.businesses.findIndex((b) => b.id === id || b.slug === id);
          if (idx !== -1) {
            db.businesses[idx] = data as Business;
            saveDb();
          }
          return data as Business;
        }
      } catch (e) {
        console.warn("Supabase updateBusiness exception:", e);
      }
    }
  }

  const db = loadDb();
  const index = db.businesses.findIndex((b) => b.id === id || b.slug === id);
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
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          await client.from("businesses").delete().or(`id.eq.${id},slug.eq.${id}`);
        } else {
          await client.from("businesses").delete().eq("slug", id);
        }
      } catch (e) {
        console.warn("Supabase deleteBusiness exception:", e);
      }
    }
  }

  const db = loadDb();
  const initialLength = db.businesses.length;
  db.businesses = db.businesses.filter((b) => b.id !== id && b.slug !== id);
  db.cards = db.cards.filter((c) => c.business_id !== id);
  db.events = db.events.filter((e) => e.business_id !== id);
  saveDb();
  return db.businesses.length < initialLength;
}

// ==========================================
// CARD OPERATIONS & HYBRID RETRIEVAL
// ==========================================

export async function getCards(
  paramsOrBusinessId?: string | { business_id?: string; batch_id?: string }
): Promise<Card[]> {
  const businessId =
    typeof paramsOrBusinessId === "string"
      ? paramsOrBusinessId
      : paramsOrBusinessId?.business_id;
  const batchId =
    typeof paramsOrBusinessId === "object"
      ? paramsOrBusinessId?.batch_id
      : undefined;

  const db = loadDb();
  let allCards: Card[] = [...db.cards];

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        let query = client
          .from("cards")
          .select("*, businesses(name)")
          .order("created_at", { ascending: false });

        const { data: cardsData, error: cardsError } = await query;

        if (!cardsError && cardsData) {
          const { data: eventsData } = await client
            .from("redirect_events")
            .select("card_id, slug, source");

          const eventsList = (eventsData || []) as Array<{ card_id: string; slug: string; source: string }>;

          allCards = cardsData.map((c: any) => {
            const cardEvents = eventsList.filter(
              (e) => e.card_id === c.id || (e.slug && e.slug.toLowerCase() === c.slug.toLowerCase())
            );
            const parsedNotes = parseCardNotes(c.notes);

            return {
              ...c,
              activation_code: c.activation_code || parsedNotes.activationCode,
              batch_id: c.batch_id || parsedNotes.batchId,
              card_purpose: c.card_purpose || parsedNotes.cardPurpose || (c.destination_type === "custom" ? "universal" : c.destination_type) || "google_review",
              inventory_status: c.status === "active" ? (c.inventory_status || parsedNotes.inventoryStatus || "ACTIVE") : (c.status === "suspended" ? "GENERATED" : c.inventory_status || parsedNotes.inventoryStatus || "GENERATED"),
              branch: c.branch || parsedNotes.branch,
              destination_type: parsedNotes.originalType || c.destination_type,
              business_name: c.businesses?.name || "Business Location",
              total_scans: cardEvents.length,
              nfc_scans: cardEvents.filter((e) => e.source === "nfc").length,
              qr_scans: cardEvents.filter((e) => e.source === "qr").length,
            };
          });
        }
      } catch (e) {
        console.warn("Supabase getCards exception, using local store:", e);
      }
    }
  }

  let filtered = allCards;
  if (businessId && businessId !== "all") {
    filtered = filtered.filter((c) => c.business_id === businessId);
  }
  if (batchId && batchId !== "all") {
    filtered = filtered.filter((c) => c.batch_id === batchId);
  }

  return filtered.map((c) => {
    const biz = db.businesses.find((b) => b.id === c.business_id);
    const batch = db.batches?.find((b) => b.id === c.batch_id);
    const cardEvents = db.events.filter((e) => e.card_id === c.id || e.slug.toLowerCase() === c.slug.toLowerCase());
    const nfcScans = c.nfc_scans ?? cardEvents.filter((e) => e.source === "nfc").length;
    const qrScans = c.qr_scans ?? cardEvents.filter((e) => e.source === "qr").length;

    return {
      ...c,
      business_name: c.business_name || (biz ? biz.name : (c.business_id ? "Unknown Business" : "Unassigned / Marketplace")),
      batch_name: batch ? batch.batch_name : undefined,
      total_scans: c.total_scans ?? cardEvents.length,
      nfc_scans: nfcScans,
      qr_scans: qrScans,
    };
  });
}

export async function getCardBySlug(slug: string): Promise<Card | null> {
  const cleanSlug = (slug || "").trim().toLowerCase();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("cards")
          .select("*, businesses(name)")
          .ilike("slug", cleanSlug)
          .maybeSingle();

        if (!error && data) {
          const { data: eventsData } = await client
            .from("redirect_events")
            .select("source")
            .or(`card_id.eq.${data.id},slug.ilike.${cleanSlug}`);

          const cardEvents = (eventsData || []) as Array<{ source: string }>;
          const parsedNotes = parseCardNotes(data.notes);

          return {
            ...data,
            activation_code: data.activation_code || parsedNotes.activationCode,
            batch_id: data.batch_id || parsedNotes.batchId,
            card_purpose: data.card_purpose || parsedNotes.cardPurpose || (data.destination_type === "custom" ? "universal" : data.destination_type) || "google_review",
            inventory_status: data.status === "active" ? (data.inventory_status || parsedNotes.inventoryStatus || "ACTIVE") : (data.status === "suspended" ? "GENERATED" : data.inventory_status || parsedNotes.inventoryStatus || "GENERATED"),
            branch: data.branch || parsedNotes.branch,
            destination_type: parsedNotes.originalType || data.destination_type,
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
  const card = db.cards.find((c) => c.slug.toLowerCase() === cleanSlug) || null;
  if (!card) return null;

  const biz = db.businesses.find((b) => b.id === card.business_id);
  const batch = db.batches?.find((b) => b.id === card.batch_id);
  const cardEvents = db.events.filter((e) => e.card_id === card.id || e.slug.toLowerCase() === card.slug.toLowerCase());

  return {
    ...card,
    business_name: biz ? biz.name : (card.business_id ? "Unknown Business" : "Unassigned / Marketplace"),
    batch_name: batch ? batch.batch_name : undefined,
    total_scans: cardEvents.length,
    nfc_scans: cardEvents.filter((e) => e.source === "nfc").length,
    qr_scans: cardEvents.filter((e) => e.source === "qr").length,
  };
}

export async function getCardById(id: string): Promise<Card | null> {
  const cleanId = (id || "").trim().toLowerCase();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
        const query = isUuid
          ? client.from("cards").select("*, businesses(name)").or(`id.eq.${cleanId},slug.ilike.${cleanId}`).maybeSingle()
          : client.from("cards").select("*, businesses(name)").ilike("slug", cleanId).maybeSingle();

        const { data, error } = await query;

        if (!error && data) {
          const { data: eventsData } = await client
            .from("redirect_events")
            .select("source")
            .or(`card_id.eq.${data.id},slug.ilike.${cleanId}`);

          const cardEvents = (eventsData || []) as Array<{ source: string }>;
          const parsedNotes = parseCardNotes(data.notes);

          return {
            ...data,
            activation_code: data.activation_code || parsedNotes.activationCode,
            batch_id: data.batch_id || parsedNotes.batchId,
            card_purpose: data.card_purpose || parsedNotes.cardPurpose || (data.destination_type === "custom" ? "universal" : data.destination_type) || "google_review",
            inventory_status: data.status === "active" ? (data.inventory_status || parsedNotes.inventoryStatus || "ACTIVE") : (data.status === "suspended" ? "GENERATED" : data.inventory_status || parsedNotes.inventoryStatus || "GENERATED"),
            branch: data.branch || parsedNotes.branch,
            destination_type: parsedNotes.originalType || data.destination_type,
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
  const card = db.cards.find((c) => c.id === cleanId || c.slug.toLowerCase() === cleanId) || null;
  if (!card) return null;

  const biz = db.businesses.find((b) => b.id === card.business_id);
  const batch = db.batches?.find((b) => b.id === card.batch_id);
  const cardEvents = db.events.filter((e) => e.card_id === card.id || e.slug.toLowerCase() === card.slug.toLowerCase());

  return {
    ...card,
    business_name: biz ? biz.name : (card.business_id ? "Unknown Business" : "Unassigned / Marketplace"),
    batch_name: batch ? batch.batch_name : undefined,
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
  inventory_status?: InventoryStatus;
  activation_code?: string;
  batch_id?: string;
  branch?: string;
  notes?: string;
}): Promise<Card> {
  const db = loadDb();
  const cardUuid = crypto.randomUUID();

  // Check slug collision in local
  const existing = db.cards.find((c) => c.slug.toLowerCase() === input.slug.toLowerCase());
  if (existing) {
    throw new Error(`Card slug '${input.slug}' is already in use. Please choose another.`);
  }

  const actCode = input.activation_code || generateActivationCode();
  const embeddedNotes = `[CODE:${actCode}][BATCH:${input.batch_id || ""}][STATUS:${input.inventory_status || "GENERATED"}][TYPE:${input.destination_type}] ${input.notes || ""}`.trim();

  const newCard: Card = {
    id: cardUuid,
    business_id: input.business_id || "11111111-1111-1111-1111-111111111111",
    slug: input.slug,
    name: input.name,
    destination_type: input.destination_type,
    destination_url: input.destination_url,
    status: input.status || "draft",
    inventory_status: input.inventory_status || (input.status === "active" ? "ACTIVE" : "GENERATED"),
    activation_code: actCode,
    batch_id: input.batch_id,
    branch: input.branch,
    nfc_programmed: false,
    qr_tested: false,
    notes: embeddedNotes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.cards.unshift(newCard);
  saveDb();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await client
          .from("cards")
          .insert({
            id: cardUuid,
            business_id: input.business_id || "11111111-1111-1111-1111-111111111111",
            slug: input.slug,
            name: input.name,
            destination_type: sanitizeSupabaseDestinationType(input.destination_type),
            destination_url: input.destination_url || "",
            status: input.status || "draft",
            nfc_programmed: false,
            qr_tested: false,
            notes: embeddedNotes,
          });
      } catch (e) {
        console.warn("Supabase createCard background sync note:", e);
      }
    }
  }

  return newCard;
}

export async function updateCard(idOrSlug: string, updates: Partial<Card>): Promise<Card | null> {
  const db = loadDb();
  const cleanId = (idOrSlug || "").trim().toLowerCase();
  const targetSlug = (updates.slug || (cleanId.length <= 12 ? cleanId : "")).toLowerCase();

  const index = db.cards.findIndex(
    (c) => c.id.toLowerCase() === cleanId || c.slug.toLowerCase() === cleanId || (targetSlug && c.slug.toLowerCase() === targetSlug)
  );

  if (index !== -1) {
    db.cards[index] = {
      ...db.cards[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDb();
  }

  let finalCard: Card | null = index !== -1 ? db.cards[index] : null;

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const supabaseUpdates: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.name) supabaseUpdates.name = updates.name;
        if (updates.destination_url !== undefined) supabaseUpdates.destination_url = updates.destination_url;
        if (updates.status) supabaseUpdates.status = updates.status;
        if (updates.business_id) supabaseUpdates.business_id = updates.business_id;
        if (updates.destination_type) supabaseUpdates.destination_type = sanitizeSupabaseDestinationType(updates.destination_type);
        if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        let query = isUuid
          ? client.from("cards").update(supabaseUpdates).eq("id", idOrSlug)
          : client.from("cards").update(supabaseUpdates).ilike("slug", targetSlug || idOrSlug);

        const { data: updatedData, error } = await query.select("*, businesses(name)").maybeSingle();

        if (!error && updatedData) {
          const parsedNotes = parseCardNotes(updatedData.notes);
          finalCard = {
            ...updatedData,
            activation_code: updatedData.activation_code || parsedNotes.activationCode || updates.activation_code,
            batch_id: updatedData.batch_id || parsedNotes.batchId || updates.batch_id,
            inventory_status: (updates.inventory_status || (updatedData.status === "active" ? "ACTIVE" : "GENERATED")) as InventoryStatus,
            branch: updates.branch || parsedNotes.branch,
            destination_type: updates.destination_type || parsedNotes.originalType || updatedData.destination_type,
            business_name: updatedData.businesses?.name || "Business Location",
          };
        } else if (targetSlug) {
          const newUuid = isUuid ? idOrSlug : crypto.randomUUID();
          const { data: insertedData, error: insErr } = await client.from("cards").insert({
            id: newUuid,
            slug: targetSlug.toUpperCase(),
            name: updates.name || `NFCFlow Card ${targetSlug.toUpperCase()}`,
            destination_type: sanitizeSupabaseDestinationType(updates.destination_type || "google_review"),
            destination_url: updates.destination_url || "",
            status: updates.status || "active",
            business_id: updates.business_id || "11111111-1111-1111-1111-111111111111",
            notes: updates.notes || `[STATUS:ACTIVE]`,
          }).select("*, businesses(name)").maybeSingle();

          if (!insErr && insertedData) {
            finalCard = insertedData as Card;
          }
        }
      } catch (e) {
        console.warn("Supabase updateCard note:", e);
      }
    }
  }

  return finalCard || (await getCardBySlug(targetSlug || idOrSlug));
}

export async function deleteCard(id: string): Promise<boolean> {
  const db = loadDb();
  const initialLength = db.cards.length;
  db.cards = db.cards.filter((c) => c.id !== id && c.slug.toLowerCase() !== id.toLowerCase());
  saveDb();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          await client.from("cards").delete().or(`id.eq.${id},slug.ilike.${id}`);
        } else {
          await client.from("cards").delete().ilike("slug", id);
        }
      } catch (e) {
        console.warn("Supabase deleteCard note:", e);
      }
    }
  }

  return db.cards.length < initialLength;
}

// ==========================================
// BATCH OPERATIONS
// ==========================================

export async function getBatches(): Promise<CardBatch[]> {
  const db = loadDb();
  const allCards = await getCards();

  const batchesMap = new Map<string, CardBatch>();

  // 1. Add local db.batches if present
  for (const b of db.batches) {
    batchesMap.set(b.id, b);
  }

  // 2. Check Supabase card_batches table if available
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("card_batches")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          for (const b of data as CardBatch[]) {
            batchesMap.set(b.id, b);
          }
        }
      } catch (e) {
        // card_batches table might not exist in Supabase schema
      }
    }
  }

  // 3. Dynamically discover/reconstruct batches from allCards (cards stored in Supabase)
  for (const card of allCards) {
    const parsed = parseCardNotes(card.notes);
    const batchId = card.batch_id || parsed.batchId;
    if (!batchId) continue;

    if (!batchesMap.has(batchId)) {
      let bName = `Batch #${batchId.substring(0, 8)}`;
      if (card.notes && card.notes.includes("Generated in ")) {
        const parts = card.notes.split("Generated in ");
        if (parts[1]) {
          bName = parts[1].split("[")[0].trim();
        }
      }

      const cardPrefix = card.slug.replace(/[0-9]/g, "") || "NF";

      batchesMap.set(batchId, {
        id: batchId,
        batch_name: bName,
        quantity: 0,
        prefix: cardPrefix,
        product_type: card.name.split(" - ")[0] || "NFCFlow CR80 NTAG213",
        card_purpose: card.card_purpose || parsed.cardPurpose || "google_review",
        business_id: card.business_id === SYSTEM_UNASSIGNED_BUSINESS_ID ? undefined : card.business_id,
        status: "GENERATED",
        created_at: card.created_at || new Date().toISOString(),
        updated_at: card.updated_at || new Date().toISOString(),
        cards_count: 0,
        activated_count: 0,
        in_stock_count: 0,
        sold_count: 0,
      });
    }
  }

  // 4. Calculate accurate live counts for all batches
  const result: CardBatch[] = [];
  for (const [batchId, batch] of batchesMap.entries()) {
    const batchCards = allCards.filter(
      (c) => c.batch_id === batchId || (c.notes && c.notes.includes(batchId))
    );
    const activatedCount = batchCards.filter(
      (c) => c.status === "active" || c.inventory_status === "ACTIVE"
    ).length;
    const inStockCount = batchCards.filter(
      (c) =>
        c.inventory_status === "IN_STOCK" ||
        c.inventory_status === "PRINTED" ||
        c.inventory_status === "GENERATED"
    ).length;
    const soldCount = batchCards.filter((c) => c.inventory_status === "SOLD").length;

    result.push({
      ...batch,
      quantity: batch.quantity || batchCards.length,
      cards_count: batchCards.length || batch.quantity,
      activated_count: activatedCount,
      in_stock_count: inStockCount,
      sold_count: soldCount,
    });
  }

  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getBatchById(id: string): Promise<{ batch: CardBatch; cards: Card[] } | null> {
  const allBatches = await getBatches();
  const batch = allBatches.find((b) => b.id === id);
  if (!batch) return null;

  const allCards = await getCards();
  const batchCards = allCards.filter(
    (c) => c.batch_id === batch.id || (c.notes && c.notes.includes(batch.id))
  );

  return {
    batch,
    cards: batchCards,
  };
}

export async function createBatch(input: {
  batch_name: string;
  quantity: number;
  prefix: string;
  product_type: string;
  card_purpose?: CardPurpose;
  business_id?: string;
  starting_index?: number;
}): Promise<{ batch: CardBatch; cards: Card[] }> {
  const db = loadDb();
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanPrefix = (input.prefix || "NF").trim().toUpperCase();
  const startIdx = input.starting_index || 1;
  const qty = Math.min(Math.max(1, Number(input.quantity) || 100), 1000);
  const purpose: CardPurpose = input.card_purpose || "google_review";
  const initialDestType: DestinationType = purpose === "universal" ? "google_review" : purpose;
  const targetBizId = input.business_id || SYSTEM_UNASSIGNED_BUSINESS_ID;

  const newBatch: CardBatch = {
    id: batchId,
    batch_name: input.batch_name,
    quantity: qty,
    prefix: cleanPrefix,
    product_type: input.product_type || "NFCFlow CR80 NTAG213",
    card_purpose: purpose,
    business_id: input.business_id,
    status: "GENERATED",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cards_count: qty,
    activated_count: 0,
    in_stock_count: qty,
    sold_count: 0,
  };

  db.batches.unshift(newBatch);

  // Generate cards
  const generatedCards: Card[] = [];
  const supabaseBatchCards: any[] = [];

  for (let i = 0; i < qty; i++) {
    const cardNum = startIdx + i;
    const padding = qty >= 1000 ? 6 : (qty >= 100 ? 4 : 3);
    const slug = `${cleanPrefix}${String(cardNum).padStart(padding, "0")}`;
    const activationCode = generateActivationCode();
    const cardUuid = crypto.randomUUID();
    const notesStr = `[CODE:${activationCode}][BATCH:${batchId}][PURPOSE:${purpose}][TYPE:${initialDestType}][STATUS:GENERATED] Generated in ${input.batch_name}`;

    const card: Card = {
      id: cardUuid,
      business_id: targetBizId,
      slug: slug,
      name: `${input.product_type || "NFCFlow Card"} - ${slug}`,
      destination_type: initialDestType,
      card_purpose: purpose,
      destination_url: "",
      status: "draft",
      inventory_status: "GENERATED",
      activation_code: activationCode,
      batch_id: batchId,
      nfc_programmed: true,
      qr_tested: true,
      notes: notesStr,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (db.cards.some((c) => c.slug.toLowerCase() === slug.toLowerCase())) {
      card.slug = `${slug}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    }

    generatedCards.push(card);
    db.cards.unshift(card);

    supabaseBatchCards.push({
      id: cardUuid,
      business_id: targetBizId,
      slug: card.slug,
      name: card.name,
      destination_type: "google_review",
      destination_url: "",
      status: "draft",
      nfc_programmed: true,
      qr_tested: true,
      notes: notesStr,
    });
  }

  saveDb();

  // Try Supabase synchronization
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await ensureSystemInventoryBusiness(client);

        // Try inserting into card_batches table if available
        try {
          await client.from("card_batches").insert({
            id: crypto.randomUUID(),
            batch_name: input.batch_name,
            quantity: qty,
            prefix: cleanPrefix,
            product_type: input.product_type || "NFCFlow CR80 NTAG213",
            business_id: input.business_id || null,
            status: "GENERATED",
          });
        } catch {}

        // Insert cards in chunks of 50
        for (let c = 0; c < supabaseBatchCards.length; c += 50) {
          const chunk = supabaseBatchCards.slice(c, c + 50);
          await client.from("cards").insert(chunk);
        }
      } catch (e) {
        console.warn("Supabase createBatch cards sync exception:", e);
      }
    }
  }

  return { batch: newBatch, cards: generatedCards };
}

export async function updateBatch(id: string, updates: Partial<CardBatch>): Promise<CardBatch | null> {
  const db = loadDb();
  const index = db.batches.findIndex((b) => b.id === id);
  if (index !== -1) {
    db.batches[index] = {
      ...db.batches[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }

  // Update card inventory statuses
  if (updates.status) {
    db.cards.forEach((c) => {
      if (c.batch_id === id && c.status !== "active") {
        if (updates.status === "PRINTED") c.inventory_status = "PRINTED";
        else if (updates.status === "IN_STOCK") c.inventory_status = "IN_STOCK";
        else if (updates.status === "NFC_PROGRAMMED") {
          c.inventory_status = "NFC_PROGRAMMED";
          c.nfc_programmed = true;
          c.programmed_at = new Date().toISOString();
        }
      }
    });
  }

  saveDb();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await client.from("card_batches").update(updates).eq("id", id);
      } catch {}
    }
  }

  const allBatches = await getBatches();
  return allBatches.find((b) => b.id === id) || (index !== -1 ? db.batches[index] : null);
}

export async function deleteBatch(id: string): Promise<boolean> {
  const db = loadDb();
  const initialLength = db.batches.length;
  db.batches = db.batches.filter((b) => b.id !== id);
  db.cards = db.cards.filter((c) => !(c.batch_id === id && c.status === "draft"));
  saveDb();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await client.from("cards").delete().ilike("notes", `%${id}%`).eq("status", "draft");
        await client.from("card_batches").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteBatch note:", e);
      }
    }
  }

  return true;
}

// ==========================================
// CARD ACTIVATION WORKFLOW ENGINE
// ==========================================

export async function verifyCardActivation(
  cardIdentifier: string,
  activationCode: string
): Promise<{
  valid: boolean;
  card?: Card;
  message?: string;
  already_active?: boolean;
}> {
  const cleanId = (cardIdentifier || "").trim().toLowerCase();
  const cleanCode = (activationCode || "").trim().toUpperCase().replace(/\s+/g, "");

  const card = (await getCardBySlug(cleanId)) || (await getCardById(cleanId));

  if (!card) {
    return {
      valid: false,
      message: `No NFCFlow card found with identifier "${cardIdentifier}". Please check your card label.`,
    };
  }

  // Check if card is already active
  if (card.status === "active" && card.destination_url) {
    return {
      valid: false,
      already_active: true,
      card,
      message: `Card ${card.slug} is already active and pointing to its configured destination. You can manage or update its destination in the dashboard.`,
    };
  }

  // Extract activation code from field or notes
  let storedCode = (card.activation_code || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!storedCode && card.notes) {
    const parsed = parseCardNotes(card.notes);
    if (parsed.activationCode) storedCode = parsed.activationCode;
  }

  if (!storedCode || storedCode !== cleanCode) {
    return {
      valid: false,
      message: "The activation code you entered does not match this card. Please check the code printed on your activation card (format: XXXX-XXXX).",
    };
  }

  return {
    valid: true,
    card,
    message: "Card and activation code successfully verified!",
  };
}

export async function activateCardByCode(params: {
  cardIdentifier: string;
  activationCode: string;
  destination_type: DestinationType;
  destination_url: string;
  business_id?: string;
  business_name?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  business_category?: string;
  card_name?: string;
  branch?: string;
}): Promise<{
  success: boolean;
  card?: Card;
  business?: Business;
  message?: string;
}> {
  const verification = await verifyCardActivation(params.cardIdentifier, params.activationCode);
  if (!verification.valid || !verification.card) {
    return {
      success: false,
      message: verification.message || "Invalid card or activation code",
    };
  }

  const card = verification.card;
  const parsed = card.notes ? parseCardNotes(card.notes) : {};
  const cardPurpose = card.card_purpose || parsed.cardPurpose || (card.destination_type === "custom" ? "universal" : card.destination_type);
  if (cardPurpose && cardPurpose !== "universal" && cardPurpose !== "custom" && params.destination_type !== cardPurpose) {
    return {
      success: false,
      message: `This card is manufactured exclusively for ${cardPurpose.replace("_", " ")} and cannot be activated as ${params.destination_type.replace("_", " ")}.`,
    };
  }
  const db = loadDb();

  // Business Registration & Association
  let finalBiz: Business | null = null;

  if (params.business_id) {
    finalBiz = await getBusinessById(params.business_id);
  }

  if (!finalBiz && params.business_name) {
    const cleanName = params.business_name.trim();
    const cleanEmail = params.business_email?.trim().toLowerCase();
    const cleanPhone = params.business_phone?.trim();

    // Check existing business in local or remote
    const existingBiz = db.businesses.find(
      (b) =>
        (cleanEmail && b.email?.toLowerCase() === cleanEmail) ||
        (cleanPhone && b.phone === cleanPhone) ||
        b.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingBiz) {
      finalBiz = existingBiz;
      if ((!existingBiz.phone && cleanPhone) || (!existingBiz.email && cleanEmail) || (!existingBiz.address && params.business_address)) {
        await updateBusiness(existingBiz.id, {
          phone: existingBiz.phone || cleanPhone,
          email: existingBiz.email || cleanEmail,
          address: existingBiz.address || params.business_address,
          category: existingBiz.category || params.business_category,
        });
      }
    } else {
      const newSlugBase = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business";
      let uniqueSlug = newSlugBase;
      let counter = 1;
      while (db.businesses.some((b) => b.slug === uniqueSlug)) {
        uniqueSlug = `${newSlugBase}-${counter++}`;
      }

      finalBiz = await createBusiness({
        name: cleanName,
        slug: uniqueSlug,
        phone: cleanPhone || undefined,
        email: cleanEmail || undefined,
        address: params.business_address?.trim() || undefined,
        category: params.business_category?.trim() || "General Business",
        google_review_url: params.destination_type === "google_review" ? params.destination_url : "",
        website_url: params.destination_type === "website" ? params.destination_url : undefined,
        whatsapp_number: cleanPhone || (params.destination_type === "whatsapp" ? params.destination_url : undefined),
        status: "active",
        branch: params.branch?.trim() || "Main Location",
      });

      if (cleanEmail && !db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        const newUser: User = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          email: cleanEmail,
          name: cleanName,
          role: "business_owner",
          created_at: new Date().toISOString(),
        };
        db.users.unshift(newUser);
        saveDb();
      }
    }
  }

  const finalBizId = finalBiz ? finalBiz.id : (card.business_id || "11111111-1111-1111-1111-111111111111");
  const businessDisplayName = finalBiz ? finalBiz.name : "Your Business";
  const finalCardName = params.card_name || `${businessDisplayName} - ${card.slug}`;
  const finalNotes = `[CODE:${params.activationCode}][BATCH:${card.batch_id || ""}][STATUS:ACTIVE][BRANCH:${params.branch || "Main"}][TYPE:${params.destination_type}] Activated for ${businessDisplayName}`;

  const updated = await updateCard(card.id || card.slug, {
    slug: card.slug,
    business_id: finalBizId,
    name: finalCardName,
    destination_type: params.destination_type,
    destination_url: params.destination_url,
    status: "active",
    inventory_status: "ACTIVE",
    branch: params.branch?.trim() || finalBiz?.branch || card.branch,
    notes: finalNotes,
    activated_at: new Date().toISOString(),
    tested_at: new Date().toISOString(),
  });

  if (!updated) {
    return {
      success: false,
      message: "Failed to activate card. Please try again.",
    };
  }

  return {
    success: true,
    card: updated,
    business: finalBiz || undefined,
    message: `Card ${card.slug} successfully registered and activated for ${businessDisplayName}!`,
  };
}

// ==========================================
// CARD SELF-SERVICE MANAGEMENT (OWNER PORTAL)
// ==========================================

export async function verifyCardManagementAuth(
  cardIdentifier: string,
  activationCode: string
): Promise<{
  valid: boolean;
  card?: Card;
  business?: Business;
  scanCount?: number;
  message?: string;
  not_activated?: boolean;
}> {
  const cleanId = (cardIdentifier || "").trim().toLowerCase();
  const cleanCode = (activationCode || "").trim().toUpperCase().replace(/\s+/g, "");

  const card = (await getCardBySlug(cleanId)) || (await getCardById(cleanId));

  if (!card) {
    return {
      valid: false,
      message: `No NFCFlow card found with identifier "${cardIdentifier}". Please check your card ID.`,
    };
  }

  // Extract activation code from field or notes
  let storedCode = (card.activation_code || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!storedCode && card.notes) {
    const parsed = parseCardNotes(card.notes);
    if (parsed.activationCode) storedCode = parsed.activationCode;
  }

  if (!storedCode || storedCode !== cleanCode) {
    return {
      valid: false,
      message: "The activation code does not match this card. Please check the secret code printed on your card envelope/box.",
    };
  }

  // Check if card is activated
  const isCardActive = card.status === "active" && !!card.destination_url;
  if (!isCardActive) {
    return {
      valid: false,
      not_activated: true,
      card,
      message: `Card ${card.slug} is not activated yet. Please activate your card and register your business first before managing it.`,
    };
  }

  let business: Business | undefined = undefined;
  if (card.business_id) {
    const b = await getBusinessById(card.business_id);
    if (b) business = b;
  }

  const events = await getScanEvents({ card_id: card.id || card.slug });
  const scanCount = events.length;
  const nfcCount = events.filter((e) => e.source === "nfc").length;
  const qrCount = events.filter((e) => e.source === "qr").length;
  const iphoneCount = events.filter((e) => e.device_type === "iphone").length;
  const androidCount = events.filter((e) => e.device_type === "android").length;
  const recentEvents = events.slice(0, 5);

  return {
    valid: true,
    card,
    business,
    scanCount,
    nfcCount,
    qrCount,
    iphoneCount,
    androidCount,
    recentEvents,
    message: "Card authenticated successfully!",
  };
}

export async function updateCardDestinationByCode(params: {
  cardIdentifier: string;
  activationCode: string;
  destination_type: DestinationType;
  destination_url: string;
  card_name?: string;
}): Promise<{
  success: boolean;
  card?: Card;
  message?: string;
}> {
  const auth = await verifyCardManagementAuth(params.cardIdentifier, params.activationCode);
  if (!auth.valid || !auth.card) {
    return {
      success: false,
      message: auth.message || "Invalid card or activation code",
    };
  }

  const card = auth.card;
  const parsed = card.notes ? parseCardNotes(card.notes) : {};
  const cardPurpose = card.card_purpose || parsed.cardPurpose || (card.destination_type === "custom" ? "universal" : card.destination_type);
  if (cardPurpose && cardPurpose !== "universal" && cardPurpose !== "custom" && params.destination_type !== cardPurpose) {
    return {
      success: false,
      message: `This card is manufactured exclusively for ${cardPurpose.replace("_", " ")}. You can update its link, but cannot change its destination type.`,
    };
  }

  const updated = await updateCard(card.id || card.slug, {
    destination_type: params.destination_type,
    destination_url: params.destination_url.trim(),
    name: params.card_name ? params.card_name.trim() : card.name,
    status: "active",
    tested_at: new Date().toISOString(),
  });

  if (!updated) {
    return {
      success: false,
      message: "Failed to update card destination. Please try again.",
    };
  }

  return {
    success: true,
    card: updated,
    message: `Destination successfully updated to ${params.destination_type}!`,
  };
}

// ==========================================
// REDIRECT EVENT & SCAN LOGGING
// ==========================================

export async function recordScanEvent(event: Omit<RedirectEvent, "id">): Promise<RedirectEvent> {
  const db = loadDb();
  const eventUuid = crypto.randomUUID();
  const newEvent: RedirectEvent = {
    ...event,
    id: eventUuid,
  };

  db.events.unshift(newEvent);
  saveDb();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const cardMatch = await client.from("cards").select("id, business_id").ilike("slug", event.slug).maybeSingle();
        const finalCardId = cardMatch.data?.id || (event.card_id && event.card_id.includes("-") ? event.card_id : "33333333-3333-3333-3333-333333333331");
        const finalBizId = cardMatch.data?.business_id || event.business_id || "11111111-1111-1111-1111-111111111111";

        await client
          .from("redirect_events")
          .insert({
            id: eventUuid,
            card_id: finalCardId,
            slug: event.slug,
            business_id: finalBizId,
            source: event.source,
            device_type: event.device_type,
            user_agent: event.user_agent || null,
            referrer: event.referrer || null,
            ip_hash: event.ip_hash || null,
            scanned_at: event.scanned_at || new Date().toISOString(),
          });
      } catch (e) {
        console.warn("Supabase recordScanEvent exception:", e);
      }
    }
  }

  return newEvent;
}

export async function getScanEvents(params?: {
  business_id?: string;
  card_id?: string;
  limit?: number;
}): Promise<RedirectEvent[]> {
  const db = loadDb();
  let events: RedirectEvent[] = [...db.events];

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
          events = data as RedirectEvent[];
        }
      } catch (e) {
        console.warn("Supabase getScanEvents exception:", e);
      }
    }
  }

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

export async function getDailyAnalytics(params?: {
  business_id?: string;
  card_id?: string;
}): Promise<CardDailyAnalytics[]> {
  const db = loadDb();
  let rollups: CardDailyAnalytics[] = [...(db.daily_analytics || [])];

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        let query = client.from("card_daily_analytics").select("*");
        if (params?.business_id && params.business_id !== "all") {
          query = query.eq("business_id", params.business_id);
        }
        if (params?.card_id && params.card_id !== "all") {
          query = query.eq("card_id", params.card_id);
        }
        const { data, error } = await query;
        if (!error && data) {
          rollups = data as CardDailyAnalytics[];
        }
      } catch (err) {
        console.warn("Supabase getDailyAnalytics note:", err);
      }
    }
  }

  if (params?.business_id && params.business_id !== "all") {
    rollups = rollups.filter((r) => r.business_id === params.business_id);
  }

  if (params?.card_id && params.card_id !== "all") {
    rollups = rollups.filter((r) => r.card_id === params.card_id);
  }

  return rollups;
}

export async function rollupAndPurgeOldTelemetry(retentionDays: number = 60): Promise<{
  purgedLogs: number;
  rolledUpDays: number;
  message: string;
}> {
  const cutoffMs = Date.now() - retentionDays * 86400000;
  let purgedCount = 0;
  let rolledUpCount = 0;

  // 1. Local / In-memory store rollup & purge
  const db = loadDb();
  if (!db.daily_analytics) db.daily_analytics = [];

  const oldEvents = db.events.filter((ev) => new Date(ev.scanned_at).getTime() < cutoffMs);
  const recentEvents = db.events.filter((ev) => new Date(ev.scanned_at).getTime() >= cutoffMs);

  if (oldEvents.length > 0) {
    purgedCount = oldEvents.length;
    // Group old events by card_id and date
    const rollupMap: { [key: string]: CardDailyAnalytics } = {};
    for (const ev of oldEvents) {
      const dateKey = ev.scanned_at.split("T")[0];
      const comboKey = `${ev.card_id}_${dateKey}`;

      if (!rollupMap[comboKey]) {
        rollupMap[comboKey] = {
          card_id: ev.card_id,
          business_id: ev.business_id,
          date: dateKey,
          total_scans: 0,
          nfc_count: 0,
          qr_count: 0,
          iphone_count: 0,
          android_count: 0,
        };
      }

      rollupMap[comboKey].total_scans++;
      if (ev.source === "nfc") rollupMap[comboKey].nfc_count++;
      if (ev.source === "qr") rollupMap[comboKey].qr_count++;
      if (ev.device_type === "iphone" || ev.device_type === "tablet") rollupMap[comboKey].iphone_count++;
      if (ev.device_type === "android") rollupMap[comboKey].android_count++;
    }

    // Merge into db.daily_analytics
    for (const item of Object.values(rollupMap)) {
      const existingIdx = db.daily_analytics.findIndex((d) => d.card_id === item.card_id && d.date === item.date);
      if (existingIdx >= 0) {
        db.daily_analytics[existingIdx].total_scans += item.total_scans;
        db.daily_analytics[existingIdx].nfc_count += item.nfc_count;
        db.daily_analytics[existingIdx].qr_count += item.qr_count;
        db.daily_analytics[existingIdx].iphone_count += item.iphone_count;
        db.daily_analytics[existingIdx].android_count += item.android_count;
      } else {
        db.daily_analytics.push(item);
      }
      rolledUpCount++;
    }

    db.events = recentEvents;
    saveDb();
  }

  // 2. Supabase PostgreSQL automated rollup & purge
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.rpc("rollup_and_purge_old_telemetry", {
          retention_days: retentionDays,
        });
        if (!error && data && data.length > 0) {
          purgedCount = data[0].purged_raw_logs ?? purgedCount;
          rolledUpCount = data[0].rolled_up_days ?? rolledUpCount;
        }
      } catch (err) {
        console.warn("Supabase rollup_and_purge_old_telemetry note:", err);
      }
    }
  }

  return {
    purgedLogs: purgedCount,
    rolledUpDays: rolledUpCount,
    message: `Telemetry older than ${retentionDays} days successfully aggregated into daily counts and purged.`,
  };
}

export async function getAnalyticsSummary(businessId?: string, cardId?: string): Promise<AnalyticsSummary> {
  const events = await getScanEvents({ business_id: businessId, card_id: cardId });
  const historicalRollups = await getDailyAnalytics({ business_id: businessId, card_id: cardId });

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

  const dailyMap: { [dateStr: string]: { total: number; nfc: number; qr: number } } = {};
  for (let d = 13; d >= 0; d--) {
    const dt = new Date(now.getTime() - d * 86400000);
    const key = dt.toISOString().split("T")[0];
    dailyMap[key] = { total: 0, nfc: 0, qr: 0 };
  }

  // 1. Process active raw events
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

  // 2. Add historical daily rollup totals (so total count is preserved for all time)
  let historicalTotal = 0;
  historicalRollups.forEach((rollup) => {
    historicalTotal += rollup.total_scans;
    nfcScans += rollup.nfc_count;
    qrScans += rollup.qr_count;
    deviceBreakdown.iphone += rollup.iphone_count;
    deviceBreakdown.android += rollup.android_count;

    if (dailyMap[rollup.date]) {
      dailyMap[rollup.date].total += rollup.total_scans;
      dailyMap[rollup.date].nfc += rollup.nfc_count;
      dailyMap[rollup.date].qr += rollup.qr_count;
    }
  });

  const daily_trends = Object.entries(dailyMap).map(([date, counts]) => ({
    date,
    total: counts.total,
    nfc: counts.nfc,
    qr: counts.qr,
  }));

  return {
    total_scans: events.length + historicalTotal,
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

export async function wipeAllDatabaseData(): Promise<{ success: boolean; message: string }> {
  // 1. Reset in-memory database
  inMemoryDb = {
    users: [],
    businesses: [],
    cards: [],
    batches: [],
    events: [],
  };
  saveDb();

  // 2. Clear Supabase tables if configured
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await client.from("redirect_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await client.from("cards").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await client.from("card_batches").delete().neq("id", "none");
        await client.from("businesses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      } catch (err) {
        console.warn("Supabase wipe note:", err);
      }
    }
  }

  return {
    success: true,
    message: "All cards, batches, scan events, and businesses deleted successfully.",
  };
}
