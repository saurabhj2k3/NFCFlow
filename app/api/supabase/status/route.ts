import { NextResponse } from "next/server";
import { checkSupabaseHealth, isSupabaseConfigured } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await checkSupabaseHealth();
    return NextResponse.json({
      configured: isSupabaseConfigured,
      health,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: isSupabaseConfigured,
        health: {
          connected: false,
          error: error.message || "Failed to check Supabase health",
        },
      },
      { status: 500 }
    );
  }
}
