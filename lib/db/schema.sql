-- NFCFlow PostgreSQL & Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up tables and security policies

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'business_owner' CHECK (role IN ('super_admin', 'business_owner', 'manager')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Businesses Table
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

-- 4. Business Users Junction Table
CREATE TABLE IF NOT EXISTS public.business_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'business_owner' CHECK (role IN ('business_owner', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- 5. Cards Table
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

-- 6. Redirect Events Table (Analytics Telemetry)
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
CREATE INDEX IF NOT EXISTS idx_redirect_events_source ON public.redirect_events(source);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirect_events ENABLE ROW LEVEL SECURITY;

-- Public policies
CREATE POLICY "Public can lookup active cards by slug" 
ON public.cards FOR SELECT USING (true);

CREATE POLICY "Public can insert redirect events" 
ON public.redirect_events FOR INSERT WITH CHECK (true);

-- Permissive policies for full CRUD
CREATE POLICY "Allow public/anon read businesses" 
ON public.businesses FOR SELECT USING (true);

CREATE POLICY "Allow all operations on businesses" 
ON public.businesses FOR ALL USING (true);

CREATE POLICY "Allow all operations on cards" 
ON public.cards FOR ALL USING (true);

CREATE POLICY "Allow all operations on redirect_events" 
ON public.redirect_events FOR ALL USING (true);

CREATE POLICY "Allow all operations on users" 
ON public.users FOR ALL USING (true);

-- Seed Initial Demo Business & Cards
INSERT INTO public.businesses (id, name, slug, phone, email, address, google_review_url, whatsapp_number, website_url, brand_color)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Swasthya Medical & General Store', 'swasthya-medical', '+91 9876543210', 'contact@swasthyamedical.com', 'Shop 4, Phoenix Marketcity, Pune, Maharashtra 411014', 'https://g.page/r/CbXx_demo_review/review', '919876543210', 'https://swasthyamedical.in', '#059669'),
  ('22222222-2222-2222-2222-222222222222', 'Artisan Brew Cafe & Bakery', 'artisan-brew', '+91 9123456780', 'hello@artisanbrew.com', '12 Koregaon Park Road, Pune, Maharashtra 411001', 'https://g.page/r/CdYy_cafe_review/review', '919123456780', 'https://artisanbrew.in', '#d97706')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cards (id, business_id, slug, name, destination_type, destination_url, status, nfc_programmed, qr_tested)
VALUES
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'X7k29P', 'Main Billing Counter 01', 'google_review', 'https://g.page/r/CbXx_demo_review/review', 'active', true, true),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'MED002', 'Pharmacy Dispensing Desk', 'whatsapp', 'https://wa.me/919876543210?text=Hi%20Swasthya%20Medical', 'active', true, true),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'MED003', 'Consultation Desk', 'google_review', 'https://g.page/r/CbXx_demo_review/review', 'draft', false, false),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 'CAFE01', 'Espresso Bar Standee', 'google_review', 'https://g.page/r/CdYy_cafe_review/review', 'active', true, true)
ON CONFLICT (id) DO NOTHING;
