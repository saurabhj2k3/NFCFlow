"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

function UnactivatedContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "NF001";
  const batch = searchParams.get("batch");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900 font-sans relative overflow-hidden">
      {/* Background subtle glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6 relative z-10">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2.5">
          <img
            src="/logo-icon.png"
            alt="NFCFlow Logo"
            className="w-9 h-9 object-contain"
          />
          <span className="text-xl font-black tracking-tight text-slate-900">NFCFlow</span>
        </div>

        {/* Card visual mockup */}
        <div className="relative mx-auto w-48 h-28 bg-linear-to-tr from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col justify-between shadow-md text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">NFC + QR Card</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-left">
            <span className="text-xs font-mono font-bold text-white tracking-wider">ID: {slug}</span>
            <p className="text-[9px] text-amber-400 flex items-center gap-1 mt-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              Ready for activation
            </p>
          </div>
        </div>

        {/* Status notice */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Card Not Activated Yet
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ready to configure your destination?
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            This card is ready for use. Activate it with your activation code to link your Google Review page, WhatsApp, or business website in seconds.
          </p>
        </div>

        {/* Card meta pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between font-mono">
          <span className="text-slate-500">Card Identifier:</span>
          <span className="font-bold text-blue-600 text-sm">{slug}</span>
        </div>

        {/* Primary CTA */}
        <div className="space-y-3 pt-2">
          <Link href={`/activate?card=${slug}`} className="block">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/25 py-3 text-sm rounded-xl gap-2"
            >
              <span>Activate Card Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button
              variant="ghost"
              size="md"
              className="w-full justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs"
            >
              Learn more about NFCFlow
            </Button>
          </Link>
        </div>

        {/* Security badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dynamic routing powered by NFCFlow Routing Layer</span>
        </div>
      </div>
    </div>
  );
}

export default function UnactivatedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
          Loading card details...
        </div>
      }
    >
      <UnactivatedContent />
    </Suspense>
  );
}
