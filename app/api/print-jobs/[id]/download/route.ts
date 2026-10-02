import { NextRequest, NextResponse } from "next/server";
import { getPrintJobById } from "@/lib/db/print-jobs-store";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "pdf"; // pdf | cards_zip | qr_zip | manifest

    const job = getPrintJobById(id);
    if (!job) {
      return NextResponse.json({ error: "Print job not found." }, { status: 404 });
    }

    const exportDir = path.join(process.cwd(), "public", "exports", id);

    let filePath = "";
    let filename = "";
    let contentType = "";

    if (type === "pdf") {
      filePath = path.join(exportDir, "print_cards.pdf");
      filename = `NFCFlow_${id}_Print_Cards_300DPI.pdf`;
      contentType = "application/pdf";
    } else if (type === "cards_zip") {
      filePath = path.join(exportDir, "cards_300dpi.zip");
      filename = `NFCFlow_${id}_Cards_PNG_300DPI.zip`;
      contentType = "application/zip";
    } else if (type === "qr_zip") {
      filePath = path.join(exportDir, "qr_codes_300dpi.zip");
      filename = `NFCFlow_${id}_QR_Codes.zip`;
      contentType = "application/zip";
    } else if (type === "manifest") {
      filePath = path.join(exportDir, "manifest.csv");
      filename = `NFCFlow_${id}_Production_Manifest.csv`;
      contentType = "text/csv; charset=utf-8";
    } else {
      return NextResponse.json({ error: "Invalid download type." }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Requested file for job ${id} does not exist on server.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(fileBuffer);
    const encodedFilename = encodeURIComponent(filename);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    console.error("Download route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
