import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const DIRECT_SUPABASE_URL = "https://tvedouflueusgxzdqiwf.supabase.co";
const DIRECT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWRvdWZsdWV1c2d4emRxaXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM3MzQsImV4cCI6MjEwNTc1OTczNH0.Jpnlzv8AvOxaXhj6ThAMweH-eq443covUHb_7QQQohg";

const supabase = createClient(DIRECT_SUPABASE_URL, DIRECT_SUPABASE_ANON_KEY);

async function wipe() {
  console.log("=== WIPING ALL PREVIOUS & TEST DATA ===");

  // 1. Wipe Supabase tables
  console.log("1. Deleting Supabase redirect_events...");
  const { error: evErr } = await supabase.from("redirect_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (evErr) console.warn("Events delete warning:", evErr.message);

  console.log("2. Deleting Supabase cards...");
  const { error: cardErr } = await supabase.from("cards").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (cardErr) console.warn("Cards delete warning:", cardErr.message);

  console.log("3. Deleting Supabase card_batches...");
  const { error: batchErr } = await supabase.from("card_batches").delete().neq("id", "none");
  if (batchErr) console.warn("Batches delete warning:", batchErr.message);

  console.log("4. Deleting Supabase businesses...");
  const { error: bizErr } = await supabase.from("businesses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (bizErr) console.warn("Businesses delete warning:", bizErr.message);

  // 2. Wipe Local files
  console.log("5. Clearing local data/store.json...");
  const emptyDb = {
    users: [],
    businesses: [],
    cards: [],
    batches: [],
    events: []
  };

  const storePath = path.join(process.cwd(), "data", "store.json");
  fs.writeFileSync(storePath, JSON.stringify(emptyDb, null, 2), "utf-8");

  const tmpPath = path.join("/tmp", "nfcflow_store.json");
  try {
    if (fs.existsSync(tmpPath)) {
      fs.writeFileSync(tmpPath, JSON.stringify(emptyDb, null, 2), "utf-8");
    }
  } catch {}

  console.log("=== ALL TEST AND PREVIOUS DATA WIPED SUCCESSFULLY ===");
  console.log("Database is clean and ready for manual testing.");
}

wipe();
