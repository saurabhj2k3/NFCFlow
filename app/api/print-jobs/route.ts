import { NextRequest, NextResponse } from "next/server";
import { createPrintJob, getAllPrintJobs } from "@/lib/db/print-jobs-store";
import { processPrintJob } from "@/lib/print/engine";
import { getTemplateById } from "@/lib/templates/registry";

export async function GET() {
  try {
    const jobs = getAllPrintJobs();
    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      job_name,
      batch_id,
      template_id = "google-review-v1",
      card_data = [],
      sheet_config,
      export_options = {
        generatePdf: true,
        generateCardsZip: true,
        generateQrZip: true,
        generateManifest: true,
      },
    } = body;

    // Validate inputs
    if (!Array.isArray(card_data) || card_data.length === 0) {
      return NextResponse.json(
        { error: "card_data array cannot be empty. Please provide at least 1 card row." },
        { status: 400 }
      );
    }

    const template = getTemplateById(template_id);
    if (!template) {
      return NextResponse.json(
        { error: `Template with ID '${template_id}' was not found.` },
        { status: 404 }
      );
    }

    // Default Sheet Config if not provided
    const defaultSheetConfig = {
      sheetSize: "A4" as const,
      sheetWidth: 210,
      sheetHeight: 297,
      cardsPerRow: 3,
      cardsPerCol: 3,
      marginX: 10,
      marginY: 15,
      gapX: 4,
      gapY: 4,
      includeCutMarks: true,
      includeBleed: true,
      bleedAmount: 2.0,
      includeCardIdQA: false,
      includeHeaderInfo: true,
      ...(sheet_config || {}),
    };

    // Create the job record in database/store
    const newJob = createPrintJob({
      job_name,
      batch_id,
      template_id,
      card_data,
      sheet_config: defaultSheetConfig,
      export_options,
    });

    // Start asynchronous processing (non-blocking for large batches)
    // We kick it off without blocking the initial HTTP response
    processPrintJob({ job: newJob }).catch((err) => {
      console.error(`Background processing for job ${newJob.id} failed:`, err);
    });

    return NextResponse.json({
      success: true,
      job: newJob,
      message: `Print job created for ${card_data.length} cards. Processing in background.`,
    });
  } catch (err: any) {
    console.error("Failed to create print job:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create print job." },
      { status: 500 }
    );
  }
}
