import { NextResponse } from "next/server";
import { getActiveSupabaseClient, isSupabaseConfigured } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 400 }
    );
  }

  const client = getActiveSupabaseClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase client not initialized" },
      { status: 500 }
    );
  }

  try {
    // 1. Seed Businesses
    const businessesToInsert = [
      {
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
      },
      {
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
      },
    ];

    const { data: insertedBiz, error: bizErr } = await client
      .from("businesses")
      .upsert(businessesToInsert, { onConflict: "slug" })
      .select();

    if (bizErr) {
      throw new Error(`Failed to seed businesses: ${bizErr.message}`);
    }

    const swasthyaBiz = insertedBiz?.find((b) => b.slug === "swasthya-medical");
    const cafeBiz = insertedBiz?.find((b) => b.slug === "artisan-brew");

    // 2. Seed Cards
    if (swasthyaBiz) {
      const cardsToInsert = [
        {
          business_id: swasthyaBiz.id,
          slug: "X7k29P",
          name: "Billing Counter 01 (Front Entrance)",
          destination_type: "google_review",
          destination_url: "https://g.page/r/CbXx_swasthya_review/review",
          status: "active",
          nfc_programmed: true,
          qr_tested: true,
          notes: "Main acrylic counter standee with NTAG213 PVC Card",
        },
        {
          business_id: swasthyaBiz.id,
          slug: "MED002",
          name: "Pharmacy Dispensing Desk 02",
          destination_type: "whatsapp",
          destination_url: "https://wa.me/919876543210?text=Hello%20Swasthya%20Medical%2C%20I%20need%20a%20prescription%20refill",
          status: "active",
          nfc_programmed: true,
          qr_tested: true,
          notes: "Placed next to medicine pickup window for repeat orders",
        },
        {
          business_id: swasthyaBiz.id,
          slug: "MED003",
          name: "Doctor Consultation Desk",
          destination_type: "google_review",
          destination_url: "https://g.page/r/CbXx_swasthya_review/review",
          status: "draft",
          nfc_programmed: false,
          qr_tested: false,
          notes: "Ready for printing and encoding",
        },
      ];

      if (cafeBiz) {
        cardsToInsert.push({
          business_id: cafeBiz.id,
          slug: "CAFE01",
          name: "Espresso Bar Standee",
          destination_type: "google_review",
          destination_url: "https://g.page/r/CdYy_artisan_review/review",
          status: "active",
          nfc_programmed: true,
          qr_tested: true,
          notes: "Front POS terminal review stand",
        });
      }

      await client.from("cards").upsert(cardsToInsert, { onConflict: "slug" });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase database seeded successfully with business locations and review cards!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to seed Supabase database" },
      { status: 500 }
    );
  }
}
