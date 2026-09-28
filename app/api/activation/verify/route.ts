import { NextRequest, NextResponse } from "next/server";
import { verifyCardActivation } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { card_id, activation_code } = body;

    if (!card_id || !activation_code) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide both the Card ID (e.g. NF001) and the Activation Code printed on your packaging.",
        },
        { status: 400 }
      );
    }

    const verification = await verifyCardActivation(card_id, activation_code);

    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          error: verification.message,
          already_active: verification.already_active,
          card: verification.card,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      card: {
        id: verification.card?.id,
        slug: verification.card?.slug,
        name: verification.card?.name,
        destination_type: verification.card?.destination_type,
        destination_url: verification.card?.destination_url,
        batch_name: verification.card?.batch_name,
        status: verification.card?.status,
        inventory_status: verification.card?.inventory_status,
      },
      message: verification.message,
    });
  } catch (error: any) {
    console.error("POST /api/activation/verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify activation code" },
      { status: 500 }
    );
  }
}
