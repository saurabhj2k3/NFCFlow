import { NextRequest, NextResponse } from "next/server";
import { wipeAllDatabaseData } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const result = await wipeAllDatabaseData();
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Admin wipe error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to wipe database data" },
      { status: 500 }
    );
  }
}
