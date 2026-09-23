import { NextRequest, NextResponse } from "next/server";
import { createCard, getCards } from "@/lib/db/store";
import { generateSlug } from "@/lib/utils";
import { isValidDestinationUrl } from "@/lib/redirect/validator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("business_id") || undefined;
    const cards = await getCards(businessId);
    return NextResponse.json({ success: true, data: cards });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, name, destination_type, destination_url, status, slug, notes } = body;

    if (!business_id || !name || !destination_type || !destination_url) {
      return NextResponse.json(
        { success: false, error: "Business ID, card name, destination type, and destination URL are required." },
        { status: 400 }
      );
    }

    if (!isValidDestinationUrl(destination_url)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination URL. Must be a valid HTTPS or HTTP address." },
        { status: 400 }
      );
    }

    // Auto-generate unique slug if not provided
    const finalSlug = (slug?.trim() || generateSlug(6)).replace(/[^a-zA-Z0-9_-]/g, "");

    const newCard = await createCard({
      business_id,
      name: name.trim(),
      destination_type,
      destination_url: destination_url.trim(),
      slug: finalSlug,
      status: status || "active",
      notes: notes?.trim(),
    });

    return NextResponse.json({ success: true, data: newCard }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
