"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Store,
  MessageSquare,
  Globe,
  Instagram,
  Utensils,
  UserCheck,
  Link2,
  KeyRound,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Phone,
  Mail,
  MapPin,
  Tag,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DestinationType } from "@/types";
import { getCardRedirectUrl } from "@/lib/utils";

const BUSINESS_CATEGORIES = [
  { id: "Healthcare & Clinic", label: "Healthcare / Clinic", icon: "🏥" },
  { id: "Restaurant & Cafe", label: "Restaurant / Cafe", icon: "🍽️" },
  { id: "Retail & Shop", label: "Retail / Store", icon: "🛍️" },
  { id: "Salon & Spa", label: "Salon & Spa", icon: "💇" },
  { id: "Services & Agency", label: "Services / Agency", icon: "🏢" },
  { id: "Hotel & Hospitality", label: "Hotel / Hospitality", icon: "🏨" },
  { id: "Gym & Fitness", label: "Gym & Fitness", icon: "🏋️" },
  { id: "General Business", label: "Other Business", icon: "📦" },
];

const DESTINATION_OPTIONS: Array<{
  type: DestinationType;
  title: string;
  badge: string;
  description: string;
  icon: any;
  placeholder: string;
  helper: string;
  prefix?: string;
}> = [
  {
    type: "google_review",
    title: "Google 5-Star Reviews",
    badge: "Recommended",
    description: "Opens your Google Maps review dialog directly",
    icon: Store,
    placeholder: "https://g.page/r/CbXx_demo/review",
    helper: "Paste your Google Maps review link (from Google Business Profile -> Ask for reviews)",
  },
  {
    type: "whatsapp",
    title: "WhatsApp Direct Chat",
    badge: "Instant Chat",
    description: "Launches customer's WhatsApp with a prefilled inquiry message",
    icon: MessageSquare,
    placeholder: "919876543210",
    prefix: "+91",
    helper: "Enter WhatsApp mobile number with country code (e.g. 919876543210)",
  },
  {
    type: "instagram",
    title: "Instagram Profile",
    badge: "Social",
    description: "Directs customers to follow your Instagram account or see reels",
    icon: Instagram,
    placeholder: "yourbusiness",
    prefix: "@",
    helper: "Enter your Instagram handle (without @)",
  },
  {
    type: "website",
    title: "Official Website",
    badge: "Web Traffic",
    description: "Send taps to your homepage, booking page, or custom URL",
    icon: Globe,
    placeholder: "https://yourbusiness.com",
    helper: "Enter full website URL starting with https://",
  },
  {
    type: "menu",
    title: "Digital QR Menu",
    badge: "Dining",
    description: "Display digital food and drink menu for in-house diners",
    icon: Utensils,
    placeholder: "https://yourrestaurant.com/menu",
    helper: "Link to your digital menu, PDF, or ordering page",
  },
  {
    type: "vcard",
    title: "Digital Business Card",
    badge: "Contact",
    description: "Share contact details, phone, and vCard for 1-tap phone saving",
    icon: UserCheck,
    placeholder: "https://yourname.bio or vCard URL",
    helper: "Link to your digital contact profile or bio link",
  },
  {
    type: "custom",
    title: "Custom Redirect URL",
    badge: "Universal",
    description: "Route NFC taps to any custom destination link",
    icon: Link2,
    placeholder: "https://custom-link.com",
    helper: "Any valid HTTPS URL",
  },
];

function CardQrPreview({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      if (canvasRef.current && isMounted) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 140,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" },
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [url]);

  return <canvas ref={canvasRef} className="rounded-xl shadow-lg border border-slate-700 mx-auto" />;
}

function ActivateContent() {
  const searchParams = useSearchParams();
  const initialCard = searchParams.get("card") || searchParams.get("slug") || "";

  // 4-Step Wizard
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Inputs: Step 1
  const [cardId, setCardId] = useState(initialCard.toUpperCase());
  const [activationCode, setActivationCode] = useState("");

  // Form Inputs: Step 2 (Isolated Business Registration)
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Healthcare & Clinic");
  const [branchName, setBranchName] = useState("Main Location");

  // Form Inputs: Step 3
  const [selectedType, setSelectedType] = useState<DestinationType>("google_review");
  const [destinationInput, setDestinationInput] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("Hi! I tapped your review card and would like more information.");

  // Async states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedCard, setVerifiedCard] = useState<any>(null);
  const [activatedCard, setActivatedCard] = useState<any>(null);
  const [registeredBusiness, setRegisteredBusiness] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialCard) {
      setCardId(initialCard.toUpperCase());
    }
  }, [initialCard]);

  // Format activation code input automatically as XXXX-XXXX
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 4) {
      val = `${val.slice(0, 4)}-${val.slice(4)}`;
    }
    setActivationCode(val);
    setErrorMsg(null);
  };

  // Quick fill demo credentials
  const handleDemoFill = () => {
    setCardId("DEMO-CARD-01");
    setActivationCode("T97E-658H");
    setErrorMsg(null);
  };

  // Step 1: Verify Card Identification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId.trim()) {
      setErrorMsg("Please enter your Card ID (e.g. WD0100 or NF001).");
      return;
    }
    if (!activationCode.trim()) {
      setErrorMsg("Please enter your 8-character Activation Code (e.g. T97E-658H).");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/activation/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: cardId.trim(),
          activation_code: activationCode.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Card verification failed");
      }

      setVerifiedCard(json.card);
      if (json.card.business_name && !businessName) {
        setBusinessName(json.card.business_name);
      }
      if (json.card.destination_type) setSelectedType(json.card.destination_type);
      if (json.card.destination_url) setDestinationInput(json.card.destination_url);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Validate business registration
  const handleBusinessNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!businessName.trim() || businessName.trim().length < 2) {
      setErrorMsg("Please enter a valid Business Name (at least 2 characters).");
      return;
    }
    if (!businessPhone.trim() || businessPhone.trim().replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid Business Contact/WhatsApp Phone Number.");
      return;
    }
    if (!businessEmail.trim() || !businessEmail.includes("@") || !businessEmail.includes(".")) {
      setErrorMsg("Please enter a valid Business Email Address for card tracking & recovery.");
      return;
    }
    if (!businessAddress.trim()) {
      setErrorMsg("Please enter your Business Location Address or City.");
      return;
    }

    setStep(3);
  };

  // Compute final destination URL based on type and input
  const getComputedUrl = () => {
    const raw = destinationInput.trim();
    if (!raw) return "";
    if (selectedType === "whatsapp") {
      const cleanNum = raw.replace(/\D/g, "");
      const msgParam = whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : "";
      return `https://wa.me/${cleanNum}${msgParam}`;
    }
    if (selectedType === "instagram") {
      const cleanHandle = raw.replace("@", "").trim();
      return `https://instagram.com/${cleanHandle}`;
    }
    if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
      return `https://${raw}`;
    }
    return raw;
  };

  // Step 3: Submit Final Activation
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = getComputedUrl();

    if (!finalUrl) {
      setErrorMsg("Please provide your destination URL or information.");
      return;
    }

    setIsActivating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/activation/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: cardId.trim(),
          activation_code: activationCode.trim(),
          destination_type: selectedType,
          destination_url: finalUrl,
          business_name: businessName.trim(),
          business_phone: businessPhone.trim(),
          business_email: businessEmail.trim().toLowerCase(),
          business_address: businessAddress.trim(),
          business_category: businessCategory,
          card_name: `${businessName.trim()} - ${cardId.trim()}`,
          branch: branchName.trim() || "Main Location",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Activation failed");
      }

      setActivatedCard(json.data);
      setRegisteredBusiness(json.business);
      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsActivating(false);
    }
  };

  const currentOption = DESTINATION_OPTIONS.find((o) => o.type === selectedType) || DESTINATION_OPTIONS[0];
  const computedUrl = getComputedUrl();
  const displaySlug = activatedCard?.slug || verifiedCard?.slug || cardId.trim() || "WD0100";
  const redirectUrl = getCardRedirectUrl(displaySlug);

  const copyRedirectUrl = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleActivateAnother = () => {
    setCardId("");
    setActivationCode("");
    setVerifiedCard(null);
    setActivatedCard(null);
    setErrorMsg(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img
            src="/logo-icon.png"
            alt="NFCFlow Logo"
            className="h-8 w-8 object-contain shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">NFCFlow</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Activation Portal
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Hardware Onboarding &amp; Routing</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gateway Ready</span>
          </div>
          <Link
            href="/manage"
            className="text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Manage Existing Card
          </Link>
          <Link
            href="/login"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors border border-slate-200 shadow-2xs"
          >
            Admin Sign In
          </Link>
        </div>
      </header>

      {/* Centered Studio Layout */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6">
          
          {/* Step Progress Pill Indicator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs">
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
              
              {/* Step 1 Pill */}
              <div
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                  step === 1
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                    : step > 1
                    ? "bg-slate-100 text-slate-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step > 1 ? "bg-emerald-500 text-white" : step === 1 ? "bg-white text-blue-600" : "bg-slate-200 text-slate-500"
                }`}>
                  {step > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : "1"}
                </span>
                <span className="truncate hidden sm:inline">Verify Card</span>
              </div>

              {/* Step 2 Pill */}
              <div
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                  step === 2
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                    : step > 2
                    ? "bg-slate-100 text-slate-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step > 2 ? "bg-emerald-500 text-white" : step === 2 ? "bg-white text-blue-600" : "bg-slate-200 text-slate-500"
                }`}>
                  {step > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : "2"}
                </span>
                <span className="truncate hidden sm:inline">Business</span>
              </div>

              {/* Step 3 Pill */}
              <div
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                  step === 3
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                    : step > 3
                    ? "bg-slate-100 text-slate-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step > 3 ? "bg-emerald-500 text-white" : step === 3 ? "bg-white text-blue-600" : "bg-slate-200 text-slate-500"
                }`}>
                  {step > 3 ? <Check className="w-3 h-3 stroke-[3]" /> : "3"}
                </span>
                <span className="truncate hidden sm:inline">Route URL</span>
              </div>

              {/* Step 4 Pill */}
              <div
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                  step === 4
                    ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20"
                    : "text-slate-400"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 4 ? "bg-white text-emerald-600" : "bg-slate-200 text-slate-500"
                }`}>
                  4
                </span>
                <span className="truncate hidden sm:inline">Live Tap</span>
              </div>

            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-900">Activation Error</p>
                <p className="text-rose-700 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 1: VERIFY CARD HARDWARE IDENTIFIER & SECRET KEY             */}
          {/* =============================================================== */}
          {step === 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Step 1 of 3: Hardware Authentication</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Verify Your Physical Review Card
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Enter the printed Card ID from the card reverse and the 8-character activation code from your delivery package.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Card ID / Slug <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={cardId}
                      onChange={(e) => setCardId(e.target.value.toUpperCase())}
                      placeholder="e.g. WD0100 or NF001"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 uppercase transition-all"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Check bottom-right on the card back or scan the unactivated QR code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Activation Security Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={activationCode}
                      onChange={handleCodeChange}
                      placeholder="XXXX-XXXX"
                      maxLength={9}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono tracking-widest placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 uppercase transition-all"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    8-character code printed on packaging sleeve (e.g. <span className="text-blue-600 font-mono font-medium">T97E-658H</span>).
                  </p>
                </div>

                {/* 1-Click Demo Fill */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quick Test: Autofill Demo Card Credentials</span>
                  </button>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isVerifying}
                    className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 text-sm rounded-xl shadow-md shadow-blue-600/25 gap-2 cursor-pointer transition-all"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Cryptographic Key...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Card &amp; Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Anti-tamper hardware verified
                </span>
                <Link href="/manage" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                  Card already active? Manage settings →
                </Link>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 2: BUSINESS REGISTRATION & PROFILE DETAILS (ISOLATED/SECURE)*/}
          {/* =============================================================== */}
          {step === 2 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Step 2 of 3: Business Information</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Register Your Business Profile
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your business information to link this card (<span className="font-mono text-slate-900 font-bold">{verifiedCard?.slug || cardId}</span>) for live telemetry and analytics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto cursor-pointer"
                >
                  Change Card
                </button>
              </div>

              <form onSubmit={handleBusinessNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Business / Brand Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Swasthya Dental Clinic"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Owner / WhatsApp Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Owner Contact Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="e.g. contact@swasthyadental.in"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Branch / Counter Location
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="e.g. Reception Desk 1"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Physical Store Address / City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <textarea
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="e.g. Shop 12, Ground Floor, Phoenix Mall, Viman Nagar, Pune 411014"
                      rows={2}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Industry Chips */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Industry Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setBusinessCategory(cat.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                          businessCategory === cat.id
                            ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setStep(1)}
                    className="bg-white hover:bg-slate-50 text-slate-700 text-xs border-slate-200 shadow-2xs"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/25 gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Destination Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 3: CONFIGURE DESTINATION URL & ROUTING                      */}
          {/* =============================================================== */}
          {step === 3 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Step 3 of 3: Tap Routing</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Where Should Taps Direct Customers?
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose what opens automatically on the customer's phone when they tap your card or scan the QR.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto cursor-pointer"
                >
                  Edit Business
                </button>
              </div>

              <form onSubmit={handleActivate} className="space-y-6">
                {/* Destination Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DESTINATION_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setSelectedType(opt.type);
                          setErrorMsg(null);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 text-blue-950 shadow-sm ring-1 ring-blue-500/30"
                            : "bg-slate-50/70 border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30 hover:text-slate-900"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900 leading-tight">{opt.title}</p>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                              isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-200/80 text-slate-600"
                            }`}>
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Destination Input Field */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <currentOption.icon className="w-4 h-4 text-blue-600" />
                      Configure {currentOption.title}
                    </span>
                  </div>

                  <div className="relative">
                    {currentOption.prefix && (
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                        {currentOption.prefix}
                      </span>
                    )}
                    <input
                      type="text"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      placeholder={currentOption.placeholder}
                      className={`w-full py-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 ${
                        currentOption.prefix ? "pl-12 pr-4" : "px-4"
                      }`}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{currentOption.helper}</p>

                  {selectedType === "whatsapp" && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Prefilled Greeting Message (Optional)
                      </label>
                      <input
                        type="text"
                        value={whatsappMessage}
                        onChange={(e) => setWhatsappMessage(e.target.value)}
                        placeholder="e.g. Hello, I tapped your review card and want to inquire..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600"
                      />
                    </div>
                  )}

                  {/* Live URL Preview */}
                  {computedUrl && (
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Computed Redirect Destination:</span>
                      <span className="font-mono text-blue-600 font-semibold truncate max-w-xs">{computedUrl}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setStep(2)}
                    className="bg-white hover:bg-slate-50 text-slate-700 text-xs border-slate-200 shadow-2xs"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isActivating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-8 text-sm rounded-xl shadow-md shadow-blue-600/25 gap-2 cursor-pointer transition-all"
                  >
                    {isActivating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Activating Card Hardware...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-100" />
                        <span>Activate &amp; Publish Card</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 4: SUCCESS CONFIRMATION & TELEMETRY HUB                     */}
          {/* =============================================================== */}
          {step === 4 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Card Active &amp; Live on NFC Network
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Your NFCFlow Card is Live!
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Physical taps and QR scans are now connected to <strong className="text-slate-900 font-semibold">{businessName}</strong>.
                </p>
              </div>

              {/* QR Code Canvas */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-2xs">
                <CardQrPreview url={redirectUrl} />
                <p className="text-[10px] text-slate-500 mt-2.5 font-mono">
                  Scan with any phone camera or tap NFC chip
                </p>
              </div>

              {/* Permanent Redirect Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Permanent Dynamic Gateway URL</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs">
                  <span className="text-blue-600 font-semibold truncate pr-2">{redirectUrl}</span>
                  <button
                    type="button"
                    onClick={copyRedirectUrl}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                    title="Copy link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400">Business:</span>{" "}
                    <span className="text-slate-900 font-medium">{businessName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Card ID:</span>{" "}
                    <span className="text-slate-900 font-mono font-medium">{activatedCard?.slug || cardId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Counter / Location:</span>{" "}
                    <span className="text-slate-900 font-medium">{branchName || "Main Desk"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Destination:</span>{" "}
                    <span className="text-slate-900 font-medium capitalize">{selectedType.replace("_", " ")}</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-emerald-600/25"
                >
                  <span>Test Tap Redirect in New Tab</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href={`/manage?card=${activatedCard?.slug || cardId}&code=${activationCode}`}
                    className="block"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 rounded-xl shadow-xs"
                    >
                      Owner Portal &amp; Link Settings
                    </Button>
                  </Link>

                  <Button
                    onClick={handleActivateAnother}
                    variant="secondary"
                    size="md"
                    className="w-full justify-center bg-white hover:bg-slate-50 text-slate-700 border-slate-200 text-xs py-3 rounded-xl shadow-2xs"
                  >
                    Activate Another Card
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                Save your Card ID (<span className="text-slate-900 font-mono font-semibold">{activatedCard?.slug || cardId}</span>) and Activation Code (<span className="text-slate-900 font-mono font-semibold">{activationCode}</span>). You can switch destinations dynamically anytime at <Link href="/manage" className="text-blue-600 underline font-semibold">nfcflow.in/manage</Link> without reprinting the card!
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-sans">
          Loading activation portal...
        </div>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}
