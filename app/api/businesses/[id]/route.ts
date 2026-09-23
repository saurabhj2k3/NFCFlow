import { NextRequest, NextResponse } from "next/server";
import { deleteBusiness, getBusinessById, updateBusiness } from "@/lib/db/store";
import { isValidDestinationUrl } from "@/lib/redirect/validator";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const business = await getBusinessById(id);
    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: business });
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

    if (body.google_review_url && !isValidDestinationUrl(body.google_review_url)) {
      return NextResponse.json(
        { success: false, error: "Invalid Google Review URL" },
        { status: 400 }
      );
    }

    const updated = await updateBusiness(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
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
    const success = await deleteBusiness(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Business deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
