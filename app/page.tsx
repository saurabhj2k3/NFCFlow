"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const [footfall, setFootfall] = useState<number>(60);

  // Review Growth Calculator Calculations
  const conversionRate = 0.18;
  const dailyScans = Math.round(footfall * 0.35);
  const monthlyReviews = Math.round(dailyScans * conversionRate * 30);
  const currentReviews = 45;
  const projectedReviews = currentReviews + monthlyReviews * 6;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Navigation */}
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img
            src="/logo-icon.png"
            alt="NFCFlow Logo"
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">NFCFlow</span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">NFC &amp; QR Review Card</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#products" className="hover:text-slate-900 transition-colors">Product Catalog</a>
          <a href="#calculator" className="hover:text-slate-900 transition-colors">Review Calculator</a>
          <Link href="/activate" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activate Card</span>
          </Link>
          <Link href="/manage" className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
            <span>Manage Card</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href="/manage">
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100">
              Manage Card
            </Button>
          </Link>
          <Link href="/activate">
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100">
              <Sparkles className="w-3 h-3 text-blue-600" /> Activate
            </Button>
          </Link>
          <Link href="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-2">
            Admin
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-16 px-6 sm:px-10 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Universal NFC + QR Cards • Online Activation • Zero Reprinting</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          One physical card. One permanent URL. <span className="text-blue-600">Unlimited destinations.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          The physical card is only the entry point. The NFCFlow routing system gives businesses complete dynamic control to switch destinations anytime from Google Reviews to WhatsApp, Menus, or Websites in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/activate">
            <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 gap-2">
              <Sparkles className="w-4 h-4" /> Activate Received Card
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Open Admin Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
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

      {/* Product Catalog Section */}
      <section id="products" className="py-16 px-6 sm:px-10 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Universal Hardware Model
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            One Universal Card. Infinite Use Cases.
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sell pre-generated smart cards online. Customers activate upon receipt in 60 seconds with their unique activation code and can reassign destinations anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "NFCFlow Smart Card",
              subtitle: "Universal Dynamic Card",
              price: "₹149",
              tag: "Most Popular",
              features: [
                "NXP NTAG213 PVC Chip",
                "ISO CR80 (85.6 × 54 mm)",
                "Pre-printed Unique QR",
                "Universal Activation Code",
                "Unlimited Link Changes",
              ],
              cta: "Order Card",
              href: "/activate",
            },
            {
              title: "Google Review Card",
              subtitle: "Pre-positioned for 5-Star Reviews",
              price: "₹149",
              features: [
                "High-contrast Review Design",
                "Tap or Scan Instructions",
                "Direct Google Review Routing",
                "Real-time Open Telemetry",
                "Counter Stand Included",
              ],
              cta: "Order Review Card",
              href: "/activate",
            },
            {
              title: "WhatsApp Smart Card",
              subtitle: "Instant Customer Direct Chat",
              price: "₹149",
              features: [
                "No Contact Saving Needed",
                "Custom Prefilled Greetings",
                "Order & Support Routing",
                "NFC Tap + QR Scanner",
                "Instant Number Updates",
              ],
              cta: "Order WhatsApp Card",
              href: "/activate",
            },
            {
              title: "Digital Menu Card",
              subtitle: "For Cafes & Restaurants",
              price: "₹199",
              features: [
                "Table-mounted Acrylic/Wood",
                "Instant Digital PDF / Menu",
                "Waterproof & Durable",
                "Seasonal Menu Switcher",
                "Per-Table Analytics",
              ],
              cta: "Order Menu Card",
              href: "/activate",
            },
          ].map((prod, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs relative ${
                prod.tag ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200"
              }`}
            >
              {prod.tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-0.5 rounded-full shadow-xs">
                  {prod.tag}
                </span>
              )}
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{prod.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{prod.subtitle}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{prod.price}</span>
                  <span className="text-xs text-slate-400">/ card</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  {prod.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={prod.href} className="block">
                <Button
                  variant={prod.tag ? "primary" : "secondary"}
                  size="md"
                  className="w-full justify-center text-xs"
                >
                  {prod.cta}
                </Button>
              </Link>
            </div>
          ))}
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
          <div className="flex items-center gap-3">
            <img
              src="/logo-icon.png"
              alt="NFCFlow Logo"
              className="h-7 w-7 object-contain"
            />
            <span className="font-bold text-slate-800 text-sm">NFCFlow</span>
            <span className="text-slate-300">|</span>
            <span>Dynamic NFC &amp; QR Review Card Management</span>
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
