import { NextRequest, NextResponse } from "next/server";
import { getScanEvents } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("business_id") || undefined;
    const cardId = searchParams.get("card_id") || undefined;

    const events = await getScanEvents({ business_id: businessId, card_id: cardId, limit: 10000 });

    const header = ["Event ID", "Card Slug", "Business ID", "Source", "Device Type", "Timestamp", "Referrer"].join(",");
    const rows = events.map((e) =>
      [
        `"${e.id}"`,
        `"${e.slug}"`,
        `"${e.business_id}"`,
        `"${e.source}"`,
        `"${e.device_type}"`,
        `"${e.scanned_at}"`,
        `"${(e.referrer || "").replace(/"/g, '""')}"`,
      ].join(",")
    );

    const csvContent = [header, ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="nfcflow-scans-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
