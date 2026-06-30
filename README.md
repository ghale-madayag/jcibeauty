# JCI Beauty — Appointment Booking & E-Commerce Platform

A production-grade beauty e-commerce + clinic appointment platform built entirely
with **Next.js (App Router)**. It recreates the look & feel of a premium beauty
brand (luxury minimalist: warm off-white, charcoal, gold accents) with a full
storefront, appointment booking engine, customer dashboard, and admin panel.

## Tech Stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Server Components, Actions) |
| Language       | TypeScript (strict)                                |
| Styling        | Tailwind CSS v4 + custom design tokens             |
| UI components  | shadcn/ui (Radix primitives) + lucide-react        |
| ORM / DB       | Prisma 6 + MySQL                                    |
| Auth           | Auth.js (NextAuth v5) — credentials + roles        |
| Payments       | Stripe Checkout + webhook                          |
| Forms / valid. | React Hook Form + Zod                              |
| Data fetching  | Server Components + TanStack Query (client)        |
| Cart state     | Zustand (persisted)                                |

> **Note on versions:** `create-next-app@latest` scaffolded Next 16 + Tailwind v4,
> so the project runs on those rather than the originally-specified Next 15 / TW v3.
> Prisma and Zod were intentionally pinned to v6 and v3 respectively for stability
> (Prisma 7 requires driver adapters; Zod 4 changed several APIs).

## Architecture

Feature-based, layered architecture:

```
src/
  app/                     # Next.js App Router
    (public)/              # storefront (header + footer layout)
    (auth)/                # login / register
    account/               # customer dashboard (auth-protected)
    admin/                 # admin panel (ADMIN-protected)
    api/                   # auth + stripe webhook route handlers
  features/                # domain modules — each is self-contained
    <domain>/
      *.schema.ts          # Zod validation (the type-safe boundary)
      *.repository.ts      # Prisma data access (where/orderBy builders)
      *.service.ts         # business logic + DTO mapping (Decimal -> number)
      *.actions.ts         # "use server" server actions
  components/
    ui/                    # shadcn/ui primitives
    layout/ shop/ home/ booking/ account/ admin/   # feature UI
  lib/                     # db, auth, stripe, money, slots, guards, utils
  hooks/                   # shared client hooks
prisma/
  schema.prisma            # full data model
  seed.ts                  # seed with real brand assets
public/images/             # brand assets (logos, banners, products, services)
```

**Data flow:** Server Component -> `service` -> `repository` -> Prisma -> MySQL.
Services map Prisma `Decimal` to plain numbers so data is safe to pass to Client
Components. Mutations go through Zod-validated **server actions**.

## Prerequisites

- Node 18+
- A running **MySQL** server. On WAMP, start MySQL (default `localhost:3306`,
  user `root`, empty password). The connection string lives in `.env`.

## Getting Started

```bash
npm install

# 1. Configure environment (already created with WAMP defaults)
#    Edit .env if your DB credentials differ.

# 2. Create tables + seed demo data
npm run db:push
npm run db:seed

# 3. Run
npm run dev          # http://localhost:3000
```

### Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the dev server                         |
| `npm run build`    | Production build                             |
| `npm run start`    | Start the production server                  |
| `npm run typecheck`| `tsc --noEmit`                               |
| `npm run db:push`  | Sync Prisma schema -> MySQL                  |
| `npm run db:seed`  | Seed catalog, services, staff, coupons, CMS  |
| `npm run db:reset` | Reset DB and re-seed                         |
| `npm run db:studio`| Open Prisma Studio                           |

## Demo Accounts

| Role     | Email                     | Password      |
| -------- | ------------------------- | ------------- |
| Admin    | `admin@jcibeauty.com`     | `admin123`    |
| Customer | `customer@jcibeauty.com`  | `customer123` |

Admin panel: **`/admin`** · Customer dashboard: **`/account`**

## Features

**Storefront** — responsive homepage (hero carousel, featured products,
categories, services, philosophy, testimonials, newsletter), shop with category
filters + sorting + pagination, product detail with gallery, cart drawer + page.

**Checkout & Payments** — Zod-validated checkout, coupon validation, Stripe
Checkout redirect + webhook. Without real Stripe keys, checkout falls back to a
simulated success so the flow is testable locally.

**Appointments** — multi-step booking wizard (service -> specialist -> date/time
-> details -> confirm). The availability engine (`src/lib/slots.ts`) intersects
staff weekly schedules with business hours, subtracts existing bookings +
time-off + buffers, and emits open slots. Customers can view, cancel, reschedule.

**Auth** — credentials auth with hashed passwords, JWT sessions, role-based access
enforced in edge middleware (`/admin` -> ADMIN, `/account` -> signed-in).

**Admin** — dashboard with KPIs, full Products CRUD, and management views for
orders, customers, categories, services, staff & schedules, coupons, homepage CMS,
and settings/business hours.

## Stripe (optional)

Set real keys in `.env` to enable live checkout:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Implementation status

Fully implemented and verified via `next build` (41 routes), `tsc --noEmit`, and a
live smoke test (public pages + authenticated admin pages all return 200; protected
routes redirect correctly):

- Storefront, cart, checkout (+ Stripe / dev-fallback), order confirmation
- Auth (credentials + roles), customer dashboard, orders, appointment management
- Appointment booking wizard + availability engine + reschedule/cancel
- Admin: dashboard, and **full create / edit / delete CRUD** for Products,
  Categories, Services, Staff (with weekly schedules + service assignments),
  Coupons, plus Homepage CMS editing, Settings & Business Hours editing,
  appointment status management, and read views for Orders & Customers.

Each admin module follows the same layered pattern:
`*.schema.ts` (Zod) → `*.admin.ts` (service) → `*.actions.ts` (server actions,
admin-guarded) → form component → list/new/edit pages.
