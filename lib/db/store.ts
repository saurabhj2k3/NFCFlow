import { AnalyticsSummary, BatchStatus, Business, Card, CardBatch, DestinationType, InventoryStatus, RedirectEvent, User } from "@/types";
import { INITIAL_BATCHES, INITIAL_BUSINESSES, INITIAL_CARDS, INITIAL_USERS, generateSeedScanEvents } from "@/lib/mock-data";
import { getActiveSupabaseClient, isSupabaseConfigured } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

// ==========================================
// LOCAL STORAGE FALLBACK & HYBRID ENGINE
// ==========================================
const LOCAL_DB_DIR = path.join(process.cwd(), "data");
const LOCAL_DB_PATH = path.join(LOCAL_DB_DIR, "store.json");

interface DbData {
  users: User[];
  businesses: Business[];
  cards: Card[];
  batches: CardBatch[];
  events: RedirectEvent[];
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
    ensureDataDir();
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.cards)) {
        inMemoryDb = parsed;
        if (!inMemoryDb!.batches || inMemoryDb!.batches.length === 0) {
          inMemoryDb!.batches = [...INITIAL_BATCHES];
        }
        return inMemoryDb!;
      }
    }
  } catch (err) {
    console.warn("Failed reading local DB file, initializing default seed data:", err);
  }

  if (inMemoryDb) {
    return inMemoryDb;
  }

  // Initialize with seed data
  inMemoryDb = {
    users: [...INITIAL_USERS],
    businesses: [...INITIAL_BUSINESSES],
    cards: [...INITIAL_CARDS],
    batches: [...INITIAL_BATCHES],
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
  const db = loadDb();
  let result = [...db.businesses];

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("businesses")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const seen = new Set<string>();
          const merged: Business[] = [];
          for (const b of data as Business[]) {
            seen.add(b.id);
            merged.push(b);
          }
          for (const b of db.businesses) {
            if (!seen.has(b.id)) {
              seen.add(b.id);
              merged.push(b);
            }
          }
          result = merged;
        }
      } catch (e) {
        console.warn("Supabase query failed, using local storage fallback:", e);
      }
    }
  }

  return result;
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
  const db = loadDb();
  const newBusiness: Business = {
    ...input,
    id: `biz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
            branch: input.branch || null,
          })
          .select()
          .single();

        if (!error && data) {
          db.businesses.unshift(data as Business);
          saveDb();
          return data as Business;
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
        const { data, error } = await client
          .from("businesses")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${id},slug.eq.${id}`)
          .select()
          .maybeSingle();

        if (!error && data) {
          // sync local
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
        const { error } = await client.from("businesses").delete().or(`id.eq.${id},slug.eq.${id}`);
        if (!error) {
          // continue to clean local
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

        if (!cardsError && cardsData && cardsData.length > 0) {
          const { data: eventsData } = await client
            .from("redirect_events")
            .select("card_id, slug, source");

          const eventsList = (eventsData || []) as Array<{ card_id: string; slug: string; source: string }>;

          const remoteCards: Card[] = cardsData.map((c: any) => {
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

          // Merge Supabase cards and local cards (deduplicating by slug/id)
          const seenSlugs = new Set<string>();
          const merged: Card[] = [];

          for (const card of remoteCards) {
            seenSlugs.add(card.slug.toLowerCase());
            merged.push(card);
          }

          for (const card of db.cards) {
            if (!seenSlugs.has(card.slug.toLowerCase())) {
              seenSlugs.add(card.slug.toLowerCase());
              merged.push(card);
            }
          }

          allCards = merged;
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
        const { data, error } = await client
          .from("cards")
          .select("*, businesses(name)")
          .or(`id.eq.${cleanId},slug.ilike.${cleanId}`)
          .maybeSingle();

        if (!error && data) {
          const { data: eventsData } = await client
            .from("redirect_events")
            .select("source")
            .or(`card_id.eq.${data.id},slug.ilike.${cleanId}`);

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

  // Check slug collision in local
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
    inventory_status: input.inventory_status || (input.status === "active" ? "ACTIVE" : "GENERATED"),
    activation_code: input.activation_code || generateActivationCode(),
    batch_id: input.batch_id,
    branch: input.branch,
    nfc_programmed: false,
    qr_tested: false,
    notes: input.notes,
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
            business_id: input.business_id || null,
            slug: input.slug,
            name: input.name,
            destination_type: input.destination_type,
            destination_url: input.destination_url,
            status: input.status || "draft",
            inventory_status: newCard.inventory_status,
            activation_code: newCard.activation_code,
            batch_id: input.batch_id || null,
            branch: input.branch || null,
            nfc_programmed: false,
            qr_tested: false,
            notes: input.notes || null,
          });
      } catch (e) {
        console.warn("Supabase createCard background sync note:", e);
      }
    }
  }

  return newCard;
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<Card | null> {
  const db = loadDb();
  const index = db.cards.findIndex((c) => c.id === id || c.slug.toLowerCase() === id.toLowerCase());
  if (index !== -1) {
    db.cards[index] = {
      ...db.cards[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDb();
  }

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await client
          .from("cards")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${id},slug.ilike.${id}`);
      } catch (e) {
        console.warn("Supabase updateCard note:", e);
      }
    }
  }

  return index !== -1 ? db.cards[index] : (await getCardById(id));
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
        await client.from("cards").delete().or(`id.eq.${id},slug.ilike.${id}`);
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

  let batchesList = [...db.batches];

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("card_batches")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const seen = new Set<string>();
          const merged: CardBatch[] = [];
          for (const b of data as CardBatch[]) {
            seen.add(b.id);
            merged.push(b);
          }
          for (const b of db.batches) {
            if (!seen.has(b.id)) {
              seen.add(b.id);
              merged.push(b);
            }
          }
          batchesList = merged;
        }
      } catch (e) {
        console.warn("Supabase getBatches note:", e);
      }
    }
  }

  return batchesList.map((batch) => {
    const batchCards = allCards.filter((c) => c.batch_id === batch.id || (c.notes && c.notes.includes(batch.batch_name)));
    const activatedCount = batchCards.filter((c) => c.status === "active" || c.inventory_status === "ACTIVE").length;
    const inStockCount = batchCards.filter((c) => c.inventory_status === "IN_STOCK" || c.inventory_status === "PRINTED" || c.inventory_status === "GENERATED").length;
    const soldCount = batchCards.filter((c) => c.inventory_status === "SOLD").length;

    return {
      ...batch,
      cards_count: batchCards.length || batch.quantity,
      activated_count: activatedCount,
      in_stock_count: inStockCount,
      sold_count: soldCount,
    };
  });
}

export async function getBatchById(id: string): Promise<{ batch: CardBatch; cards: Card[] } | null> {
  const db = loadDb();
  let batch = db.batches.find((b) => b.id === id);

  if (!batch && isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("card_batches")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!error && data) {
          batch = data as CardBatch;
        }
      } catch (e) {
        console.warn("Supabase getBatchById note:", e);
      }
    }
  }

  if (!batch) return null;

  // Retrieve batch cards: check both local store db.cards and getCards()
  const allCards = await getCards();
  let batchCards = allCards.filter((c) => c.batch_id === batch.id || (c.notes && c.notes.includes(batch.batch_name)));

  // Extra safety fallback: direct query in db.cards
  if (batchCards.length === 0) {
    batchCards = db.cards.filter((c) => c.batch_id === batch.id);
  }

  const activatedCount = batchCards.filter((c) => c.status === "active" || c.inventory_status === "ACTIVE").length;
  const inStockCount = batchCards.filter((c) => c.inventory_status === "IN_STOCK" || c.inventory_status === "PRINTED" || c.inventory_status === "GENERATED").length;
  const soldCount = batchCards.filter((c) => c.inventory_status === "SOLD").length;

  return {
    batch: {
      ...batch,
      cards_count: batchCards.length || batch.quantity,
      activated_count: activatedCount,
      in_stock_count: inStockCount,
      sold_count: soldCount,
    },
    cards: batchCards,
  };
}

export async function createBatch(input: {
  batch_name: string;
  quantity: number;
  prefix: string;
  product_type: string;
  business_id?: string;
  starting_index?: number;
}): Promise<{ batch: CardBatch; cards: Card[] }> {
  const db = loadDb();
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanPrefix = (input.prefix || "NF").trim().toUpperCase();
  const startIdx = input.starting_index || 1;
  const qty = Math.min(Math.max(1, Number(input.quantity) || 100), 1000);

  const newBatch: CardBatch = {
    id: batchId,
    batch_name: input.batch_name,
    quantity: qty,
    prefix: cleanPrefix,
    product_type: input.product_type || "NFCFlow CR80 NTAG213",
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
  for (let i = 0; i < qty; i++) {
    const cardNum = startIdx + i;
    const padding = qty >= 1000 ? 6 : (qty >= 100 ? 4 : 3);
    const slug = `${cleanPrefix}${String(cardNum).padStart(padding, "0")}`;
    const activationCode = generateActivationCode();

    const card: Card = {
      id: `crd_${batchId}_${i + 1}`,
      business_id: input.business_id || "",
      slug: slug,
      name: `${input.product_type || "NFCFlow Card"} - ${slug}`,
      destination_type: "google_review",
      destination_url: "",
      status: "draft",
      inventory_status: "GENERATED",
      activation_code: activationCode,
      batch_id: batchId,
      nfc_programmed: true,
      qr_tested: true,
      notes: `Generated in ${input.batch_name}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if slug already exists; if so, append random suffix
    if (db.cards.some((c) => c.slug.toLowerCase() === slug.toLowerCase())) {
      card.slug = `${slug}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    }

    generatedCards.push(card);
    db.cards.unshift(card);
  }

  saveDb();

  // Try background Supabase synchronization if configured
  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await client.from("card_batches").insert({
          id: batchId,
          batch_name: newBatch.batch_name,
          quantity: newBatch.quantity,
          prefix: newBatch.prefix,
          product_type: newBatch.product_type,
          business_id: newBatch.business_id || null,
          status: newBatch.status,
        });

        // Batch insert cards in chunks of 50
        for (let c = 0; c < generatedCards.length; c += 50) {
          const chunk = generatedCards.slice(c, c + 50).map((card) => ({
            business_id: card.business_id || null,
            slug: card.slug,
            name: card.name,
            destination_type: card.destination_type,
            destination_url: card.destination_url || "",
            status: card.status,
            inventory_status: card.inventory_status,
            activation_code: card.activation_code,
            batch_id: batchId,
            nfc_programmed: card.nfc_programmed,
            qr_tested: card.qr_tested,
            notes: card.notes,
          }));
          await client.from("cards").insert(chunk);
        }
      } catch (e) {
        console.warn("Supabase createBatch background sync note:", e);
      }
    }
  }

  return { batch: newBatch, cards: generatedCards };
}

export async function updateBatch(id: string, updates: Partial<CardBatch>): Promise<CardBatch | null> {
  const db = loadDb();
  const index = db.batches.findIndex((b) => b.id === id);
  if (index === -1) return null;

  db.batches[index] = {
    ...db.batches[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // If batch status was updated, propagate to unactivated batch cards
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
        await client
          .from("card_batches")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      } catch (e) {
        console.warn("Supabase updateBatch note:", e);
      }
    }
  }

  return db.batches[index];
}

export async function deleteBatch(id: string): Promise<boolean> {
  const db = loadDb();
  const initialLength = db.batches.length;
  db.batches = db.batches.filter((b) => b.id !== id);
  // remove batch cards that are still in generated/draft state
  db.cards = db.cards.filter((c) => !(c.batch_id === id && c.status === "draft"));
  saveDb();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await client.from("card_batches").delete().eq("id", id);
        await client.from("cards").delete().eq("batch_id", id);
      } catch (e) {
        console.warn("Supabase deleteBatch note:", e);
      }
    }
  }

  return db.batches.length < initialLength;
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

  const card = await getCardBySlug(cleanId) || await getCardById(cleanId);

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

  // Check activation code
  const storedCode = (card.activation_code || "").trim().toUpperCase().replace(/\s+/g, "");
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
  const db = loadDb();

  // Business Registration & Association (Mandatory tracking)
  let finalBiz: Business | null = null;

  if (params.business_id) {
    finalBiz = await getBusinessById(params.business_id);
  }

  if (!finalBiz && params.business_name) {
    const cleanName = params.business_name.trim();
    const cleanEmail = params.business_email?.trim().toLowerCase();
    const cleanPhone = params.business_phone?.trim();

    // Check if business already exists by email, phone, or name
    const existingBiz = db.businesses.find(
      (b) =>
        (cleanEmail && b.email?.toLowerCase() === cleanEmail) ||
        (cleanPhone && b.phone === cleanPhone) ||
        b.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingBiz) {
      finalBiz = existingBiz;
      // Update contact details if newly provided
      if ((!existingBiz.phone && cleanPhone) || (!existingBiz.email && cleanEmail) || (!existingBiz.address && params.business_address)) {
        await updateBusiness(existingBiz.id, {
          phone: existingBiz.phone || cleanPhone,
          email: existingBiz.email || cleanEmail,
          address: existingBiz.address || params.business_address,
          category: existingBiz.category || params.business_category,
        });
      }
    } else {
      // Create new registered business
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

      // If email provided, create a user record if not exists
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

  // Fallback to default if somehow no business was provided
  const finalBizId = finalBiz ? finalBiz.id : (card.business_id || "biz_swasthya_medical");
  const businessDisplayName = finalBiz ? finalBiz.name : "Your Business";

  const updated = await updateCard(card.id, {
    business_id: finalBizId,
    name: params.card_name || `${businessDisplayName} - ${card.slug}`,
    destination_type: params.destination_type,
    destination_url: params.destination_url,
    status: "active",
    inventory_status: "ACTIVE",
    branch: params.branch?.trim() || finalBiz?.branch || card.branch,
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
// REDIRECT EVENT & SCAN LOGGING
// ==========================================

export async function recordScanEvent(event: Omit<RedirectEvent, "id">): Promise<RedirectEvent> {
  const db = loadDb();
  const newEvent: RedirectEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };

  db.events.unshift(newEvent);
  saveDb();

  if (isSupabaseConfigured) {
    const client = getActiveSupabaseClient();
    if (client) {
      try {
        await client
          .from("redirect_events")
          .insert({
            card_id: event.card_id,
            slug: event.slug,
            business_id: event.business_id || null,
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
  let events = [...db.events];

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
        if (!error && data && data.length > 0) {
          const seen = new Set<string>();
          const merged: RedirectEvent[] = [];
          for (const ev of data as RedirectEvent[]) {
            seen.add(ev.id);
            merged.push(ev);
          }
          for (const ev of db.events) {
            if (!seen.has(ev.id)) {
              seen.add(ev.id);
              merged.push(ev);
            }
          }
          events = merged;
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
