import { NextRequest, NextResponse } from "next/server";
import { getBatchById } from "@/lib/db/store";
import { getCardRedirectUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getBatchById(id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 }
      );
    }

    const { batch, cards } = result;

    // Build CSV Content
    const headers = [
      "Card ID",
      "Public Redirect URL",
      "NFC Permanent URL",
      "Activation Code",
      "Product Type",
      "Batch Name",
      "Inventory Status",
      "Card Status",
      "Destination Type",
      "Current Destination URL",
      "Created Date",
    ];

    const rows = cards.map((card) => {
      const publicUrl = getCardRedirectUrl(card.slug);
      return [
        `"${card.slug}"`,
        `"${publicUrl}"`,
        `"${publicUrl}?source=nfc"`,
        `"${card.activation_code || ""}"`,
        `"${batch.product_type}"`,
        `"${batch.batch_name}"`,
        `"${card.inventory_status || "GENERATED"}"`,
        `"${card.status}"`,
        `"${card.destination_type}"`,
        `"${card.destination_url || ""}"`,
        `"${card.created_at}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const sanitizedBatchName = batch.batch_name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `NFCFlow_${sanitizedBatchName}_Cards.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/batches/[id]/export error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export batch" },
      { status: 500 }
    );
  }
}
