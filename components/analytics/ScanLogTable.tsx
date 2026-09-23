"use client";

import React, { useState } from "react";
import { RedirectEvent } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Radio, QrCode, Smartphone, Apple, Monitor, Globe, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ScanLogTableProps {
  events: RedirectEvent[];
  onExportCsv?: () => void;
}

export function ScanLogTable({ events, onExportCsv }: ScanLogTableProps) {
  const [filterSource, setFilterSource] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("all");

  const filtered = events.filter((e) => {
    const matchesSource = filterSource === "all" || e.source === filterSource;
    const matchesSearch =
      searchTerm === "all" ||
      e.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.device_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Redirect Event Logs</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time redirect events across cards
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Sources</option>
            <option value="nfc">NFC Taps</option>
            <option value="qr">QR Scans</option>
            <option value="direct">Direct</option>
          </select>

          {/* CSV Export Button */}
          {onExportCsv && (
            <Button onClick={onExportCsv} variant="secondary" size="sm">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Timestamp</th>
              <th className="py-2.5 px-4">Card Identifier</th>
              <th className="py-2.5 px-4">Channel</th>
              <th className="py-2.5 px-4">Device</th>
              <th className="py-2.5 px-4 text-right">HTTP Response</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No scan records found.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDateTime(event.scanned_at)}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                    /r/{event.slug}
                  </td>
                  <td className="py-2.5 px-4">
                    {event.source === "nfc" ? (
                      <span className="inline-flex items-center gap-1 text-slate-900 font-medium">
                        <Radio className="w-3.5 h-3.5 text-slate-600" /> NFC Tap
                      </span>
                    ) : event.source === "qr" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" /> QR Scan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Globe className="w-3.5 h-3.5" /> Direct
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 capitalize text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      {event.device_type === "iphone" && <Apple className="w-3.5 h-3.5 text-slate-500" />}
                      {event.device_type === "android" && <Smartphone className="w-3.5 h-3.5 text-slate-500" />}
                      {event.device_type === "desktop" && <Monitor className="w-3.5 h-3.5 text-slate-500" />}
                      {event.device_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      302 Redirect
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
