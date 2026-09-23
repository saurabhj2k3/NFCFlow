"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Copy, Check, FileCode, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QrCodeGeneratorProps {
  url: string;
  slug: string;
  businessName?: string;
  size?: number;
  showControls?: boolean;
}

export function QrCodeGenerator({
  url,
  slug,
  businessName,
  size = 220,
  showControls = true,
}: QrCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgString, setSvgString] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const margin = 2;

  useEffect(() => {
    let isMounted = true;

    import("qrcode").then((QRCode) => {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          url,
          {
            width: size,
            margin: margin,
            color: {
              dark: fgColor,
              light: bgColor,
            },
            errorCorrectionLevel: "H",
          },
          (error) => {
            if (error) console.error("QR Canvas Error:", error);
          }
        );
      }

      QRCode.toString(
        url,
        {
          type: "svg",
          margin: margin,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: "H",
        },
        (error, string) => {
          if (error) console.error("QR SVG Error:", error);
          else if (isMounted) setSvgString(string);
        }
      );
    }).catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [url, size, fgColor, bgColor]);

  const downloadPng = async (res: number = 1200) => {
    try {
      const QRCode = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(url, {
        width: res,
        margin: margin,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: "H",
      });
      const link = document.createElement("a");
      link.download = `nfcflow-qr-${slug}-${res}px.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG Download failed:", err);
    }
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `nfcflow-qr-${slug}-vector.svg`;
    link.href = blobUrl;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR Canvas Display */}
      <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col items-center">
        <canvas ref={canvasRef} className="rounded max-w-full" />
        <div className="mt-2 text-center">
          <p className="text-[11px] font-mono text-slate-800 font-semibold">
            /r/{slug}?source=qr
          </p>
          {businessName && (
            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
              {businessName}
            </p>
          )}
        </div>
      </div>

      {showControls && (
        <div className="w-full mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => downloadPng(1200)}
              variant="secondary"
              size="sm"
              className="w-full text-xs justify-center"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Download PNG
            </Button>
            <Button
              onClick={downloadSvg}
              variant="secondary"
              size="sm"
              className="w-full text-xs justify-center"
            >
              <FileCode className="w-3.5 h-3.5" />
              Download SVG
            </Button>
          </div>

          <button
            onClick={copyUrl}
            className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 flex items-center justify-between transition-colors"
          >
            <span className="truncate mr-2 text-slate-600">
              {url}
            </span>
            {copied ? (
              <span className="flex items-center gap-1 text-emerald-700 text-[11px] font-sans font-medium shrink-0">
                <Check className="w-3.5 h-3.5" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-700 text-[11px] font-sans font-medium shrink-0">
                <Copy className="w-3.5 h-3.5" /> Copy
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
