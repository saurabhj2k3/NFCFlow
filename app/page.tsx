"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
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
      <section className="pt-20 pb-20 px-6 sm:px-10 max-w-6xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
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
