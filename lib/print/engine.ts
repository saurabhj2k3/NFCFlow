import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import sharp from "sharp";
import QRCode from "qrcode";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import { generateCardSvg, CR80_WIDTH_MM, CR80_HEIGHT_MM } from "./svg-generator";
import { CardTemplate, CsvCardRow, PrintJob, SheetLayoutConfig } from "@/lib/templates/types";
import { getTemplateById } from "@/lib/templates/registry";
import { updatePrintJob } from "@/lib/db/print-jobs-store";
import { getCardRedirectUrl } from "@/lib/utils";

// Unit conversions
const MM_TO_PT = 72 / 25.4; // 1 mm = 2.83465 PDF points
const MM_TO_INCH = 1 / 25.4;

export interface ProcessPrintJobOptions {
  job: PrintJob;
  onProgress?: (processed: number, total: number, percent: number) => void;
}

export async function processPrintJob({ job, onProgress }: ProcessPrintJobOptions): Promise<void> {
  const jobId = job.id;
  const template: CardTemplate = getTemplateById(job.template_id) || getTemplateById("google-review-v1")!;
  const sheetConfig: SheetLayoutConfig = job.sheet_config;
  const cards: CsvCardRow[] = job.card_data;
  const total = cards.length;

  const exportDir = path.join(process.cwd(), "public", "exports", jobId);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  updatePrintJob(jobId, { status: "processing", processed_cards: 0, progress_percent: 0 });

  try {
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);

    const cardsZip = job.export_options.generateCardsZip ? new JSZip() : null;
    const qrZip = job.export_options.generateQrZip ? new JSZip() : null;
    const manifestRows: string[] = [
      "Card ID,QR Redirect URL,Activation Code,Business Name,Sheet Page,Grid Row,Grid Col,Card File",
    ];

    // Sheet Dimensions in PDF Points
    const isSingleCard = sheetConfig.sheetSize === "Single_CR80";
    const bleed = sheetConfig.includeBleed ? (sheetConfig.bleedAmount || 2.0) : 0;
    const cardWidthMm = CR80_WIDTH_MM + bleed * 2;
    const cardHeightMm = CR80_HEIGHT_MM + bleed * 2;

    const sheetWidthPt = isSingleCard
      ? cardWidthMm * MM_TO_PT
      : sheetConfig.sheetWidth * MM_TO_PT;
    const sheetHeightPt = isSingleCard
      ? cardHeightMm * MM_TO_PT
      : sheetConfig.sheetHeight * MM_TO_PT;

    const cardsPerRow = isSingleCard ? 1 : (sheetConfig.cardsPerRow || 3);
    const cardsPerCol = isSingleCard ? 1 : (sheetConfig.cardsPerCol || 3);
    const cardsPerPage = cardsPerRow * cardsPerCol;
    const totalPages = Math.ceil(total / cardsPerPage);

    let currentPage: any = null;
    let pageNumber = 0;

    // Process Cards in asynchronous batches for high throughput & non-blocking execution
    const CHUNK_SIZE = 10;
    let processedCount = 0;

    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunk = cards.slice(i, i + CHUNK_SIZE);

      for (let cIdx = 0; cIdx < chunk.length; cIdx++) {
        const globalIdx = i + cIdx;
        const card = chunk[cIdx];
        const cardId = card.cardId || `CR-${globalIdx + 1}`;
        const qrUrl = card.qrUrl || getCardRedirectUrl(cardId, "qr");

        // 1. Generate SVG String for this card
        const svgString = await generateCardSvg({
          cardId,
          qrUrl,
          template,
          includeBleed: sheetConfig.includeBleed,
          bleedAmountMm: bleed,
          dpi: 300,
          showCardIdQA: sheetConfig.includeCardIdQA,
        });

        // 2. Render 300 DPI High-Res PNG Buffer with Sharp (density 450 produces true 1012x1606px CR80)
        const pngBuffer = await sharp(Buffer.from(svgString), { density: 450 })
          .png({ compressionLevel: 6 })
          .toBuffer();

        // 3. Add to Cards ZIP
        if (cardsZip) {
          cardsZip.file(`${cardId}.png`, pngBuffer);
        }

        // 4. Generate standalone QR PNG if requested
        if (qrZip) {
          const qrBuffer = await QRCode.toBuffer(qrUrl, {
            width: 600,
            margin: 1,
            errorCorrectionLevel: "H",
          });
          qrZip.file(`${cardId}_qr.png`, qrBuffer);
        }

        // 5. Place Card on PDF Sheet
        if (job.export_options.generatePdf) {
          const cardIndexOnPage = globalIdx % cardsPerPage;
          const currentCol = cardIndexOnPage % cardsPerRow;
          const currentRow = Math.floor(cardIndexOnPage / cardsPerRow);

          // Create new page when needed
          if (cardIndexOnPage === 0) {
            pageNumber++;
            currentPage = pdfDoc.addPage([sheetWidthPt, sheetHeightPt]);

            // Draw Header Metadata on Sheet
            if (sheetConfig.includeHeaderInfo && !isSingleCard) {
              currentPage.drawText(`NFCFlow Bulk Print Run: ${job.job_name}`, {
                x: 20,
                y: sheetHeightPt - 18,
                size: 8,
                font: helveticaBold,
                color: rgb(0.2, 0.2, 0.2),
              });
              currentPage.drawText(
                `Sheet ${pageNumber} of ${totalPages} • CR80 (53.98 × 85.60 mm) • Bleed: ${bleed}mm • 300 DPI Commercial Ready`,
                {
                  x: 20,
                  y: sheetHeightPt - 28,
                  size: 7,
                  font: helvetica,
                  color: rgb(0.4, 0.4, 0.4),
                }
              );
            }
          }

          // Calculate Position in Points
          let posXPt: number;
          let posYPt: number;

          if (isSingleCard) {
            posXPt = 0;
            posYPt = 0;
          } else {
            const marginXPt = (sheetConfig.marginX || 10) * MM_TO_PT;
            const marginYPt = (sheetConfig.marginY || 15) * MM_TO_PT;
            const gapXPt = (sheetConfig.gapX || 4) * MM_TO_PT;
            const gapYPt = (sheetConfig.gapY || 4) * MM_TO_PT;
            const cardWPt = cardWidthMm * MM_TO_PT;
            const cardHPt = cardHeightMm * MM_TO_PT;

            posXPt = marginXPt + currentCol * (cardWPt + gapXPt);
            // PDF origin is bottom-left
            posYPt = sheetHeightPt - marginYPt - (currentRow + 1) * cardHPt - currentRow * gapYPt;
          }

          // Embed PNG into PDF
          const embeddedImage = await pdfDoc.embedPng(pngBuffer);
          currentPage.drawImage(embeddedImage, {
            x: posXPt,
            y: posYPt,
            width: cardWidthMm * MM_TO_PT,
            height: cardHeightMm * MM_TO_PT,
          });

          // Draw Crop / Cut Marks if enabled
          if (sheetConfig.includeCutMarks && !isSingleCard) {
            const cutLineLen = 6;
            const cutColor = rgb(0.7, 0.7, 0.7);

            // Bleed offset
            const bPt = bleed * MM_TO_PT;
            const actualCardWPt = CR80_WIDTH_MM * MM_TO_PT;
            const actualCardHPt = CR80_HEIGHT_MM * MM_TO_PT;
            const x0 = posXPt + bPt;
            const y0 = posYPt + bPt;
            const x1 = x0 + actualCardWPt;
            const y1 = y0 + actualCardHPt;

            // Top-left mark
            currentPage.drawLine({ start: { x: x0 - cutLineLen, y: y1 }, end: { x: x0, y: y1 }, thickness: 0.5, color: cutColor });
            currentPage.drawLine({ start: { x: x0, y: y1 + cutLineLen }, end: { x: x0, y: y1 }, thickness: 0.5, color: cutColor });
            // Top-right mark
            currentPage.drawLine({ start: { x: x1, y: y1 }, end: { x: x1 + cutLineLen, y: y1 }, thickness: 0.5, color: cutColor });
            currentPage.drawLine({ start: { x: x1, y: y1 + cutLineLen }, end: { x: x1, y: y1 }, thickness: 0.5, color: cutColor });
            // Bottom-left mark
            currentPage.drawLine({ start: { x: x0 - cutLineLen, y: y0 }, end: { x: x0, y: y0 }, thickness: 0.5, color: cutColor });
            currentPage.drawLine({ start: { x: x0, y: y0 - cutLineLen }, end: { x: x0, y: y0 }, thickness: 0.5, color: cutColor });
            // Bottom-right mark
            currentPage.drawLine({ start: { x: x1, y: y0 }, end: { x: x1 + cutLineLen, y: y0 }, thickness: 0.5, color: cutColor });
            currentPage.drawLine({ start: { x: x1, y: y0 - cutLineLen }, end: { x: x1, y: y0 }, thickness: 0.5, color: cutColor });
          }

          // Production QA Card ID text outside card cut
          if (sheetConfig.includeCardIdQA && !isSingleCard) {
            currentPage.drawText(`${cardId}`, {
              x: posXPt + 2,
              y: posYPt - 7,
              size: 6,
              font: courier,
              color: rgb(0.5, 0.5, 0.5),
            });
          }

          // Append to Manifest CSV
          manifestRows.push(
            `"${cardId}","${qrUrl}","${card.activationCode || ""}","${card.businessName || ""}","${pageNumber}","${currentRow + 1}","${currentCol + 1}","${cardId}.png"`
          );
        }

        processedCount++;
      }

      // Update progress
      const progressPercent = Math.round((processedCount / total) * 100);
      updatePrintJob(jobId, {
        processed_cards: processedCount,
        progress_percent: progressPercent,
      });

      if (onProgress) {
        onProgress(processedCount, total, progressPercent);
      }
    }

    // Save Output Files
    let outputPdfUrl: string | undefined;
    let outputPdfSize: number | undefined;
    let cardsZipUrl: string | undefined;
    let qrZipUrl: string | undefined;
    let manifestCsvUrl: string | undefined;

    // 1. Save PDF
    if (job.export_options.generatePdf) {
      const pdfBytes = await pdfDoc.save();
      const pdfFilePath = path.join(exportDir, "print_cards.pdf");
      fs.writeFileSync(pdfFilePath, pdfBytes);
      outputPdfUrl = `/exports/${jobId}/print_cards.pdf`;
      outputPdfSize = pdfBytes.byteLength;
    }

    // 2. Save Cards ZIP
    if (cardsZip) {
      const zipBytes = await cardsZip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
      const zipPath = path.join(exportDir, "cards_300dpi.zip");
      fs.writeFileSync(zipPath, zipBytes);
      cardsZipUrl = `/exports/${jobId}/cards_300dpi.zip`;
    }

    // 3. Save QR Codes ZIP
    if (qrZip) {
      const qrZipBytes = await qrZip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
      const qrZipPath = path.join(exportDir, "qr_codes_300dpi.zip");
      fs.writeFileSync(qrZipPath, qrZipBytes);
      qrZipUrl = `/exports/${jobId}/qr_codes_300dpi.zip`;
    }

    // 4. Save Manifest CSV
    if (job.export_options.generateManifest) {
      const csvPath = path.join(exportDir, "manifest.csv");
      fs.writeFileSync(csvPath, manifestRows.join("\n"), "utf-8");
      manifestCsvUrl = `/exports/${jobId}/manifest.csv`;
    }

    // Mark Job as Completed
    updatePrintJob(jobId, {
      status: "completed",
      processed_cards: total,
      progress_percent: 100,
      output_pdf_url: outputPdfUrl,
      output_pdf_size_bytes: outputPdfSize,
      cards_zip_url: cardsZipUrl,
      qr_zip_url: qrZipUrl,
      manifest_csv_url: manifestCsvUrl,
    });
  } catch (err: any) {
    console.error("Print Job processing failed:", err);
    updatePrintJob(jobId, {
      status: "failed",
      error_message: err?.message || "Unknown error during bulk print generation.",
    });
    throw err;
  }
}
