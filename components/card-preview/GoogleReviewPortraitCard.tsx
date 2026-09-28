"use client";

import React, { useEffect, useState, useRef } from "react";
import { Star, Wifi, RotateCcw, Smartphone } from "lucide-react";
import { getCardRedirectUrl } from "@/lib/utils";

export function GoogleGLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleLogotype({ className = "text-2xl font-bold tracking-tight" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center font-sans font-semibold tracking-tight ${className}`}>
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </span>
  );
}

export function GoogleDiagonalBar({ className = "w-full" }: { className?: string }) {
  return (
    <div className={`w-full flex items-center justify-between gap-1.5 overflow-hidden h-2 ${className}`}>
      <div className="flex-1 h-2 bg-[#EA4335] -skew-x-30 rounded-xs" />
      <div className="flex-1 h-2 bg-[#FBBC05] -skew-x-30 rounded-xs" />
      <div className="flex-1 h-2 bg-[#4285F4] -skew-x-30 rounded-xs" />
      <div className="flex-1 h-2 bg-[#34A853] -skew-x-30 rounded-xs" />
    </div>
  );
}

export function NfcLeftWaves({ className = "w-5 h-8 text-white/80" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M16 5a9 9 0 0 0 0 14" />
      <path d="M11 7.5a5.5 5.5 0 0 0 0 9" />
    </svg>
  );
}

export function NfcRightWaves({ className = "w-5 h-8 text-white/80" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M8 5a9 9 0 0 1 0 14" />
      <path d="M13 7.5a5.5 5.5 0 0 1 0 9" />
    </svg>
  );
}

export function ContactlessNfcSymbol({ className = "w-4 h-4 text-zinc-800" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M14 6a8 8 0 0 1 0 12" />
      <path d="M10 8.5a4.5 4.5 0 0 1 0 7" />
      <path d="M6 11a1 1 0 0 1 0 2" />
    </svg>
  );
}

export interface GoogleReviewPortraitCardProps {
  slug: string;
  businessName?: string;
  activationCode?: string;
  headerSubtitle?: string;
  headerHeadline?: string;
  theme?: "white_revuz_edition" | "matte_black" | "frost_white" | "midnight_navy" | "emerald_gold";
  brandTag?: string;
  showActivationCode?: boolean;
  scale?: number;
  interactive?: boolean;
  onPrint?: () => void;
}

export function GoogleReviewPortraitCard({
  slug,
  businessName = "NFCFlow",
  activationCode,
  headerSubtitle = "WE'D LOVE",
  headerHeadline = "YOUR FEEDBACK",
  theme = "white_revuz_edition",
  brandTag,
  showActivationCode = false,
  scale = 1,
  interactive = true,
}: GoogleReviewPortraitCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);
  const qrUrl = getCardRedirectUrl(slug, "qr");

  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(qrUrl, {
        width: 360,
        margin: 1,
        color: {
          dark: "#0a0a0a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      }).then((url) => {
        if (isMounted) setQrDataUrl(url);
      });
    }).catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [qrUrl, theme]);

  const displayBrand = brandTag || businessName || "REVUZ";

  // =========================================================================
  // DESIGN 1: WHITE REVUZ DUAL-SIDED WITH 4-COLOR BORDERS (Exact Match to New Photo)
  // =========================================================================
  if (theme === "white_revuz_edition") {
    return (
      <div className="flex flex-col items-center">
        <div
          className="relative perspective-1000 select-none print:shadow-none print:border-none"
          style={{
            width: `${254 * scale}px`,
            height: `${402 * scale}px`,
          }}
        >
          <div
            ref={cardRef}
            onClick={() => interactive && setIsFlipped(!isFlipped)}
            className={`w-full h-full duration-500 transform-style-3d ${
              interactive ? "cursor-pointer" : ""
            } transition-transform rounded-[18px] ${isFlipped ? "rotate-y-180" : ""}`}
          >
            {/* ------------------------------------------------------------- */}
            {/* FRONT SIDE: Large Google G + Google Logo + 5 Stars + NFC */}
            {/* ------------------------------------------------------------- */}
            <div
              className="absolute inset-0 w-full h-full rounded-[18px] p-4 bg-[#f8f9fa] text-zinc-900 flex flex-col justify-between items-center text-center overflow-hidden backface-hidden border border-zinc-200/80 shadow-[0_18px_45px_rgba(0,0,0,0.12)] relative"
              style={{
                aspectRatio: "54 / 85.6",
              }}
            >
              {/* TOP GOOGLE COLOR BAR */}
              <div className="w-full pt-0.5">
                <GoogleDiagonalBar />
              </div>

              {/* TOP RIGHT NFC SYMBOL */}
              <div className="absolute top-4 right-4 text-zinc-700 bg-zinc-100/80 p-1 rounded-full border border-zinc-200/60 shadow-2xs">
                <ContactlessNfcSymbol className="w-3.5 h-3.5" />
              </div>

              {/* CENTER GOOGLE HERO & STARS */}
              <div className="flex flex-col items-center justify-center my-auto space-y-2">
                {/* Google G Logo */}
                <div className="drop-shadow-sm transition-transform hover:scale-105 duration-200">
                  <GoogleGLogo className="w-20 h-20" />
                </div>

                {/* Google Wordmark Logotype */}
                <div className="pt-0.5">
                  <GoogleLogotype className="text-[26px] font-bold" />
                </div>

                {/* 5 Golden Stars */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4.5 h-4.5 text-[#FBBC05] fill-[#FBBC05] drop-shadow-[0_1px_4px_rgba(251,188,5,0.4)]"
                    />
                  ))}
                </div>
              </div>

              {/* BOTTOM BRAND & BOTTOM COLOR BAR */}
              <div className="w-full space-y-2 pb-0.5">
                <div className="flex items-center justify-center gap-1 text-[11px] font-mono tracking-widest text-zinc-800 font-extrabold uppercase">
                  <span>{displayBrand}</span>
                  <span className="text-zinc-600">✦</span>
                </div>
                <GoogleDiagonalBar />
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* BACK SIDE: We'd Love Your Feedback + 4-Color QR + Tap or Scan */}
            {/* ------------------------------------------------------------- */}
            <div
              className="absolute inset-0 w-full h-full rounded-[18px] p-4 bg-[#f8f9fa] text-zinc-900 flex flex-col justify-between items-center text-center overflow-hidden rotate-y-180 backface-hidden border border-zinc-200/80 shadow-[0_18px_45px_rgba(0,0,0,0.12)] relative"
              style={{
                aspectRatio: "54 / 85.6",
              }}
            >
              {/* TOP GOOGLE COLOR BAR */}
              <div className="w-full pt-0.5">
                <GoogleDiagonalBar />
              </div>

              {/* TOP HEADLINE */}
              <div className="pt-2 space-y-0.5 z-10">
                <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-600">
                  {headerSubtitle}
                </p>
                <h3 className="text-sm font-extrabold tracking-wider uppercase leading-tight text-zinc-950">
                  {headerHeadline}
                </h3>
              </div>

              {/* CENTER 4-COLOR FRAMED QR CODE */}
              <div className="flex flex-col items-center justify-center my-auto">
                <div className="relative p-2.5 bg-white rounded-xl shadow-md border border-zinc-200">
                  {/* Top-Left Bracket (Red) */}
                  <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-[3px] border-l-[3px] border-[#EA4335] rounded-tl-sm" />
                  {/* Top-Right Bracket (Yellow) */}
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-[3px] border-r-[3px] border-[#FBBC05] rounded-tr-sm" />
                  {/* Bottom-Left Bracket (Green) */}
                  <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-[3px] border-l-[3px] border-[#34A853] rounded-bl-sm" />
                  {/* Bottom-Right Bracket (Blue) */}
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-[3px] border-r-[3px] border-[#4285F4] rounded-br-sm" />

                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Google Review QR"
                      className="w-[84px] h-[84px] rounded object-contain block"
                    />
                  ) : (
                    <div className="w-[84px] h-[84px] bg-zinc-100 rounded animate-pulse" />
                  )}
                </div>

                {/* TAP OR SCAN Instruction */}
                <p className="text-[9.5px] font-black tracking-[0.2em] uppercase mt-2.5 text-zinc-900">
                  TAP OR SCAN
                </p>
              </div>

              {/* BOTTOM BRAND & BOTTOM COLOR BAR */}
              <div className="w-full space-y-2 pb-0.5">
                <div className="flex items-center justify-between px-1 text-[9px] font-mono text-zinc-500">
                  <span className="font-extrabold tracking-wider uppercase text-zinc-800">
                    {displayBrand} ✦
                  </span>
                  {showActivationCode && activationCode ? (
                    <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded border border-blue-200">
                      {activationCode}
                    </span>
                  ) : (
                    <span>#{slug}</span>
                  )}
                </div>
                <GoogleDiagonalBar />
              </div>
            </div>
          </div>
        </div>

        {interactive && (
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Click to flip card ({isFlipped ? "Back: QR Code" : "Front: Google Logo"})</span>
          </button>
        )}
      </div>
    );
  }

  // =========================================================================
  // DESIGN 2: MATTE OBSIDIAN BLACK & OTHER EDITIONS (From 1st Reference Image)
  // =========================================================================
  const themeStyles = {
    matte_black: {
      cardBg: "bg-[#0d0f12] text-white border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)]",
      subtextColor: "text-zinc-400",
      headlineColor: "text-white",
      nfcWaveColor: "text-zinc-300",
      tapScanBg: "text-zinc-200",
      starColor: "text-amber-400 fill-amber-400",
      footerColor: "text-zinc-500",
      backBg: "bg-[#090a0d] text-zinc-300 border-zinc-800",
    },
    frost_white: {
      cardBg: "bg-white text-zinc-900 border-zinc-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)]",
      subtextColor: "text-zinc-500",
      headlineColor: "text-zinc-900",
      nfcWaveColor: "text-zinc-700",
      tapScanBg: "text-zinc-800",
      starColor: "text-amber-500 fill-amber-500",
      footerColor: "text-zinc-400",
      backBg: "bg-zinc-50 text-zinc-700 border-zinc-200",
    },
    midnight_navy: {
      cardBg: "bg-[#0a1128] text-white border-blue-950 shadow-[0_20px_50px_rgba(10,17,40,0.8)]",
      subtextColor: "text-blue-300/80",
      headlineColor: "text-white",
      nfcWaveColor: "text-blue-200",
      tapScanBg: "text-blue-100",
      starColor: "text-amber-400 fill-amber-400",
      footerColor: "text-blue-400/60",
      backBg: "bg-[#060c1d] text-blue-200 border-blue-900",
    },
    emerald_gold: {
      cardBg: "bg-[#062016] text-white border-emerald-950 shadow-[0_20px_50px_rgba(6,32,22,0.8)]",
      subtextColor: "text-emerald-300/80",
      headlineColor: "text-white",
      nfcWaveColor: "text-emerald-200",
      tapScanBg: "text-emerald-100",
      starColor: "text-amber-400 fill-amber-400",
      footerColor: "text-emerald-400/60",
      backBg: "bg-[#04150e] text-emerald-200 border-emerald-900",
    },
  }[theme as "matte_black" | "frost_white" | "midnight_navy" | "emerald_gold"] || {
    cardBg: "bg-[#0d0f12] text-white border-zinc-800",
    subtextColor: "text-zinc-400",
    headlineColor: "text-white",
    nfcWaveColor: "text-zinc-300",
    tapScanBg: "text-zinc-200",
    starColor: "text-amber-400 fill-amber-400",
    footerColor: "text-zinc-500",
    backBg: "bg-[#090a0d] text-zinc-300 border-zinc-800",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative perspective-1000 select-none print:shadow-none print:border-none"
        style={{
          width: `${254 * scale}px`,
          height: `${402 * scale}px`,
        }}
      >
        <div
          ref={cardRef}
          onClick={() => interactive && setIsFlipped(!isFlipped)}
          className={`w-full h-full duration-500 transform-style-3d ${
            interactive ? "cursor-pointer" : ""
          } transition-transform rounded-[18px] ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* FRONT */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[18px] p-5 flex flex-col justify-between items-center text-center overflow-hidden backface-hidden border ${themeStyles.cardBg} relative`}
            style={{
              aspectRatio: "54 / 85.6",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

            <div className="pt-2 z-10 space-y-0.5">
              <p className={`text-[9.5px] font-bold tracking-[0.18em] uppercase ${themeStyles.subtextColor}`}>
                {headerSubtitle}
              </p>
              <h3 className={`text-sm font-extrabold tracking-wider uppercase leading-tight ${themeStyles.headlineColor}`}>
                {headerHeadline}
              </h3>
            </div>

            <div className="flex flex-col items-center z-10 my-auto">
              <div className="flex items-center justify-center gap-2.5">
                <NfcLeftWaves className={`w-5 h-9 ${themeStyles.nfcWaveColor}`} />
                <div className="p-1.5 bg-white rounded-xl shadow-lg border border-white/20">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Review QR"
                      className="w-[84px] h-[84px] rounded-lg object-contain block"
                    />
                  ) : (
                    <div className="w-[84px] h-[84px] bg-zinc-100 rounded-lg animate-pulse" />
                  )}
                </div>
                <NfcRightWaves className={`w-5 h-9 ${themeStyles.nfcWaveColor}`} />
              </div>

              <p className={`text-[10px] font-black tracking-[0.2em] uppercase mt-2.5 ${themeStyles.tapScanBg}`}>
                TAP OR SCAN
              </p>
            </div>

            <div className="flex flex-col items-center z-10 space-y-2 mb-1">
              <div className="drop-shadow-md transition-transform hover:scale-105 duration-200">
                <GoogleGLogo className="w-14 h-14" />
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${themeStyles.starColor} drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]`}
                  />
                ))}
              </div>
            </div>

            <div className="w-full pt-1.5 border-t border-white/10 flex items-center justify-between z-10 text-[8.5px] font-mono">
              <div className="flex items-center gap-1">
                <span className="font-bold tracking-widest uppercase opacity-80 text-white truncate max-w-[130px]">
                  {displayBrand}
                </span>
                <span className="text-amber-400">✦</span>
              </div>

              <div className="flex items-center gap-1.5 text-zinc-400">
                {showActivationCode && activationCode ? (
                  <span className="font-bold text-amber-300">KEY: {activationCode}</span>
                ) : (
                  <span>#{slug}</span>
                )}
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[18px] p-5 flex flex-col justify-between text-left overflow-hidden rotate-y-180 backface-hidden border ${themeStyles.backBg} shadow-2xl`}
            style={{
              aspectRatio: "54 / 85.6",
            }}
          >
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-400">
                  SMART REVIEW CARD
                </span>
                <p className="text-[9px] font-mono text-zinc-400">CR80 (85.6 × 54 mm)</p>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[9px] font-mono text-zinc-300">
                <Wifi className="w-3 h-3 text-emerald-400 rotate-90" />
                <span>NFC</span>
              </div>
            </div>

            <div className="space-y-3 my-auto text-[10px] leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-mono">1</span>
                  Tap Phone (NFC):
                </p>
                <p className="text-zinc-400 pl-5 text-[9px]">
                  Hold top of iPhone or center of Android phone near the card center.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-mono">2</span>
                  Camera Scan (QR):
                </p>
                <p className="text-zinc-400 pl-5 text-[9px]">
                  Open phone camera and point directly at the high-contrast QR code.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-mono">3</span>
                  Instant Review:
                </p>
                <p className="text-zinc-400 pl-5 text-[9px]">
                  Customer directly lands on the 5-star Google Review screen.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2 space-y-1 text-[9px] font-mono text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Card ID:</span>
                <span className="text-white font-bold">{slug}</span>
              </div>
              {activationCode && (
                <div className="flex items-center justify-between">
                  <span>Activation Code:</span>
                  <span className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                    {activationCode}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-0.5">
                <span>nfcflow.in/r/{slug}</span>
                <span>Click to flip</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {interactive && (
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Click to flip card ({isFlipped ? "Back" : "Front"})</span>
        </button>
      )}
    </div>
  );
}
