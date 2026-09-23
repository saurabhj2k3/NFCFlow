import { NextRequest, NextResponse } from "next/server";
import { deleteCard, getCardById, updateCard } from "@/lib/db/store";
import { isValidDestinationUrl } from "@/lib/redirect/validator";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const card = await getCardById(id);
    if (!card) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: card });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (body.destination_url && !isValidDestinationUrl(body.destination_url)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination URL" },
        { status: 400 }
      );
    }

    const updated = await updateCard(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const success = await deleteCard(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Card deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
