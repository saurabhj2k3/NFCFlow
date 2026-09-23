"use client";

import React from "react";
import { Radio, QrCode } from "lucide-react";

interface SourceBreakdownProps {
  nfcScans: number;
  qrScans: number;
  directScans?: number;
  totalScans: number;
}

export function SourceBreakdown({
  nfcScans,
  qrScans,
  totalScans,
}: SourceBreakdownProps) {
  const safeTotal = totalScans > 0 ? totalScans : 1;
  const nfcPercent = Math.round((nfcScans / safeTotal) * 100);
  const qrPercent = Math.round((qrScans / safeTotal) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">NFC vs QR Channel Share</h3>
        <span className="text-xs text-slate-500 tabular-nums">
          {totalScans.toLocaleString()} total
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
        <div
          style={{ width: `${nfcPercent}%` }}
          className="h-full bg-slate-800 transition-all duration-300"
          title={`NFC Taps: ${nfcPercent}%`}
        />
        <div
          style={{ width: `${qrPercent}%` }}
          className="h-full bg-emerald-600 transition-all duration-300"
          title={`QR Scans: ${qrPercent}%`}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-700" /> NFC
            </span>
            <span className="text-xs font-bold text-slate-900">{nfcPercent}%</span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
            {nfcScans.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-emerald-700" /> QR
            </span>
            <span className="text-xs font-bold text-emerald-800">{qrPercent}%</span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
            {qrScans.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
