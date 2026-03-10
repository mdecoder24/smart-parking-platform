# 📍 ParkSmart — Smart Parking Reservations Platform

> A full-stack, real-time smart parking platform built with **Next.js 16**, **Supabase**, and **Framer Motion**. Find, select, and book individual parking spaces for any vehicle type — with a mock payment flow and downloadable receipts.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-v11-purple)

---

## 🎯 Objectives

| # | Objective |
|---|-----------|
| 1 | Provide a seamless, real-time parking space discovery and reservation experience |
| 2 | Support multiple vehicle types — Cars, Motorcycles, Bicycles, Trucks, and EVs |
| 3 | Enable admins to manage parking lots, monitor occupancy, and view analytics |
| 4 | Allow users to visually select individual parking spaces from an interactive grid |
| 5 | Simulate a full end-to-end booking flow with mock payment and receipt generation |
| 6 | Integrate with Supabase for live database queries, auth, and real-time updates |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser / Client                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Browse  │  │   Book   │  │ Confirmed│  │   Admin    │  │
│  │  /browse │  │  /book   │  │/booking- │  │  /admin/   │  │
│  │ (Find &  │->│ (Payment │->│confirmed │  │ dashboard  │  │
│  │ Select)  │  │  Form)   │  │(Receipt) │  │            │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │ API Routes (Next.js)
┌─────────────────────────────────────────────────────────────┐
│                     Next.js API Layer                        │
│   /api/auth/login   /api/reservations   /api/payments        │
│   /api/user         /api/user                                │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │     Auth     │  │   Realtime       │  │
│  │  Database    │  │  (JWTs)      │  │  Subscriptions   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions
- **Client-side rendering** for interactive pages (browse, book, confirmed) with `'use client'`
- **Supabase anon key** for public queries; service role key for admin-only operations
- **URL params** pass booking state between pages — no session storage needed
- **Mock data layer** in `browse/page.tsx` ensures the UI works even with an empty database
- **Framer Motion** drives all animations (page transitions, stagger grids, slot hover effects)

---

## 📁 Project Structure

```
smart-parking-platform/
│
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing / home page
│   ├── layout.tsx                # Root layout (fonts, theme provider)
│   ├── globals.css               # Global styles + Tailwind v4 config
│   │
│   ├── browse/
│   │   └── page.tsx              # 🔍 Find Parking — vehicle selector + lot grid + interactive slot picker
│   │
│   ├── book/
│   │   └── page.tsx              # 💳 Payment page — duration, plate, card/UPI/wallet mock form
│   │
│   ├── booking-confirmed/
│   │   └── page.tsx              # ✅ Receipt page — booking ID, QR, price breakdown, download/print
│   │
│   ├── bookings/
│   │   └── page.tsx              # 📋 My Bookings (user history)
│   │
│   ├── reserve/[lotId]/
│   │   └── page.tsx              # Reserve page (Supabase-connected flow)
│   │
│   ├── checkout/[reservationId]/
│   │   └── page.tsx              # Checkout (Supabase-connected flow)
│   │
│   ├── admin/
│   │   ├── login/page.tsx        # 🔐 Admin login (admin/admin bypass + Supabase auth)
│   │   └── dashboard/page.tsx    # 📊 Admin dashboard — KPIs, charts, lot management
│   │
│   └── api/
│       ├── auth/login/route.ts   # POST /api/auth/login
│       ├── reservations/         # Reservation CRUD endpoints
│       ├── payments/             # Payment processing endpoints
│       └── user/                 # User profile endpoints
│
├── components/
│   ├── ui/                       # shadcn/ui component library (Button, Card, Input…)
│   ├── animated-button.tsx       # Motion-enhanced button wrapper
│   ├── animated-counter.tsx      # Number count-up animation
│   ├── page-transition.tsx       # Route transition wrapper
│   ├── parking-map.tsx           # Map component
│   ├── scroll-reveal.tsx         # Scroll-triggered reveal
│   └── theme-provider.tsx        # next-themes dark/light provider
│
├── lib/
│   ├── supabase.ts               # Supabase client (anon + server role)
│   ├── db-queries.ts             # All Supabase query functions
│   ├── types.ts                  # TypeScript interfaces (ParkingLot, Reservation…)
│   ├── animations.ts             # Shared Framer Motion variants
│   └── utils.ts                  # Tailwind class merge utility (cn)
│
├── scripts/
│   ├── 01-create-schema.sql      # Database schema — all tables & indexes
│   └── 02-seed-data.sql          # Sample seed data for development
│
├── public/                       # Static assets
├── styles/                       # Additional stylesheets
├── .env.local                    # Environment variables (not committed)
├── next.config.mjs               # Next.js configuration
├── tailwind.config.*             # Tailwind v4 configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
└── README.md
```

---

## ✨ Features

### 🏠 Landing Page
- Hero section with animated tagline and CTA buttons
- Feature highlights: Smart Pricing, Real-time Availability, Flexible Payment
- "How It Works" 4-step guide
- Smooth scroll animations powered by Framer Motion

### 🔍 Find Parking (`/browse`)
- **Vehicle Type Selector** — Car 🚗, Motorcycle 🏍️, Bicycle 🚲, Truck/SUV 🚚, Electric Vehicle ⚡
- Dynamic rate multipliers per vehicle type (Bicycle: 25% of standard, Truck: 150%)
- Live search by city, lot name, or address
- Collapsible filter panel: EV Charging, Accessible, Covered, Open 24/7
- **Animated occupancy progress bar** per lot (green → amber → red)
- Vehicle-type badge grid per lot (which vehicles are accepted)
- **Interactive Parking Slot Grid**:
  - Visual floor-by-floor layout with driving lane separator
  - Color-coded slots: 🟩 Available, 🟥 Occupied, 🟨 Reserved, 🟦 Accessible, 🟩 EV, 🟪 Truck, 🟢 Bike
  - One-click slot selection with animated indigo highlight + checkmark badge
  - Floating bottom booking panel showing space number, vehicle, and rate

### 💳 Book & Pay (`/book`)
- Booking summary card (lot, space, vehicle, rate)
- Duration picker (1h – 24h) with dynamic time display
- Vehicle plate number input (auto-uppercase)
- Three payment methods:
  - 💳 **Card** — Cardholder name, card number (auto-formatted with spaces), MM/YY expiry, CVV
  - 📱 **UPI** — UPI ID input
  - 👛 **Wallet** — Paytm, PhonePe, Google Pay, Amazon Pay
- Real-time order summary sidebar: subtotal, GST (18%), total
- Form validation with animated error messages
- Simulated 2-second payment processing animation

### ✅ Booking Confirmed (`/booking-confirmed`)
- Unique Booking ID (e.g. `#PS8F3K2A`)
- QR code placeholder for gate entry
- Full receipt card:
  - Lot name, address, space number, vehicle type, plate, duration
  - Check-in / check-out times
  - Itemised price breakdown with GST
- **Print Receipt** — browser print dialog with print-optimised styles
- **Download Receipt** — generates and downloads a standalone HTML receipt file
- Helpful next-steps guide panel

### 🔐 Admin Portal (`/admin`)
- Login with `admin` / `admin` (local bypass — no Supabase required)
- Supabase-authenticated login for production use
- **Dashboard** with KPI cards: Total Revenue, Reservations, Total Spaces, Avg Occupancy
- Revenue trend line chart (Recharts)
- Lot occupancy bar chart
- Parking lots management table with live Supabase data

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1 (App Router, Turbopack) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion v11 |
| UI Components | shadcn/ui + Radix UI |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Charts | Recharts |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> **Where to find these:**
> 1. Go to [supabase.com](https://supabase.com) → your project
> 2. **Settings → API** → copy Project URL and anon/public key
> 3. The service role key is on the same page (keep it secret — server-side only)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** (or pnpm / yarn)
- A [Supabase](https://supabase.com) account (free tier works)

---

### 1. Clone the Repository

```bash
git clone https://github.com/mdecoder24/smart-parking-platform.git
cd smart-parking-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example (or create manually)
cp .env.example .env.local
```

Then fill in your Supabase credentials in `.env.local` (see above).

### 4. Set Up the Database

Run the SQL scripts inside your Supabase project's **SQL Editor**:

```bash
# Step 1 — Create all tables, indexes, and views
scripts/01-create-schema.sql

# Step 2 — Seed with sample parking lots and data
scripts/02-seed-data.sql
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server (Turbopack) at `localhost:3000` |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server (after build) |
| `npm run lint` | Run ESLint across the project |

---

## 🗺️ Page Routes

| Route | Description |
|-------|-------------|
| `/` | Landing / home page |
| `/browse` | Find parking — vehicle selector, lot grid, interactive slot picker |
| `/book?lot=&slot=&vehicle=` | Payment / checkout page |
| `/booking-confirmed?...` | Booking receipt & confirmation |
| `/bookings` | User booking history |
| `/reserve/[lotId]` | Supabase-connected reservation flow |
| `/checkout/[reservationId]` | Supabase-connected checkout flow |
| `/admin/login` | Admin login (`admin` / `admin` for demo) |
| `/admin/dashboard` | Admin dashboard — KPIs, charts, lot table |

---

## 🗄️ Database Schema (Supabase)

Key tables defined in `scripts/01-create-schema.sql`:

| Table | Description |
|-------|-------------|
| `parking_lots` | Lot details — location, capacity, rates, features |
| `parking_spaces` | Individual spaces within each lot |
| `space_status` | Real-time status of each space (available/occupied/reserved) |
| `reservations` | Booking records with start/end times and status |
| `payments` | Payment records linked to reservations |
| `users` | User profiles |
| `admins` | Admin role assignments |
| `pricing_rules` | Dynamic pricing rules (time-based, demand-based) |
| `occupancy_summary` | View — aggregated occupancy per lot |
| `revenue_summary` | View — daily revenue per lot |

---

## 🔑 Admin Access

| Credential | Value |
|---|---|
| Username | `admin` |
| Password | `admin` |

> The Admin Portal includes a **local bypass** that skips Supabase auth entirely — great for demos. For production, remove the bypass in `app/admin/login/page.tsx` and use Supabase Auth with proper role checks.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <p>Built with ❤️ using Next.js, Supabase & Framer Motion</p>
  <p><strong>ParkSmart</strong> — Smart Parking Reservations</p>
</div>
