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
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-4 text-white font-sans relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative z-10">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">NFCFlow</span>
        </div>

        {/* Card visual mockup */}
        <div className="relative mx-auto w-48 h-28 bg-linear-to-tr from-slate-800 via-slate-800/80 to-slate-700/60 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">NFC + QR Card</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-left">
            <span className="text-xs font-mono font-bold text-white tracking-wider">ID: {slug}</span>
            <p className="text-[9px] text-amber-400/90 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              Ready for activation
            </p>
          </div>
        </div>

        {/* Status notice */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Card Not Activated Yet
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Ready to configure your destination?
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            This card is ready for use. Activate it with your activation code to link your Google Review page, WhatsApp, or business website in seconds.
          </p>
        </div>

        {/* Card meta pill */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 flex items-center justify-between font-mono">
          <span className="text-slate-400">Card Identifier:</span>
          <span className="font-bold text-blue-400 text-sm">{slug}</span>
        </div>

        {/* Primary CTA */}
        <div className="space-y-3 pt-2">
          <Link href={`/activate?card=${slug}`} className="block">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 py-3 text-sm rounded-xl gap-2"
            >
              <span>Activate Card Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button
              variant="ghost"
              size="md"
              className="w-full justify-center text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
            >
              Learn more about NFCFlow
            </Button>
          </Link>
        </div>

        {/* Security badge */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading card details...
        </div>
      }
    >
      <UnactivatedContent />
    </Suspense>
  );
}
