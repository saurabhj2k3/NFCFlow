"use client";

import React, { useState } from "react";
import { BarChart3 } from "lucide-react";

interface ScanChartProps {
  dailyTrends: Array<{
    date: string;
    total: number;
    nfc: number;
    qr: number;
  }>;
}

export function ScanChart({ dailyTrends }: ScanChartProps) {
  const [activeTab, setActiveTab] = useState<"all" | "nfc" | "qr">("all");

  const maxTotal = Math.max(...dailyTrends.map((d) => (activeTab === "all" ? d.total : activeTab === "nfc" ? d.nfc : d.qr)), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Scan Activity & Trends</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily NFC taps and QR scans over the past 14 days
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Scans
          </button>
          <button
            onClick={() => setActiveTab("nfc")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === "nfc" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            NFC
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === "qr" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            QR
          </button>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="h-44 flex items-end gap-2 pt-4 pb-2 border-b border-slate-100">
        {dailyTrends.map((day, idx) => {
          const val = activeTab === "all" ? day.total : activeTab === "nfc" ? day.nfc : day.qr;
          const heightPercent = Math.max(Math.round((val / maxTotal) * 100), 4);
          const dateLabel = new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 bg-slate-900 text-white text-[11px] py-1 px-2 rounded border border-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                {dateLabel}: <strong>{val}</strong>
              </div>

              {/* Bar */}
              <div className="w-full flex items-end justify-center h-full">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[24px] rounded-t transition-all ${
                    activeTab === "nfc"
                      ? "bg-slate-700 hover:bg-slate-900"
                      : activeTab === "qr"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-slate-800 hover:bg-slate-950"
                  }`}
                />
              </div>

              {/* Day Label */}
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(day.date).toLocaleDateString("en-US", { weekday: "narrow" })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
            <span>NFC Tap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <span>QR Scan</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">Captured via 302 redirect events</span>
      </div>
    </div>
  );
}
