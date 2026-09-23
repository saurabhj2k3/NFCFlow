"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { Card, AnalyticsSummary } from "@/types";
import { StatCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScanChart } from "@/components/analytics/ScanChart";
import { SourceBreakdown } from "@/components/analytics/SourceBreakdown";
import { DeviceBreakdown } from "@/components/analytics/DeviceBreakdown";
import { QrDownloadModal } from "@/components/qr/QrDownloadModal";
import {
  CreditCard,
  Building2,
  Radio,
  QrCode,
  TrendingUp,
  Plus,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { getCardRedirectUrl } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { selectedBusinessId, businesses } = useDashboard();
  const [cards, setCards] = useState<Card[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardForQr, setSelectedCardForQr] = useState<Card | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const bizParam = selectedBusinessId !== "all" ? `?business_id=${selectedBusinessId}` : "";
      const [cardsRes, analyticsRes] = await Promise.all([
        fetch(`/api/cards${bizParam}`),
        fetch(`/api/analytics${bizParam}`),
      ]);

      const cardsJson = await cardsRes.json();
      const analyticsJson = await analyticsRes.json();

      if (cardsJson.success) setCards(cardsJson.data);
      if (analyticsJson.success) setAnalytics(analyticsJson.data.summary);
    } catch (err) {
      console.error("Failed loading overview data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBusinessId]);

  const activeBiz = businesses.find((b) => b.id === selectedBusinessId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {selectedBusinessId === "all" ? "Platform Overview" : activeBiz?.name || "Dashboard"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Card telemetry, dynamic routing, and destination management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/cards/new">
            <Button variant="primary" size="md">
              <Plus className="w-3.5 h-3.5" /> Create Card
            </Button>
          </Link>
          <Link href="/dashboard/businesses">
            <Button variant="secondary" size="md">
              <Building2 className="w-3.5 h-3.5" /> Businesses
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scan Opens"
          value={analytics?.total_scans?.toLocaleString() || "0"}
          subtitle="Google Review link visits"
          icon={TrendingUp}
          trend="+18.4%"
          trendLabel="vs last month"
        />
        <StatCard
          title="Today's Scans"
          value={analytics?.today_scans?.toLocaleString() || "0"}
          subtitle="Past 24 hours"
          icon={Radio}
        />
        <StatCard
          title="Active Cards"
          value={cards.filter((c) => c.status === "active").length}
          subtitle={`${cards.length} total deployed`}
          icon={CreditCard}
        />
        <StatCard
          title="Locations"
          value={selectedBusinessId === "all" ? businesses.length : "1"}
          subtitle="Managed businesses"
          icon={Building2}
        />
      </div>

      {/* Main Charts Row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ScanChart dailyTrends={analytics.daily_trends} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <SourceBreakdown
              nfcScans={analytics.nfc_scans}
              qrScans={analytics.qr_scans}
              totalScans={analytics.total_scans}
            />
            <DeviceBreakdown devices={analytics.device_breakdown} />
          </div>
        </div>
      )}

      {/* Active Cards Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Deployed NFC & QR Cards</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant destination redirection without reprinting physical cards
            </p>
          </div>
          <Link
            href="/dashboard/cards"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View All ({cards.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Card Name</th>
                <th className="py-2.5 px-4">Slug</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Destination</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Total Scans</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {cards.slice(0, 6).map((card) => {
                const redirectUrl = getCardRedirectUrl(card.slug);
                return (
                  <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/cards/${card.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {card.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      /r/{card.slug}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {card.business_name || "—"}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600">
                      {card.destination_type.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={card.status} />
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 tabular-nums">
                      {card.total_scans?.toLocaleString() || "0"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCardForQr(card)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Download QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={redirectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Test Redirect URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/dashboard/cards/${card.id}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Download Modal */}
      {selectedCardForQr && (
        <QrDownloadModal
          isOpen={Boolean(selectedCardForQr)}
          onClose={() => setSelectedCardForQr(null)}
          card={{
            slug: selectedCardForQr.slug,
            name: selectedCardForQr.name,
            business_name: selectedCardForQr.business_name,
          }}
        />
      )}
    </div>
  );
}
