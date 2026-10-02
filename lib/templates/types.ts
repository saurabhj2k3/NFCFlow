export type TemplateCategory =
  | "google_review"
  | "whatsapp"
  | "instagram"
  | "business_card"
  | "custom";

export type UnitType = "mm" | "px" | "in";

export interface TemplateDimensions {
  width: number; // in unit (default mm) - CR80 is 53.98
  height: number; // in unit (default mm) - CR80 is 85.60
  unit: UnitType;
  dpi: number; // default 300
  bleed: number; // in mm, e.g. 2 or 3
  cornerRadius: number; // in mm, CR80 standard is 3.18mm
  orientation: "portrait" | "landscape";
}

export interface QrElementConfig {
  type: "qr";
  x: number; // mm from left edge
  y: number; // mm from top edge
  width: number; // mm
  height: number; // mm
  errorCorrection: "L" | "M" | "Q" | "H";
  margin: number; // quiet zone modules (e.g. 1-4)
  darkColor: string; // e.g. "#000000"
  lightColor: string; // e.g. "#ffffff"
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  version: string;
  status: "active" | "draft" | "archived";
  dimensions: TemplateDimensions;
  elements: {
    qr: QrElementConfig;
    [key: string]: any;
  };
  preview_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SheetLayoutConfig {
  sheetSize: "A4" | "A3" | "US_Letter" | "Single_CR80" | "Custom";
  sheetWidth: number; // mm (A4: 210)
  sheetHeight: number; // mm (A4: 297)
  cardsPerRow: number; // default 3
  cardsPerCol: number; // default 3
  marginX: number; // mm (default 10)
  marginY: number; // mm (default 10)
  gapX: number; // mm (default 4)
  gapY: number; // mm (default 4)
  includeCutMarks: boolean;
  includeBleed: boolean;
  bleedAmount: number; // mm (default 2)
  includeCardIdQA: boolean;
  includeHeaderInfo: boolean;
}

export type PrintJobStatus = "pending" | "processing" | "completed" | "failed";

export interface CsvCardRow {
  cardId: string;
  qrUrl: string;
  activationCode?: string;
  businessName?: string;
  productType?: string;
  customData?: Record<string, string>;
}

export interface CsvMapping {
  cardIdCol: string;
  qrUrlCol: string;
  activationCodeCol?: string;
  businessNameCol?: string;
  productTypeCol?: string;
}

export interface CsvValidationIssue {
  row: number;
  type: "error" | "warning";
  field: string;
  message: string;
  rawValue?: string;
}

export interface CsvValidationResult {
  totalRows: number;
  validCards: CsvCardRow[];
  invalidRows: Array<{ rowNumber: number; data: Record<string, string>; issues: CsvValidationIssue[] }>;
  duplicateCardIds: string[];
  duplicateUrls: string[];
  isValid: boolean;
}

export interface PrintJob {
  id: string;
  batch_id?: string;
  job_name: string;
  template_id: string;
  status: PrintJobStatus;
  total_cards: number;
  processed_cards: number;
  progress_percent: number;
  output_pdf_url?: string;
  output_pdf_size_bytes?: number;
  cards_zip_url?: string;
  qr_zip_url?: string;
  manifest_csv_url?: string;
  card_data: CsvCardRow[];
  sheet_config: SheetLayoutConfig;
  export_options: {
    generatePdf: boolean;
    generateCardsZip: boolean;
    generateQrZip: boolean;
    generateManifest: boolean;
  };
  error_message?: string;
  created_at: string;
  completed_at?: string;
}
