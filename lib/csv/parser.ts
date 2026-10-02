import Papa from "papaparse";
import { CsvCardRow, CsvMapping, CsvValidationIssue, CsvValidationResult } from "@/lib/templates/types";

export interface ParsedCsvData {
  headers: string[];
  rows: Record<string, string>[];
  detectedMapping: CsvMapping;
}

// Intelligent column detection dictionaries
const CARD_ID_CANDIDATES = [
  "card id",
  "card_id",
  "cardid",
  "card no",
  "card_no",
  "id",
  "slug",
  "code",
  "serial",
  "card",
];

const QR_URL_CANDIDATES = [
  "public redirect url",
  "nfc permanent url",
  "redirect url",
  "destination url",
  "qr url",
  "target url",
  "permanent url",
  "review url",
  "url",
  "link",
  "destination",
];

const ACTIVATION_CODE_CANDIDATES = [
  "activation code",
  "activation_code",
  "activation key",
  "secret code",
  "secret",
  "pin",
  "key",
  "code",
];

const BUSINESS_NAME_CANDIDATES = [
  "business name",
  "business",
  "store name",
  "company name",
  "merchant",
  "client",
  "name",
];

const PRODUCT_TYPE_CANDIDATES = [
  "product type",
  "product",
  "card type",
  "template",
  "category",
  "type",
];

function findBestColumn(headers: string[], candidates: string[]): string {
  for (const candidate of candidates) {
    const match = headers.find(
      (h) => h.trim().toLowerCase() === candidate || h.trim().toLowerCase().includes(candidate)
    );
    if (match) return match;
  }
  return "";
}

export function autoDetectMapping(headers: string[]): CsvMapping {
  return {
    cardIdCol: findBestColumn(headers, CARD_ID_CANDIDATES) || (headers.length > 0 ? headers[0] : ""),
    qrUrlCol: findBestColumn(headers, QR_URL_CANDIDATES) || (headers.length > 1 ? headers[1] : ""),
    activationCodeCol: findBestColumn(headers, ACTIVATION_CODE_CANDIDATES),
    businessNameCol: findBestColumn(headers, BUSINESS_NAME_CANDIDATES),
    productTypeCol: findBestColumn(headers, PRODUCT_TYPE_CANDIDATES),
  };
}

export function parseCsvFile(file: File): Promise<ParsedCsvData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = (results.data as Record<string, string>[]).filter((row) =>
          Object.values(row).some((val) => val && String(val).trim() !== "")
        );
        const detectedMapping = autoDetectMapping(headers);

        resolve({
          headers,
          rows,
          detectedMapping,
        });
      },
      error: (err) => {
        reject(new Error(`Failed to parse CSV file: ${err.message}`));
      },
    });
  });
}

export function parseCsvString(csvContent: string): ParsedCsvData {
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });

  const headers = results.meta.fields || [];
  const rows = (results.data as Record<string, string>[]).filter((row) =>
    Object.values(row).some((val) => val && String(val).trim() !== "")
  );
  const detectedMapping = autoDetectMapping(headers);

  return {
    headers,
    rows,
    detectedMapping,
  };
}

function isValidUrlString(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }
  // Allow relative short slugs e.g. /r/abc123 or https://nfcflow.in/r/abc
  if (trimmed.startsWith("/r/") || trimmed.startsWith("/")) {
    return true;
  }
  // Basic domain format check e.g. nfcflow.in/r/123
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return true;
  }
  return false;
}

export function validateCsvRows(
  rows: Record<string, string>[],
  mapping: CsvMapping
): CsvValidationResult {
  const validCards: CsvCardRow[] = [];
  const invalidRows: Array<{
    rowNumber: number;
    data: Record<string, string>;
    issues: CsvValidationIssue[];
  }> = [];

  const seenCardIds = new Set<string>();
  const seenUrls = new Set<string>();
  const duplicateCardIds: string[] = [];
  const duplicateUrls: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // 1-indexed including header
    const issues: CsvValidationIssue[] = [];

    // 1. Validate Card ID
    const rawCardId = mapping.cardIdCol ? row[mapping.cardIdCol]?.trim() : "";
    if (!rawCardId) {
      issues.push({
        row: rowNumber,
        type: "error",
        field: "Card ID",
        message: `Missing Card ID in column "${mapping.cardIdCol}".`,
      });
    } else {
      if (seenCardIds.has(rawCardId)) {
        issues.push({
          row: rowNumber,
          type: "error",
          field: "Card ID",
          message: `Duplicate Card ID "${rawCardId}". Card IDs must be unique.`,
          rawValue: rawCardId,
        });
        if (!duplicateCardIds.includes(rawCardId)) {
          duplicateCardIds.push(rawCardId);
        }
      } else {
        seenCardIds.add(rawCardId);
      }
    }

    // 2. Validate QR URL
    const rawUrl = mapping.qrUrlCol ? row[mapping.qrUrlCol]?.trim() : "";
    if (!rawUrl) {
      issues.push({
        row: rowNumber,
        type: "error",
        field: "QR Redirect URL",
        message: `Missing QR Redirect URL in column "${mapping.qrUrlCol}".`,
      });
    } else if (!isValidUrlString(rawUrl)) {
      issues.push({
        row: rowNumber,
        type: "error",
        field: "QR Redirect URL",
        message: `Invalid URL format "${rawUrl}". Must be a valid http:// or https:// URL.`,
        rawValue: rawUrl,
      });
    } else {
      if (seenUrls.has(rawUrl)) {
        if (!duplicateUrls.includes(rawUrl)) {
          duplicateUrls.push(rawUrl);
        }
      } else {
        seenUrls.add(rawUrl);
      }
    }

    // Process valid or invalid
    if (issues.length > 0) {
      invalidRows.push({
        rowNumber,
        data: row,
        issues,
      });
    } else {
      validCards.push({
        cardId: rawCardId,
        qrUrl: rawUrl,
        activationCode: mapping.activationCodeCol ? row[mapping.activationCodeCol]?.trim() : undefined,
        businessName: mapping.businessNameCol ? row[mapping.businessNameCol]?.trim() : undefined,
        productType: mapping.productTypeCol ? row[mapping.productTypeCol]?.trim() : undefined,
        customData: row,
      });
    }
  });

  return {
    totalRows: rows.length,
    validCards,
    invalidRows,
    duplicateCardIds,
    duplicateUrls,
    isValid: invalidRows.length === 0 && validCards.length > 0,
  };
}

export function generateSampleCsvContent(count: number = 10): string {
  const sampleRows = [
    "Card ID,Public Redirect URL,NFC Permanent URL,Activation Code,Business Name,Product Type",
  ];

  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(3, "0");
    const code = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const slug = `GR${num}`;
    sampleRows.push(
      `${slug},https://nfcflow.in/r/${slug},https://nfcflow.in/r/${slug},${code},Apex Health & Retail Store #${i},google_review`
    );
  }

  return sampleRows.join("\n");
}
