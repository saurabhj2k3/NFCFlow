"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Link2,
  BarChart3,
  CreditCard,
  Smartphone,
  Settings,
  Globe,
  Utensils,
  MapPin,
  Instagram,
  MessageCircle,
  UserCheck,
  Check,
  CheckCircle2,
  Star,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  QrCode,
  Radio,
  Menu,
  X,
  Phone,
  Mail,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoogleReviewCardExact } from "@/components/card-preview/GoogleReviewCardExact";

// Destination Types for the Interactive Showcase
const USE_CASES = [
  {
    id: "google_review",
    title: "Google Reviews",
    subtitle: "Get more customer feedback",
    iconBg: "bg-blue-50 text-blue-600",
    color: "#4285F4",
    accent: "border-blue-200 hover:border-blue-400 hover:shadow-blue-500/10",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
    ),
    previewTitle: "Google Review Page",
    previewDesc: "Opens direct 5-star review modal with pre-filled feedback box on the customer's phone instantly.",
  },
  {
    id: "whatsapp",
    title: "WhatsApp Chat",
    subtitle: "Let customers start a chat",
    iconBg: "bg-emerald-50 text-emerald-600",
    color: "#25D366",
    accent: "border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-500/10",
    icon: (
      <svg className="w-6 h-6 fill-current text-emerald-600" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.676.15-.2.3-.776.978-.952 1.178-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.8-1.501-1.788-1.677-2.089-.176-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.15-.176.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.588-.493-.508-.676-.517-.176-.009-.376-.009-.576-.009-.2 0-.526.075-.802.376-.276.3-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.227 3.109.15.2 2.12 3.238 5.136 4.542.717.31 1.278.496 1.715.635.72.229 1.376.196 1.895.119.578-.086 1.78-.727 2.031-1.43.251-.702.251-1.304.176-1.43-.076-.125-.276-.201-.577-.351z" />
        <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.766.459 3.424 1.261 4.869L2 22l5.289-1.229c1.402.748 3.003 1.173 4.715 1.173 5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.273c-1.508 0-2.915-.411-4.126-1.127l-.296-.174-3.08.716.732-2.998-.191-.308c-.792-1.277-1.212-2.766-1.212-4.382 0-4.561 3.712-8.273 8.273-8.273s8.273 3.712 8.273 8.273-3.712 8.273-8.273 8.273z" />
      </svg>
    ),
    previewTitle: "WhatsApp Direct Chat",
    previewDesc: "Opens instant WhatsApp chat with pre-filled greeting message — without customer needing to save your phone number.",
  },
  {
    id: "menu",
    title: "Digital Menu",
    subtitle: "Show your menu instantly",
    iconBg: "bg-amber-50 text-amber-600",
    color: "#F59E0B",
    accent: "border-amber-200 hover:border-amber-400 hover:shadow-amber-500/10",
    icon: <Utensils className="w-6 h-6 text-amber-600" />,
    previewTitle: "Interactive Digital Menu",
    previewDesc: "Displays high-res food/drink menu with photos, allergen tags, and seasonal specials right on the guest's mobile browser.",
  },
  {
    id: "website",
    title: "Website",
    subtitle: "Send visitors to your website",
    iconBg: "bg-sky-50 text-sky-600",
    color: "#0EA5E9",
    accent: "border-sky-200 hover:border-sky-400 hover:shadow-sky-500/10",
    icon: <Globe className="w-6 h-6 text-sky-600" />,
    previewTitle: "Official Business Website",
    previewDesc: "Directs customers to your landing page, appointment booking system, e-commerce store, or special promotional campaign.",
  },
  {
    id: "business_card",
    title: "Business Card",
    subtitle: "Share your contact details",
    iconBg: "bg-purple-50 text-purple-600",
    color: "#8B5CF6",
    accent: "border-purple-200 hover:border-purple-400 hover:shadow-purple-500/10",
    icon: <UserCheck className="w-6 h-6 text-purple-600" />,
    previewTitle: "Digital Contact Card (vCard)",
    previewDesc: "Lets new clients download and save your full contact card, email, WhatsApp, and social links to their phone with 1 tap.",
  },
  {
    id: "directions",
    title: "Directions",
    subtitle: "Guide customers to your location",
    iconBg: "bg-rose-50 text-rose-600",
    color: "#EF4444",
    accent: "border-rose-200 hover:border-rose-400 hover:shadow-rose-500/10",
    icon: <MapPin className="w-6 h-6 text-rose-600" />,
    previewTitle: "Google Maps Turn-by-Turn",
    previewDesc: "Opens turn-by-turn Google Maps GPS navigation straight to your store entrance or valet counter.",
  },
  {
    id: "social_media",
    title: "Social Media",
    subtitle: "Grow your online presence",
    iconBg: "bg-pink-50 text-pink-600",
    color: "#EC4899",
    accent: "border-pink-200 hover:border-pink-400 hover:shadow-pink-500/10",
    icon: (
      <svg className="w-8 h-8 drop-shadow-xs" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-grad-social" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6.5" fill="url(#ig-grad-social)" />
        <rect x="5.5" y="5.5" width="13" height="13" rx="3.8" stroke="white" strokeWidth="1.6" fill="none" />
        <circle cx="12" cy="12" r="3.2" stroke="white" strokeWidth="1.6" fill="none" />
        <circle cx="15.8" cy="8.2" r="0.9" fill="white" />
      </svg>
    ),
    previewTitle: "Instagram / Social Hub",
    previewDesc: "Grows your social followings, tags, and story check-ins by linking directly to your Instagram profile or Linktree hub.",
  },
];

const FAQS = [
  {
    q: "How does the NFCFlow Smart Card work?",
    a: "The NFCFlow card has an embedded NXP NFC chip and a precision-printed QR code. When customers hold any iPhone or Android phone near the card (or scan the QR), it immediately opens your destination link without needing any app.",
  },
  {
    q: "Can I change where the card points after receiving it?",
    a: "Yes! That is the core superpower of NFCFlow. The physical card uses a permanent dynamic URL. You can log into your dashboard anytime and change your destination from Google Reviews to WhatsApp, a Menu, or a Website with zero downtime and without reprinting the card.",
  },
  {
    q: "Do customers need an app to tap or scan?",
    a: "No app required! 99% of modern smartphones have built-in native NFC readers and camera QR scanners that automatically open the link in the phone's default browser.",
  },
  {
    q: "Are there any monthly subscription fees?",
    a: "No! Your NFCFlow physical card purchase includes permanent cloud routing and unlimited destination link updates with zero monthly subscription fees.",
  },
  {
    q: "How long does the physical NFC chip last?",
    a: "Our cards use industrial-grade NXP NTAG213 PVC chips rated for over 100,000 read cycles and 10+ years of physical durability with waterproof lamination.",
  },
  {
    q: "How can I contact customer support or place bulk orders?",
    a: "You can email our team directly at support.nfcflow@gmail.com for enterprise inquiries, bulk card batch printing, or general customer support.",
  },
];

export default function LandingPage() {
  const [activeUseCase, setActiveUseCase] = useState(USE_CASES[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="h-20 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
          <img
            src="/logo-icon.png"
            alt="NFCFlow Logo"
            className="h-9 w-9 object-contain shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              NFC<span className="text-blue-600">Flow</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
              TAP. CONNECT. GROW.
            </span>
          </div>
        </Link>

        {/* Center Pill Menu (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 border border-slate-200/80 p-1 rounded-full text-xs font-medium text-slate-600">
          <Link
            href="/"
            className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-semibold transition-colors"
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#use-cases"
            className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
          >
            Use Cases
          </a>
          <a
            href="#faq"
            className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
          >
            FAQ
          </a>
          <a
            href="#contact"
            className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Right CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/activate">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50/60 font-semibold px-4 py-2 text-xs shadow-2xs"
            >
              Activate Card
            </Button>
          </Link>
          <Link href="/activate">
            <Button
              variant="primary"
              size="sm"
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 text-xs shadow-md shadow-blue-600/20 gap-1.5 transition-all cursor-pointer"
            >
              <span>Get Your Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="sm:hidden flex items-center gap-2">
          <Link href="/activate">
            <Button variant="secondary" size="sm" className="rounded-full text-xs px-3 py-1.5">
              Activate
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 bg-white px-6 py-4 space-y-3 animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-blue-600"
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-700 font-medium"
          >
            How It Works
          </a>
          <a
            href="#use-cases"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-700 font-medium"
          >
            Use Cases
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-700 font-medium"
          >
            FAQ
          </a>
          <Link
            href="/manage"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-indigo-600 font-medium"
          >
            Manage Existing Card
          </Link>
          <a
            href="mailto:support.nfcflow@gmail.com"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-blue-600 font-semibold pt-1"
          >
            <Mail className="w-4 h-4" />
            <span>support.nfcflow@gmail.com</span>
          </a>
          <div className="pt-2">
            <Link href="/activate" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center bg-blue-600 text-white rounded-xl">
                Get Your NFCFlow Card <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Background glow accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              One card.<br />
              Connect customers<br />
              to <span className="text-blue-600">anything.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Let your customers instantly open Google Reviews, WhatsApp, menus, websites and more with a simple tap or scan. Change the destination anytime — without replacing your card.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href="/activate">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 shadow-lg shadow-blue-600/25 gap-2 text-sm transition-all transform hover:-translate-y-0.5"
                >
                  <span>Get Your NFCFlow Card</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/activate">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-xl border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 font-semibold px-5 py-3.5 text-sm shadow-2xs transition-colors"
                >
                  Already have a card? Activate
                </Button>
              </Link>
            </div>

            {/* 3 Core Highlights Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Works with all smartphones</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">NFC + QR support</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Link2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dynamic links</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Change destination anytime</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Track interactions</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">See real customer engagement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual (Exact Realistic Smartphone + Card Mockup) */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0">
            
            {/* Annotation Arrow Banner */}
            <div className="absolute -top-7 right-0 sm:right-4 z-30 flex flex-col items-center">
              <span className="text-xs sm:text-sm font-bold text-blue-700 tracking-tight rotate-[-4deg] bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md border border-blue-200">
                Tap or Scan to Connect ↗
              </span>
            </div>

            {/* Outer Stage Container */}
            <div className="relative w-full max-w-md h-[460px] sm:h-[500px] flex items-center justify-center select-none">
              
              {/* Back: Realistic Smartphone Mockup */}
              <div className="absolute left-2 sm:left-4 top-8 sm:top-10 w-[230px] sm:w-[250px] h-[400px] sm:h-[440px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 rotate-[-8deg] transform hover:rotate-[-6deg] transition-transform duration-300">
                {/* Speaker Notch */}
                <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                  <div className="w-8 h-1 rounded-full bg-slate-800" />
                </div>

                {/* Phone Screen Display */}
                <div className="w-full h-[calc(100%-28px)] bg-white rounded-[28px] p-4 flex flex-col justify-between overflow-hidden shadow-inner text-center">
                  
                  {/* Status bar */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 px-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1 text-[9px]">
                      <Radio className="w-3 h-3 text-slate-600" />
                      <span>5G</span>
                      <div className="w-4 h-2 border border-slate-700 rounded-xs p-0.5 flex items-center">
                        <div className="w-full h-full bg-slate-700 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Google Review Prompt Card inside Phone */}
                  <div className="space-y-3 py-4">
                    {/* Google G Logo */}
                    <div className="w-11 h-11 mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Leave a review</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Share your experience with us on Google
                      </p>
                    </div>

                    {/* 5 Yellow Stars */}
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Phone CTA Button */}
                  <div className="pb-1">
                    <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/30">
                      Write a review
                    </button>
                  </div>
                </div>
              </div>

              {/* Front: Authentic Provided Vector SVG Smart Card */}
              <div className="absolute right-0 sm:right-2 top-4 sm:top-6 rotate-[7deg] transform hover:rotate-[3deg] hover:scale-105 transition-all duration-300 z-20 drop-shadow-2xl">
                <GoogleReviewCardExact
                  cardId="WD0100"
                  qrUrl="https://www.nfcflow.in/r/WD0100"
                  scale={0.88}
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW NFCFLOW WORKS SECTION                                              */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full text-center">
        
        {/* Top Section Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>SIMPLE • FAST • EFFECTIVE</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          How <span className="text-blue-600">NFCFlow</span> works
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mb-14 leading-relaxed">
          Get up and running in 4 easy steps. Zero technical skills or app downloads required.
        </p>

        {/* 4 Connected Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Step 01 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Get your card
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Choose your NFCFlow card design for your business.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Tap or scan
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Customers tap with NFC or scan the QR code.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Link2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Connect
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                They instantly reach your chosen destination.
              </p>
            </div>
          </div>

          {/* Step 04 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                04
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Change anytime
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Update the destination from your dashboard without replacing the card.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. USE CASES: "ONE CARD. MANY POSSIBILITIES."                             */}
      {/* ========================================================================= */}
      <section id="use-cases" className="py-12 sm:py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        
        {/* Large Rounded Container */}
        <div className="bg-gradient-to-b from-blue-50/50 via-sky-50/20 to-slate-50/70 border border-blue-100 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs">
          
          {/* Container Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                One card. <span className="text-blue-600">Many possibilities.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Use NFCFlow for your business needs.
              </p>
            </div>

            <Link href="/activate" className="self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 text-xs font-bold shadow-2xs transition-colors">
                <span>And Many More...</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* 7 Destination Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
            {USE_CASES.map((uc) => {
              const isSelected = activeUseCase.id === uc.id;
              return (
                <button
                  key={uc.id}
                  onClick={() => setActiveUseCase(uc)}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center justify-between space-y-3 transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md transform -translate-y-1"
                      : "border-slate-200/80 hover:border-blue-300 hover:shadow-xs"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${uc.iconBg} flex items-center justify-center shrink-0`}>
                    {uc.icon}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {uc.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 leading-snug">
                      {uc.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Interactive Preview Callout */}
          <div className="mt-8 bg-white border border-blue-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  Currently Previewing: <span className="text-blue-600">{activeUseCase.title}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeUseCase.previewDesc}
                </p>
              </div>
            </div>

            <Link href="/activate" className="shrink-0 w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs gap-1">
                Configure {activeUseCase.title} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FAQ ACCORDION                                                          */}
      {/* ========================================================================= */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Everything you need to know about NFCFlow smart cards and cloud routing.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CONTACT & CTA FOOTER BANNER                                            */}
      {/* ========================================================================= */}
      <section id="contact" className="py-16 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
          {/* Subtle background decorative shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 max-w-lg relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ready to grow your customer reviews?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Activate your NFCFlow smart card today or get in touch with our team at{" "}
              <a href="mailto:support.nfcflow@gmail.com" className="underline font-bold text-white hover:text-blue-200 transition-colors">
                support.nfcflow@gmail.com
              </a>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative z-10">
            <Link href="/activate" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full justify-center bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs py-3.5 px-6 shadow-md">
                Get Started Now <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <a
              href="mailto:support.nfcflow@gmail.com"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="mt-auto border-t border-slate-100 py-10 px-4 sm:px-8 lg:px-12 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo-icon.png"
              alt="NFCFlow Logo"
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-sm">NFCFlow</span>
              <span className="text-[10px] text-slate-400">Universal Dynamic NFC &amp; QR Smart Cards</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 font-medium">
            <Link href="/activate" className="hover:text-blue-600 transition-colors">
              Activate Card
            </Link>
            <Link href="/manage" className="hover:text-blue-600 transition-colors">
              Manage Card
            </Link>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#use-cases" className="hover:text-blue-600 transition-colors">
              Use Cases
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
            <a
              href="mailto:support.nfcflow@gmail.com"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>support.nfcflow@gmail.com</span>
            </a>
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Admin Sign In
            </Link>
          </div>

          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} NFCFlow. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
