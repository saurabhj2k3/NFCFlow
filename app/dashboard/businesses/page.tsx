"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function BusinessesPage() {
  const { businesses, refreshData, setSelectedBusinessId } = useDashboard();
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
        slug,
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
            Configure store branches, default review URLs, and contact details.
          </p>
        </div>

        <Button onClick={openAddModal} variant="primary" size="md">
          <Plus className="w-3.5 h-3.5" /> Add Location
        </Button>
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((biz) => (
          <div
            key={biz.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: biz.brand_color || "#0f172a" }}
                  >
                    {biz.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1">
                      {biz.name}
                    </h3>
                    <span className="font-mono text-[11px] text-slate-500">
                      ID: {biz.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(biz)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                    title="Edit Location"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(biz.id, biz.name)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors"
                    title="Delete Location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs text-slate-600 py-2 border-y border-slate-100 my-3">
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
                      className="text-slate-800 hover:underline truncate font-mono text-[11px]"
                    >
                      {biz.google_review_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setSelectedBusinessId(biz.id)}
                className="text-xs font-semibold text-slate-800 hover:underline"
              >
                View Analytics →
              </button>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Business Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingBusiness ? "Edit Location" : "Add New Location"}
        description="Configure store details and default Google Review target."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Business / Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Swasthya Medical & General Store"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Location Slug (Unique ID)
              </label>
              <input
                type="text"
                placeholder="e.g. swasthya-medical"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Card Theme Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Default Google Review URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://g.page/r/XXXXXXXX/review"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="919876543210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Store Address
              </label>
              <textarea
                rows={2}
                placeholder="Shop No., Street, City, State, PIN"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingBusiness ? "Update Location" : "Save Location"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
