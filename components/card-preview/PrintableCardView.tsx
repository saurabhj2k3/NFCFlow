"use client";

import React, { useState } from "react";
import { Printer, Sparkles, LayoutGrid, Sliders, Palette, Check, Download, FileCode, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoogleReviewPortraitCard } from "@/components/card-preview/GoogleReviewPortraitCard";
import { PvcCardPreview } from "@/components/card-preview/PvcCardPreview";

interface PrintableCardViewProps {
  businessName: string;
  slug: string;
  brandColor?: string;
  destinationType?: string;
  activationCode?: string;
}

export function PrintableCardView({
  businessName,
  slug,
  brandColor = "#0d0f12",
  activationCode,
}: PrintableCardViewProps) {
  const [layoutStyle, setLayoutStyle] = useState<"portrait_revuz" | "landscape_classic">("portrait_revuz");
  const [theme, setTheme] = useState<"white_revuz_edition" | "matte_black" | "frost_white" | "midnight_navy" | "emerald_gold">("white_revuz_edition");
  const [subtitle, setSubtitle] = useState("WE'D LOVE");
  const [headline, setHeadline] = useState("YOUR FEEDBACK");
  const [brandTag, setBrandTag] = useState(businessName || "NFCFlow");
  const [showActivationKey, setShowActivationKey] = useState(false);
  const [printSide, setPrintSide] = useState<"both" | "front" | "back">("both");
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAsset = (format: "png" | "svg" | "pdf") => {
    setIsExporting(format);
    const downloadUrl = `/api/cards/${encodeURIComponent(slug)}/export?format=${format}&template_id=google-review-v1&bleed=2.0`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `nfcflow_${slug}_${format === "png" ? "300dpi.png" : (format === "svg" ? "cr80.svg" : "cr80.pdf")}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      setIsExporting(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              CR80 Smart PVC Card Print Studio
            </h3>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 5-Star Google Edition
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Thermal card printer ready (Fargo, Zebra, Evolis) or dye-sublimation PVC sheets (85.6 × 54 mm).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => handleDownloadAsset("png")}
            disabled={isExporting !== null}
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            {isExporting === "png" ? "Exporting..." : "300 DPI PNG"}
          </Button>

          <Button
            onClick={() => handleDownloadAsset("svg")}
            disabled={isExporting !== null}
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-600" />
            {isExporting === "svg" ? "Exporting..." : "Vector SVG"}
          </Button>

          <Button
            onClick={() => handleDownloadAsset("pdf")}
            disabled={isExporting !== null}
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            {isExporting === "pdf" ? "Exporting..." : "CR80 PDF"}
          </Button>

          <Button
            onClick={handlePrint}
            variant="primary"
            size="sm"
            className="gap-1.5 bg-slate-900 text-white hover:bg-slate-800 font-bold"
          >
            <Printer className="w-3.5 h-3.5" /> Print Card (CR80)
          </Button>
        </div>
      </div>

      {/* CUSTOMIZATION TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs no-print">
        {/* Layout Style */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" /> Card Style
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLayoutStyle("portrait_revuz")}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-center border transition-all ${
                layoutStyle === "portrait_revuz"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Portrait Google
            </button>
            <button
              onClick={() => setLayoutStyle("landscape_classic")}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-center border transition-all ${
                layoutStyle === "landscape_classic"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Landscape Classic
            </button>
          </div>
        </div>

        {/* Color Theme */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-indigo-600" /> Color Theme
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { key: "white_revuz_edition", name: "Google White", bg: "bg-white border-2 border-red-500", label: "White" },
              { key: "matte_black", name: "Matte Black", bg: "bg-zinc-900 border-zinc-700", label: "Black" },
              { key: "midnight_navy", name: "Navy", bg: "bg-blue-950 border-blue-800", label: "Navy" },
              { key: "emerald_gold", name: "Emerald", bg: "bg-emerald-950 border-emerald-800", label: "Emerald" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key as any)}
                title={t.name}
                className={`h-8 rounded-lg ${t.bg} flex items-center justify-center transition-transform ${
                  theme === t.key ? "ring-2 ring-blue-500 scale-105" : "hover:opacity-90"
                }`}
              >
                {theme === t.key && <Check className={`w-3.5 h-3.5 ${t.key === "white_revuz_edition" ? "text-blue-600" : "text-white"}`} />}
              </button>
            ))}
          </div>
        </div>

        {/* Headline Preset */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Header Text
          </label>
          <select
            value={`${subtitle}|${headline}`}
            onChange={(e) => {
              const [s, h] = e.target.value.split("|");
              setSubtitle(s);
              setHeadline(h);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="HELP OTHERS DISCOVER US|REVIEW NOW!">HELP OTHERS DISCOVER US / REVIEW NOW!</option>
            <option value="WE'D LOVE|YOUR FEEDBACK">WE&apos;D LOVE / YOUR FEEDBACK</option>
            <option value="LEAVE US A REVIEW|RATE US 5-STARS">LEAVE US A REVIEW / RATE US 5-STARS</option>
            <option value="HOW WAS YOUR VISIT?|TAP TO REVIEW">HOW WAS YOUR VISIT? / TAP TO REVIEW</option>
          </select>
        </div>

        {/* Brand Label */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Bottom Brand Tag</label>
          <input
            type="text"
            value={brandTag}
            onChange={(e) => setBrandTag(e.target.value)}
            placeholder="NFCFlow or Business Name"
            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* PRINTABLE PREVIEW CANVAS */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-100 border border-slate-200 rounded-2xl relative overflow-hidden">
        <div id="printable-card-target" className="flex flex-col items-center justify-center">
          {layoutStyle === "portrait_revuz" ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              {/* Front Side */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-mono text-slate-500 mb-2 font-bold uppercase tracking-wider no-print">
                  Front Side (Tap NFC / Contactless)
                </span>
                <GoogleReviewPortraitCard
                  slug={slug}
                  businessName={businessName}
                  brandTag={brandTag}
                  activationCode={activationCode}
                  headerSubtitle={subtitle}
                  headerHeadline={headline}
                  theme={theme}
                  showActivationCode={showActivationKey}
                  scale={1.05}
                  interactive={true}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono text-slate-500 mb-2 font-bold uppercase tracking-wider no-print">
                Landscape PVC Layout (85.60 × 53.98 mm)
              </span>
              <PvcCardPreview
                businessName={businessName}
                slug={slug}
                brandColor={theme === "matte_black" ? "#0d0f12" : (theme === "frost_white" ? "#ffffff" : brandColor)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Print Instructions Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600 no-print">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
          <Printer className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Commercial Printing Guidelines for Card Manufacturers</p>
          <p>
            Standard CR80 dimensions: <strong>85.60 mm × 53.98 mm</strong> (3.375 × 2.125 inches) with 3.18 mm corner radius.
            For direct card printers (Fargo, Zebra, Evolis), use the <strong>300 DPI PNG</strong> or <strong>Vector SVG</strong> export for zero quality loss.
          </p>
        </div>
      </div>
    </div>
  );
}
