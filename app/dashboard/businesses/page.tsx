"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Business } from "@/types";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Star,
  BarChart3,
  CreditCard,
  Radio,
  QrCode,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function BusinessesPage() {
  const router = useRouter();
  const { businesses, cards, refreshData, setSelectedBusinessId } = useDashboard();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [brandColor, setBrandColor] = useState("#0f2e22");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setName("");
    setSlug("");
    setGoogleReviewUrl("");
    setPhone("");
    setEmail("");
    setAddress("");
    setWebsiteUrl("");
    setWhatsappNumber("");
    setBrandColor("#0f2e22");
    setErrorMessage("");
    setEditingBusiness(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (biz: Business) => {
    setEditingBusiness(biz);
    setName(biz.name);
    setSlug(biz.slug);
    setGoogleReviewUrl(biz.google_review_url);
    setPhone(biz.phone || "");
    setEmail(biz.email || "");
    setAddress(biz.address || "");
    setWebsiteUrl(biz.website_url || "");
    setWhatsappNumber(biz.whatsapp_number || "");
    setBrandColor(biz.brand_color || "#0f2e22");
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        google_review_url: googleReviewUrl,
        phone,
        email,
        address,
        website_url: websiteUrl,
        whatsapp_number: whatsappNumber,
        brand_color: brandColor,
      };

      const url = editingBusiness ? `/api/businesses/${editingBusiness.id}` : "/api/businesses";
      const method = editingBusiness ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        setErrorMessage(json.error || "Failed to save business");
        setIsSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      resetForm();
      refreshData();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? All associated cards will also be removed.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/businesses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        refreshData();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleNavigateToAnalytics = (bizId: string) => {
    setSelectedBusinessId(bizId);
    router.push("/dashboard/analytics");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            Business Locations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your branches, active review cards, and location-specific analytics.
          </p>
        </div>

        <Button onClick={openAddModal} variant="primary" size="md">
          <Plus className="w-3.5 h-3.5" /> Add Location
        </Button>
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {businesses.map((biz) => {
          // Calculate location-specific metrics
          const bizCards = cards.filter((c) => c.business_id === biz.id);
          const totalScans = bizCards.reduce((acc, c) => acc + (c.total_scans || 0), 0);
          const nfcScans = bizCards.reduce((acc, c) => acc + (c.nfc_scans || 0), 0);
          const qrScans = bizCards.reduce((acc, c) => acc + (c.qr_scans || 0), 0);

          return (
            <div
              key={biz.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Top Title & Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: biz.brand_color || "#0f2e22" }}
                    >
                      {biz.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1">
                        {biz.name}
                      </h3>
                      <span className="font-mono text-[11px] text-slate-400">
                        {biz.slug}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(biz)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Location"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(biz.id, biz.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Delete Location"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Location Live Metrics Bar */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Cards
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {bizCards.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" /> Total Scans
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {totalScans}
                    </p>
                  </div>
                </div>

                {/* Channel Share */}
                {totalScans > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-slate-400" /> {nfcScans} NFC taps
                    </span>
                    <span className="flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-slate-400" /> {qrScans} QR scans
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 py-2.5 border-t border-slate-100">
                  {biz.address && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-600 line-clamp-2">{biz.address}</span>
                    </div>
                  )}
                  {biz.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{biz.phone}</span>
                    </div>
                  )}
                  {biz.google_review_url && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <a
                        href={biz.google_review_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:underline truncate font-mono text-[11px]"
                      >
                        {biz.google_review_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleNavigateToAnalytics(biz.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Analytics <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Business Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingBusiness ? "Edit Location" : "Add New Location"}
        description="Configure branch information and default Google Review target."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Branch Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Swasthya Medical - Phoenix Mall"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Review Target URL *
            </label>
            <input
              type="url"
              required
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/CbXx_your_review_link/review"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Number (Optional)
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="919876543210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No. 4, Ground Floor, Phoenix Marketcity..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="sm"
            >
              {isSubmitting ? "Saving..." : editingBusiness ? "Save Changes" : "Create Location"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
