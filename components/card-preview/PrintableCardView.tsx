"use client";

import React, { useEffect, useState } from "react";
import { Wifi, Star, Smartphone, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCardRedirectUrl } from "@/lib/utils";

interface PrintableCardViewProps {
  businessName: string;
  slug: string;
  brandColor?: string;
  destinationType?: string;
}

export function PrintableCardView({
  businessName,
  slug,
  brandColor = "#0f2e22",
}: PrintableCardViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const qrUrl = getCardRedirectUrl(slug, "qr");

  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(qrUrl, {
        width: 400,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H",
      }).then((url) => {
        if (isMounted) setQrDataUrl(url);
      });
    }).catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [qrUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Standard PVC Card Print Layout (85.6 × 54 mm)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Print layout ready for thermal CR80 PVC badge printers or dye-sublimation.
          </p>
        </div>
        <Button onClick={handlePrint} variant="primary" size="sm">
          <Printer className="w-3.5 h-3.5" /> Print Layout
        </Button>
      </div>

      <div id="printable-card-area" className="flex flex-col sm:flex-row items-center gap-6 justify-center p-6 bg-slate-100 border border-slate-200 rounded-xl">
        {/* FRONT */}
        <div
          className="w-[324px] h-[204px] rounded-xl p-4 text-white flex flex-col justify-between shadow-sm relative overflow-hidden border border-slate-700/50 select-none"
          style={{
            backgroundColor: brandColor?.startsWith("#") ? brandColor : "#1e293b",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-white/70">
                Official Review Card
              </p>
              <h4 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-1">
                {businessName}
              </h4>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
              <Wifi className="w-3 h-3 text-white rotate-90" />
              <span className="text-[9px] font-bold text-white">NFC</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center my-auto">
            <div className="col-span-7 space-y-1">
              <div className="flex items-center gap-1 text-white">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Tap Phone Here
                </span>
              </div>
              <p className="text-[9px] text-white/80 leading-tight">
                Scan QR or tap to leave an honest review.
              </p>
              <div className="flex items-center gap-0.5 pt-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[9px] font-bold text-amber-300 ml-1">5.0</span>
              </div>
            </div>

            <div className="col-span-5 flex justify-end">
              <div className="p-1 bg-white rounded shadow-xs">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR"
                    className="w-16 h-16 rounded object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] text-white/70 border-t border-white/15 pt-1 font-mono">
            <span>nfcflow.in</span>
            <span>CARD ID: {slug}</span>
          </div>
        </div>

        {/* BACK */}
        <div className="w-[324px] h-[204px] rounded-xl p-4 bg-slate-900 text-slate-300 flex flex-col justify-between shadow-sm border border-slate-700 select-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="text-[10px] font-bold text-white uppercase">
              Instructions
            </span>
            <span className="text-[8px] font-mono text-slate-400">NTAG213</span>
          </div>

          <div className="space-y-1.5 text-[9px] text-slate-300 my-auto">
            <p><strong>1. Tap:</strong> Place top of iPhone or center of Android on the front.</p>
            <p><strong>2. Scan:</strong> Open Camera and point at the QR code.</p>
            <p><strong>3. Review:</strong> Opens business destination directly.</p>
          </div>

          <div className="flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-800 pt-1 font-mono">
            <span>Dynamic URL: nfcflow.in/r/{slug}</span>
            <span>CR80 Size</span>
          </div>
        </div>
      </div>
    </div>
  );
}
