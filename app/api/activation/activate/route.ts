import { NextRequest, NextResponse } from "next/server";
import { activateCardByCode } from "@/lib/db/store";
import { isValidDestinationUrl, sanitizeDestinationUrl } from "@/lib/redirect/validator";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      card_id,
      activation_code,
      destination_type,
      destination_url,
      business_name,
      business_phone,
      business_email,
      business_address,
      business_category,
      business_id,
      card_name,
      branch,
    } = body;

    // Validate Card Identifiers
    if (!card_id || !activation_code) {
      return NextResponse.json(
        {
          success: false,
          error: "Card ID and Activation Code are required.",
        },
        { status: 400 }
      );
    }

    // Validate Mandatory Business Registration
    if (!business_id) {
      if (!business_name || !business_name.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Business Name is required. Please register your business profile before activating.",
          },
          { status: 400 }
        );
      }

      if (!business_phone || !business_phone.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Business contact phone number is required for verification and support.",
          },
          { status: 400 }
        );
      }

      if (!business_email || !business_email.trim() || !business_email.includes("@")) {
        return NextResponse.json(
          {
            success: false,
            error: "A valid business email address is required to create your owner profile.",
          },
          { status: 400 }
        );
      }
    }

    // Validate Destination URL
    if (!destination_type || !destination_url) {
      return NextResponse.json(
        {
          success: false,
          error: "Destination type and target URL/number are required.",
        },
        { status: 400 }
      );
    }

    // Format & validate destination URL
    let formattedUrl = destination_url.trim();

    if (destination_type === "whatsapp") {
      // If user passed a plain phone number, format to https://wa.me/XXXXXXXXXX
      if (!formattedUrl.startsWith("http")) {
        const cleanNumber = formattedUrl.replace(/\D/g, "");
        formattedUrl = `https://wa.me/${cleanNumber}`;
      }
    } else if (destination_type === "instagram") {
      if (!formattedUrl.startsWith("http")) {
        const cleanHandle = formattedUrl.replace("@", "").trim();
        formattedUrl = `https://instagram.com/${cleanHandle}`;
      }
    } else if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (!isValidDestinationUrl(formattedUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid destination URL. Please check your link format.",
        },
        { status: 400 }
      );
    }

    formattedUrl = sanitizeDestinationUrl(formattedUrl);

    const result = await activateCardByCode({
      cardIdentifier: card_id,
      activationCode: activation_code,
      destination_type,
      destination_url: formattedUrl,
      business_id,
      business_name: business_name?.trim(),
      business_phone: business_phone?.trim(),
      business_email: business_email?.trim(),
      business_address: business_address?.trim(),
      business_category: business_category?.trim(),
      card_name: card_name?.trim(),
      branch: branch?.trim(),
    });

    if (!result.success || !result.card) {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to activate card" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.card,
      business: result.business,
      message: result.message,
    });
  } catch (error: any) {
    console.error("POST /api/activation/activate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to activate card" },
      { status: 500 }
    );
  }
}
