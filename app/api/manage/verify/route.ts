import { NextRequest, NextResponse } from "next/server";
import { verifyCardManagementAuth } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { card_id, activation_code } = body;

    if (!card_id || !activation_code) {
      return NextResponse.json(
        { success: false, error: "Card ID and secret Activation Code are required." },
        { status: 400 }
      );
    }

    const result = await verifyCardManagementAuth(card_id, activation_code);

    if (!result.valid || !result.card) {
      return NextResponse.json(
        {
          success: false,
          not_activated: result.not_activated || false,
          card_slug: result.card?.slug || card_id,
          error: result.message || "Invalid Card ID or Activation Code.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      card: result.card,
      business: result.business,
      scan_count: result.scanCount || 0,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Manage verify API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Card verification error" },
      { status: 500 }
    );
  }
}
