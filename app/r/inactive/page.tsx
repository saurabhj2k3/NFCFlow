"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";

function InactiveContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const status = searchParams.get("status") || "inactive";
  const business = searchParams.get("business");

  const getStatusDetails = () => {
    switch (status) {
      case "draft":
        return {
          title: "Card Under Preparation",
          badge: "Draft",
          message: "This review card is currently being configured and will be active shortly.",
        };
      case "suspended":
        return {
          title: "Card Temporarily Suspended",
          badge: "Suspended",
          message: "Redirects for this card are temporarily paused by the store administrator.",
        };
      case "archived":
        return {
          title: "Card Retired",
          badge: "Archived",
          message: "This card is no longer in active circulation.",
        };
      default:
        return {
          title: "Card Inactive",
          badge: "Inactive",
          message: "This card is not accepting taps at this moment.",
        };
    }
  };

  const details = getStatusDetails();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-700">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {details.badge}
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            {details.title}
          </h1>
          {business && (
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              {business}
            </p>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {details.message}
        </p>

        {slug && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-mono text-xs text-slate-600 flex items-center justify-between">
            <span>Card Slug:</span>
            <span className="font-semibold text-slate-900">/r/{slug}</span>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            size="md"
            className="w-full justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Check Again
          </Button>
          <Link href="/" className="block">
            <Button
              variant="secondary"
              size="md"
              className="w-full justify-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InactivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading...</div>}>
      <InactiveContent />
    </Suspense>
  );
}
