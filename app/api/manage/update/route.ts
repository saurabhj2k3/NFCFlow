import { NextRequest, NextResponse } from "next/server";
import { updateCardDestinationByCode } from "@/lib/db/store";
import { DestinationType } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { card_id, activation_code, destination_type, destination_url, card_name } = body;

    if (!card_id || !activation_code) {
      return NextResponse.json(
        { success: false, error: "Card ID and Activation Code are required." },
        { status: 400 }
      );
    }

    if (!destination_type || !destination_url) {
      return NextResponse.json(
        { success: false, error: "Destination type and target URL are required." },
        { status: 400 }
      );
    }

    // Validate valid destination URL
    let cleanUrl = destination_url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://") && !cleanUrl.startsWith("tel:") && !cleanUrl.startsWith("mailto:")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const result = await updateCardDestinationByCode({
      cardIdentifier: card_id,
      activationCode: activation_code,
      destination_type: destination_type as DestinationType,
      destination_url: cleanUrl,
      card_name: card_name ? card_name.trim() : undefined,
    });

    if (!result.success || !result.card) {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to update card destination." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      card: result.card,
      message: result.message || "Card destination updated successfully!",
    });
  } catch (error: any) {
    console.error("Manage update API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Card update error" },
      { status: 500 }
    );
  }
}
