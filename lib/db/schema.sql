-- NFCFlow PostgreSQL & Supabase Database Schema
-- Complete System Specification Schema with Batches, Multi-Branch & Activation

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
  branch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Card Batches Table
CREATE TABLE IF NOT EXISTS public.card_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 100,
  prefix TEXT NOT NULL DEFAULT 'NF',
  product_type TEXT NOT NULL DEFAULT 'NFCFlow CR80 NTAG213',
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'PRINTED', 'IN_STOCK', 'NFC_PROGRAMMED', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Business Users Junction Table
CREATE TABLE IF NOT EXISTS public.business_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'business_owner' CHECK (role IN ('business_owner', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- 6. Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  destination_type TEXT NOT NULL DEFAULT 'google_review' CHECK (destination_type IN ('google_review', 'whatsapp', 'website', 'instagram', 'menu', 'vcard', 'custom')),
  destination_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended', 'archived', 'in_stock', 'sold')),
  inventory_status TEXT NOT NULL DEFAULT 'GENERATED' CHECK (inventory_status IN ('GENERATED', 'PRINTED', 'IN_STOCK', 'SOLD', 'ASSIGNED', 'NFC_PROGRAMMED', 'TESTED', 'ACTIVE', 'SUSPENDED', 'LOST', 'ARCHIVED')),
  activation_code TEXT,
  batch_id UUID REFERENCES public.card_batches(id) ON DELETE SET NULL,
  branch TEXT,
  nfc_programmed BOOLEAN DEFAULT FALSE,
  qr_tested BOOLEAN DEFAULT FALSE,
  notes TEXT,
  activated_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  programmed_at TIMESTAMPTZ,
  tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Destination History Table
CREATE TABLE IF NOT EXISTS public.destination_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  destination_type TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 8. Redirect Events Table (Analytics Telemetry)
CREATE TABLE IF NOT EXISTS public.redirect_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('nfc', 'qr', 'direct', 'unknown')),
  device_type TEXT NOT NULL DEFAULT 'other' CHECK (device_type IN ('android', 'iphone', 'desktop', 'tablet', 'other')),
  user_agent TEXT,
  referrer TEXT,
  ip_hash TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Daily Analytics Rollup Table (Compact long-term storage preserving total counts)
CREATE TABLE IF NOT EXISTS public.card_daily_analytics (
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  total_scans INT NOT NULL DEFAULT 0,
  nfc_count INT NOT NULL DEFAULT 0,
  qr_count INT NOT NULL DEFAULT 0,
  iphone_count INT NOT NULL DEFAULT 0,
  android_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (card_id, date)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cards_slug ON public.cards(slug);
CREATE INDEX IF NOT EXISTS idx_cards_business ON public.cards(business_id);
CREATE INDEX IF NOT EXISTS idx_cards_batch ON public.cards(batch_id);
CREATE INDEX IF NOT EXISTS idx_cards_activation ON public.cards(activation_code);
CREATE INDEX IF NOT EXISTS idx_redirect_events_card_id ON public.redirect_events(card_id);
CREATE INDEX IF NOT EXISTS idx_redirect_events_business_id ON public.redirect_events(business_id);
CREATE INDEX IF NOT EXISTS idx_redirect_events_scanned_at ON public.redirect_events(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_redirect_events_source ON public.redirect_events(source);
CREATE INDEX IF NOT EXISTS idx_card_daily_date ON public.card_daily_analytics(date);
CREATE INDEX IF NOT EXISTS idx_card_daily_business ON public.card_daily_analytics(business_id);

-- 60-Day Telemetry Rollup & Auto-Purge Procedure (Preserves Total Counts Forever)
CREATE OR REPLACE FUNCTION public.rollup_and_purge_old_telemetry(retention_days INT DEFAULT 60)
RETURNS TABLE(purged_raw_logs INT, rolled_up_days INT) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ := NOW() - (retention_days || ' days')::INTERVAL;
  v_purged INT;
  v_rolled_up INT;
BEGIN
  -- Step 1: Aggregate logs older than retention_days into card_daily_analytics
  WITH aggregated AS (
    SELECT 
      card_id,
      business_id,
      scanned_at::date AS scan_date,
      COUNT(*)::INT AS total,
      COUNT(*) FILTER (WHERE source = 'nfc')::INT AS nfc,
      COUNT(*) FILTER (WHERE source = 'qr')::INT AS qr,
      COUNT(*) FILTER (WHERE device_type = 'iphone')::INT AS iphone,
      COUNT(*) FILTER (WHERE device_type = 'android')::INT AS android
    FROM public.redirect_events
    WHERE scanned_at < cutoff_date
    GROUP BY card_id, business_id, scanned_at::date
  ),
  upserted AS (
    INSERT INTO public.card_daily_analytics (card_id, business_id, date, total_scans, nfc_count, qr_count, iphone_count, android_count)
    SELECT card_id, business_id, scan_date, total, nfc, qr, iphone, android FROM aggregated
    ON CONFLICT (card_id, date) DO UPDATE SET
      total_scans = public.card_daily_analytics.total_scans + EXCLUDED.total_scans,
      nfc_count = public.card_daily_analytics.nfc_count + EXCLUDED.nfc_count,
      qr_count = public.card_daily_analytics.qr_count + EXCLUDED.qr_count,
      iphone_count = public.card_daily_analytics.iphone_count + EXCLUDED.iphone_count,
      android_count = public.card_daily_analytics.android_count + EXCLUDED.android_count
    RETURNING 1
  )
  SELECT COUNT(*)::INT INTO v_rolled_up FROM upserted;

  -- Step 2: Purge raw event logs older than retention_days
  WITH deleted AS (
    DELETE FROM public.redirect_events
    WHERE scanned_at < cutoff_date
    RETURNING 1
  )
  SELECT COUNT(*)::INT INTO v_purged FROM deleted;

  RETURN QUERY SELECT v_purged, v_rolled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirect_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_daily_analytics ENABLE ROW LEVEL SECURITY;

-- Public policies
CREATE POLICY "Public can lookup active cards by slug" 
ON public.cards FOR SELECT USING (true);

CREATE POLICY "Public can insert redirect events" 
ON public.redirect_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public/anon read businesses" 
ON public.businesses FOR SELECT USING (true);

CREATE POLICY "Allow all operations on businesses" 
ON public.businesses FOR ALL USING (true);

CREATE POLICY "Allow all operations on cards" 
ON public.cards FOR ALL USING (true);

CREATE POLICY "Allow all operations on batches" 
ON public.card_batches FOR ALL USING (true);

CREATE POLICY "Allow all operations on redirect_events" 
ON public.redirect_events FOR ALL USING (true);

CREATE POLICY "Allow all operations on users" 
ON public.users FOR ALL USING (true);

-- Seed Initial Demo Business & Cards
INSERT INTO public.businesses (id, name, slug, phone, email, address, google_review_url, whatsapp_number, website_url, brand_color, branch)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Swasthya Medical & General Store', 'swasthya-medical', '+91 9876543210', 'contact@swasthyamedical.com', 'Shop 4, Phoenix Marketcity, Pune, Maharashtra 411014', 'https://g.page/r/CbXx_demo_review/review', '919876543210', 'https://swasthyamedical.in', '#059669', 'Main Branch'),
  ('22222222-2222-2222-2222-222222222222', 'Artisan Brew Cafe & Bakery', 'artisan-brew', '+91 9123456780', 'hello@artisanbrew.com', '12 Koregaon Park Road, Pune, Maharashtra 411001', 'https://g.page/r/CdYy_cafe_review/review', '919123456780', 'https://artisanbrew.in', '#d97706', 'Koregaon Park')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.card_batches (id, batch_name, quantity, prefix, product_type, status)
VALUES
  ('bbbbbbbb-1111-1111-1111-111111111111', 'Batch #BATCH001 — Standard NTAG213 PVC', 100, 'NF', 'NFCFlow CR80 NTAG213', 'IN_STOCK'),
  ('bbbbbbbb-2222-2222-2222-222222222222', 'Batch #BATCH002 — Wood Standees', 50, 'WD', 'NFCFlow Eco Wood Standee', 'PRINTED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cards (id, business_id, slug, name, destination_type, destination_url, status, inventory_status, activation_code, batch_id, branch, nfc_programmed, qr_tested)
VALUES
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'NF001', 'Main Billing Counter', 'google_review', 'https://g.page/r/CbXx_demo_review/review', 'active', 'ACTIVE', '9KL2-W4P1', 'bbbbbbbb-1111-1111-1111-111111111111', 'Counter 1', true, true),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'NF002', 'Prescription Dispensing Desk', 'whatsapp', 'https://wa.me/919876543210?text=Hi%20Swasthya%20Medical', 'active', 'ACTIVE', '4RT8-M9V3', 'bbbbbbbb-1111-1111-1111-111111111111', 'Dispensary 2', true, true),
  ('33333333-3333-3333-3333-333333333333', NULL, 'NF003', 'Pre-printed Smart Card', 'google_review', '', 'draft', 'SOLD', '8XK4-P9Q2', 'bbbbbbbb-1111-1111-1111-111111111111', NULL, true, true),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 'CAFE01', 'Espresso Bar Standee', 'google_review', 'https://g.page/r/CdYy_cafe_review/review', 'active', 'ACTIVE', '6PL4-R8Z2', 'bbbbbbbb-2222-2222-2222-222222222222', 'Table 4', true, true)
ON CONFLICT (id) DO NOTHING;
