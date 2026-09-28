"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Plus,
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  Package,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  CreditCard,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { CardBatch, Card, CardPurpose } from "@/types";
import { getCardRedirectUrl } from "@/lib/utils";
import { GoogleReviewPortraitCard } from "@/components/card-preview/GoogleReviewPortraitCard";

function BatchQrCode({ url }: { url: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      if (canvasRef.current && isMounted) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 64,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" },
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [url]);

  return <canvas ref={canvasRef} className="w-16 h-16 rounded" />;
}

export default function BatchesDashboardPage() {
  const [batches, setBatches] = useState<CardBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState<{ batch: CardBatch; cards: Card[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printLayout, setPrintLayout] = useState<"portrait_cards" | "packaging_slips">("portrait_cards");
  const [printTheme, setPrintTheme] = useState<"white_revuz_edition" | "matte_black" | "frost_white" | "midnight_navy" | "emerald_gold">("white_revuz_edition");
  const [printSubtitle, setPrintSubtitle] = useState("WE'D LOVE");
  const [printHeadline, setPrintHeadline] = useState("YOUR FEEDBACK");
  const [printBrandTag, setPrintBrandTag] = useState("NFCFlow");

  // Form states for batch creation
  const [batchName, setBatchName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [prefix, setPrefix] = useState("NF");
  const [productType, setProductType] = useState("NFCFlow CR80 NTAG213");
  const [cardPurpose, setCardPurpose] = useState<CardPurpose>("google_review");
  const [startingIndex, setStartingIndex] = useState("1");

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/batches");
      const json = await res.json();
      if (json.success) {
        setBatches(json.data);
      }
    } catch (err) {
      console.error("Failed to load batches:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const router = useRouter();

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim() || !quantity) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_name: batchName.trim(),
          quantity: Number(quantity),
          prefix: prefix.trim().toUpperCase() || "NF",
          product_type: productType,
          card_purpose: cardPurpose,
          starting_index: Number(startingIndex) || 1,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.id) {
        setIsCreateModalOpen(false);
        setBatchName("");
        router.push(`/dashboard/batches/${json.data.id}`);
      } else {
        alert(json.error || "Failed to create batch");
      }
    } catch (err) {
      console.error("Error creating batch:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPrintPreview = async (batchId: string) => {
    try {
      const res = await fetch(`/api/batches/${batchId}`);
      const json = await res.json();
      if (json.success) {
        setSelectedBatchForPrint({ batch: json.data, cards: json.cards || [] });
      }
    } catch (err) {
      console.error("Failed loading batch details:", err);
    }
  };

  const handleStatusProgression = async (batchId: string, newStatus: string) => {
    try {
      await fetch(`/api/batches/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      loadBatches();
    } catch (err) {
      console.error("Failed updating batch status:", err);
    }
  };

  const totalCardsCount = batches.reduce((acc, b) => acc + (b.quantity || 0), 0);
  const totalActivated = batches.reduce((acc, b) => acc + (b.activated_count || 0), 0);
  const totalInStock = batches.reduce((acc, b) => acc + (b.in_stock_count || 0), 0);

  const filteredBatches = batches.filter(
    (b) =>
      b.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.product_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.prefix.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" /> Card Batches &amp; Inventory Production
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate unique Card IDs, activation codes, CSV data, and print sheets for mass production.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="md"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Generate Batch
          </Button>
          <Link href="/activate" target="_blank">
            <Button variant="secondary" size="md" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Test Activation
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Batches"
          value={batches.length.toString()}
          subtitle="Production runs"
          icon={Layers}
        />
        <StatCard
          title="Total Cards Created"
          value={totalCardsCount.toLocaleString()}
          subtitle="Unique URLs & Chips"
          icon={CreditCard}
        />
        <StatCard
          title="Warehouse In-Stock"
          value={totalInStock.toLocaleString()}
          subtitle="Ready to package & sell"
          icon={Package}
        />
        <StatCard
          title="Cards Activated"
          value={totalActivated.toLocaleString()}
          subtitle={`${Math.round((totalActivated / (totalCardsCount || 1)) * 100)}% active rate`}
          icon={CheckCircle2}
        />
      </div>

      {/* Batches Table & Search */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">All Production Batches</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lifecycle: Generated → Printed → In Stock → Programmed → Active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search batches, prefixes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 w-56"
              />
            </div>
            <button
              onClick={loadBatches}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              title="Refresh batches"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Batch Name</th>
                <th className="py-2.5 px-4">Product Type</th>
                <th className="py-2.5 px-4">Prefix / Range</th>
                <th className="py-2.5 px-4">Quantity</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Activation Progress</th>
                <th className="py-2.5 px-4 text-right">Production Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBatches.map((batch) => {
                const percent = Math.round(((batch.activated_count || 0) / (batch.quantity || 1)) * 100);
                return (
                  <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/batches/${batch.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 hover:underline block"
                      >
                        {batch.batch_name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {batch.id}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {batch.product_type}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-bold text-slate-800">
                        {batch.prefix}0001 → {batch.prefix}{String(batch.quantity).padStart(4, "0")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums">
                      {batch.quantity} Cards
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={batch.status} />
                        <select
                          value={batch.status}
                          onChange={(e) => handleStatusProgression(batch.id, e.target.value)}
                          className="text-[10px] bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-600 focus:outline-hidden"
                        >
                          <option value="GENERATED">Generated</option>
                          <option value="PRINTED">Printed</option>
                          <option value="IN_STOCK">In Stock</option>
                          <option value="NFC_PROGRAMMED">Programmed</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-36 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{batch.activated_count || 0} activated</span>
                          <span className="font-semibold text-slate-700">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/batches/${batch.id}`}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-xs"
                          title="View and manage generated cards in this batch"
                        >
                          <span>Cards ({batch.quantity})</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <a
                          href={`/api/batches/${batch.id}/export`}
                          download
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Export CSV for Factory/Printing"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CSV</span>
                        </a>

                        <button
                          onClick={() => handleOpenPrintPreview(batch.id)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Printable Label Sheet"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Labels</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No production batches found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE BATCH MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Generate Production Batch</h3>
                  <p className="text-xs text-slate-500">Create unique Card IDs, activation keys &amp; permanent URLs</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Name / Reference
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. Batch #BATCH003 — Standard NTAG213 PVC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Quantity
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="10">10 Cards (Sample Test)</option>
                    <option value="50">50 Cards</option>
                    <option value="100">100 Cards (Standard)</option>
                    <option value="250">250 Cards</option>
                    <option value="500">500 Cards</option>
                    <option value="1000">1,000 Cards (Factory)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prefix (e.g. NF, CR, WD)
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="NF"
                    maxLength={5}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono uppercase focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical Product Type
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="NFCFlow CR80 NTAG213 PVC">NFCFlow CR80 NTAG213 PVC (Standard 85.6×54mm)</option>
                  <option value="NFCFlow Eco Wood Standee">NFCFlow Eco Wood Counter Standee</option>
                  <option value="NFCFlow Acrylic Table Standee">NFCFlow Premium Acrylic Table Standee</option>
                  <option value="NFCFlow Epoxy Keyfob / Token">NFCFlow Epoxy Keyfob / Token</option>
                  <option value="NFCFlow Metallic Review Card">NFCFlow Matte Metal Review Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Purpose &amp; Feature Lock
                </label>
                <select
                  value={cardPurpose}
                  onChange={(e) => setCardPurpose(e.target.value as CardPurpose)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500"
                >
                  <option value="google_review">🌟 Google Reviews Card (Owner locked to Google Reviews)</option>
                  <option value="whatsapp">💬 WhatsApp Connect Card (Owner locked to WhatsApp)</option>
                  <option value="instagram">📸 Instagram Follower Card (Owner locked to Instagram)</option>
                  <option value="menu">🍽️ Restaurant Digital Menu Card (Owner locked to Menu)</option>
                  <option value="vcard">📇 Digital Contact Business Card (Owner locked to vCard)</option>
                  <option value="universal">⚡ Universal Multi-Purpose (Owner can choose any type)</option>
                </select>
                <p className="text-[11px] text-blue-600 font-medium mt-1">
                  {cardPurpose === "google_review" && "🔒 Owners activating cards in this batch can ONLY configure Google Reviews."}
                  {cardPurpose === "whatsapp" && "🔒 Owners activating cards in this batch can ONLY configure WhatsApp chat."}
                  {cardPurpose === "instagram" && "🔒 Owners activating cards in this batch can ONLY configure Instagram."}
                  {cardPurpose === "menu" && "🔒 Owners activating cards in this batch can ONLY link their digital menu."}
                  {cardPurpose === "vcard" && "🔒 Owners activating cards in this batch can ONLY link their digital contact card."}
                  {cardPurpose === "universal" && "⚡ Owners can freely select and switch between all destination types."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Starting Sequence Number
                </label>
                <input
                  type="number"
                  min={1}
                  value={startingIndex}
                  onChange={(e) => setStartingIndex(e.target.value)}
                  placeholder="1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Preview first card slug: <span className="font-mono font-bold text-blue-600">{prefix || "NF"}0001</span>
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  variant="secondary"
                  size="md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Batch...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate {quantity} Cards</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE CARDS & PACKAGING SLIPS MODAL */}
      {selectedBatchForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" />
                  Printable Batch Production Studio — {selectedBatchForPrint.batch.batch_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Ready to print for CR80 PVC card printers or production sheets ({selectedBatchForPrint.cards.length} cards)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  variant="primary"
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs font-bold px-4"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Sheet
                </Button>
                <button
                  onClick={() => setSelectedBatchForPrint(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1.5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Print Controls */}
            <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Layout Switcher */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Print Layout</label>
                <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    onClick={() => setPrintLayout("portrait_cards")}
                    className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
                      printLayout === "portrait_cards"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Google Review Cards
                  </button>
                  <button
                    onClick={() => setPrintLayout("packaging_slips")}
                    className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
                      printLayout === "packaging_slips"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Packaging Slips
                  </button>
                </div>
              </div>

              {/* Theme Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Color Theme</label>
                <select
                  value={printTheme}
                  onChange={(e) => setPrintTheme(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium text-slate-800"
                >
                  <option value="white_revuz_edition">Google White (4-Color Borders Edition)</option>
                  <option value="matte_black">Matte Obsidian Black (Revuz Edition)</option>
                  <option value="midnight_navy">Midnight Royal Navy</option>
                  <option value="emerald_gold">Emerald Green & Gold</option>
                </select>
              </div>

              {/* Header Text Preset */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Top Headline</label>
                <select
                  value={`${printSubtitle}|${printHeadline}`}
                  onChange={(e) => {
                    const [sub, head] = e.target.value.split("|");
                    setPrintSubtitle(sub);
                    setPrintHeadline(head);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium text-slate-800"
                >
                  <option value="HELP OTHERS DISCOVER US|REVIEW NOW!">HELP OTHERS DISCOVER US / REVIEW NOW!</option>
                  <option value="WE'D LOVE|YOUR FEEDBACK">WE&apos;D LOVE / YOUR FEEDBACK</option>
                  <option value="LEAVE US A REVIEW|RATE US 5-STARS">LEAVE US A REVIEW / RATE US 5-STARS</option>
                  <option value="HOW WAS YOUR VISIT?|TAP TO REVIEW">HOW WAS YOUR VISIT? / TAP TO REVIEW</option>
                </select>
              </div>

              {/* Bottom Brand Label */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand Tag</label>
                <input
                  type="text"
                  value={printBrandTag}
                  onChange={(e) => setPrintBrandTag(e.target.value)}
                  placeholder="NFCFlow or Business Name"
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Printable Content Grid */}
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-100 flex-1">
              {printLayout === "portrait_cards" ? (
                /* GOOGLE REVIEW REVUZ-STYLE PORTRAIT CARDS */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 justify-items-center">
                  {selectedBatchForPrint.cards.map((card) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <GoogleReviewPortraitCard
                        slug={card.slug}
                        businessName={printBrandTag}
                        brandTag={printBrandTag}
                        activationCode={card.activation_code}
                        headerSubtitle={printSubtitle}
                        headerHeadline={printHeadline}
                        theme={printTheme}
                        scale={0.95}
                        interactive={false}
                      />
                      <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-2">
                        <span>Card #{card.slug}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-bold">Key: {card.activation_code || "XXXX-XXXX"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* PACKAGING SLIPS */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedBatchForPrint.cards.map((card) => {
                    const redirectUrl = getCardRedirectUrl(card.slug);
                    return (
                      <div
                        key={card.id}
                        className="border border-dashed border-slate-300 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3 relative shadow-xs"
                      >
                        <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-600">
                              NFCFlow Card
                            </span>
                            <p className="text-xs font-mono font-bold text-slate-900">{card.slug}</p>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                            CR80
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-white border border-slate-200 rounded-md">
                            <BatchQrCode url={redirectUrl} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-500">Activation Code:</p>
                            <p className="font-mono text-xs font-extrabold text-blue-600 tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {card.activation_code || "XXXX-XXXX"}
                            </p>
                            <p className="text-[9px] text-slate-400">nfcflow.in/activate</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono truncate">
                          <span>/r/{card.slug}</span>
                          <span>{card.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
