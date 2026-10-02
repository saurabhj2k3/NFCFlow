import { NextRequest, NextResponse } from "next/server";
import { getPrintJobById, deletePrintJob } from "@/lib/db/print-jobs-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = getPrintJobById(id);

    if (!job) {
      return NextResponse.json({ error: "Print job not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deletePrintJob(id);

    if (!deleted) {
      return NextResponse.json({ error: "Print job not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Print job deleted." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
