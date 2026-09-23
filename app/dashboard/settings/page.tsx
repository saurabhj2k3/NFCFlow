"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Database,
  ShieldCheck,
  Copy,
  Check,
  FileCode,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  KeyRound,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SupabaseStatusData {
  configured: boolean;
  health: {
    connected: boolean;
    urlConfigured: boolean;
    hasAnonKey: boolean;
    hasServiceKey: boolean;
    tables: {
      businesses: boolean;
      cards: boolean;
      redirect_events: boolean;
      users: boolean;
    };
    counts?: {
      businesses: number;
      cards: number;
      redirect_events: number;
    };
    error?: string;
    latencyMs?: number;
  };
}

export default function SettingsPage() {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [status, setStatus] = useState<SupabaseStatusData | null>(null);

  const fullSchemaSql = `-- NFCFlow PostgreSQL & Supabase Database Schema
-- Paste into Supabase SQL Editor (Dashboard > SQL Editor > New Query > Run)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'business_owner' CHECK (role IN ('super_admin', 'business_owner', 'manager')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  google_review_url TEXT NOT NULL,
  website_url TEXT,
  whatsapp_number TEXT,
  instagram_handle TEXT,
  brand_color TEXT DEFAULT '#4f46e5',
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  destination_type TEXT NOT NULL DEFAULT 'google_review' CHECK (destination_type IN ('google_review', 'whatsapp', 'website', 'instagram', 'custom')),
  destination_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended', 'archived')),
  nfc_programmed BOOLEAN DEFAULT FALSE,
  qr_tested BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Redirect Events Table (Analytics Telemetry)
CREATE TABLE IF NOT EXISTS public.redirect_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('nfc', 'qr', 'direct', 'unknown')),
  device_type TEXT NOT NULL DEFAULT 'other' CHECK (device_type IN ('android', 'iphone', 'desktop', 'tablet', 'other')),
  user_agent TEXT,
  referrer TEXT,
  ip_hash TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cards_slug ON public.cards(slug);
CREATE INDEX IF NOT EXISTS idx_cards_business ON public.cards(business_id);
CREATE INDEX IF NOT EXISTS idx_redirect_events_card_id ON public.redirect_events(card_id);
CREATE INDEX IF NOT EXISTS idx_redirect_events_business_id ON public.redirect_events(business_id);
CREATE INDEX IF NOT EXISTS idx_redirect_events_scanned_at ON public.redirect_events(scanned_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirect_events ENABLE ROW LEVEL SECURITY;

-- Public read for card lookup during redirects
CREATE POLICY "Public can lookup active cards by slug" 
ON public.cards FOR SELECT USING (true);

-- Public can insert redirect events (analytics telemetry)
CREATE POLICY "Public can insert redirect events" 
ON public.redirect_events FOR INSERT WITH CHECK (true);

-- Authenticated / Service full access
CREATE POLICY "Allow authenticated access to businesses" 
ON public.businesses FOR ALL USING (true);

CREATE POLICY "Allow authenticated access to cards" 
ON public.cards FOR ALL USING (true);

CREATE POLICY "Allow authenticated access to redirect_events" 
ON public.redirect_events FOR ALL USING (true);`;

  const envTemplate = `# NFCFlow Supabase Configuration (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000`;

  const checkStatus = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch("/api/supabase/status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to test Supabase status:", err);
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const copySql = () => {
    navigator.clipboard.writeText(fullSchemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyEnv = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          Settings & Supabase Integration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage Supabase PostgreSQL database connection, security keys, and schema migrations.
        </p>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  Supabase PostgreSQL Engine
                </h3>
                {status?.health?.connected ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                  </span>
                ) : status?.configured ? (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Configured (Pending Schema)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[11px] font-semibold flex items-center gap-1">
                    Local Storage Mode (Zero-Config Active)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {status?.health?.connected
                  ? `Connected to remote Supabase database (${status.health.latencyMs}ms response time)`
                  : "Currently operating on high-performance local JSON storage (`data/store.json`). Connect Supabase below for cloud persistence."}
              </p>
            </div>
          </div>

          <Button
            onClick={checkStatus}
            disabled={testingConnection}
            variant="secondary"
            size="sm"
            className="self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
            {testingConnection ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        {/* Environment Variables Detection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Project URL
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">NEXT_PUBLIC_SUPABASE_URL</p>
            </div>
            {status?.health?.urlConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Anon Public Key
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
            </div>
            {status?.health?.hasAnonKey ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Service Role Key
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">SUPABASE_SERVICE_ROLE_KEY</p>
            </div>
            {status?.health?.hasServiceKey ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Tables Health Checklist */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
          <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-700" /> Supabase PostgreSQL Tables Status
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white border border-slate-200 rounded-md p-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-700">businesses</span>
              {status?.health?.tables?.businesses ? (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Ready</span>
              ) : (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Not Found</span>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-md p-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-700">cards</span>
              {status?.health?.tables?.cards ? (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Ready</span>
              ) : (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Not Found</span>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-md p-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-700">redirect_events</span>
              {status?.health?.tables?.redirect_events ? (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Ready</span>
              ) : (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Not Found</span>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-md p-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-700">users</span>
              {status?.health?.tables?.users ? (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Ready</span>
              ) : (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Not Found</span>
              )}
            </div>
          </div>

          {status?.health?.error && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
              {status.health.error}
            </p>
          )}
        </div>
      </div>

      {/* Step-by-Step Setup Guide */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-700" />
          How to Connect Your Supabase Project (3 Easy Steps)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="font-semibold text-slate-900">Create Supabase Project</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Create a free project at{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 font-medium inline-flex items-center gap-0.5 hover:underline"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>
              . Pick your preferred region.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="font-semibold text-slate-900">Execute SQL Migration</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Go to **SQL Editor** in Supabase dashboard, copy the schema below, paste it, and click **Run**.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="font-semibold text-slate-900">Add Keys to .env.local</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Copy **Project URL** and **API Keys** from Project Settings &gt; API into your `.env.local` file.
            </p>
          </div>
        </div>

        {/* Environment File Template */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-800">.env.local Configuration Template</p>
            <Button onClick={copyEnv} variant="ghost" size="sm" className="h-7 text-xs">
              {copiedEnv ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied .env
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy .env
                </>
              )}
            </Button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
            {envTemplate}
          </pre>
        </div>
      </div>

      {/* Supabase SQL Migration Script */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-700" />
              Complete Supabase PostgreSQL Schema (schema.sql)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes all tables (`businesses`, `cards`, `redirect_events`), performance indexes, and RLS policies.
            </p>
          </div>
          <Button onClick={copySql} variant="secondary" size="sm">
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Full SQL
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Full SQL
              </>
            )}
          </Button>
        </div>

        <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
          {fullSchemaSql}
        </pre>
      </div>

      {/* Security Details */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          Production Security & Reliability
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <p className="font-semibold text-slate-900">Dual-Mode Fallback</p>
            <p className="text-slate-600 text-[11px]">
              If Supabase credentials are not configured or network drops, NFCFlow automatically continues on local store with zero downtime.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <p className="font-semibold text-slate-900">Sub-100ms Redirects</p>
            <p className="text-slate-600 text-[11px]">
              Redirect responses execute HTTP 302 immediately and record scan telemetry events asynchronously.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <p className="font-semibold text-slate-900">Row Level Security</p>
            <p className="text-slate-600 text-[11px]">
              PostgreSQL policies permit public card lookup and scan insertion while securing business management endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
