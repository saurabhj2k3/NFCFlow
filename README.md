# NFCFlow — Dynamic NFC & QR Google Review Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.1-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.0-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/NFC-NXP%20NTAG213-blue" alt="NTAG213" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

**NFCFlow** is a modern B2B SaaS platform for businesses to deploy permanent physical PVC NFC review cards and dynamic QR standees. With NFCFlow, the physical card URL (`https://nfcflow.in/r/{slug}`) never changes, while the redirect destination (Google Reviews, WhatsApp Chat, Instagram, or Custom Web Links) can be changed instantly in real time from the dashboard with zero reprint costs.

---

## ✨ Features

- **⚡ Sub-100ms HTTP 302 Dynamic Redirects**: Ultra-fast routing with instant open-redirect protection.
- **📱 Dynamic NFC & High-Density QR Codes**: Program once on standard NXP NTAG213 chips; change destinations infinitely.
- **💳 Realistic ISO CR80 PVC Card Studio**: Interactive 85.6 × 54 mm physical card preview with 3D flip animation.
- **🖨️ Print-Ready Layout & Vector QR Exporter**: Export sharp 1200px PNG and lossless SVG vector QR codes.
- **📊 Real-Time Analytics & Telemetry**: Privacy-preserving scan metrics (NFC vs QR breakdown, device OS breakdown, and 14-day scan velocity).
- **🗄️ Dual-Mode Database Engine**: High-performance Supabase PostgreSQL cloud sync with built-in zero-config local JSON persistence fallback.
- **🔐 Multi-Location & Role Simulator**: Manage multiple branch stores with dedicated Super Admin, Business Owner, and Manager roles.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS (Classic crisp B2B aesthetic, neutral slate design system)
- **Database**: Supabase (PostgreSQL with Row Level Security and indexes)
- **Icons**: Lucide React
- **NFC Hardware Standard**: NXP NTAG213 / ISO/IEC 14443 Type A

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/saurabhj2k3/NFCFlow.git
cd NFCFlow
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the root directory:

```env
# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Credentials (Optional for cloud sync)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the management portal.

---

## 🗄️ Supabase Database Setup

Run the migration script located in [`lib/db/schema.sql`](lib/db/schema.sql) in your Supabase SQL Editor to initialize the tables (`businesses`, `cards`, `redirect_events`, `users`), performance indexes, and RLS policies.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
