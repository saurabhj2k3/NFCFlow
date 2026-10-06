"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  KeyRound,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Radio,
  BarChart2,
  Building2,
  Layers,
  Star,
  MessageCircle,
  Globe,
  Instagram,
  Utensils,
  Contact,
  Link2,
  Download,
  ShieldCheck,
  RefreshCw,
  LogOut,
  HelpCircle,
  Phone,
} from "lucide-react";
import { Card, Business, DestinationType } from "@/types";

interface DestinationPreset {
  type: DestinationType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  helper: string;
}

const DESTINATION_PRESETS: DestinationPreset[] = [
  {
    type: "google_review",
    title: "Google Reviews",
    description: "Send customers directly to your Google Review rating dialog",
    icon: Star,
    placeholder: "https://g.page/r/your-google-place-id/review",
    helper: "Paste your Google Maps Review Link or Place ID",
  },
  {
    type: "whatsapp",
    title: "WhatsApp Direct",
    description: "Open a direct chat window with pre-filled greeting text",
    icon: MessageCircle,
    placeholder: "https://wa.me/919876543210?text=Hello",
    helper: "Format: https://wa.me/[country_code][number]",
  },
  {
    type: "instagram",
    title: "Instagram Profile",
    description: "Grow your social followers by routing taps to your profile",
    icon: Instagram,
    placeholder: "https://instagram.com/yourbusiness",
    helper: "Paste your official Instagram handle URL",
  },
  {
    type: "website",
    title: "Business Website",
    description: "Drive traffic to your main landing page or online store",
    icon: Globe,
    placeholder: "https://yourbusiness.com",
    helper: "Any HTTPS store or landing page URL",
  },
  {
    type: "menu",
    title: "Digital Menu / Catalog",
    description: "Show a digital restaurant menu, PDF brochure, or catalog",
    icon: Utensils,
    placeholder: "https://yourbusiness.com/menu.pdf",
    helper: "Link to your PDF, Drive file, or interactive menu page",
  },
  {
    type: "vcard",
    title: "Digital Contact Card (vCard)",
    description: "Allow clients to save your phone and email in one tap",
    icon: Contact,
    placeholder: "https://vcard.link/card/your-vcard-id",
    helper: "Link to your digital vCard profile or contact exchange",
  },
  {
    type: "custom",
    title: "Custom Link",
    description: "Route NFC taps and QR scans to any custom URL",
    icon: Link2,
    placeholder: "https://custom-link.com",
    helper: "Any valid HTTPS destination URL",
  },
];

function CardQrCanvas({ url, slug }: { url: string; slug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      if (canvasRef.current && isMounted) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 160,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" },
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [url]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const pngUrl = canvasRef.current.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `NFCFlow_QR_${slug}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      <button
        onClick={handleDownload}
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Download QR Code (PNG)
      </button>
    </div>
  );
}

function ManageCardContent() {
  const searchParams = useSearchParams();
  const initialCard = searchParams.get("card") || searchParams.get("slug") || "";
  const initialCode = searchParams.get("code") || "";

  // Auth States
  const [cardId, setCardId] = useState(initialCard.toUpperCase());
  const [activationCode, setActivationCode] = useState(initialCode.toUpperCase());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [notActivatedInfo, setNotActivatedInfo] = useState<{ slug: string; code: string } | null>(null);

  // Authenticated Card States
  const [card, setCard] = useState<Card | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);

  // Edit Destination States
  const [selectedType, setSelectedType] = useState<DestinationType>("google_review");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [cardName, setCardName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Auto format activation code input as XXXX-XXXX
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 4) {
      val = `${val.slice(0, 4)}-${val.slice(4)}`;
    }
    setActivationCode(val);
    setAuthError(null);
    setNotActivatedInfo(null);
  };

  // Perform Auth Verification
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cardId.trim()) {
      setAuthError("Please enter your Card ID (e.g. WD0100 or NF001).");
      return;
    }
    if (!activationCode.trim()) {
      setAuthError("Please enter your 8-character Activation Code (e.g. T97E-658H).");
      return;
    }

    setIsVerifying(true);
    setAuthError(null);
    setNotActivatedInfo(null);

    try {
      const res = await fetch("/api/manage/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: cardId.trim(),
          activation_code: activationCode.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.not_activated) {
          setNotActivatedInfo({
            slug: json.card_slug || cardId.trim(),
            code: activationCode.trim(),
          });
        }
        throw new Error(json.error || "Authentication failed.");
      }

      setCard(json.card);
      setBusiness(json.business || null);
      setScanCount(json.scan_count || 0);
      setSelectedType(json.card.destination_type || "google_review");
      setDestinationUrl(json.card.destination_url || "");
      setCardName(json.card.name || "");
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message || "Failed to verify credentials.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto verify if both URL params provided
  useEffect(() => {
    if (initialCard && initialCode) {
      handleVerify();
    }
  }, []);

  // Save Destination Target Changes
  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationUrl.trim()) {
      setSaveErrorMsg("Please enter a valid target URL.");
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const res = await fetch("/api/manage/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: card?.slug || cardId.trim(),
          activation_code: activationCode.trim(),
          destination_type: selectedType,
          destination_url: destinationUrl.trim(),
          card_name: cardName.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save updates.");
      }

      setCard(json.card);
      setSaveSuccessMsg("Destination link updated successfully! Taps and scans now route to your new destination.");
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      setSaveErrorMsg(err.message || "Failed to update link.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCard(null);
    setBusiness(null);
    setActivationCode("");
  };

  const redirectUrl = card ? `https://nfcflow.in/r/${card.slug}` : "";
  const activePreset = DESTINATION_PRESETS.find((p) => p.type === selectedType) || DESTINATION_PRESETS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo-icon.png"
              alt="NFCFlow Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-base tracking-tight text-slate-900">
              NFC<span className="text-indigo-600">Flow</span>
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Owner Portal
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Portal
              </button>
            ) : (
              <Link
                href="/activate"
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
              >
                Activate New Card <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!isAuthenticated ? (
          /* ========================================================================= */
          /* SCREEN 1: AUTHENTICATION (CARD ID + SECRET CODE)                          */
          /* ========================================================================= */
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 mb-3 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Manage Your NFC Card
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Enter your Card ID and private activation code to view live scan statistics or update where your card redirects.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
              {notActivatedInfo ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-5 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-950">Card is not activated yet</p>
                      <p className="text-[11px] text-amber-800/80 mt-0.5 leading-relaxed">
                        Card <span className="font-mono text-slate-900 font-bold">{notActivatedInfo.slug}</span> must be registered to a business before you can manage its destination.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/activate?card=${notActivatedInfo.slug}&code=${notActivatedInfo.code}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-xs"
                  >
                    <span>Activate Card & Register Business</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : authError ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-5 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              ) : null}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                    <span>Card Identifier (Slug or ID)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Printed on card</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={cardId}
                      onChange={(e) => {
                        setCardId(e.target.value.toUpperCase());
                        setAuthError(null);
                      }}
                      placeholder="e.g. WD0100 or NF001"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                    <span>Secret Activation Code</span>
                    <span className="text-[10px] text-slate-400 font-normal">Format: XXXX-XXXX</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={activationCode}
                      onChange={handleCodeChange}
                      placeholder="e.g. T97E-658H"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono tracking-wider text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                    Found on your card box, envelope, or scratch sticker.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Authenticating Card...
                    </>
                  ) : (
                    <>
                      Verify & Open Card Settings
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  First time setting up your card?{" "}
                  <Link href="/activate" className="text-indigo-600 hover:underline font-semibold">
                    Go to Activation Portal →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* SCREEN 2: AUTHENTICATED MANAGEMENT STUDIO                                 */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Top Card Info & Stats Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {card?.slug}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active & Routing
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {card?.name || business?.name || "My NFC Card"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {business?.name || "Registered Business"} &bull; {business?.category || "Local Business"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`/r/${card?.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                    Test Live NFC Redirect
                  </a>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Total Taps & Scans</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-slate-900 font-mono">{scanCount}</span>
                    <span className="text-[10px] text-indigo-600 font-medium">interactions</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Current Target</span>
                  <span className="text-xs font-semibold text-slate-800 capitalize truncate block">
                    {card?.destination_type?.replace("_", " ") || "Google Review"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Branch / Location</span>
                  <span className="text-xs font-semibold text-slate-800 truncate block">
                    {card?.branch || business?.branch || "Main Branch"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Routing URL</span>
                  <span className="text-xs font-mono text-indigo-600 font-semibold truncate block">
                    /r/{card?.slug}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Destination Selector & URL Form */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
                  <div className="mb-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        Change Destination Link
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose what happens when customers tap your physical NFC card or scan your QR code.
                      </p>
                    </div>
                  </div>

                  {saveSuccessMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 mb-5 flex items-center gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  {saveErrorMsg && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-5 flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{saveErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveDestination} className="space-y-5">
                    {/* Destination Presets (Locked if Card is dedicated to specific purpose) */}
                    {card?.card_purpose && card.card_purpose !== "universal" && card.card_purpose !== "custom" ? (
                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                            <activePreset.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>Dedicated {activePreset.title} Card</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono font-semibold">
                                PURPOSE LOCKED
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              This physical card is manufactured exclusively for {activePreset.title}. You can update its destination link below.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-2">
                          Select Destination Type
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {DESTINATION_PRESETS.map((preset) => {
                            const Icon = preset.icon;
                            const isSelected = selectedType === preset.type;
                            return (
                              <button
                                key={preset.type}
                                type="button"
                                onClick={() => {
                                  setSelectedType(preset.type);
                                  if (!destinationUrl || destinationUrl === activePreset.placeholder) {
                                    setDestinationUrl(preset.placeholder);
                                  }
                                }}
                                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-indigo-50/70 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500/30 shadow-xs"
                                    : "bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-bold block truncate">{preset.title}</span>
                                  <span className="text-[11px] text-slate-500 block line-clamp-1 mt-0.5">
                                    {preset.description}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Target URL Input */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                        <span>Target Destination URL *</span>
                        <span className="text-[10px] text-slate-400">{activePreset.helper}</span>
                      </label>
                      <div className="relative">
                        <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={destinationUrl}
                          onChange={(e) => setDestinationUrl(e.target.value)}
                          placeholder={activePreset.placeholder}
                          className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Optional Card Label */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Card Display Name <span className="text-slate-400 font-normal">(Optional label for your records)</span>
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="e.g. Front Reception Card"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Updating Cloud Routing...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save & Update Destination
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Physical Card QR & Tips */}
              <div className="lg:col-span-4 space-y-6">
                {/* QR Code Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Your Card's QR Code</h3>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Permanent scan link: <span className="font-mono text-indigo-600 font-semibold">nfcflow.in/r/{card?.slug}</span>
                  </p>

                  <CardQrCanvas url={redirectUrl} slug={card?.slug || "card"} />
                </div>

                {/* Instant Real-Time Routing Info */}
                <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Permanent Dynamic Chip
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your physical NFC card and QR code are permanently linked to your cloud routing ID. Whenever you change the destination link above, all future customer taps redirect to the new page in real time with 0 downtime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <p>NFCFlow &bull; Dynamic NFC & QR Routing Platform for Businesses</p>
      </footer>
    </div>
  );
}

export default function ManageCardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-slate-500 flex items-center justify-center text-xs">
          Loading NFCFlow Owner Portal...
        </div>
      }
    >
      <ManageCardContent />
    </Suspense>
  );
}
