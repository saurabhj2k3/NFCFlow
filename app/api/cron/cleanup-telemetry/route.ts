import { NextRequest, NextResponse } from "next/server";
import { rollupAndPurgeOldTelemetry } from "@/lib/db/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/cleanup-telemetry
 * Nightly cron worker that aggregates raw scan events older than 60 days
 * into compact daily summaries and purges individual row logs.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days");
    const retentionDays = daysParam ? parseInt(daysParam, 10) : 60;

    const result = await rollupAndPurgeOldTelemetry(retentionDays);

    return NextResponse.json({
      success: true,
      retention_days: retentionDays,
      purged_raw_logs: result.purgedLogs,
      rolled_up_days: result.rolledUpDays,
      message: result.message,
      executed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute telemetry cleanup",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
