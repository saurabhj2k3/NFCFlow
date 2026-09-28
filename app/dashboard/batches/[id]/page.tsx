"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  ArrowLeft,
  Download,
  Printer,
  FileSpreadsheet,
  QrCode,
  CheckCircle2,
  Package,
  RefreshCw,
  ExternalLink,
  Search,
  KeyRound,
  CreditCard,
  Copy,
  Check,
  Building2,
  Trash2,
  Sparkles,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { CardBatch, Card } from "@/types";
import { getCardRedirectUrl } from "@/lib/utils";
import { QrDownloadModal } from "@/components/qr/QrDownloadModal";
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

export default function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [batch, setBatch] = useState<CardBatch | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [selectedCardForQr, setSelectedCardForQr] = useState<Card | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printLayout, setPrintLayout] = useState<"portrait_cards" | "packaging_slips">("portrait_cards");
  const [printTheme, setPrintTheme] = useState<"white_revuz_edition" | "matte_black" | "frost_white" | "midnight_navy" | "emerald_gold">("white_revuz_edition");
  const [printSubtitle, setPrintSubtitle] = useState("WE'D LOVE");
  const [printHeadline, setPrintHeadline] = useState("YOUR FEEDBACK");
  const [printBrandTag, setPrintBrandTag] = useState("NFCFlow");

  const loadBatchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/batches/${id}`);
      const json = await res.json();
      if (json.success) {
        setBatch(json.data);
        setCards(json.cards || []);
      }
    } catch (err) {
      console.error("Failed loading batch:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatchData();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!batch) return;
    try {
      const res = await fetch(`/api/batches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        loadBatchData();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteBatch = async () => {
    if (!confirm(`Are you sure you want to delete batch '${batch?.batch_name}'?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        router.push("/dashboard/batches");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const copyToClipboard = (text: string, slug: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading batch inventory...
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-base font-bold text-slate-900">Batch Not Found</h2>
        <p className="text-xs text-slate-500">The requested batch could not be found or has been removed.</p>
        <Link href="/dashboard/batches">
          <Button variant="primary" size="md">Return to Batches</Button>
        </Link>
      </div>
    );
  }

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.activation_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.business_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && card.status === "active";
    if (statusFilter === "in_stock") return matchesSearch && card.inventory_status === "IN_STOCK";
    if (statusFilter === "sold") return matchesSearch && card.inventory_status === "SOLD";
    if (statusFilter === "generated") return matchesSearch && card.inventory_status === "GENERATED";
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/batches"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {batch.batch_name}
              </h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Product: <strong className="text-slate-700">{batch.product_type}</strong></span>
              <span>•</span>
              <span className="font-mono">Prefix: {batch.prefix}</span>
              <span>•</span>
              <span>Created {new Date(batch.created_at).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={batch.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="GENERATED">Status: Generated</option>
            <option value="PRINTED">Status: Printed</option>
            <option value="IN_STOCK">Status: In Stock</option>
            <option value="NFC_PROGRAMMED">Status: Programmed</option>
            <option value="COMPLETED">Status: Completed</option>
          </select>

          <a
            href={`/api/batches/${batch.id}/export`}
            download
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </a>

          <Button
            onClick={() => setIsPrintModalOpen(true)}
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" /> Print Slips
          </Button>

          <Button onClick={handleDeleteBatch} variant="danger" size="sm">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cards"
          value={cards.length.toString()}
          subtitle="Manufactured in batch"
          icon={Layers}
        />
        <StatCard
          title="Activated Cards"
          value={cards.filter((c) => c.status === "active").length.toString()}
          subtitle={`${Math.round((cards.filter((c) => c.status === "active").length / (cards.length || 1)) * 100)}% live`}
          icon={CheckCircle2}
        />
        <StatCard
          title="In Warehouse Stock"
          value={cards.filter((c) => c.inventory_status === "IN_STOCK" || c.inventory_status === "GENERATED" || c.inventory_status === "PRINTED").length.toString()}
          subtitle="Ready to ship"
          icon={Package}
        />
        <StatCard
          title="Sold / In Transit"
          value={cards.filter((c) => c.inventory_status === "SOLD").length.toString()}
          subtitle="Pending customer activation"
          icon={CreditCard}
        />
      </div>

      {/* Cards Table in this Batch */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Cards in this Batch ({cards.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each card has a permanent URL, unique QR code, and activation key
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search card ID, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Statuses ({cards.length})</option>
              <option value="active">Active</option>
              <option value="in_stock">In Stock</option>
              <option value="sold">Sold</option>
              <option value="generated">Generated</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Card ID / Slug</th>
                <th className="py-2.5 px-4">Activation Code</th>
                <th className="py-2.5 px-4">Permanent Link</th>
                <th className="py-2.5 px-4">Assigned Location</th>
                <th className="py-2.5 px-4">Current Destination</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Taps</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCards.map((card) => {
                const redirectUrl = getCardRedirectUrl(card.slug);
                const activateUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/activate?card=${card.slug}`;

                return (
                  <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/cards/${card.id}`}
                        className="font-mono font-bold text-blue-600 hover:underline block"
                      >
                        {card.slug}
                      </Link>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[120px]">
                        {card.name}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-mono text-[11px] font-bold text-slate-800">
                        <KeyRound className="w-3 h-3 text-blue-600" />
                        <span>{card.activation_code || "XXXX-XXXX"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1">
                        <a
                          href={redirectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          /r/{card.slug}
                        </a>
                        <button
                          onClick={() => copyToClipboard(redirectUrl, card.slug)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Copy Permanent URL"
                        >
                          {copiedSlug === card.slug ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {card.business_name || "Unassigned Stock"}
                    </td>

                    <td className="py-3 px-4 max-w-[180px]">
                      <span className="capitalize font-medium text-slate-900 block">
                        {card.destination_type?.replace("_", " ") || "—"}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block" title={card.destination_url}>
                        {card.destination_url || "(Not activated)"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={card.status} />
                    </td>

                    <td className="py-3 px-4 text-center font-semibold text-slate-900 tabular-nums">
                      {card.total_scans || 0}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCardForQr(card)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="View QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/activate?card=${card.slug}`}
                          target="_blank"
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Test Customer Activation"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Activate</span>
                        </Link>

                        <Link
                          href={`/dashboard/cards/${card.id}`}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors"
                        >
                          Studio
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCards.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No cards in this batch match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT SLIPS & CARD PRODUCTION MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" />
                  Batch Print & Production Studio — {batch.batch_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {cards.length} cards ready to print for CR80 PVC printers (Fargo, Zebra, Evolis) or sheet printing
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
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1.5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Print Customization Controls */}
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

            {/* Cards Print Canvas */}
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-100 flex-1">
              {printLayout === "portrait_cards" ? (
                /* GOOGLE REVIEW REVUZ-STYLE PORTRAIT CARDS GRID */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 justify-items-center">
                  {cards.map((card) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <GoogleReviewPortraitCard
                        slug={card.slug}
                        businessName={printBrandTag || batch.batch_name}
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
                /* PACKAGING SLIPS GRID */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {cards.map((card) => {
                    const redirectUrl = getCardRedirectUrl(card.slug);
                    return (
                      <div
                        key={card.id}
                        className="border border-dashed border-slate-300 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3 relative shadow-xs"
                      >
                        <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-600">
                              NFCFlow Smart Card
                            </span>
                            <p className="text-xs font-mono font-bold text-slate-900">{card.slug}</p>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                            {batch.prefix}
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
                          <span>{card.inventory_status || card.status}</span>
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

      {/* QR Modal */}
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
