"use client";

import React, { useEffect, useState } from "react";
import { CardTemplate } from "@/lib/templates/types";

export interface GoogleReviewCardExactProps {
  cardId?: string;
  qrUrl?: string;
  businessName?: string;
  activationCode?: string;
  template?: CardTemplate;
  qrCoordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
    margin?: number;
    errorCorrection?: "L" | "M" | "Q" | "H";
  };
  scale?: number;
  showCutGuides?: boolean;
  showBleed?: boolean;
  className?: string;
}

export function GoogleReviewCardExact({
  cardId = "GR001",
  qrUrl = "https://nfcflow.in/r/GR001",
  template,
  scale = 1,
  showCutGuides = false,
  showBleed = false,
  className = "",
}: GoogleReviewCardExactProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    import("qrcode")
      .then((QRCode) => {
        QRCode.toDataURL(qrUrl, {
          width: 600,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        }).then((url) => {
          if (isMounted) setQrDataUrl(url);
        });
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [qrUrl]);

  // CR80 Card Dimensions: ratio 153 : 243 (~ 1 : 1.588)
  const baseWidth = 280 * scale;
  const baseHeight = baseWidth * (243 / 153);

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width: `${baseWidth}px`,
        height: `${baseHeight}px`,
      }}
    >
      {/* Bleed guide border (if enabled) */}
      {showBleed && (
        <div
          className="absolute -inset-[8px] border-2 border-dashed border-red-400 rounded-[22px] pointer-events-none z-30"
          title="2mm Bleed Area"
        />
      )}

      {/* Main Card Canvas */}
      <div
        className="w-full h-full relative bg-white rounded-[16px] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.14)] border border-slate-200"
        style={{
          boxSizing: "border-box",
        }}
      >
        {/* Cut guide line (if enabled) */}
        {showCutGuides && (
          <div className="absolute inset-0 border border-indigo-400/40 rounded-[16px] pointer-events-none z-20" />
        )}

        {/* Authentic Vector Artwork Background */}
        <img
          src="/templates/google-review-base.svg"
          alt="Google Review Card Template"
          className="w-full h-full object-fill block pointer-events-none"
        />

        {/* Dynamic QR Code Overlay Container (perfectly centered inside the white quadrant, zero overlap with stars, blue bar, or outer circle) */}
        <div
          className="absolute z-10 flex items-center justify-center pointer-events-none"
          style={{
            left: "14.706%",
            top: "40.329%",
            width: "25.490%",
            height: "16.049%",
          }}
        >
          <div className="w-full h-full p-[2%] bg-white rounded-[3px] flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${cardId}`}
                className="w-full h-full object-contain block"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
