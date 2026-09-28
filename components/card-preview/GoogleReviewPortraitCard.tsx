"use client";

import React, { useEffect, useState, useRef } from "react";
import { Star, Wifi, RotateCcw } from "lucide-react";
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
    <div className={`w-full flex items-center justify-between gap-1.5 overflow-hidden h-2.5 ${className}`}>
      <div className="flex-1 h-2.5 bg-[#EA4335] -skew-x-30 rounded-xs" />
      <div className="flex-1 h-2.5 bg-[#FBBC05] -skew-x-30 rounded-xs" />
      <div className="flex-1 h-2.5 bg-[#4285F4] -skew-x-30 rounded-xs" />
      <div className="flex-1 h-2.5 bg-[#34A853] -skew-x-30 rounded-xs" />
    </div>
  );
}

export function NfcLeftWaves({ className = "w-5 h-8 text-zinc-800" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M16 5a9 9 0 0 0 0 14" />
      <path d="M11 7.5a5.5 5.5 0 0 0 0 9" />
    </svg>
  );
}

export function NfcRightWaves({ className = "w-5 h-8 text-zinc-800" }: { className?: string }) {
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

export function NfcFlowBrandLogo({
  isDark = false,
  brandName = "NFCFlow",
  logoUrl,
  className = "h-4",
}: {
  isDark?: boolean;
  brandName?: string;
  logoUrl?: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <img
          src={logoUrl}
          alt={brandName}
          className="h-4 sm:h-4.5 max-w-[85px] object-contain shrink-0"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <img
        src="/logo.png"
        alt="NFCFlow Logo"
        className="w-4 h-4 object-contain shrink-0 drop-shadow-xs"
      />
      <span
        className={`font-sans font-black text-[11px] tracking-tight ${
          isDark ? "text-white" : "text-slate-950"
        }`}
      >
        {brandName}
      </span>
    </div>
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
  logoUrl?: string;
  useLogoImage?: boolean;
  showActivationCode?: boolean;
  scale?: number;
  interactive?: boolean;
  onPrint?: () => void;
}

export function GoogleReviewPortraitCard({
  slug,
  businessName = "NFCFlow",
  activationCode,
  headerSubtitle,
  headerHeadline,
  theme = "white_revuz_edition",
  brandTag,
  logoUrl,
  useLogoImage = true,
  showActivationCode = false,
  scale = 1,
  interactive = true,
}: GoogleReviewPortraitCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);
  const qrUrl = getCardRedirectUrl(slug, "qr");

  // Determine subtitles based on theme defaults
  const finalSubtitle = headerSubtitle || (theme === "white_revuz_edition" ? "WE'D LOVE" : "HELP OTHERS DISCOVER US");
  const finalHeadline = headerHeadline || (theme === "white_revuz_edition" ? "YOUR FEEDBACK" : "REVIEW NOW!");

  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(qrUrl, {
        width: 360,
        margin: 1,
        color: {
          dark: "#000000",
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

  const isDark = theme === "matte_black" || theme === "midnight_navy" || theme === "emerald_gold";

  // Brand Logo element to display at the bottom (using brand logo instead of plain text)
  const renderBrandFooterLogo = () => {
    const finalName = brandTag || businessName || "NFCFlow";
    return (
      <NfcFlowBrandLogo
        isDark={isDark}
        brandName={finalName}
        logoUrl={logoUrl}
      />
    );
  };

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
              className="absolute inset-0 w-full h-full rounded-[18px] p-4 bg-white text-zinc-900 flex flex-col justify-between items-center text-center overflow-hidden backface-hidden border border-zinc-300 shadow-[0_18px_45px_rgba(0,0,0,0.12)] relative"
              style={{
                aspectRatio: "54 / 85.6",
              }}
            >
              {/* TOP GOOGLE COLOR BAR */}
              <div className="w-full pt-0.5">
                <GoogleDiagonalBar />
              </div>

              {/* TOP RIGHT NFC SYMBOL */}
              <div className="absolute top-4.5 right-4 text-zinc-900 bg-zinc-100 p-1.5 rounded-full border border-zinc-300 shadow-2xs">
                <ContactlessNfcSymbol className="w-3.5 h-3.5 text-zinc-900" />
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
              <div className="w-full space-y-2 pb-0.5 flex flex-col items-center">
                <div className="flex items-center justify-center">
                  {renderBrandFooterLogo()}
                </div>
                <GoogleDiagonalBar />
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* BACK SIDE: We'd Love Your Feedback + 4-Color QR + Tap or Scan */}
            {/* ------------------------------------------------------------- */}
            <div
              className="absolute inset-0 w-full h-full rounded-[18px] p-4 bg-white text-zinc-900 flex flex-col justify-between items-center text-center overflow-hidden rotate-y-180 backface-hidden border border-zinc-300 shadow-[0_18px_45px_rgba(0,0,0,0.12)] relative"
              style={{
                aspectRatio: "54 / 85.6",
              }}
            >
              {/* TOP GOOGLE COLOR BAR */}
              <div className="w-full pt-0.5">
                <GoogleDiagonalBar />
              </div>

              {/* TOP HEADLINE (HIGH CONTRAST) */}
              <div className="pt-2 space-y-0.5 z-10">
                <p className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-zinc-700">
                  {finalSubtitle}
                </p>
                <h3 className="text-sm font-black tracking-wider uppercase leading-tight text-zinc-950">
                  {finalHeadline}
                </h3>
              </div>

              {/* CENTER 4-COLOR FRAMED QR CODE */}
              <div className="flex flex-col items-center justify-center my-auto">
                <div className="relative p-2.5 bg-white rounded-xl shadow-md border border-zinc-200">
                  {/* Top-Left Bracket (Red) */}
                  <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-[3.5px] border-l-[3.5px] border-[#EA4335] rounded-tl-xs" />
                  {/* Top-Right Bracket (Yellow) */}
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-[3.5px] border-r-[3.5px] border-[#FBBC05] rounded-tr-xs" />
                  {/* Bottom-Left Bracket (Green) */}
                  <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-[3.5px] border-l-[3.5px] border-[#34A853] rounded-bl-xs" />
                  {/* Bottom-Right Bracket (Blue) */}
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-[3.5px] border-r-[3.5px] border-[#4285F4] rounded-br-xs" />

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

                {/* TAP OR SCAN Instruction (HIGH CONTRAST) */}
                <p className="text-[10px] font-black tracking-[0.2em] uppercase mt-2.5 text-zinc-950">
                  TAP OR SCAN
                </p>
              </div>

              {/* BOTTOM BRAND & BOTTOM COLOR BAR */}
              <div className="w-full space-y-2 pb-0.5">
                <div className="flex items-center justify-between px-1 text-[9px] font-mono">
                  <div className="flex items-center">
                    {renderBrandFooterLogo()}
                  </div>
                  {showActivationCode && activationCode ? (
                    <span className="font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-300">
                      {activationCode}
                    </span>
                  ) : (
                    <span className="font-bold text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
                      #{slug}
                    </span>
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
            className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Click to flip card ({isFlipped ? "Back: QR Code" : "Front: Google Logo"})</span>
          </button>
        )}
      </div>
    );
  }

  // =========================================================================
  // DESIGN 2: MATTE OBSIDIAN BLACK & OTHER EDITIONS (HIGH CONTRAST ON ALL TEXT)
  // =========================================================================
  const themeStyles = {
    matte_black: {
      cardBg: "bg-[#0d0f12] text-white border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)]",
      subtextColor: "text-zinc-300 font-bold",
      headlineColor: "text-white font-black",
      nfcWaveColor: "text-zinc-300",
      tapScanBg: "text-zinc-100 font-black",
      starColor: "text-amber-400 fill-amber-400",
      serialBg: "text-zinc-300 font-bold bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700",
      backBg: "bg-[#090a0d] text-zinc-300 border-zinc-800",
    },
    frost_white: {
      cardBg: "bg-white text-zinc-950 border-zinc-300 shadow-[0_20px_40px_rgba(0,0,0,0.1)]",
      subtextColor: "text-zinc-700 font-bold",
      headlineColor: "text-zinc-950 font-black",
      nfcWaveColor: "text-zinc-900",
      tapScanBg: "text-zinc-950 font-black",
      starColor: "text-amber-500 fill-amber-500",
      serialBg: "text-zinc-800 font-bold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300",
      backBg: "bg-zinc-50 text-zinc-800 border-zinc-300",
    },
    midnight_navy: {
      cardBg: "bg-[#0a1128] text-white border-blue-950 shadow-[0_20px_50px_rgba(10,17,40,0.8)]",
      subtextColor: "text-blue-200 font-bold",
      headlineColor: "text-white font-black",
      nfcWaveColor: "text-blue-200",
      tapScanBg: "text-blue-100 font-black",
      starColor: "text-amber-400 fill-amber-400",
      serialBg: "text-blue-200 font-bold bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800",
      backBg: "bg-[#060c1d] text-blue-200 border-blue-900",
    },
    emerald_gold: {
      cardBg: "bg-[#062016] text-white border-emerald-950 shadow-[0_20px_50px_rgba(6,32,22,0.8)]",
      subtextColor: "text-emerald-200 font-bold",
      headlineColor: "text-white font-black",
      nfcWaveColor: "text-emerald-200",
      tapScanBg: "text-emerald-100 font-black",
      starColor: "text-amber-400 fill-amber-400",
      serialBg: "text-emerald-200 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800",
      backBg: "bg-[#04150e] text-emerald-200 border-emerald-900",
    },
  }[theme as "matte_black" | "frost_white" | "midnight_navy" | "emerald_gold"] || {
    cardBg: "bg-[#0d0f12] text-white border-zinc-800",
    subtextColor: "text-zinc-300 font-bold",
    headlineColor: "text-white font-black",
    nfcWaveColor: "text-zinc-300",
    tapScanBg: "text-zinc-100 font-black",
    starColor: "text-amber-400 fill-amber-400",
    serialBg: "text-zinc-300 font-bold bg-zinc-800 px-1.5 py-0.5 rounded",
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

            {/* TOP HEADLINE (HIGH CONTRAST) */}
            <div className="pt-2 z-10 space-y-0.5">
              <p className={`text-[9.5px] font-extrabold tracking-[0.18em] uppercase ${themeStyles.subtextColor}`}>
                {finalSubtitle}
              </p>
              <h3 className={`text-sm font-black tracking-wider uppercase leading-tight ${themeStyles.headlineColor}`}>
                {finalHeadline}
              </h3>
            </div>

            {/* CENTER NFC WAVES + QR */}
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

            {/* GOOGLE LOGO & 5 STARS */}
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

            {/* BOTTOM BRAND LOGO (REPLACES PLAIN INVISIBLE TEXT) */}
            <div className="w-full pt-2 border-t border-current/10 flex items-center justify-between z-10 text-[8.5px] font-mono">
              <div className="flex items-center">
                {renderBrandFooterLogo()}
              </div>

              <div className="flex items-center gap-1.5">
                {showActivationCode && activationCode ? (
                  <span className="font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                    KEY: {activationCode}
                  </span>
                ) : (
                  <span className={themeStyles.serialBg}>
                    #{slug}
                  </span>
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
            <div className="border-b border-current/10 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-400">
                  SMART REVIEW CARD
                </span>
                <p className="text-[9px] font-mono opacity-80">CR80 (85.6 × 54 mm)</p>
              </div>
              <div className="flex items-center gap-1 bg-current/10 px-2 py-0.5 rounded text-[9px] font-mono">
                <Wifi className="w-3 h-3 text-emerald-400 rotate-90" />
                <span>NFC</span>
              </div>
            </div>

            <div className="space-y-3 my-auto text-[10px] leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-mono">1</span>
                  Tap Phone (NFC):
                </p>
                <p className="opacity-80 pl-5 text-[9px]">
                  Hold top of iPhone or center of Android phone near the card center.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-mono">2</span>
                  Camera Scan (QR):
                </p>
                <p className="opacity-80 pl-5 text-[9px]">
                  Open phone camera and point directly at the high-contrast QR code.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-mono">3</span>
                  Instant Review:
                </p>
                <p className="opacity-80 pl-5 text-[9px]">
                  Customer directly lands on the 5-star Google Review screen.
                </p>
              </div>
            </div>

            <div className="border-t border-current/10 pt-2 space-y-1 text-[9px] font-mono">
              <div className="flex items-center justify-between">
                <span>Card ID:</span>
                <span className="font-bold">#{slug}</span>
              </div>
              {activationCode && (
                <div className="flex items-center justify-between">
                  <span>Activation Code:</span>
                  <span className="font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    {activationCode}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-[8px] opacity-60 pt-0.5">
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
          className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Click to flip card ({isFlipped ? "Back" : "Front"})</span>
        </button>
      )}
    </div>
  );
}
