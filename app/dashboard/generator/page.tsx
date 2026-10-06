"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  Layers,
  Eye,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  ExternalLink,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  FileText,
  Archive,
  QrCode,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoogleReviewCardExact } from "@/components/card-preview/GoogleReviewCardExact";
import { TemplateEditorModal } from "@/components/generator/TemplateEditorModal";
import {
  CardTemplate,
  CsvCardRow,
  CsvMapping,
  CsvValidationResult,
  PrintJob,
  SheetLayoutConfig,
} from "@/lib/templates/types";
import {
  parseCsvFile,
  validateCsvRows,
} from "@/lib/csv/parser";

export default function BulkGeneratorPage() {
  // Wizard Steps: 1: CSV, 2: Template, 3: Preview, 4: Sheet Settings, 5: Progress/Download
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // CSV & Data State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRawRows, setCsvRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<CsvMapping>({
    cardIdCol: "",
    qrUrlCol: "",
    activationCodeCol: "",
    businessNameCol: "",
    productTypeCol: "",
  });
  const [validation, setValidation] = useState<CsvValidationResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Template State
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("google-review-v1");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Preview Carousel State
  const [previewIndex, setPreviewIndex] = useState(0);

  // Sheet Layout & Output Config
  const [sheetConfig, setSheetConfig] = useState<SheetLayoutConfig>({
    sheetSize: "A4",
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
  });

  const [exportOptions, setExportOptions] = useState({
    generatePdf: true,
    generateCardsZip: true,
    generateQrZip: true,
    generateManifest: true,
  });

  // Print Job & Execution State
  const [activeJob, setActiveJob] = useState<PrintJob | null>(null);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [recentJobs, setRecentJobs] = useState<PrintJob[]>([]);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Templates & Recent Jobs on Mount
  useEffect(() => {
    fetchTemplates();
    fetchRecentJobs();
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Failed fetching templates:", err);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const res = await fetch("/api/print-jobs");
      const data = await res.json();
      if (data.jobs) {
        setRecentJobs(data.jobs);
      }
    } catch (err) {
      console.error("Failed fetching recent print jobs:", err);
    }
  };

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) ||
    templates[0] ||
    ({
      id: "google-review-v1",
      name: "Google Review Card (Reference Design)",
      category: "google_review",
      dimensions: { width: 53.98, height: 85.6, unit: "mm", dpi: 300, bleed: 2, cornerRadius: 3.18, orientation: "portrait" },
      elements: {
        qr: { type: "qr", x: 10.99, y: 37.5, width: 32, height: 32, errorCorrection: "H", margin: 1, darkColor: "#000000", lightColor: "#ffffff" },
      },
    } as any);

  // Handle CSV File Upload
  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    setCsvFile(file);
    try {
      const parsed = await parseCsvFile(file);
      setCsvHeaders(parsed.headers);
      setCsvRawRows(parsed.rows);
      setMapping(parsed.detectedMapping);

      const valResult = validateCsvRows(parsed.rows, parsed.detectedMapping);
      setValidation(valResult);
    } catch (err: any) {
      alert(`CSV Error: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Revalidate whenever column mapping changes
  const handleMappingChange = (colKey: keyof CsvMapping, value: string) => {
    const updated = { ...mapping, [colKey]: value };
    setMapping(updated);
    if (csvRawRows.length > 0) {
      const valResult = validateCsvRows(csvRawRows, updated);
      setValidation(valResult);
    }
  };

  // Save modified template from editor
  const handleSaveTemplate = async (updated: CardTemplate) => {
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: updated }),
      });
      const data = await res.json();
      if (data.template) {
        setTemplates((prev) => prev.map((t) => (t.id === data.template.id ? data.template : t)));
        setIsEditorOpen(false);
      }
    } catch (err) {
      console.error("Failed saving template:", err);
    }
  };

  const handleDuplicateTemplate = async (sourceId: string, newName: string) => {
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", sourceId, newName }),
      });
      const data = await res.json();
      if (data.template) {
        setTemplates((prev) => [...prev, data.template]);
        setSelectedTemplateId(data.template.id);
        setIsEditorOpen(false);
      }
    } catch (err) {
      console.error("Failed duplicating template:", err);
    }
  };

  // Submit Bulk Print Job
  const handleStartPrintJob = async () => {
    if (!validation || validation.validCards.length === 0) return;

    setIsSubmittingJob(true);
    try {
      const payload = {
        job_name: `Bulk Batch ${new Date().toLocaleDateString()} (${validation.validCards.length} Cards)`,
        template_id: selectedTemplateId,
        card_data: validation.validCards,
        sheet_config: sheetConfig,
        export_options: exportOptions,
      };

      const res = await fetch("/api/print-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.job) {
        setActiveJob(data.job);
        setCurrentStep(5);
        startPollingJob(data.job.id);
      } else {
        alert(data.error || "Failed to start print job.");
      }
    } catch (err: any) {
      alert(`Error starting print job: ${err.message}`);
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const startPollingJob = (jobId: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/print-jobs/${jobId}`);
        const data = await res.json();
        if (data.job) {
          setActiveJob(data.job);
          if (data.job.status === "completed" || data.job.status === "failed") {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            fetchRecentJobs();
          }
        }
      } catch (err) {
        console.error("Job polling error:", err);
      }
    }, 800);
  };

  const handleDownloadFile = (
    jobId: string,
    type: "pdf" | "cards_zip" | "qr_zip" | "manifest",
    filename: string
  ) => {
    setDownloadingType(type);
    const downloadUrl = `/api/print-jobs/${jobId}/download?type=${type}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      setDownloadingType(null);
    }, 1500);
  };

  const currentPreviewCard = validation?.validCards[previewIndex] || {
    cardId: "GR001",
    qrUrl: "https://nfcflow.vercel.app/r/GR001",
    activationCode: "49K2-X8L1",
    businessName: "Sample Business Store",
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <Printer className="w-3 h-3 text-blue-600" />
              Production Engine
            </span>
            <span className="text-xs font-mono text-slate-400">CR80 • 300 DPI</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bulk Card Design &amp; Print Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Upload CSV with Card IDs &amp; URLs, apply reference Google Review CR80 templates, preview dynamic QR codes live, and export commercial 300 DPI print-ready PDFs and image packs.
          </p>
        </div>
      </div>

      {/* Step Navigation Wizard Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { num: 1, label: "1. Upload CSV & Map", icon: FileSpreadsheet },
            { num: 2, label: "2. Template Library", icon: Layers },
            { num: 3, label: "3. Live Verification", icon: Eye },
            { num: 4, label: "4. Sheet Layout", icon: Sliders },
            { num: 5, label: "5. Generate & Export", icon: Printer },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isPassed = currentStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => {
                  if (s.num <= currentStep || (validation && validation.validCards.length > 0)) {
                    setCurrentStep(s.num as any);
                  }
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : isPassed
                    ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* STEP 1: CSV UPLOAD & COLUMN MAPPING                               */}
      {/* ================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload Zone */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Upload Card Manifest CSV
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your card batch manifest CSV. We automatically detect <code>Card ID</code> and <code>Public Redirect URL</code> columns.
                </p>

                {/* Dropzone */}
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-blue-50/30">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="p-3 bg-blue-100/70 text-blue-700 rounded-full mb-3">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {csvFile ? csvFile.name : "Click to select or drag CSV file here"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports 10 to 5,000+ cards per batch
                  </p>
                  {isParsing && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-semibold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Parsing &amp; Validating...
                    </div>
                  )}
                </label>
              </div>

              {/* Column Mapping Selectors */}
              {csvHeaders.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Column Association Mapping
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Card ID Column <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={mapping.cardIdCol}
                        onChange={(e) => handleMappingChange("cardIdCol", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select Column --</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400">Unique physical card serial</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        QR Redirect URL Column <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={mapping.qrUrlCol}
                        onChange={(e) => handleMappingChange("qrUrlCol", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select Column --</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400">Target encoded into QR code</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Activation Code (Optional)
                      </label>
                      <select
                        value={mapping.activationCodeCol}
                        onChange={(e) => handleMappingChange("activationCodeCol", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- None / Auto-generate --</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Business Name (Optional)
                      </label>
                      <select
                        value={mapping.businessNameCol}
                        onChange={(e) => handleMappingChange("businessNameCol", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- None / Generic --</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Feedback & Table */}
            <div className="lg:col-span-6 space-y-4">
              {validation ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      Batch Validation Results
                    </h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        validation.isValid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {validation.isValid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Ready for Generation
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Validation Issues Found
                        </>
                      )}
                    </span>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total Rows</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                        {validation.totalRows}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Valid Cards</p>
                      <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                        {validation.validCards.length}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
                      <p className="text-[10px] font-bold text-red-600 uppercase">Invalid Rows</p>
                      <p className="text-xl font-extrabold text-red-700 mt-0.5">
                        {validation.invalidRows.length}
                      </p>
                    </div>
                  </div>

                  {/* Error Details (if any) */}
                  {validation.invalidRows.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        Issues Detected in CSV:
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-red-50/40 border border-red-200 rounded-xl text-xs font-mono">
                        {validation.invalidRows.map((inv, idx) => (
                          <div key={idx} className="text-red-800 flex items-start gap-1.5">
                            <span className="font-bold shrink-0">Row {inv.rowNumber}:</span>
                            <span>{inv.issues.map((i) => i.message).join(" • ")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Valid Rows Preview Table */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">Valid Rows Preview (First 5):</p>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">#</th>
                            <th className="p-2.5">Card ID</th>
                            <th className="p-2.5">QR Destination URL</th>
                            <th className="p-2.5">Activation Code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {validation.validCards.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="p-2.5 text-slate-400">{idx + 1}</td>
                              <td className="p-2.5 font-bold text-slate-900">{row.cardId}</td>
                              <td className="p-2.5 text-blue-600 truncate max-w-[180px]">
                                {row.qrUrl}
                              </td>
                              <td className="p-2.5 text-slate-600">
                                {row.activationCode || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Next Step Button */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      disabled={validation.validCards.length === 0}
                      onClick={() => setCurrentStep(2)}
                      className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
                    >
                      Continue to Template Selection ({validation.validCards.length} Cards)
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">
                    No CSV uploaded yet
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Upload your CSV manifest to begin card validation and bulk sheet generation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 2: TEMPLATE SELECTION & CUSTOMIZATION                        */}
      {/* ================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Select Card Design Template
              </h2>
              <p className="text-xs text-slate-500">
                Choose the physical card template. Google Review CR80 Reference Design is active.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100"
            >
              <Sliders className="w-3.5 h-3.5" /> Adjust QR Coordinates &amp; Template JSON
            </Button>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              const isRef = tpl.id === "google-review-v1";
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`border rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all relative ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {isRef && (
                    <span className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                      Official Reference Design
                    </span>
                  )}

                  <div className="space-y-4">
                    {/* Visual Thumbnail */}
                    <div className="h-56 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-200/60">
                      <GoogleReviewCardExact
                        cardId="SAMPLE"
                        qrUrl="https://nfcflow.vercel.app/r/SAMPLE"
                        template={tpl}
                        scale={0.52}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-slate-400">
                      CR80 • v{tpl.version}
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        isSelected ? "text-blue-600" : "text-slate-500"
                      }`}
                    >
                      {isSelected ? "✓ Selected" : "Select"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to CSV Upload
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(3)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5"
            >
              Continue to Live Verification <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 3: LIVE VERIFICATION & PREVIEW CAROUSEL                      */}
      {/* ================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Interactive CR80 Card */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1 text-blue-600">
                  <Eye className="w-4 h-4" />
                  Exact 300 DPI Rendering
                </span>
                <span className="font-mono font-bold text-slate-700">
                  Card {previewIndex + 1} of {validation?.validCards.length || 1}
                </span>
              </div>

              {/* Exact CR80 Preview Card */}
              <div className="p-6 bg-slate-200/60 rounded-3xl shadow-inner flex items-center justify-center">
                <GoogleReviewCardExact
                  cardId={currentPreviewCard.cardId}
                  qrUrl={currentPreviewCard.qrUrl}
                  template={selectedTemplate}
                  scale={1.05}
                />
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-center gap-3 w-full pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <input
                  type="range"
                  min={0}
                  max={(validation?.validCards.length || 1) - 1}
                  value={previewIndex}
                  onChange={(e) => setPreviewIndex(parseInt(e.target.value, 10))}
                  className="w-48 accent-blue-600 cursor-pointer"
                />

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={previewIndex >= (validation?.validCards.length || 1) - 1}
                  onClick={() =>
                    setPreviewIndex((prev) =>
                      Math.min((validation?.validCards.length || 1) - 1, prev + 1)
                    )
                  }
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Verification Metadata & Test QR */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  Card Verification &amp; Telemetry
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Card Serial ID:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {currentPreviewCard.cardId}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500 font-semibold">Encoded QR Redirect URL:</span>
                    <p className="font-mono font-semibold text-blue-700 text-xs break-all">
                      {currentPreviewCard.qrUrl}
                    </p>
                  </div>

                  {currentPreviewCard.activationCode && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Activation Code:</span>
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {currentPreviewCard.activationCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Test Live URL Button */}
                <div className="pt-2">
                  <a
                    href={currentPreviewCard.qrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block"
                  >
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full justify-center border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100 font-semibold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Test QR Link (Open Live Redirect in New Tab)
                    </Button>
                  </a>
                </div>
              </div>

              {/* Batch Generation Summary */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">Batch Print Scope</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold">TOTAL CARDS</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">
                      {validation?.validCards.length || 0} Cards
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold">ESTIMATED A4 SHEETS</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">
                      {Math.ceil((validation?.validCards.length || 1) / 9)} Pages (3×3)
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Templates
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(4)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5"
                >
                  Configure Sheet &amp; Layout <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 4: SHEET LAYOUT & PRINT SETTINGS                             */}
      {/* ================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sheet Settings */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Sheet Imposition &amp; Commercial Print Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sheet Size Format
                  </label>
                  <select
                    value={sheetConfig.sheetSize}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      if (val === "A4") {
                        setSheetConfig({ ...sheetConfig, sheetSize: val, sheetWidth: 210, sheetHeight: 297, cardsPerRow: 3, cardsPerCol: 3 });
                      } else if (val === "A3") {
                        setSheetConfig({ ...sheetConfig, sheetSize: val, sheetWidth: 297, sheetHeight: 420, cardsPerRow: 4, cardsPerCol: 4 });
                      } else if (val === "Single_CR80") {
                        setSheetConfig({ ...sheetConfig, sheetSize: val, sheetWidth: 54, sheetHeight: 85.6, cardsPerRow: 1, cardsPerCol: 1 });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="A4">A4 Sheet (210 × 297 mm) — 9 Cards / Page (3×3)</option>
                    <option value="A3">A3 Sheet (297 × 420 mm) — 16 Cards / Page (4×4)</option>
                    <option value="Single_CR80">Single Card Pages (CR80 54 × 85.6 mm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cards per Sheet Grid
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={sheetConfig.cardsPerRow}
                      onChange={(e) => setSheetConfig({ ...sheetConfig, cardsPerRow: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                      placeholder="Cols (3)"
                    />
                    <span className="text-slate-400 font-bold">×</span>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={sheetConfig.cardsPerCol}
                      onChange={(e) => setSheetConfig({ ...sheetConfig, cardsPerCol: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                      placeholder="Rows (3)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Horizontal &amp; Vertical Gap (mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={sheetConfig.gapX}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, gapX: parseFloat(e.target.value) || 0, gapY: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Spacing between card cut marks</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bleed Amount (mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={sheetConfig.bleedAmount}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, bleedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Standard: 2.0 mm</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheetConfig.includeCutMarks}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, includeCutMarks: e.target.checked })}
                    className="rounded text-blue-600 accent-blue-600"
                  />
                  <span className="font-semibold">Include Precision Die-Cut / Crop Marks</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheetConfig.includeBleed}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, includeBleed: e.target.checked })}
                    className="rounded text-blue-600 accent-blue-600"
                  />
                  <span className="font-semibold">Include 2mm Commercial Bleed Margin</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheetConfig.includeCardIdQA}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, includeCardIdQA: e.target.checked })}
                    className="rounded text-blue-600 accent-blue-600"
                  />
                  <span className="font-semibold">Print Card ID Outside Cut Line for QA Inspection</span>
                </label>
              </div>
            </div>

            {/* Output Package Selection */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Archive className="w-4 h-4 text-blue-600" />
                Export Output Deliverables
              </h3>

              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70">
                  <input
                    type="checkbox"
                    checked={exportOptions.generatePdf}
                    onChange={(e) => setExportOptions({ ...exportOptions, generatePdf: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 accent-blue-600"
                  />
                  <div>
                    <p className="font-bold text-slate-900">Print-Ready PDF</p>
                    <p className="text-slate-500 text-[11px]">300 DPI vector embedded sheets with cut guides.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70">
                  <input
                    type="checkbox"
                    checked={exportOptions.generateCardsZip}
                    onChange={(e) => setExportOptions({ ...exportOptions, generateCardsZip: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 accent-blue-600"
                  />
                  <div>
                    <p className="font-bold text-slate-900">Individual Card PNGs (ZIP)</p>
                    <p className="text-slate-500 text-[11px]">High-res standalone PNG for every single card.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70">
                  <input
                    type="checkbox"
                    checked={exportOptions.generateQrZip}
                    onChange={(e) => setExportOptions({ ...exportOptions, generateQrZip: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 accent-blue-600"
                  />
                  <div>
                    <p className="font-bold text-slate-900">Standalone QR Codes (ZIP)</p>
                    <p className="text-slate-500 text-[11px]">Crisp standalone QR code PNG files.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70">
                  <input
                    type="checkbox"
                    checked={exportOptions.generateManifest}
                    onChange={(e) => setExportOptions({ ...exportOptions, generateManifest: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 accent-blue-600"
                  />
                  <div>
                    <p className="font-bold text-slate-900">Production Manifest CSV</p>
                    <p className="text-slate-500 text-[11px]">Audit sheet mapping Card ID to page coordinates.</p>
                  </div>
                </label>
              </div>

              {/* Start Generation Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isSubmittingJob}
                  onClick={handleStartPrintJob}
                  className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Start Bulk Print Engine ({validation?.validCards.length || 0} Cards)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 5: REAL-TIME PROGRESS & DOWNLOAD CENTER                      */}
      {/* ================================================================= */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-4xl mx-auto space-y-8 text-center">
            {/* Status Header */}
            <div>
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-700 mb-3">
                {activeJob?.status === "completed" ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                ) : activeJob?.status === "failed" ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                )}
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">
                {activeJob?.status === "completed"
                  ? "Bulk Card Design & Print Generation Complete!"
                  : activeJob?.status === "failed"
                  ? "Print Job Processing Encountered an Error"
                  : "Rendering 300 DPI High-Resolution Print Cards..."}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Job ID: {activeJob?.id} • {activeJob?.total_cards} Total Cards
              </p>
            </div>

            {/* Progress Bar (Visual ASCII + Bar) */}
            <div className="space-y-2 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Progress:</span>
                <span className="font-mono font-bold">
                  {activeJob?.processed_cards || 0} / {activeJob?.total_cards || 0} cards (
                  {activeJob?.progress_percent || 0}%)
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-xs"
                  style={{ width: `${activeJob?.progress_percent || 0}%` }}
                />
              </div>

              <div className="font-mono text-[11px] text-slate-400 text-left pt-1">
                Rendering vector SVG → Sharp 300 DPI compositing → PDF-Lib multi-sheet assembly
              </div>
            </div>

            {/* Download Deliverables Cards */}
            {activeJob?.status === "completed" && (
              <div className="pt-4 border-t border-slate-100 space-y-4 text-left">
                <h3 className="text-sm font-bold text-slate-900 text-center">
                  Ready for Download &amp; Commercial Printing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PDF Download */}
                  {activeJob.output_pdf_url && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-100 text-red-700 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Print-Ready PDF</p>
                          <p className="text-[10px] text-slate-500">
                            {activeJob.output_pdf_size_bytes
                              ? `${Math.round(activeJob.output_pdf_size_bytes / 1024 / 1024 * 10) / 10} MB`
                              : "Commercial Ready (300 DPI)"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={downloadingType === "pdf"}
                        onClick={() =>
                          handleDownloadFile(
                            activeJob.id,
                            "pdf",
                            `NFCFlow_${activeJob.id}_Print_Cards_300DPI.pdf`
                          )
                        }
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </Button>
                    </div>
                  )}

                  {/* Cards ZIP */}
                  {activeJob.cards_zip_url && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                          <Archive className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Cards PNG Pack (ZIP)</p>
                          <p className="text-[10px] text-slate-500">All {activeJob.total_cards} card PNGs</p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={downloadingType === "cards_zip"}
                        onClick={() =>
                          handleDownloadFile(
                            activeJob.id,
                            "cards_zip",
                            `NFCFlow_${activeJob.id}_Cards_PNG_300DPI.zip`
                          )
                        }
                        className="text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download ZIP
                      </Button>
                    </div>
                  )}

                  {/* QR ZIP */}
                  {activeJob.qr_zip_url && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Standalone QR Codes (ZIP)</p>
                          <p className="text-[10px] text-slate-500">Raw QR code files</p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={downloadingType === "qr_zip"}
                        onClick={() =>
                          handleDownloadFile(
                            activeJob.id,
                            "qr_zip",
                            `NFCFlow_${activeJob.id}_QR_Codes.zip`
                          )
                        }
                        className="text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download ZIP
                      </Button>
                    </div>
                  )}

                  {/* Manifest CSV */}
                  {activeJob.manifest_csv_url && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Production Manifest CSV</p>
                          <p className="text-[10px] text-slate-500">Coordinates &amp; verification audit</p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={downloadingType === "manifest"}
                        onClick={() =>
                          handleDownloadFile(
                            activeJob.id,
                            "manifest",
                            `NFCFlow_${activeJob.id}_Production_Manifest.csv`
                          )
                        }
                        className="text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download CSV
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setCurrentStep(1);
                      setActiveJob(null);
                    }}
                  >
                    Start Another Batch
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Print Jobs History Table */}
      {recentJobs.length > 0 && currentStep !== 5 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-slate-600" />
              Recent Bulk Print Runs
            </h3>
            <button
              onClick={fetchRecentJobs}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Job ID / Date</th>
                  <th className="p-3">Batch Name</th>
                  <th className="p-3">Cards</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {recentJobs.slice(0, 5).map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{job.id}</span>
                      <p className="text-[10px] text-slate-400 font-sans">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </td>
                    <td className="p-3 font-sans font-medium text-slate-800">
                      {job.job_name}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{job.total_cards}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          job.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : job.status === "failed"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {job.output_pdf_url && (
                        <button
                          onClick={() =>
                            handleDownloadFile(
                              job.id,
                              "pdf",
                              `NFCFlow_${job.id}_Print_Cards_300DPI.pdf`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 font-bold font-sans cursor-pointer underline"
                        >
                          PDF
                        </button>
                      )}
                      {job.cards_zip_url && (
                        <button
                          onClick={() =>
                            handleDownloadFile(
                              job.id,
                              "cards_zip",
                              `NFCFlow_${job.id}_Cards_PNG_300DPI.zip`
                            )
                          }
                          className="text-slate-600 hover:text-slate-900 font-bold font-sans cursor-pointer underline"
                        >
                          ZIP
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Customizer Modal */}
      {isEditorOpen && (
        <TemplateEditorModal
          isOpen={isEditorOpen}
          template={selectedTemplate}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveTemplate}
          onDuplicate={handleDuplicateTemplate}
        />
      )}
    </div>
  );
}
