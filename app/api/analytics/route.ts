import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, getScanEvents } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("business_id") || undefined;
    const cardId = searchParams.get("card_id") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const summary = await getAnalyticsSummary(businessId, cardId);
    const recentEvents = await getScanEvents({ business_id: businessId, card_id: cardId, limit });

    return NextResponse.json({
      success: true,
      data: {
        summary,
        recentEvents,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
