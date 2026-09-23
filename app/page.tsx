"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Radio,
  QrCode,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Smartphone,
  Star,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PvcCardPreview } from "@/components/card-preview/PvcCardPreview";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"swasthya" | "cafe" | "salon">("swasthya");
  const [footfall, setFootfall] = useState<number>(60);
  const [testTapped, setTestTapped] = useState(false);

  const demoCards = {
    swasthya: {
      name: "Swasthya Medical & General Store",
      slug: "X7k29P",
      brandColor: "#0f3e2b",
      destination: "https://g.page/r/CbXx_swasthya_review/review",
      destLabel: "Google Reviews Page",
      category: "Pharmacy & Healthcare",
    },
    cafe: {
      name: "Artisan Brew Specialty Cafe",
      slug: "CAFE01",
      brandColor: "#2b1c11",
      destination: "https://g.page/r/CdYy_cafe_review/review",
      destLabel: "Google Reviews",
      category: "Restaurant & Cafe",
    },
    salon: {
      name: "Glamour Luxe Hair & Spa",
      slug: "GLAM01",
      brandColor: "#3b1424",
      destination: "https://instagram.com/glamourluxepune",
      destLabel: "Instagram Profile",
      category: "Salon & Wellness",
    },
  };

  const currentDemo = demoCards[activeTab];

  // Review Growth Calculator Calculations
  const conversionRate = 0.18;
  const dailyScans = Math.round(footfall * 0.35);
  const monthlyReviews = Math.round(dailyScans * conversionRate * 30);
  const currentReviews = 45;
  const projectedReviews = currentReviews + monthlyReviews * 6;

  const simulateLiveTap = () => {
    setTestTapped(true);
    setTimeout(() => {
      window.open(`/r/${currentDemo.slug}?source=nfc`, "_blank");
      setTestTapped(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Navigation */}
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
            NF
          </div>
          <span className="font-bold text-base text-slate-900 tracking-tight">
            NFCFlow
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            Platform
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#simulator" className="hover:text-slate-900 transition-colors">Live Card Demo</a>
          <a href="#calculator" className="hover:text-slate-900 transition-colors">Review Calculator</a>
          <a href="#hardware" className="hover:text-slate-900 transition-colors">Hardware Specs</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Admin Login
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 sm:px-10 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700 mb-6">
          <CreditCard className="w-3.5 h-3.5 text-slate-600" />
          <span>Dynamic NFC & QR Google Review Card Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          One physical card. Infinite destinations.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Deploy permanent PVC NFC & QR review cards for your business. Switch destinations in real-time from Google Reviews to WhatsApp, Instagram, or your website without ever reprinting cards.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              Launch Platform Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard/cards/new">
            <Button variant="secondary" size="lg">
              Create New Card
            </Button>
          </Link>
        </div>

        {/* Live Card Simulator Frame */}
        <div id="simulator" className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto text-left shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-700" />
                Interactive PVC Card Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch presets to test permanent URL routing and tap redirects
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab("swasthya")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "swasthya" ? "bg-slate-900 text-white font-semibold shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Medical Store
              </button>
              <button
                onClick={() => setActiveTab("cafe")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "cafe" ? "bg-slate-900 text-white font-semibold shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Coffee Cafe
              </button>
              <button
                onClick={() => setActiveTab("salon")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "salon" ? "bg-slate-900 text-white font-semibold shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Luxe Salon
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Card Mockup */}
            <div className="md:col-span-6 flex flex-col items-center">
              <PvcCardPreview
                businessName={currentDemo.name}
                slug={currentDemo.slug}
                brandColor={currentDemo.brandColor}
              />
            </div>

            {/* Live Routing Specs */}
            <div className="md:col-span-6 space-y-4 text-xs">
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Permanent NFC / QR Slug:</span>
                  <span className="font-mono text-slate-900 font-bold">/r/{currentDemo.slug}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Live Destination:</span>
                  <span className="font-semibold text-slate-900">{currentDemo.destLabel}</span>
                </div>
                <p className="font-mono text-slate-400 text-[11px] truncate pt-0.5">
                  {currentDemo.destination}
                </p>
              </div>

              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sub-300ms HTTP 302 temporary dynamic redirect</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time channel telemetry (NFC taps vs QR scans)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Card never needs to be reprinted when links change</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={simulateLiveTap}
                  variant="primary"
                  size="md"
                  isLoading={testTapped}
                  className="w-full justify-center"
                >
                  <Play className="w-3.5 h-3.5" /> Simulate NFC Tap & Test 302 Redirect
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-slate-50 border-y border-slate-200 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Operational Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              How NFCFlow Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Register Card",
                desc: "Create your card in the dashboard. System assigns a permanent short slug (e.g. /r/X7k29P).",
              },
              {
                step: "02",
                title: "Program & Print",
                desc: "Write the NFCFlow URL to any NTAG213 PVC card using the free NFC Tools mobile app.",
              },
              {
                step: "03",
                title: "Customer Taps",
                desc: "Customers touch their smartphone to the card or scan the QR code on the counter.",
              },
              {
                step: "04",
                title: "Dynamic 302 Redirect",
                desc: "Server captures device telemetry and instantly redirects to your live Google Review page.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs"
              >
                <span className="font-mono text-xs font-bold text-slate-400">
                  STEP {item.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Estimator Calculator */}
      <section id="calculator" className="py-16 px-6 sm:px-10 max-w-5xl mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Review Growth Estimator
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Projected Google Review Growth
            </h2>
            <p className="text-xs text-slate-500">
              Estimate how many authentic 5-star reviews your store can collect with 1 counter card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Daily Billing Customers:</span>
                  <span className="text-slate-900 font-bold tabular-nums">{footfall} customers / day</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={5}
                  value={footfall}
                  onChange={(e) => setFootfall(parseInt(e.target.value, 10))}
                  className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>10 (Clinic)</span>
                  <span>100 (Pharmacy)</span>
                  <span>300 (Cafe)</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">Benchmark conversion rates:</p>
                <p>• ~35% of checkout customers tap/scan ({dailyScans} daily scans)</p>
                <p>• ~18% complete the review ({monthlyReviews} new reviews / month)</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Estimated New Monthly Reviews
                </p>
                <p className="text-4xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  +{monthlyReviews}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  5-star reviews per month
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-left">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <p className="text-[10px] text-slate-500">Current Reviews</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{currentReviews}</p>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <p className="text-[10px] text-slate-500">Projected (6 Months)</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{projectedReviews}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Static vs NFCFlow */}
      <section className="py-12 px-6 sm:px-10 max-w-5xl mx-auto w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Static Printed Cards vs NFCFlow Dynamic Cards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">Traditional Static QR / NFC Card</h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p>• Permanent Google URL burned permanently into NFC / printed QR</p>
              <p>• If review link changes, all cards must be discarded and reprinted</p>
              <p>• Zero scan telemetry or NFC vs QR breakdown</p>
              <p>• Cannot route to WhatsApp or seasonal promotional links</p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-2.5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">NFCFlow Dynamic Platform</h3>
            <div className="space-y-1.5 text-xs text-slate-800">
              <p>• Permanent short URL (<code className="font-mono font-medium">/r/slug</code>) never needs to change</p>
              <p>• Switch destinations instantly in 1 click from the web dashboard</p>
              <p>• Real-time telemetry (NFC taps vs QR scans, Android vs iOS)</p>
              <p>• Works with standard ₹115 NXP NTAG213 PVC cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-6 px-6 sm:px-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-[10px]">
              NF
            </div>
            <span className="font-medium text-slate-800">NFCFlow Platform</span>
            <span>— Dynamic NFC & QR Google Review Management</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/cards" className="hover:text-slate-900 transition-colors">
              Cards
            </Link>
            <Link href="/dashboard/hardware" className="hover:text-slate-900 transition-colors">
              Hardware Specs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
