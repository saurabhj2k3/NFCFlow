import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvedouflueusgxzdqiwf.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWRvdWZsdWV1c2d4emRxaXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM3MzQsImV4cCI6MjEwNTc1OTczNH0.Jpnlzv8AvOxaXhj6ThAMweH-eq443covUHb_7QQQohg";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
