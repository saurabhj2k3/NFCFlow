"use client";

import React from "react";
import {
  Cpu,
  Smartphone,
  CreditCard,
  Layers,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function HardwareGuidePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-slate-700" />
          Hardware Specifications & Production Guide
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Specifications for NTAG213 PVC cards, programming instructions, and cost analysis.
        </p>
      </div>

      {/* Recommended Chip Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Standard Chip
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              NXP NTAG213 PVC Smart Cards
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Genuine NXP NTAG213 chips are the standard for contactless customer review cards. They provide 144 bytes of usable memory (ideal for short permanent URLs like <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">https://nfcflow.in/r/X7k29P</code>) and native background NFC reading on iOS (iPhone 7+) and Android.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center shrink-0">
            <p className="text-[11px] text-slate-500">Estimated Unit Cost</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">₹115 / card</p>
            <p className="text-[10px] text-slate-400 mt-0.5">(₹1,150 per 10-pack)</p>
          </div>
        </div>
      </div>

      {/* Tech Specs & Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-slate-600" />
            NTAG213 Technical Specs
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Frequency</span>
              <span className="font-mono text-slate-900 font-medium">13.56 MHz (HF)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Standard</span>
              <span className="font-mono text-slate-900 font-medium">ISO/IEC 14443A</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Memory</span>
              <span className="font-mono text-slate-900 font-medium">144 Bytes (NDEF)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Data Retention</span>
              <span className="font-mono text-slate-900 font-medium">10 Years</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Write Cycles</span>
              <span className="font-mono text-slate-900 font-medium">100,000</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Read Range</span>
              <span className="font-mono text-slate-900 font-medium">Up to 3-5 cm</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-slate-600" />
            Card Dimensions (ISO CR80)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Dimensions</span>
              <span className="font-mono text-slate-900 font-medium">85.60 × 53.98 mm</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Thickness</span>
              <span className="font-mono text-slate-900 font-medium">0.76 mm</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Material</span>
              <span className="font-mono text-slate-900 font-medium">PVC (Matte / Gloss)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Corner Radius</span>
              <span className="font-mono text-slate-900 font-medium">3.18 mm</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Printing Compatibility</span>
              <span className="font-mono text-slate-900 font-medium">Thermal / UV / Offset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Workflow */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Card Setup & Deployment Workflow
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "1. Create in Dashboard",
              desc: "Register business and generate permanent slug like /r/X7k29P.",
            },
            {
              step: "2. Print PVC Card",
              desc: "Print artwork with generated QR code and contactless icon.",
            },
            {
              step: "3. Write NFC Chip",
              desc: "Write URL (https://nfcflow.in/r/X7k29P?source=nfc) using NFC Tools app.",
            },
            {
              step: "4. Test & Deploy",
              desc: "Tap phone to verify 302 redirect. Card is ready on billing counter.",
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Step {idx + 1}</span>
              <h4 className="font-semibold text-slate-900 text-xs">{item.step}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
