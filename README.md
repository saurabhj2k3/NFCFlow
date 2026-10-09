# NFCFlow — Dynamic NFC & QR Google Review Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.0-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/NFC-NXP%20NTAG213-blue" alt="NTAG213" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

**NFCFlow** is a modern B2B SaaS platform for businesses to deploy permanent physical PVC NFC review cards and dynamic QR standees. With NFCFlow, the physical card URL (`https://www.nfcflow.in/r/{slug}`) never changes, while the redirect destination (Google Reviews, WhatsApp Chat, Instagram, or Custom Web Links) can be changed instantly in real time from the dashboard with zero reprint costs.

---

## 📚 Complete Documentation Suite

Comprehensive technical guides are available in the [`docs/`](docs/) directory:

| Section | Guide | Description |
| :--- | :--- | :--- |
| 📑 **Master Index** | **[Documentation Index](docs/README.md)** | Full sitemap and high-level architecture diagram. |
| 🏗️ **Architecture** | **[System Architecture & Data Layer](docs/ARCHITECTURE.md)** | Tech stack, Next.js 15 structure, dual-layer storage, PostgreSQL schemas & ERD. |
| ⚡ **Routing** | **[Redirection Engine & Edge Routing](docs/REDIRECT_ENGINE.md)** | Sub-15ms edge resolution, HTTP 302 caching rules, UA parser, source attribution. |
| 🔐 **Security** | **[Security & Authorization](docs/SECURITY.md)** | Super Admin vs Owner permissions, Dual-Token card auth, SSRF/Open-redirect defenses. |
| 🔌 **API** | **[REST API Reference](docs/API_REFERENCE.md)** | Complete endpoint specifications, request payloads, response contracts & status codes. |
| 🚀 **Performance** | **[Performance & Scalability](docs/PERFORMANCE_AND_SCALABILITY.md)** | Asynchronous non-blocking I/O, 60-day rolling log retention, daily rollup aggregator. |
| 🖨️ **Print Studio** | **[Card Print & Manufacturing](docs/PRINT_AND_MANUFACTURING.md)** | ISO CR80 standards, dual-sided SVG/PNG, 300 DPI Sharp rasterization, commercial bleed. |
| 📱 **Hardware** | **[NFC Hardware & Deployment](docs/NFC_HARDWARE_GUIDE.md)** | NXP NTAG213 chip specs, NFC Tools mobile programming, retail counter placement. |
| 🌐 **Deployment** | **[Deployment & DNS Setup](docs/DEPLOYMENT_AND_DNS.md)** | Vercel production hosting, Apex/WWW DNS configuration, SSL validation, automated crons. |

---

## ✨ Core Features

- **⚡ Sub-15ms HTTP 302 Dynamic Redirects**: Ultra-fast edge routing with open-redirect and SSRF protection.
- **📱 Dynamic NFC & High-Density QR Codes**: Program once on standard NXP NTAG213 chips; change destinations infinitely.
- **💳 Realistic ISO CR80 PVC Card Studio**: Interactive $85.60 \times 53.98\text{ mm}$ physical card preview with 3D flip animation and instant 300 DPI PNG, SVG, and PDF exports.
- **🖨️ Commercial Print & Prepress Engine**: Multi-card A4 sheet imposition with $2\text{ mm}$ bleed, crop marks, and thermal card printer (Fargo, Zebra, Evolis) ready outputs.
- **📊 Real-Time Analytics & Telemetry**: Privacy-preserving scan metrics (NFC vs QR breakdown, iOS vs Android OS breakdown, and 14-day scan velocity).
- **♻️ 60-Day Smart Retention & Daily Rollups**: Automatically aggregates raw individual tap events older than 60 days into lightweight daily summaries (`card_daily_analytics`), preserving all-time scan totals forever while keeping database storage well within free-tier limits.
- **🗄️ Dual-Mode Database Engine**: High-performance Supabase PostgreSQL cloud sync with built-in zero-config local JSON persistence fallback.
- **🔐 Multi-Tenant & Owner Self-Service**: Dedicated Super Admin portal (`/dashboard`) and Business Owner Self-Service portal (`/manage`) with Dual-Token authorization.

---

## 🛠️ Quick Start

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
NEXT_PUBLIC_APP_URL=https://www.nfcflow.in
NEXT_PUBLIC_CARD_BASE_URL=https://www.nfcflow.in

# Supabase Credentials (Optional for cloud sync)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page, [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the management studio, and [http://localhost:3000/manage](http://localhost:3000/manage) for owner self-service.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
