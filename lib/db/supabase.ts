import { createClient } from "@supabase/supabase-js";

// ============================================================================
// DIRECT SUPABASE IN-CODE CONFIGURATION
// You can paste your Supabase Project URL and Keys directly into the strings below:
// ============================================================================
const DIRECT_SUPABASE_URL = "https://tvedouflueusgxzdqiwf.supabase.co";
const DIRECT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWRvdWZsdWV1c2d4emRxaXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM3MzQsImV4cCI6MjEwNTc1OTczNH0.Jpnlzv8AvOxaXhj6ThAMweH-eq443covUHb_7QQQohg";
const DIRECT_SUPABASE_SERVICE_ROLE_KEY = "";

const supabaseUrl = DIRECT_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = DIRECT_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = DIRECT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && (supabaseAnonKey || supabaseServiceKey) && !supabaseUrl.includes("your-project")
);

// Standard client for public/anon operations (e.g. public redirects, client-side reads)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;

// Admin client with service_role key to bypass RLS for server-side management and background operations
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

export function getActiveSupabaseClient() {
  return supabaseAdmin || supabase;
}

export interface SupabaseHealthResult {
  connected: boolean;
  urlConfigured: boolean;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
  tables: {
    businesses: boolean;
    cards: boolean;
    redirect_events: boolean;
    users: boolean;
  };
  counts?: {
    businesses: number;
    cards: number;
    redirect_events: number;
  };
  error?: string;
  latencyMs?: number;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  const result: SupabaseHealthResult = {
    connected: false,
    urlConfigured: Boolean(supabaseUrl && !supabaseUrl.includes("your-project")),
    hasAnonKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes("your-anon")),
    hasServiceKey: Boolean(supabaseServiceKey && !supabaseServiceKey.includes("your-service")),
    tables: {
      businesses: false,
      cards: false,
      redirect_events: false,
      users: false,
    },
  };

  if (!isSupabaseConfigured) {
    result.error = "Supabase environment variables not configured in .env.local";
    return result;
  }

  const client = getActiveSupabaseClient();
  if (!client) {
    result.error = "Supabase client initialization failed";
    return result;
  }

  const startTime = Date.now();

  try {
    // Test businesses table
    const { count: bizCount, error: bizErr } = await client
      .from("businesses")
      .select("*", { count: "exact", head: true });
    
    if (!bizErr) {
      result.tables.businesses = true;
    }

    // Test cards table
    const { count: cardCount, error: cardErr } = await client
      .from("cards")
      .select("*", { count: "exact", head: true });

    if (!cardErr) {
      result.tables.cards = true;
    }

    // Test redirect_events table
    const { count: eventCount, error: eventErr } = await client
      .from("redirect_events")
      .select("*", { count: "exact", head: true });

    if (!eventErr) {
      result.tables.redirect_events = true;
    }

    // Test users table
    const { error: userErr } = await client
      .from("users")
      .select("id", { count: "exact", head: true });

    if (!userErr) {
      result.tables.users = true;
    }

    result.latencyMs = Date.now() - startTime;
    result.connected = result.tables.businesses && result.tables.cards && result.tables.redirect_events;
    result.counts = {
      businesses: bizCount || 0,
      cards: cardCount || 0,
      redirect_events: eventCount || 0,
    };

    if (!result.connected) {
      const missing = Object.entries(result.tables)
        .filter(([, exists]) => !exists)
        .map(([table]) => table);
      result.error = `Connected to Supabase project, but missing tables: ${missing.join(", ")}. Please run schema.sql migration.`;
    }
  } catch (err: any) {
    result.error = err.message || "Failed connecting to Supabase";
    result.latencyMs = Date.now() - startTime;
  }

  return result;
}
