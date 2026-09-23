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

      // 2. Card is not active (Draft, Suspended, or Archived)
      if (card.status !== "active") {
        const inactiveUrl = new URL("/r/inactive", request.url);
        inactiveUrl.searchParams.set("slug", slug);
        inactiveUrl.searchParams.set("status", card.status);
        inactiveUrl.searchParams.set("business", card.business_name || "");
        return NextResponse.redirect(inactiveUrl, 302);
      }

      // 3. Destination validation
      let destination = card.destination_url;
      if (!destination || !isValidDestinationUrl(destination)) {
        const errorUrl = new URL("/r/invalid", request.url);
        errorUrl.searchParams.set("slug", slug);
        errorUrl.searchParams.set("error", "invalid_destination");
        return NextResponse.redirect(errorUrl, 302);
      }

      destination = sanitizeDestinationUrl(destination);

      // 4. Parse source and device category for privacy-preserving analytics
      const source = parseScanSource(sourceParam, referrer);
      const deviceType = parseDeviceCategory(userAgent);

      // 5. Asynchronously log the redirect event without blocking the response
      recordScanEvent({
        card_id: card.id,
        slug: card.slug,
        business_id: card.business_id,
        source,
        device_type: deviceType,
        user_agent: userAgent?.slice(0, 180) || undefined,
        referrer: referrer?.slice(0, 180) || undefined,
        scanned_at: new Date().toISOString(),
      }).catch((err) => {
        console.error("Async scan logging failed:", err);
      });

      // 6. Fast 302 Temporary Redirect to the destination
      return NextResponse.redirect(destination, 302);
    } catch (error) {
      console.error("Redirect handler error:", error);
      const errorUrl = new URL("/r/invalid", request.url);
      errorUrl.searchParams.set("slug", slug);
      return NextResponse.redirect(errorUrl, 302);
    }
}
