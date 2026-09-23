"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { AnalyticsSummary, RedirectEvent } from "@/types";
import { StatCard } from "@/components/ui/Card";
import { ScanChart } from "@/components/analytics/ScanChart";
import { SourceBreakdown } from "@/components/analytics/SourceBreakdown";
import { DeviceBreakdown } from "@/components/analytics/DeviceBreakdown";
import { ScanLogTable } from "@/components/analytics/ScanLogTable";
import { Button } from "@/components/ui/Button";
import {
  BarChart3,
  TrendingUp,
  Radio,
  QrCode,
  Download,
  RefreshCw,
  Building2,
  ExternalLink,
} from "lucide-react";

export default function AnalyticsPage() {
  const { selectedBusinessId, setSelectedBusinessId, businesses, cards } = useDashboard();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [events, setEvents] = useState<RedirectEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const bizParam =
        selectedBusinessId !== "all"
          ? `?business_id=${selectedBusinessId}&limit=100`
          : "?limit=100";
      const res = await fetch(`/api/analytics${bizParam}`);
      const json = await res.json();
      if (json.success) {
        setSummary(json.data.summary);
        setEvents(json.data.recentEvents);
      }
    } catch (err) {
      console.error("Failed loading analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedBusinessId]);

  const handleExportCsv = () => {
    const bizParam = selectedBusinessId !== "all" ? `?business_id=${selectedBusinessId}` : "";
    window.location.href = `/api/export${bizParam}`;
  };

  const activeBiz = businesses.find((b) => b.id === selectedBusinessId);
  const activeCards =
    selectedBusinessId === "all"
      ? cards
      : cards.filter((c) => c.business_id === selectedBusinessId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-700" />
            Scan Analytics &amp; Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedBusinessId === "all"
              ? "Aggregated scan telemetry across all managed locations"
              : `Customer interaction telemetry for ${activeBiz?.name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportCsv} variant="secondary" size="md">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button onClick={loadAnalytics} disabled={isLoading} variant="outline" size="md">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Location Filter Pill Selector */}
      {businesses.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-xs font-semibold flex items-center gap-1 shrink-0 mr-1">
            <Building2 className="w-3.5 h-3.5" /> Filter Location:
          </span>

          <button
            onClick={() => setSelectedBusinessId("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
              selectedBusinessId === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Locations ({businesses.length})
          </button>

          {businesses.map((biz) => (
            <button
              key={biz.id}
              onClick={() => setSelectedBusinessId(biz.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedBusinessId === biz.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: biz.brand_color || "#0f2e22" }}
              />
              <span>{biz.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scans"
          value={summary?.total_scans.toLocaleString() || "0"}
          subtitle={selectedBusinessId === "all" ? "All active cards" : `${activeCards.length} active cards`}
          icon={TrendingUp}
        />
        <StatCard
          title="Today's Scans"
          value={summary?.today_scans.toLocaleString() || "0"}
          subtitle="Last 24 hours"
          icon={Radio}
        />
        <StatCard
          title="NFC Tap Share"
          value={
            summary && summary.total_scans > 0
              ? `${Math.round((summary.nfc_scans / summary.total_scans) * 100)}%`
              : "0%"
          }
          subtitle={`${summary?.nfc_scans.toLocaleString() || 0} taps`}
          icon={Radio}
        />
        <StatCard
          title="QR Scan Share"
          value={
            summary && summary.total_scans > 0
              ? `${Math.round((summary.qr_scans / summary.total_scans) * 100)}%`
              : "0%"
          }
          subtitle={`${summary?.qr_scans.toLocaleString() || 0} scans`}
          icon={QrCode}
        />
      </div>

      {/* Charts */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ScanChart dailyTrends={summary.daily_trends} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <SourceBreakdown
              nfcScans={summary.nfc_scans}
              qrScans={summary.qr_scans}
              totalScans={summary.total_scans}
            />
            <DeviceBreakdown devices={summary.device_breakdown} />
          </div>
        </div>
      )}

      {/* Raw Event Logs Table */}
      <ScanLogTable events={events} onExportCsv={handleExportCsv} />
    </div>
  );
}
