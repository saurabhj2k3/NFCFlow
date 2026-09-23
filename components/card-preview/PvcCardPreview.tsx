"use client";

import React, { useEffect, useState } from "react";
import { Wifi, Star, Smartphone, RotateCcw } from "lucide-react";
import { getCardRedirectUrl } from "@/lib/utils";

interface PvcCardPreviewProps {
  businessName: string;
  slug: string;
  brandColor?: string;
  destinationType?: string;
  subtitle?: string;
  className?: string;
}

export function PvcCardPreview({
  businessName,
  slug,
  brandColor = "#0f2e22",
  destinationType = "google_review",
  subtitle = "Tap phone on card or scan QR code",
  className = "",
}: PvcCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const qrUrl = getCardRedirectUrl(slug, "qr");

  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(qrUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: "#0f172a",
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
  }, [qrUrl]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 3D Perspective Card Container */}
      <div className="relative w-[340px] h-[215px] sm:w-[360px] sm:h-[227px] perspective-1000">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full h-full duration-500 transform-style-3d cursor-pointer transition-transform shadow-pvc rounded-xl ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl p-5 text-white flex flex-col justify-between overflow-hidden backface-hidden border border-slate-700/40 select-none shadow-md"
            style={{
              backgroundColor: brandColor?.startsWith("#") ? brandColor : "#1e293b",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold tracking-wider uppercase text-white/70">
                  Google Review Smart Card
                </p>
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-1">
                  {businessName || "Business Name"}
                </h4>
              </div>

              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                <Wifi className="w-3.5 h-3.5 text-white rotate-90" />
                <span className="text-[9px] font-bold text-white tracking-widest">NFC</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center my-auto">
              <div className="col-span-7 space-y-2">
                <div className="flex items-center gap-1.5 text-white">
                  <Smartphone className="w-3.5 h-3.5 text-slate-200" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Tap Phone Here
                  </span>
                </div>
                <p className="text-[10px] text-white/80 leading-snug">
                  {subtitle}
                </p>

                <div className="flex items-center gap-1 pt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-3 h-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="text-[10px] font-semibold text-white/90 ml-1">
                    Google Review
                  </span>
                </div>
              </div>

              <div className="col-span-5 flex justify-end">
                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-white/20">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR"
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded object-contain"
                    />
                  ) : (
                    <div className="w-18 h-18 sm:w-20 sm:h-20 bg-slate-100 rounded animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between text-[9px] text-white/70 border-t border-white/15 pt-2 font-mono">
              <span>nfcflow.in</span>
              <span>CARD ID: {slug}</span>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl p-5 bg-slate-900 text-slate-200 flex flex-col justify-between overflow-hidden rotate-y-180 backface-hidden border border-slate-700 select-none shadow-md"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                NXP NTAG213 PVC Card
              </span>
              <span className="text-[10px] font-mono text-slate-400">85.6 × 54 mm</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 my-auto">
              <p className="text-[11px] leading-tight">
                <strong>iPhone:</strong> Tap top edge near camera to center of card.
              </p>
              <p className="text-[11px] leading-tight">
                <strong>Android:</strong> Turn NFC on, hold back of phone against card.
              </p>
              <p className="text-[11px] leading-tight">
                <strong>QR Backup:</strong> Open camera app and aim at the QR code.
              </p>
            </div>

            <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>/r/{slug}</span>
              <span className="text-slate-300">Click to flip</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsFlipped(!isFlipped)}
        className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Click card to flip ({isFlipped ? "Back" : "Front"})</span>
      </button>
    </div>
  );
}
