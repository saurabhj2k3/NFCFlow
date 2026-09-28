import { NextRequest, NextResponse } from "next/server";
import { getCardBySlug, recordScanEvent } from "@/lib/db/store";
import { parseDeviceCategory, parseScanSource } from "@/lib/redirect/parser";
import { isValidDestinationUrl, sanitizeDestinationUrl } from "@/lib/redirect/validator";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const sourceParam = searchParams.get("source");
  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");

  if (!slug) {
    return NextResponse.redirect(new URL("/r/invalid", request.url), 302);
  }

  try {
    const card = await getCardBySlug(slug);

    // 1. Card does not exist
    if (!card) {
      const notFoundUrl = new URL("/r/invalid", request.url);
      notFoundUrl.searchParams.set("slug", slug);
      return NextResponse.redirect(notFoundUrl, 302);
    }

    // 2. Unactivated card (Draft, In Stock, Sold, or empty destination)
    const isUnactivated =
      !card.destination_url ||
      card.status === "draft" ||
      card.status === "in_stock" ||
      card.status === "sold" ||
      card.inventory_status === "GENERATED" ||
      card.inventory_status === "PRINTED" ||
      card.inventory_status === "IN_STOCK" ||
      card.inventory_status === "SOLD";

    if (isUnactivated) {
      const unactivatedUrl = new URL("/r/unactivated", request.url);
      unactivatedUrl.searchParams.set("slug", card.slug);
      if (card.batch_name) unactivatedUrl.searchParams.set("batch", card.batch_name);
      return NextResponse.redirect(unactivatedUrl, 302);
    }

    // 3. Card is suspended or archived
    if (card.status === "suspended" || card.status === "archived") {
      const inactiveUrl = new URL("/r/inactive", request.url);
      inactiveUrl.searchParams.set("slug", card.slug);
      inactiveUrl.searchParams.set("status", card.status);
      inactiveUrl.searchParams.set("business", card.business_name || "");
      return NextResponse.redirect(inactiveUrl, 302);
    }

    // 4. Destination validation
    let destination = card.destination_url;
    if (!destination || !isValidDestinationUrl(destination)) {
      const errorUrl = new URL("/r/invalid", request.url);
      errorUrl.searchParams.set("slug", card.slug);
      errorUrl.searchParams.set("error", "invalid_destination");
      return NextResponse.redirect(errorUrl, 302);
    }

    destination = sanitizeDestinationUrl(destination);

    // 5. Parse source and device category for privacy-preserving analytics
    const source = parseScanSource(sourceParam, referrer);
    const deviceType = parseDeviceCategory(userAgent);

    // 6. Asynchronously log the redirect event without blocking the response
    recordScanEvent({
      card_id: card.id,
      slug: card.slug,
      business_id: card.business_id || "biz_direct",
      source,
      device_type: deviceType,
      user_agent: userAgent?.slice(0, 180) || undefined,
      referrer: referrer?.slice(0, 180) || undefined,
      scanned_at: new Date().toISOString(),
    }).catch((err) => {
      console.error("Async scan logging failed:", err);
    });

    // 7. Fast HTTP 302 Temporary Redirect to the dynamic destination
    return NextResponse.redirect(destination, 302);
  } catch (error) {
    console.error("Redirect handler error:", error);
    const errorUrl = new URL("/r/invalid", request.url);
    errorUrl.searchParams.set("slug", slug);
    return NextResponse.redirect(errorUrl, 302);
  }
}
