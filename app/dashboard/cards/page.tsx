"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, DestinationType, CardStatus } from "@/types";
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
} from "lucide-react";
import { getCardRedirectUrl } from "@/lib/utils";

export default function CardsPage() {
  const { selectedBusinessId, businesses } = useDashboard();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCardForQr, setSelectedCardForQr] = useState<Card | null>(null);

  // Quick Destination Change Modal State
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [destType, setDestType] = useState<DestinationType>("google_review");
  const [destUrl, setDestUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const bizParam = selectedBusinessId !== "all" ? `?business_id=${selectedBusinessId}` : "";
      const res = await fetch(`/api/cards${bizParam}`);
      const json = await res.json();
      if (json.success) {
        setCards(json.data);
      }
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [selectedBusinessId]);

  const toggleCardStatus = async (card: Card) => {
    const nextStatus: CardStatus = card.status === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, status: nextStatus } : c))
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
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === editingCard.id
              ? { ...c, destination_type: destType, destination_url: destUrl }
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
      (c.business_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-700" />
            NFC & QR Cards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage permanent card slugs, dynamic destinations, QR downloads, and statuses.
          </p>
        </div>

        <Link href="/dashboard/cards/new">
          <Button variant="primary" size="md">
            <Plus className="w-3.5 h-3.5" /> Create Card
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by card name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="suspended">Suspended</option>
          </select>

          <Button onClick={loadCards} variant="secondary" size="sm">
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
                <th className="py-2.5 px-4">Card Name</th>
                <th className="py-2.5 px-4">Slug</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Destination Target</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">NFC Taps</th>
                <th className="py-2.5 px-4 text-center">QR Scans</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No cards found.
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
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {card.name}
                        </Link>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                        /r/{card.slug}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {card.business_name || "—"}
                      </td>

                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <span className="capitalize font-medium text-slate-900">
                            {card.destination_type.replace("_", " ")}
                          </span>
                          <button
                            onClick={() => openDestinationModal(card)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Quick Change Destination"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5" title={card.destination_url}>
                          {card.destination_url}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleCardStatus(card)}
                          title="Click to toggle status"
                          className="text-left"
                        >
                          <StatusBadge status={card.status} />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-slate-900 tabular-nums">
                        {card.nfc_scans?.toLocaleString() || 0}
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-slate-900 tabular-nums">
                        {card.qr_scans?.toLocaleString() || 0}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* QR Download */}
                          <button
                            onClick={() => setSelectedCardForQr(card)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Download QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {/* Test Link */}
                          <a
                            href={redirectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Test Live Redirect"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Studio Details */}
                          <Link
                            href={`/dashboard/cards/${card.id}`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors"
                          >
                            Studio
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteCard(card)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Delete Card"
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

      {/* Quick Destination Change Modal */}
      {editingCard && (
        <Modal
          isOpen={Boolean(editingCard)}
          onClose={() => setEditingCard(null)}
          title="Update Redirect Destination"
          description={`Change target URL for /r/${editingCard.slug} in real-time.`}
          maxWidth="md"
        >
          <form onSubmit={handleDestinationUpdate} className="space-y-4 py-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Destination Type
              </label>
              <select
                value={destType}
                onChange={(e) => setDestType(e.target.value as DestinationType)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
              >
                <option value="google_review">Google Reviews</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="website">Website</option>
                <option value="instagram">Instagram</option>
                <option value="custom">Custom URL</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Redirect URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={destUrl}
                onChange={(e) => setDestUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => setEditingCard(null)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdating}
              >
                Save
              </Button>
            </div>
          </form>
        </Modal>
      )}

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
