"use client";

import React, { useState } from "react";
import { CardTemplate, QrElementConfig } from "@/lib/templates/types";
import { GoogleReviewCardExact } from "@/components/card-preview/GoogleReviewCardExact";
import { Button } from "@/components/ui/Button";
import {
  X,
  Save,
  Copy,
  Layers,
  Sliders,
  Code,
  Check,
  RefreshCw,
  Eye,
  Info,
} from "lucide-react";

interface TemplateEditorModalProps {
  isOpen: boolean;
  template: CardTemplate;
  onClose: () => void;
  onSave: (updatedTemplate: CardTemplate) => void;
  onDuplicate: (sourceId: string, newName: string) => void;
}

export function TemplateEditorModal({
  isOpen,
  template,
  onClose,
  onSave,
  onDuplicate,
}: TemplateEditorModalProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "json">("visual");
  const [currentTemplate, setCurrentTemplate] = useState<CardTemplate>({ ...template });
  const [jsonText, setJsonText] = useState(JSON.stringify(template, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [showBleed, setShowBleed] = useState(false);

  if (!isOpen) return null;

  const qrConfig: QrElementConfig = currentTemplate.elements?.qr || {
    type: "qr",
    x: 10.99,
    y: 37.5,
    width: 32.0,
    height: 32.0,
    errorCorrection: "H",
    margin: 1,
    darkColor: "#000000",
    lightColor: "#ffffff",
  };

  const updateQrConfig = (updates: Partial<QrElementConfig>) => {
    const updated: CardTemplate = {
      ...currentTemplate,
      elements: {
        ...currentTemplate.elements,
        qr: {
          ...qrConfig,
          ...updates,
        },
      },
    };
    setCurrentTemplate(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setCurrentTemplate(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleSave = () => {
    onSave(currentTemplate);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDuplicate = () => {
    const newName = `${currentTemplate.name} (Copy v${Date.now().toString().slice(-4)})`;
    onDuplicate(currentTemplate.id, newName);
  };

  const resetToDefaults = () => {
    updateQrConfig({
      x: 10.99,
      y: 37.5,
      width: 32.0,
      height: 32.0,
      errorCorrection: "H",
      margin: 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100/80 text-blue-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Card Template &amp; QR Coordinate Editor</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {currentTemplate.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Configure CR80 millimeters, QR matrix bounding box, error correction, and layer coordinates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium mr-2">
              <button
                onClick={() => setActiveTab("visual")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === "visual" ? "bg-white text-slate-900 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Visual Controls
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === "json" ? "bg-white text-slate-900 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code className="w-3.5 h-3.5" /> JSON Schema
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Interactive Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Live CR80 Rendering (1:1.585)
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                53.98 × 85.60 mm
              </span>
            </div>

            <div className="p-4 bg-slate-200/50 rounded-2xl flex items-center justify-center">
              <GoogleReviewCardExact
                cardId="TEST01"
                qrUrl="https://nfcflow.vercel.app/r/TEST01"
                template={currentTemplate}
                qrCoordinates={qrConfig}
                scale={0.92}
                showCutGuides={showCutGuides}
                showBleed={showBleed}
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutGuides}
                  onChange={(e) => setShowCutGuides(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600"
                />
                <span>Cut Guides</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBleed}
                  onChange={(e) => setShowBleed(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600"
                />
                <span>2mm Bleed Outline</span>
              </label>
            </div>
          </div>

          {/* Right: Controls or JSON */}
          <div className="lg:col-span-7 space-y-6">
            {activeTab === "visual" ? (
              <div className="space-y-6">
                {/* Dynamic QR Coordinate Form */}
                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Dynamic QR Matrix Placement (mm)
                    </h3>
                    <button
                      onClick={resetToDefaults}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Centered Defaults
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        X Coordinate (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={qrConfig.x}
                        onChange={(e) => updateQrConfig({ x: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">From Left Edge</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Y Coordinate (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={qrConfig.y}
                        onChange={(e) => updateQrConfig({ y: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">From Top Edge</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Width (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={qrConfig.width}
                        onChange={(e) => updateQrConfig({ width: parseFloat(e.target.value) || 10 })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">Standard: 32mm</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Height (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={qrConfig.height}
                        onChange={(e) => updateQrConfig({ height: parseFloat(e.target.value) || 10 })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">1:1 Square</span>
                    </div>
                  </div>

                  {/* QR Encoding Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Error Correction Level
                      </label>
                      <select
                        value={qrConfig.errorCorrection || "H"}
                        onChange={(e) => updateQrConfig({ errorCorrection: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="H">Level H (30% Recovery - Recommended for PVC)</option>
                        <option value="Q">Level Q (25% Recovery)</option>
                        <option value="M">Level M (15% Recovery)</option>
                        <option value="L">Level L (7% Recovery)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Quiet Zone Margin (Modules)
                      </label>
                      <select
                        value={qrConfig.margin ?? 1}
                        onChange={(e) => updateQrConfig({ margin: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1 Module (Standard Quiet Zone)</option>
                        <option value={2}>2 Modules (Wide Quiet Zone)</option>
                        <option value={3}>3 Modules</option>
                        <option value={4}>4 Modules (Maximum Quiet Zone)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Template Info Card */}
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-900">
                  <div className="flex items-center gap-2 font-bold">
                    <Info className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Fixed Layer Structure &amp; Specifications</span>
                  </div>
                  <p className="text-blue-800 leading-relaxed">
                    • <strong>Top Layer:</strong> Contactless NFC symbol &amp; "Review Us On" script typography.
                    <br />• <strong>Google Layer:</strong> Official 4-color Google logo + 5 golden stars.
                    <br />• <strong>Action Layer:</strong> Smartphone vector icon + "Tap or Scan" instruction.
                    <br />• <strong>Branding Layer:</strong> NFCFlow logo + "TAP. CONNECT. GROW."
                    <br />• <strong>Bottom Graphics:</strong> 4-Color flowing waves (Blue, Red, Yellow, Green).
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">JSON Template Definition:</span>
                  {jsonError && (
                    <span className="text-xs font-semibold text-red-600">
                      Syntax Error: {jsonError}
                    </span>
                  )}
                </div>
                <textarea
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={16}
                  className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDuplicate}
            className="flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate as New Version
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Template Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
