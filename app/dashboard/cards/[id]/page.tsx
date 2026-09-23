"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, DestinationType, CardStatus, RedirectEvent } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PvcCardPreview } from "@/components/card-preview/PvcCardPreview";
import { PrintableCardView } from "@/components/card-preview/PrintableCardView";
import { QrCodeGenerator } from "@/components/qr/QrCodeGenerator";
import { NfcWriterHelper } from "@/components/nfc/NfcWriterHelper";
import { ScanLogTable } from "@/components/analytics/ScanLogTable";
import { SourceBreakdown } from "@/components/analytics/SourceBreakdown";
import { getCardRedirectUrl } from "@/lib/utils";
import {
  ArrowLeft,
  Radio,
  QrCode,
  Printer,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
  Trash2,
  Layers,
  Star,
  MessageCircle,
  Globe,
  Instagram,
  Link2,
} from "lucide-react";

export default function CardStudioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [card, setCard] = useState<Card | null>(null);
  const [events, setEvents] = useState<RedirectEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"destination" | "nfc" | "qr" | "print" | "logs">("destination");

  // Destination Edit State
  const [destType, setDestType] = useState<DestinationType>("google_review");
  const [destUrl, setDestUrl] = useState<string>("");
  const [cardStatus, setCardStatus] = useState<CardStatus>("active");
  const [cardName, setCardName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadCardData = async () => {
    setIsLoading(true);
    try {
      const [cardRes, analyticsRes] = await Promise.all([
        fetch(`/api/cards/${id}`),
        fetch(`/api/analytics?card_id=${id}`),
      ]);

      const cardJson = await cardRes.json();
      const analyticsJson = await analyticsRes.json();

      if (cardJson.success) {
        const c: Card = cardJson.data;
        setCard(c);
        setDestType(c.destination_type);
        setDestUrl(c.destination_url);
        setCardStatus(c.status);
        setCardName(c.name);
        setNotes(c.notes || "");
      }

      if (analyticsJson.success) {
        setEvents(analyticsJson.data.recentEvents || []);
      }
    } catch (err) {
      console.error("Failed to load card details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCardData();
  }, [id]);

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cardName,
          destination_type: destType,
          destination_url: destUrl,
          status: cardStatus,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCard(json.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(json.error || "Failed to update card");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!confirm(`Are you sure you want to delete this card (${card?.slug})?`)) return;
    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        router.push("/dashboard/cards");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <p className="text-xs">Loading...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="py-16 text-center text-slate-600">
        <h2 className="text-base font-bold text-slate-900 mb-2">Card Not Found</h2>
        <Link href="/dashboard/cards" className="text-xs text-slate-800 hover:underline font-medium">
          Return to Cards
        </Link>
      </div>
    );
  }

  const redirectUrl = getCardRedirectUrl(card.slug);
  const qrUrl = getCardRedirectUrl(card.slug, "qr");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cards"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {card.name}
              </h1>
              <StatusBadge status={card.status} />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              URL: {redirectUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={redirectUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Test Redirect
          </a>
          <Button onClick={handleDeleteCard} variant="danger" size="sm">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Studio Tabs & Control Panels */}
        <div className="lg:col-span-7 space-y-5">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg">
            {[
              { id: "destination", label: "Destination", icon: Sparkles },
              { id: "nfc", label: "NFC Setup", icon: Radio },
              { id: "qr", label: "QR Code", icon: QrCode },
              { id: "print", label: "Print Layout", icon: Printer },
              { id: "logs", label: `Logs (${events.length})`, icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: DESTINATION EDITOR */}
          {activeTab === "destination" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">
                  Redirect Destination Target
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update where this card points in real-time.
                </p>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Destination updated successfully.
                </div>
              )}

              <form onSubmit={handleSaveDestination} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Card Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Destination Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "google_review", label: "Google Reviews", icon: Star },
                      { id: "whatsapp", label: "WhatsApp Chat", icon: MessageCircle },
                      { id: "website", label: "Store Website", icon: Globe },
                      { id: "instagram", label: "Instagram", icon: Instagram },
                      { id: "custom", label: "Custom Link", icon: Link2 },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = destType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDestType(item.id as DestinationType)}
                          className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                            isSelected
                              ? "bg-slate-100 border-slate-400 text-slate-900 font-semibold"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Destination Target URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={destUrl}
                    onChange={(e) => setDestUrl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Card Status
                    </label>
                    <select
                      value={cardStatus}
                      onChange={(e) => setCardStatus(e.target.value as CardStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="suspended">Suspended</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Internal Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Front desk standee"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                    <Save className="w-3.5 h-3.5" /> Save Destination
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: NFC PROGRAMMING */}
          {activeTab === "nfc" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <NfcWriterHelper
                slug={card.slug}
                cardName={card.name}
                destinationUrl={card.destination_url}
                onCardTested={loadCardData}
              />
            </div>
          )}

          {/* TAB 3: DYNAMIC QR STUDIO */}
          {activeTab === "qr" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <QrCodeGenerator
                url={qrUrl}
                slug={card.slug}
                businessName={card.business_name}
                size={220}
                showControls={true}
              />
            </div>
          )}

          {/* TAB 4: PRINTABLE CARD VIEW */}
          {activeTab === "print" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <PrintableCardView
                businessName={card.business_name || "Business Name"}
                slug={card.slug}
                destinationType={card.destination_type}
              />
            </div>
          )}

          {/* TAB 5: SCAN LOGS */}
          {activeTab === "logs" && (
            <ScanLogTable events={events} />
          )}
        </div>

        {/* Right: Realistic Card Mockup & Channel Share */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
              Card Mockup
            </h3>
            <p className="text-xs text-slate-500 mb-6 text-center">
              ISO/IEC 7810 ID-1 standard (85.6 × 54 mm)
            </p>

            <PvcCardPreview
              businessName={card.business_name || "Business Name"}
              slug={card.slug}
              destinationType={card.destination_type}
            />
          </div>

          <SourceBreakdown
            nfcScans={card.nfc_scans || 0}
            qrScans={card.qr_scans || 0}
            totalScans={card.total_scans || 0}
          />
        </div>
      </div>
    </div>
  );
}
