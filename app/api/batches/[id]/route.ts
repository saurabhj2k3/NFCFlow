import { NextRequest, NextResponse } from "next/server";
import { getBatchById, updateBatch, deleteBatch } from "@/lib/db/store";

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

    return NextResponse.json({
      success: true,
      data: result.batch,
      cards: result.cards,
    });
  } catch (error: any) {
    console.error("GET /api/batches/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch batch" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateBatch(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Batch updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH /api/batches/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update batch" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteBatch(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Batch not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/batches/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete batch" },
      { status: 500 }
    );
  }
}
