"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, DestinationType, CardStatus, InventoryStatus } from "@/types";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QrDownloadModal } from "@/components/qr/QrDownloadModal";
import {
  CreditCard,
  Plus,
  Search,
  QrCode,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  KeyRound,
  Filter,
} from "lucide-react";
import { getCardRedirectUrl } from "@/lib/utils";

export default function CardsPage() {
  const { selectedBusinessId, businesses } = useDashboard();
  const [cards, setCards] = useState<Card[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCardForQr, setSelectedCardForQr] = useState<Card | null>(null);

  // Quick Destination Change Modal State
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [destType, setDestType] = useState<DestinationType>("google_review");
  const [destUrl, setDestUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const bizParam = selectedBusinessId !== "all" ? `?business_id=${selectedBusinessId}` : "";
      const [cardsRes, batchesRes] = await Promise.all([
        fetch(`/api/cards${bizParam}`),
        fetch("/api/batches"),
      ]);

      const cardsJson = await cardsRes.json();
      const batchesJson = await batchesRes.json();

      if (cardsJson.success) setCards(cardsJson.data);
      if (batchesJson.success) setBatches(batchesJson.data);
    } catch (err) {
      console.error("Failed to load cards or batches:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBusinessId]);

  const toggleCardStatus = async (card: Card) => {
    const nextStatus: CardStatus = card.status === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          inventory_status: nextStatus === "active" ? "ACTIVE" : "GENERATED",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id
              ? { ...c, ...(json.data || {}), status: nextStatus, inventory_status: nextStatus === "active" ? "ACTIVE" : "GENERATED" }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Failed status toggle:", err);
    }
  };

  const openDestinationModal = (card: Card) => {
    setEditingCard(card);
    setDestType(card.destination_type);
    setDestUrl(card.destination_url);
  };

  const handleDestinationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/cards/${editingCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_type: destType,
          destination_url: destUrl,
          status: "active",
          inventory_status: "ACTIVE",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === editingCard.id
              ? { ...c, destination_type: destType, destination_url: destUrl, status: "active", inventory_status: "ACTIVE" }
              : c
          )
        );
        setEditingCard(null);
      } else {
        alert(json.error || "Failed to update destination");
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCard = async (card: Card) => {
    if (!confirm(`Are you sure you want to delete card '${card.name}' (${card.slug})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCards((prev) => prev.filter((c) => c.id !== card.id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredCards = cards.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.activation_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.business_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.batch_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBatch = selectedBatchFilter === "all" || c.batch_id === selectedBatchFilter;
    if (!matchesBatch) return false;

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && c.status === "active";
    if (statusFilter === "in_stock") return matchesSearch && (c.inventory_status === "IN_STOCK" || c.status === "in_stock");
    if (statusFilter === "sold") return matchesSearch && (c.inventory_status === "SOLD" || c.status === "sold" || (c.status === "draft" && !c.destination_url));
    if (statusFilter === "suspended") return matchesSearch && c.status === "suspended";
    if (statusFilter === "archived") return matchesSearch && (c.status === "archived" || c.inventory_status === "LOST");
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-700" />
            NFC &amp; QR Cards Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            One permanent URL. Dynamic destination switching anytime without reprinting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/batches">
            <Button variant="secondary" size="md" className="gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Card Batches
            </Button>
          </Link>
          <Link href="/dashboard/cards/new">
            <Button variant="primary" size="md">
              <Plus className="w-3.5 h-3.5" /> Create Card
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search card ID, code, batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto">
          {batches.length > 0 && (
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-slate-500 max-w-[160px] truncate"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_name}
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-slate-500"
          >
            <option value="all">All Cards ({cards.length})</option>
            <option value="active">Active ({cards.filter((c) => c.status === "active").length})</option>
            <option value="in_stock">In Stock / Warehouse</option>
            <option value="sold">Sold / Ready to Activate</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived / Lost</option>
          </select>

          <Button onClick={loadData} variant="secondary" size="sm">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Card ID / Slug</th>
                <th className="py-2.5 px-4">Card Name</th>
                <th className="py-2.5 px-4">Location / Branch</th>
                <th className="py-2.5 px-4">Current Destination</th>
                <th className="py-2.5 px-4">Activation Code</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Taps</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No cards found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const redirectUrl = getCardRedirectUrl(card.slug);
                  return (
                    <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/cards/${card.id}`}
                          className="font-mono font-bold text-blue-600 hover:underline block"
                        >
                          /r/{card.slug}
                        </Link>
                        {card.batch_name && (
                          <span className="text-[10px] text-slate-400 truncate block max-w-[120px]">
                            {card.batch_name}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/cards/${card.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {card.name}
                        </Link>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="block font-medium">{card.business_name || "—"}</span>
                        {card.branch && (
                          <span className="text-[10px] text-slate-400">{card.branch}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span className="capitalize font-medium text-slate-900">
                            {card.destination_type.replace("_", " ")}
                          </span>
                          <button
                            onClick={() => openDestinationModal(card)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Instant Change Destination"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5" title={card.destination_url}>
                          {card.destination_url || "(Not configured yet)"}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        {card.activation_code ? (
                          <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            {card.activation_code}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleCardStatus(card)}
                          title="Click to toggle active / suspended"
                          className="text-left"
                        >
                          <StatusBadge status={card.status} />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-slate-900 tabular-nums">
                        {card.total_scans?.toLocaleString() || "0"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCardForQr(card)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Download Print QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={redirectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Test Dynamic Redirect"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/dashboard/cards/${card.id}`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors"
                          >
                            Manage
                          </Link>
                          <button
                            onClick={() => handleDeleteCard(card)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK DESTINATION SWITCH MODAL */}
      <Modal
        isOpen={Boolean(editingCard)}
        onClose={() => setEditingCard(null)}
        title="Dynamic Destination Switcher"
      >
        {editingCard && (
          <form onSubmit={handleDestinationUpdate} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-500">Card ID:</span>
                <span className="font-bold text-slate-900">{editingCard.slug}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-500">Permanent URL:</span>
                <span className="text-blue-600 font-semibold">{getCardRedirectUrl(editingCard.slug)}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Destination Type
              </label>
              <select
                value={destType}
                onChange={(e) => setDestType(e.target.value as DestinationType)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-500"
              >
                <option value="google_review">Google Reviews</option>
                <option value="whatsapp">WhatsApp Chat</option>
                <option value="website">Official Website</option>
                <option value="instagram">Instagram Profile</option>
                <option value="menu">Restaurant Menu</option>
                <option value="vcard">Digital Business Card</option>
                <option value="custom">Custom URL</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target URL / Number
              </label>
              <input
                type="text"
                value={destUrl}
                onChange={(e) => setDestUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:border-slate-500"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                All physical cards with slug <span className="font-mono font-bold text-slate-800">/r/{editingCard.slug}</span> will immediately redirect here.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => setEditingCard(null)}
                variant="secondary"
                size="md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? "Updating..." : "Save & Switch Now"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* QR Code Modal */}
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
