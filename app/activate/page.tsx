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
  QrCode,
  Smartphone,
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
  Briefcase,
  ChevronDown,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DestinationType, Business } from "@/types";
import { getCardRedirectUrl } from "@/lib/utils";

const BUSINESS_CATEGORIES = [
  { id: "Healthcare & Clinic", label: "🏥 Healthcare / Clinic", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { id: "Restaurant & Cafe", label: "🍽️ Restaurant / Cafe", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "Retail & Shop", label: "🛍️ Retail / Store", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: "Salon & Spa", label: "💇 Salon & Spa", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { id: "Services & Agency", label: "🏢 Services & Agency", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { id: "Hotel & Hospitality", label: "🏨 Hotel / Hospitality", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { id: "Gym & Fitness", label: "🏋️ Gym & Fitness", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { id: "General Business", label: "📦 Other Business", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
];

const DESTINATION_OPTIONS: Array<{
  type: DestinationType;
  title: string;
  description: string;
  icon: any;
  placeholder: string;
  helper: string;
  prefix?: string;
}> = [
  {
    type: "google_review",
    title: "Google Reviews",
    description: "Send customers directly to your Google 5-star review page",
    icon: Store,
    placeholder: "https://g.page/r/CbXx_demo/review",
    helper: "Paste your Google Maps review link (from Google Business Profile -> Ask for reviews)",
  },
  {
    type: "whatsapp",
    title: "WhatsApp Chat",
    description: "Open an instant WhatsApp chat with prefilled message",
    icon: MessageSquare,
    placeholder: "919876543210",
    prefix: "+91",
    helper: "Enter WhatsApp mobile number with country code (e.g. 91XXXXXXXXXX)",
  },
  {
    type: "website",
    title: "Official Website",
    description: "Direct traffic to your business website or special offers",
    icon: Globe,
    placeholder: "https://yourbusiness.com",
    helper: "Enter full website URL including https://",
  },
  {
    type: "instagram",
    title: "Instagram Profile",
    description: "Grow your Instagram followers and social engagement",
    icon: Instagram,
    placeholder: "yourbusiness",
    prefix: "@",
    helper: "Enter your Instagram handle or profile URL",
  },
  {
    type: "menu",
    title: "Restaurant Menu",
    description: "Display digital QR food & drink menu for diners",
    icon: Utensils,
    placeholder: "https://yourrestaurant.com/menu",
    helper: "Link to your digital menu, PDF, or ordering page",
  },
  {
    type: "vcard",
    title: "Digital Business Card",
    description: "Share contact details, phone, and vCard for easy saving",
    icon: UserCheck,
    placeholder: "https://yourname.bio or vCard URL",
    helper: "Link to your digital contact profile or bio link",
  },
  {
    type: "custom",
    title: "Custom Link",
    description: "Route taps to any custom destination URL",
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

  // 4-Step Wizard:
  // Step 1 = Card Identification & Verification
  // Step 2 = Mandatory Business Registration / Linking
  // Step 3 = Destination URL Routing
  // Step 4 = Live Activation Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Inputs: Step 1
  const [cardId, setCardId] = useState(initialCard.toUpperCase());
  const [activationCode, setActivationCode] = useState("");

  // Form Inputs: Step 2 (Mandatory Business Registration)
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Healthcare & Clinic");
  const [branchName, setBranchName] = useState("Main Location");
  const [isExistingBusinessMode, setIsExistingBusinessMode] = useState(false);
  const [selectedExistingBizId, setSelectedExistingBizId] = useState("");
  const [existingBusinesses, setExistingBusinesses] = useState<Business[]>([]);

  // Form Inputs: Step 3 (Destination Setup)
  const [selectedType, setSelectedType] = useState<DestinationType>("google_review");
  const [destinationInput, setDestinationInput] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("Hi, I want to inquire about your services.");

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
    // Load existing businesses for quick lookup
    fetch("/api/businesses")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setExistingBusinesses(res.data);
        }
      })
      .catch(() => {});
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

  // Step 1: Verify Card Identification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId.trim()) {
      setErrorMsg("Please enter your Card ID (e.g. NF001 or WD0100).");
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
      if (json.card.destination_type) setSelectedType(json.card.destination_type);
      if (json.card.destination_url) setDestinationInput(json.card.destination_url);
      setStep(2); // Move to Mandatory Business Registration
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Proceed to Destination Setup after validating business registration
  const handleBusinessNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isExistingBusinessMode) {
      if (!selectedExistingBizId) {
        setErrorMsg("Please select an existing business from the list.");
        return;
      }
      const found = existingBusinesses.find((b) => b.id === selectedExistingBizId);
      if (found) {
        setBusinessName(found.name);
        setBusinessPhone(found.phone || "");
        setBusinessEmail(found.email || "");
        setBusinessAddress(found.address || "");
        if (found.category) setBusinessCategory(found.category);
        if (found.google_review_url && !destinationInput) {
          setDestinationInput(found.google_review_url);
        }
      }
    } else {
      if (!businessName.trim() || businessName.trim().length < 2) {
        setErrorMsg("Please enter a valid Business Name (at least 2 characters).");
        return;
      }
      if (!businessPhone.trim() || businessPhone.trim().replace(/\D/g, "").length < 7) {
        setErrorMsg("Please enter a valid Business Contact/WhatsApp Phone Number.");
        return;
      }
      if (!businessEmail.trim() || !businessEmail.includes("@") || !businessEmail.includes(".")) {
        setErrorMsg("Please enter a valid Business Email Address for tracking and account recovery.");
        return;
      }
      if (!businessAddress.trim()) {
        setErrorMsg("Please enter your Business Location Address or City.");
        return;
      }
    }

    setStep(3); // Move to Destination Setup
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

  // Step 3: Submit Final Activation & Business Registration
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
          business_id: isExistingBusinessMode ? selectedExistingBizId : undefined,
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
      setStep(4); // Move to Success Screen
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsActivating(false);
    }
  };

  const currentOption = DESTINATION_OPTIONS.find((o) => o.type === selectedType) || DESTINATION_OPTIONS[0];
  const computedUrl = getComputedUrl();
  const redirectUrl = getCardRedirectUrl(activatedCard?.slug || cardId);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img
            src="/logo.png"
            alt="NFCFlow Logo"
            className="h-10 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white leading-none">NFCFlow</span>
            <span className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase mt-0.5">Card Activation &amp; Onboarding</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            Admin Dashboard
          </Link>
          <Link
            href="/login"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 text-xs"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full relative z-10">
        {/* Step Progress Indicator */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: step === 1 ? "0%" : step === 2 ? "33%" : step === 3 ? "66%" : "100%",
              }}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-slate-800 text-slate-400"
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-medium text-slate-300">Verify Card</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 2 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-slate-800 text-slate-400"
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-medium text-slate-300">Register Business</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 3 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-slate-800 text-slate-400"
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-medium text-slate-300">Destination URL</span>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === 4 ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Check className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Live &amp; Tracked</span>
            </div>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="w-full max-w-xl mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 1: CARD IDENTIFICATION & ACTIVATION CODE                        */}
        {/* ==================================================================== */}
        {step === 1 && (
          <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Activate Your NFCFlow Card</h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Enter your unique Card ID and the secret Activation Code from your packaging slip to begin.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Card ID / Slug <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value.toUpperCase())}
                    placeholder="e.g. WD0100 or NF001"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Printed on the back of your NFC card or displayed when scanning the unactivated QR code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Activation Code <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={activationCode}
                    onChange={handleCodeChange}
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono tracking-widest placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  8-character security key (e.g. <span className="text-blue-400 font-mono">T97E-658H</span> or <span className="text-blue-400 font-mono">8XK4-P9Q2</span>)
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isVerifying}
                  className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 text-sm rounded-xl shadow-lg shadow-blue-600/30 gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Card...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Card &amp; Register Business</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Anti-tamper cryptographic activation key
              </span>
              <span>Need help? support@nfcflow.in</span>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: MANDATORY BUSINESS REGISTRATION & PROFILE SETUP              */}
        {/* ==================================================================== */}
        {step === 2 && (
          <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                  CARD VERIFIED: {verifiedCard?.slug || cardId}
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight mt-1.5 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  Register Business Profile
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register your business so we can track card taps, generate analytics, and assign your cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-200 underline self-start sm:self-auto"
              >
                Change Card
              </button>
            </div>

            {/* Toggle: New Registration vs Existing Business */}
            {existingBusinesses.length > 0 && (
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">Already registered a business with NFCFlow?</span>
                <button
                  type="button"
                  onClick={() => setIsExistingBusinessMode(!isExistingBusinessMode)}
                  className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors font-semibold"
                >
                  {isExistingBusinessMode ? "Register New Business" : "Select Existing Business"}
                </button>
              </div>
            )}

            <form onSubmit={handleBusinessNext} className="space-y-4">
              {isExistingBusinessMode ? (
                /* Select Existing Business */
                <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200">
                    Select Your Business Location <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedExistingBizId}
                    onChange={(e) => setSelectedExistingBizId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-blue-500"
                    required
                  >
                    <option value="">-- Choose your registered business --</option>
                    {existingBusinesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.name} {biz.phone ? `(${biz.phone})` : ""} {biz.branch ? `• ${biz.branch}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    This card will be assigned directly to the selected business profile for aggregated reporting.
                  </p>
                </div>
              ) : (
                /* New Business Registration Form */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Business / Store Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Swasthya Medical Store"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Contact / WhatsApp Phone <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="tel"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Business Owner Email <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          placeholder="e.g. owner@swasthyamedical.in"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Branch / Counter Tag
                      </label>
                      <div className="relative">
                        <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          placeholder="e.g. Main Billing Counter"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Physical Address / City <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <textarea
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="e.g. Shop 4, Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014"
                        rows={2}
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Business Category Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Business Industry / Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setBusinessCategory(cat.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            businessCategory === cat.id
                              ? `${cat.color} font-bold shadow-sm`
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(1)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border-slate-700"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 gap-1.5"
                >
                  <span>Continue to Destination Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: CONFIGURE CARD DESTINATION & ROUTING                         */}
        {/* ==================================================================== */}
        {step === 3 && (
          <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                  BUSINESS: {businessName || "Registered Profile"}
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight mt-1.5">
                  Configure Where Your Card Directs
                </h2>
                <p className="text-xs text-slate-400">
                  Select what opens instantly when customers tap your NFC card or scan the QR code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-slate-200 underline self-start sm:self-auto"
              >
                Edit Business
              </button>
            </div>

            <form onSubmit={handleActivate} className="space-y-6">
              {/* Destination Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Select Destination Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
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
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? "bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none">{opt.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Destination Input Field */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <currentOption.icon className="w-3.5 h-3.5 text-blue-400" />
                    Configure {currentOption.title}
                  </span>
                  <span className="text-[11px] text-slate-400">{currentOption.helper}</span>
                </div>

                <div className="relative">
                  {currentOption.prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                      {currentOption.prefix}
                    </span>
                  )}
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    placeholder={currentOption.placeholder}
                    className={`w-full py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 ${
                      currentOption.prefix ? "pl-12 pr-4" : "px-3.5"
                    }`}
                    required
                  />
                </div>

                {selectedType === "whatsapp" && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Prefilled Greeting Message (Optional)
                    </label>
                    <input
                      type="text"
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      placeholder="e.g. Hello, I saw your card and want to inquire..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Live destination preview */}
                {computedUrl && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Target URL:</span>
                    <span className="font-mono text-blue-400 truncate max-w-xs">{computedUrl}</span>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(2)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border-slate-700"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isActivating}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 text-sm rounded-xl shadow-lg shadow-blue-600/30 gap-2"
                >
                  {isActivating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registering &amp; Activating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>Register &amp; Publish Card</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: ACTIVATION COMPLETE & LIVE TRACKING ACTIVE                   */}
        {/* ==================================================================== */}
        {step === 4 && (
          <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Business Registered &amp; Card Live
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
                Your NFCFlow Card is Live!
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Taps and scans are now linked to <strong className="text-slate-200">{businessName}</strong> and ready to track.
              </p>
            </div>

            {/* QR Code Canvas */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl inline-block">
              <CardQrPreview url={redirectUrl} />
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Scan QR or Tap NFC chip</p>
            </div>

            {/* Registered Business & Card Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Permanent NFCFlow URL</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                <span className="text-blue-400 font-semibold">{redirectUrl}</span>
                <button
                  type="button"
                  onClick={copyRedirectUrl}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="Copy link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div>
                  <span className="text-slate-500">Business:</span>{" "}
                  <span className="text-slate-200 font-medium">{businessName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Card ID:</span>{" "}
                  <span className="text-slate-200 font-mono font-medium">{activatedCard?.slug || cardId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>{" "}
                  <span className="text-slate-200 font-medium">{branchName || "Main"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Routing Type:</span>{" "}
                  <span className="text-slate-200 font-medium capitalize">{selectedType.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            {/* Test Actions */}
            <div className="space-y-3">
              <a
                href={redirectUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/30"
              >
                <span>Test Live Tap Redirect</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link href="/dashboard" className="block">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs"
                  >
                    Go to Dashboard
                  </Button>
                </Link>

                <Button
                  onClick={handleActivateAnother}
                  variant="secondary"
                  size="md"
                  className="w-full justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs"
                >
                  Activate Another Card
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              You can modify the destination URL or business profile anytime from the Dashboard without touching the physical card!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
          Loading activation portal...
        </div>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}
