import { NextRequest, NextResponse } from "next/server";
import { getCardById } from "@/lib/db/store";
import { generateCardSvg, CR80_WIDTH_MM, CR80_HEIGHT_MM } from "@/lib/print/svg-generator";
import { getTemplateById } from "@/lib/templates/registry";
import { getCardRedirectUrl } from "@/lib/utils";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "png"; // png | svg | pdf
    const bleed = parseFloat(searchParams.get("bleed") || "2.0");
    const templateId = searchParams.get("template_id") || "google-review-v1";

    const card = await getCardById(id);
    if (!card) {
      return NextResponse.json({ error: "Card not found." }, { status: 404 });
    }

    const template = getTemplateById(templateId) || getTemplateById("google-review-v1")!;
    const cardId = card.slug;
    const qrUrl = getCardRedirectUrl(card.slug, "qr");

    // Generate high resolution authentic SVG
    const svgString = await generateCardSvg({
      cardId,
      qrUrl,
      template,
      includeBleed: bleed > 0,
      bleedAmountMm: bleed,
      dpi: 300,
      showCardIdQA: false,
    });

    if (format === "svg") {
      return new Response(svgString, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Content-Disposition": `attachment; filename="nfcflow_${card.slug}_cr80.svg"`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Render 300 DPI High-Res PNG Buffer with Sharp
    const pngBuffer = await sharp(Buffer.from(svgString), { density: 450 })
      .png({ compressionLevel: 6 })
      .toBuffer();

    if (format === "png") {
      return new Response(new Uint8Array(pngBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="nfcflow_${card.slug}_300dpi.png"`,
          "Content-Length": pngBuffer.length.toString(),
          "Cache-Control": "no-cache",
        },
      });
    }

    if (format === "pdf") {
      const MM_TO_PT = 72 / 25.4;
      const pdfDoc = await PDFDocument.create();
      const cardWidthMm = CR80_WIDTH_MM + bleed * 2;
      const cardHeightMm = CR80_HEIGHT_MM + bleed * 2;
      const page = pdfDoc.addPage([cardWidthMm * MM_TO_PT, cardHeightMm * MM_TO_PT]);

      const embeddedImage = await pdfDoc.embedPng(pngBuffer);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: cardWidthMm * MM_TO_PT,
        height: cardHeightMm * MM_TO_PT,
      });

      const pdfBytes = await pdfDoc.save();
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="nfcflow_${card.slug}_cr80.pdf"`,
          "Content-Length": pdfBytes.byteLength.toString(),
          "Cache-Control": "no-cache",
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format. Use 'png', 'svg', or 'pdf'." }, { status: 400 });
  } catch (err: any) {
    console.error("Card single export error:", err);
    return NextResponse.json({ error: err.message || "Failed to export card." }, { status: 500 });
  }
}
