"use client";

import React, { useState } from "react";
import { getCardRedirectUrl } from "@/lib/utils";
import {
  Smartphone,
  Copy,
  Check,
  Radio,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NfcWriterHelperProps {
  slug: string;
  cardName: string;
  destinationUrl: string;
  onCardTested?: () => void;
}

export function NfcWriterHelper({
  slug,
  cardName,
  destinationUrl,
  onCardTested,
}: NfcWriterHelperProps) {
  const [copied, setCopied] = useState(false);
  const [isNfcWriting, setIsNfcWriting] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<string | null>(null);

  const nfcUrl = getCardRedirectUrl(slug, "nfc");

  const copyNfcUrl = () => {
    navigator.clipboard.writeText(nfcUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const writeWebNfc = async () => {
    if (!("NDEFReader" in window)) {
      setNfcStatus("Web NFC is not supported in this browser. Please use the free 'NFC Tools' mobile app.");
      return;
    }

    try {
      setIsNfcWriting(true);
      setNfcStatus("Hold blank NTAG213 PVC card near the back of phone...");
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [{ recordType: "url", data: nfcUrl }],
      });
      setNfcStatus("Success: NFC Card programmed.");
      setIsNfcWriting(false);
      if (onCardTested) onCardTested();
    } catch (err: any) {
      setNfcStatus(`NFC write failed: ${err.message || "Timeout"}`);
      setIsNfcWriting(false);
    }
  };

  const simulateTap = () => {
    if (onCardTested) onCardTested();
    window.open(nfcUrl, "_blank");
  };

  return (
    <div className="space-y-5">
      {/* Permanent NFC URL Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-slate-600" />
            NFC URL to Write
          </label>
          <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
            NTAG213
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={nfcUrl}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-800 select-all focus:outline-none"
          />
          <Button
            onClick={copyNfcUrl}
            variant="primary"
            size="sm"
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Programming Step-by-Step Guide */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          Programming Steps
        </h4>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <p className="font-semibold text-slate-900">Install "NFC Tools" app</p>
              <p className="text-slate-500 text-[11px]">
                Available on iOS App Store & Android Play Store.
              </p>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <p className="font-semibold text-slate-900">Add Record &gt; Custom URL</p>
              <p className="text-slate-500 text-[11px]">
                Paste the copied permanent URL above (e.g. /r/{slug}?source=nfc).
              </p>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-900">Write to Card</p>
              <p className="text-slate-500 text-[11px]">
                Hold physical PVC card against the phone until written.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
        <Button
          onClick={simulateTap}
          variant="secondary"
          size="sm"
        >
          <Play className="w-3.5 h-3.5" />
          Test Tap & Verify Redirect
        </Button>

        <Button
          onClick={writeWebNfc}
          variant="outline"
          size="sm"
          isLoading={isNfcWriting}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Web NFC Write
        </Button>
      </div>

      {nfcStatus && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
          {nfcStatus}
        </div>
      )}
    </div>
  );
}
