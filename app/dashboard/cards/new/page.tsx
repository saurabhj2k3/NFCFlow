"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { DestinationType } from "@/types";
import { generateSlug } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { PvcCardPreview } from "@/components/card-preview/PvcCardPreview";
import {
  CreditCard,
  ArrowLeft,
  RefreshCw,
  Star,
  MessageCircle,
  Globe,
  Instagram,
  Link2,
} from "lucide-react";

export default function NewCardPage() {
  const router = useRouter();
  const { businesses, selectedBusinessId } = useDashboard();

  // Form State
  const [businessId, setBusinessId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [destinationType, setDestinationType] = useState<DestinationType>("google_review");
  const [destinationUrl, setDestinationUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    setSlug(generateSlug(6));
    if (businesses.length > 0) {
      const defaultBizId = selectedBusinessId !== "all" ? selectedBusinessId : businesses[0].id;
      setBusinessId(defaultBizId);
      const biz = businesses.find((b) => b.id === defaultBizId);
      if (biz) {
        setDestinationUrl(biz.google_review_url || "");
      }
    }
  }, [businesses, selectedBusinessId]);

  const handleBusinessChange = (bizId: string) => {
    setBusinessId(bizId);
    const biz = businesses.find((b) => b.id === bizId);
    if (biz && destinationType === "google_review") {
      setDestinationUrl(biz.google_review_url || "");
    }
  };

  const handleDestinationTypeChange = (type: DestinationType) => {
    setDestinationType(type);
    const biz = businesses.find((b) => b.id === businessId);
    if (!biz) return;

    switch (type) {
      case "google_review":
        setDestinationUrl(biz.google_review_url || "");
        break;
      case "whatsapp":
        setDestinationUrl(
          biz.whatsapp_number
            ? `https://wa.me/${biz.whatsapp_number}?text=Hello%20${encodeURIComponent(biz.name)}%2C%20I%20have%20an%20inquiry`
            : "https://wa.me/"
        );
        break;
      case "website":
        setDestinationUrl(biz.website_url || "https://");
        break;
      case "instagram":
        setDestinationUrl(
          biz.instagram_handle
            ? `https://instagram.com/${biz.instagram_handle}`
            : "https://instagram.com/"
        );
        break;
      case "custom":
        setDestinationUrl("https://");
        break;
    }
  };

  const regenerateSlug = () => {
    setSlug(generateSlug(6));
  };

  const selectedBiz = businesses.find((b) => b.id === businessId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          name,
          slug,
          destination_type: destinationType,
          destination_url: destinationUrl,
          status: "active",
          notes,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.error || "Failed to create card");
        setIsSubmitting(false);
        return;
      }

      router.push(`/dashboard/cards/${json.data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create card");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cards"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-700" />
              Create Review Card
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign a permanent slug and set the initial redirect destination.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Business Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Store Location *
              </label>
              <select
                required
                value={businessId}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Card Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Card Name / Counter Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Billing Counter 01"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Permanent Card Slug *
                </label>
                <button
                  type="button"
                  onClick={regenerateSlug}
                  className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Random Slug
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  /r/
                </span>
                <input
                  type="text"
                  required
                  placeholder="X7k29P"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {/* Destination Selector Tabs */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Initial Destination
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
                  const isSelected = destinationType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleDestinationTypeChange(item.id as DestinationType)}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors ${
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

            {/* Destination URL */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Destination Target URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Link href="/dashboard/cards">
                <Button type="button" variant="secondary" size="md">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Save Card & Open Studio
              </Button>
            </div>
          </form>
        </div>

        {/* Live PVC Preview */}
        <div className="lg:col-span-5 flex flex-col items-center bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
            Card Mockup (85.6 × 54 mm)
          </h3>
          <p className="text-xs text-slate-500 mb-6 text-center">
            Standard ISO CR80 dimensions
          </p>

          <PvcCardPreview
            businessName={selectedBiz?.name || "Business Name"}
            slug={slug || "SLUG"}
            brandColor={selectedBiz?.brand_color || "#0f2e22"}
            destinationType={destinationType}
          />
        </div>
      </div>
    </div>
  );
}
