"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";

function InvalidCardContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto text-red-700">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {error === "invalid_destination" ? "Destination Unavailable" : "Card Not Found"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {error === "invalid_destination"
              ? "This card does not have a valid redirect destination configured yet."
              : `The NFC card or QR code you scanned (${slug ? `Code: ${slug}` : "Unknown"}) is invalid or unregistered.`}
          </p>
        </div>

        {slug && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-mono text-xs text-slate-600 flex items-center justify-between">
            <span>Slug:</span>
            <span className="font-semibold text-slate-900">/r/{slug}</span>
          </div>
        )}

        <div className="pt-2">
          <Link href="/" className="block">
            <Button
              variant="secondary"
              size="md"
              className="w-full justify-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to NFCFlow
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InvalidCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading...</div>}>
      <InvalidCardContent />
    </Suspense>
  );
}
