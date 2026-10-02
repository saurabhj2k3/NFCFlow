import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { CardTemplate } from "@/lib/templates/types";

// Standard CR80 Dimensions in mm
export const CR80_WIDTH_MM = 53.98;
export const CR80_HEIGHT_MM = 85.60;
export const CR80_CORNER_RADIUS_MM = 3.18;

// Cached Template SVG Base
let cachedGoogleTemplateParts: { beforeQr: string; afterQr: string } | null = null;

function getGoogleTemplateParts(): { beforeQr: string; afterQr: string } {
  if (cachedGoogleTemplateParts) {
    return cachedGoogleTemplateParts;
  }

  // Look for the user's template SVG file
  const possiblePaths = [
    path.join(process.cwd(), "lib", "print", "Review us on (1).svg"),
    path.join(process.cwd(), "public", "templates", "google-review-template.svg"),
  ];

  let rawSvg = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      rawSvg = fs.readFileSync(p, "utf-8");
      break;
    }
  }

  if (!rawSvg) {
    throw new Error("Google Review Card SVG template file could not be found.");
  }

  const qrMarker = '<g transform="matrix(1, 0, 0, 1, 21, 89)">';
  const qrStart = rawSvg.indexOf(qrMarker);
  if (qrStart === -1) {
    // If exact marker not found, fallback to splitting before closing tags
    const closeIdx = rawSvg.lastIndexOf("</g></g></svg>");
    cachedGoogleTemplateParts = {
      beforeQr: rawSvg.substring(0, closeIdx),
      afterQr: rawSvg.substring(closeIdx),
    };
  } else {
    const afterQrIdx = rawSvg.lastIndexOf("</g></g></svg>");
    cachedGoogleTemplateParts = {
      beforeQr: rawSvg.substring(0, qrStart),
      afterQr: rawSvg.substring(afterQrIdx),
    };
  }

  return cachedGoogleTemplateParts;
}

export interface SvgCardOptions {
  cardId: string;
  qrUrl: string;
  template: CardTemplate;
  includeBleed?: boolean;
  bleedAmountMm?: number;
  dpi?: number;
  showCardIdQA?: boolean;
}

export async function generateCardSvg({
  cardId,
  qrUrl,
  template,
  includeBleed = false,
  bleedAmountMm = 2.0,
  dpi = 300,
  showCardIdQA = false,
}: SvgCardOptions): Promise<string> {
  const isGoogleTemplate = !template?.id || template.id.startsWith("google-review");

  // Dynamic QR Code generation with high resolution Level H error correction
  const qrConfig = template?.elements?.qr || {
    errorCorrection: "H",
    margin: 1,
    darkColor: "#000000",
    lightColor: "#ffffff",
  };

  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    margin: qrConfig.margin ?? 1,
    width: 600,
    color: {
      dark: qrConfig.darkColor || "#000000",
      light: qrConfig.lightColor || "#ffffff",
    },
    errorCorrectionLevel: qrConfig.errorCorrection || "H",
  });

  if (isGoogleTemplate) {
    const { beforeQr, afterQr } = getGoogleTemplateParts();

    // Replace QR group in the authentic vector template
    // Template viewBox: "0 0 153 242.999999", width="204", height="324"
    // The QR is positioned at x=21, y=89 with white square 55.5x55.5 and QR image 45.5x45.5 inset by 5
    const dynamicQrGroup = `
    <g transform="matrix(1, 0, 0, 1, 21, 89)">
      <rect x="0" y="0" width="55.5" height="55.5" rx="3" ry="3" fill="#ffffff" />
      <image x="5" y="5" width="45.5" height="45.5" href="${qrDataUrl}" />
    </g>
    `;

    return beforeQr + dynamicQrGroup + afterQr;
  }

  // Generic fallback for non-Google templates
  const pxPerMm = dpi / 25.4;
  const bleed = includeBleed ? bleedAmountMm : 0;
  const totalWidthMm = CR80_WIDTH_MM + bleed * 2;
  const totalHeightMm = CR80_HEIGHT_MM + bleed * 2;
  const widthPx = Math.round(totalWidthMm * pxPerMm);
  const heightPx = Math.round(totalHeightMm * pxPerMm);
  const cardX = Math.round(bleed * pxPerMm);
  const cardY = Math.round(bleed * pxPerMm);
  const cardWPx = Math.round(CR80_WIDTH_MM * pxPerMm);
  const cardHPx = Math.round(CR80_HEIGHT_MM * pxPerMm);
  const cornerRadiusPx = Math.round(CR80_CORNER_RADIUS_MM * pxPerMm);

  const qrW = Math.round(32.0 * pxPerMm);
  const qrH = Math.round(32.0 * pxPerMm);
  const qrX = cardX + Math.round((CR80_WIDTH_MM - 32.0) / 2 * pxPerMm);
  const qrY = cardY + Math.round(35.0 * pxPerMm);

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}">
  <defs>
    <clipPath id="cardClip">
      <rect x="${cardX}" y="${cardY}" width="${cardWPx}" height="${cardHPx}" rx="${cornerRadiusPx}" ry="${cornerRadiusPx}" />
    </clipPath>
  </defs>
  <rect x="0" y="0" width="${widthPx}" height="${heightPx}" fill="#ffffff" />
  <g clip-path="url(#cardClip)">
    <rect x="${cardX}" y="${cardY}" width="${cardWPx}" height="${cardHPx}" fill="#ffffff" />
    <g transform="translate(${qrX}, ${qrY})">
      <rect x="0" y="0" width="${qrW}" height="${qrH}" rx="10" ry="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <image href="${qrDataUrl}" x="10" y="10" width="${qrW - 20}" height="${qrH - 20}" />
    </g>
  </g>
  ${showCardIdQA ? `<text x="${cardX + 8}" y="${cardY + cardHPx - 6}" font-family="monospace" font-size="10" fill="#94a3b8">[QA: ${cardId}]</text>` : ""}
</svg>`;
}
