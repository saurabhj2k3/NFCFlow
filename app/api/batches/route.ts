import { NextRequest, NextResponse } from "next/server";
import { getBatches, createBatch } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const batches = await getBatches();
    return NextResponse.json({
      success: true,
      data: batches,
      count: batches.length,
    });
  } catch (error: any) {
    console.error("GET /api/batches error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load batches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batch_name, quantity, prefix, product_type, card_purpose, business_id, starting_index } = body;

    if (!batch_name || !quantity) {
      return NextResponse.json(
        { success: false, error: "batch_name and quantity are required" },
        { status: 400 }
      );
    }

    const result = await createBatch({
      batch_name,
      quantity: Number(quantity),
      prefix: prefix || "NF",
      product_type: product_type || "NFCFlow CR80 NTAG213",
      card_purpose: card_purpose || "google_review",
      business_id,
      starting_index: starting_index ? Number(starting_index) : 1,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.batch,
        generated_cards_count: result.cards.length,
        message: `Successfully generated batch '${batch_name}' with ${result.cards.length} cards and activation codes.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/batches error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create batch" },
      { status: 500 }
    );
  }
}
