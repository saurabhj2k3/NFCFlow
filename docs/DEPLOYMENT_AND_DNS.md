# Deployment, DNS & Infrastructure Setup

This guide details the complete production deployment workflow on **Vercel** with **Supabase PostgreSQL**, apex/subdomain DNS setup, and automated maintenance cron scheduling.

---

## 1. Vercel Production Deployment

### Step 1: Connect Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project** and import your GitHub repository (`saurabhj2k3/NFCFlow`).
3. Framework Preset: Select **Next.js**.

### Step 2: Configure Environment Variables
In Vercel Project Settings $\rightarrow$ **Environment Variables**, add the following:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `https://www.nfcflow.in` | Base URL for dashboard, marketing, and assets. |
| `NEXT_PUBLIC_CARD_BASE_URL` | `https://www.nfcflow.in` | Base URL embedded into physical NFC cards and QR codes. |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project API gateway. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase public anonymous API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | *(Optional)* Supabase backend administrative service key. |
| `CRON_SECRET` | *(Random 32-char string)* | Bearer token to secure the automated 60-day cleanup endpoint. |

---

## 2. Custom Domain & DNS Configuration

To ensure both `https://nfcflow.in` and `https://www.nfcflow.in` work flawlessly with valid SSL/TLS certificates and no browser security warnings:

### Step 1: DNS Records at Domain Registrar (GoDaddy, Namecheap, Hostinger, Cloudflare)

| Record Type | Host / Name | Target / Points To | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (or leave blank) | `76.76.21.21` | Automatic / 3600 | Points apex root domain to Vercel Anycast IP. |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic / 3600 | Aliases www subdomain to Vercel global CDN. |

### Step 2: Vercel Domain Pairing & SSL Certificates
1. In Vercel Project $\rightarrow$ **Settings** $\rightarrow$ **Domains**:
2. Add `www.nfcflow.in` (Primary Domain).
3. Add `nfcflow.in` and select **"Redirect to www.nfcflow.in"** (Recommended).
4. Vercel automatically requests and provisions free Let's Encrypt SSL/TLS certificates for both hostnames via SNI.

---

## 3. Supabase Database Initialization

1. Open your project on the [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor** from the left navigation bar.
3. Paste and run the entire migration script from [`lib/db/schema.sql`](file:///e:/ReviewCard/lib/db/schema.sql).
4. Verify table creation (`businesses`, `cards`, `redirect_events`, `card_daily_analytics`, `card_batches`, `users`).
5. In NFCFlow Dashboard, open `/dashboard/settings` and verify the green **Supabase Connected** badge.

---

## 4. Automated 60-Day Telemetry Cleanup Cron

To run the automated 60-day rolling telemetry aggregation and database cleanup daily, configure `vercel.json` in the root of your project:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-telemetry",
      "schedule": "0 3 * * *"
    }
  ]
}
```

*This triggers the rollup job every day at 03:00 AM UTC, calculating daily summaries and purging raw tap logs older than 60 days.*
