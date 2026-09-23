import { NextRequest, NextResponse } from "next/server";
import { createBusiness, getBusinesses } from "@/lib/db/store";
import { isValidDestinationUrl } from "@/lib/redirect/validator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const businesses = await getBusinesses();
    return NextResponse.json({ success: true, data: businesses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, google_review_url, phone, email, address, website_url, whatsapp_number, brand_color } = body;

    if (!name || !google_review_url) {
      return NextResponse.json(
        { success: false, error: "Business name and default Google Review URL are required." },
        { status: 400 }
      );
    }

    if (!isValidDestinationUrl(google_review_url)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Google Review URL (e.g., https://g.page/r/.../review)" },
        { status: 400 }
      );
    }

    const cleanSlug = (slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-+|-+$/g, "");

    const newBusiness = await createBusiness({
      name: name.trim(),
      slug: cleanSlug,
      google_review_url: google_review_url.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      address: address?.trim(),
      website_url: website_url?.trim(),
      whatsapp_number: whatsapp_number?.trim(),
      brand_color: brand_color || "#4f46e5",
      status: "active",
    });

    return NextResponse.json({ success: true, data: newBusiness }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
