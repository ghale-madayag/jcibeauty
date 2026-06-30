<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# JCI Beauty — Agent Guide

Appointment-booking + e-commerce platform for a premium beauty brand, built only
with Next.js. See `README.md` for the product-level overview; this file is the
working guide for editing the codebase.

## Commands

```bash
npm run dev          # dev server (http://localhost:3000)
npm run build        # production build (also typechecks + validates routes)
npm run typecheck    # tsc --noEmit — run this after edits; it's the fastest gate
npm run lint         # eslint

npm run db:push      # sync prisma/schema.prisma -> MySQL
npm run db:seed      # seed catalog/services/staff/coupons/CMS (prisma/seed.ts)
npm run db:reset     # force-reset DB + reseed
npm run db:studio    # Prisma Studio
```

There is no test runner configured. Verify changes with `npm run typecheck` and,
for anything non-trivial, `npm run build`.

## Environment gotchas (read before debugging "it won't run")

- **Versions are pinned deliberately — do not "upgrade" them blindly:**
  - **Prisma 6** (not 7): v7 removes `url` from `schema.prisma` and forces driver
    adapters. The schema keeps `url = env("DATABASE_URL")`; there is no
    `prisma.config.ts`.
  - **Zod 3** (not 4): v4 moved/changed `.email()`, `.datetime()`, `.flatten()`.
  - **lucide-react 0.468** (not 1.x): v1 dropped brand/social icons (Facebook,
    Instagram, …) used in the footer.
  - Runs on **Next 16 + Tailwind v4** (scaffolded by `create-next-app`), not the
    Next 15 / TW v3 the brief mentioned.
- **MySQL:** the app expects MySQL at `localhost:3306`, db `jcibeauty`, user
  `root`, empty password (WAMP defaults; see `.env`). On this machine the WAMP
  services can't be started without elevation — launch the daemon directly:
  `c:/wamp64/bin/mysql/mysql8.0.31/bin/mysqld.exe --defaults-file=c:/wamp64/bin/mysql/mysql8.0.31/my.ini`
  (MariaDB at `c:/wamp64/bin/mariadb/...` listens on 3307, not 3306).
- **Middleware:** Next 16 deprecates the `middleware` filename (warns to use
  `proxy`) but still runs it. `src/middleware.ts` uses a **default export**
  (a destructured `export const` is NOT detected by the build).
- **Tailwind v4:** all theme tokens live in `src/app/globals.css` via `@theme`
  (no `tailwind.config.js`). See **Theming (Glowify)** below — the `gold` and
  `serif` token names are intentional aliases; do not "fix" them.

## Architecture

Feature-based, layered. Data flows: Server Component → service → repository →
Prisma → MySQL. Mutations go through Zod-validated server actions.

```
src/
  app/
    (public)/    storefront (Header+Footer layout)
    (auth)/      login / register
    account/     customer dashboard — protected by middleware (signed-in)
    admin/       admin panel — protected by middleware (role ADMIN)
    api/         auth + stripe webhook route handlers
  features/<domain>/
    *.schema.ts      Zod schemas (the validation boundary)
    *.repository.ts  Prisma access (where/orderBy builders)
    *.service.ts     read logic + DTO mapping (Decimal -> number)
    *.admin.ts       admin write logic (create/update/remove/getForEdit)
    *.actions.ts     "use server" actions (admin ones call requireSection/requireAdmin)
  components/ui/      shadcn/ui primitives (hand-authored, Radix-based)
  components/{layout,shop,home,booking,account,admin}/   feature UI
  lib/   db, auth, auth.config (edge-safe), stripe, money, slots, guards,
         mailer, email-layout, constants, utils
```

### Conventions that matter

- **Decimal → number:** Prisma returns `Decimal` for money. Always convert with
  `toNumber()` (`src/lib/money.ts`) in the service layer before passing data to
  client components. Display money with `formatMoney()` (currency = PHP).
- **Auth — staff/admin only (no customer accounts):** the storefront is **guest-only**;
  customers shop, check out, and book without an account. `/login` is for panel users
  only and `/register` was removed. `src/lib/auth.config.ts` is the edge-safe config
  (no Prisma/bcrypt) used by `middleware.ts`; `src/lib/auth.ts` adds the Prisma
  adapter + Credentials provider. Roles: `CUSTOMER | STAFF | ADMIN | SHOP_MANAGER`
  (CUSTOMER is vestigial; STAFF = booking specialists, see the Staff model).
  `components/layout/account-menu.tsx` renders for any **panel role** (ADMIN or
  SHOP_MANAGER) and links to the panel + My Account. `/account` route files remain
  but are unlinked + self-guarded. **Sign out** (`logoutAction` in `auth.actions.ts`)
  redirects to **`/login`** (not `/`); it's wired in the storefront account menu and
  the admin panel (sidebar footer + mobile header sign-out controls in
  `app/admin/layout.tsx`).
- **Admin access control (role → capability map):** `src/lib/permissions.ts` is the
  single source of truth — `ADMIN_SECTIONS`, `ROLE_SECTIONS` (ADMIN = all;
  SHOP_MANAGER = dashboard, orders, appointments, products, categories, customers,
  services, coupons — **not** staff/cms/settings/users), `canAccess(role, section)`,
  `canAccessPanel(role)`, plus `ASSIGNABLE_ROLES` + `ROLE_LABELS`. It imports only the
  `Role` *type*, so it's edge-safe and shared by middleware, guards, and the client
  nav. Enforced in **three layers**: middleware (`auth.config.ts` → `canAccessPanel`
  gates `/admin` entry), a `layout.tsx` in **every** `src/app/admin/<section>/` folder
  calling `requireSection("<section>")` (covers list/new/[id]), and each feature's
  `*.actions.ts` calling `requireSection(...)`. Guards in `src/lib/guards.ts`:
  `requireUser`, `requireAdmin` (strict ADMIN), `requireRole(roles[])`,
  `requireSection(section)` (sends a logged-in panel user lacking the section back to
  `/admin`, not `/`). When adding an admin section: add its key to `ADMIN_SECTIONS`,
  grant it in `ROLE_SECTIONS` as needed, add a section `layout.tsx`, and a nav entry
  (with `section`) in `admin-nav.tsx` (links are auto-filtered by `canAccess`).
- **User management & profile:** `features/users/*` is a standard CRUD module
  (admin-only) for panel accounts — create/edit Admin & Shop Manager users, bcrypt
  password hashing, "leave blank to keep" on edit. Safety rails in `user.actions.ts`:
  can't delete your own account, can't delete or demote the **last remaining ADMIN**.
  `features/account/*` + `/admin/account` is the self-service profile page (any panel
  user): edit own name/email + change password (current password verified via
  `bcrypt.compare`); it keys off `auth()` (own `session.user.id`), not `requireAdmin`.
  **JWT sessions** mean a role change or own-email change only takes effect after the
  next sign-in.
- **Email codes — 2FA, verification, password reset:** one engine backs all three,
  `features/auth/otp.service.ts` — `issueLoginOtp` / `issuePasswordResetOtp` (6-digit)
  and `issueEmailVerifyToken` (URL token), plus `verify()`. Secrets are **bcrypt-hashed**
  in the `VerificationCode` model (`purpose` = LOGIN_2FA | EMAIL_VERIFY | PASSWORD_RESET),
  10-min expiry, 5-attempt cap, single-use, one active per (user, purpose). Branded
  emails: `features/auth/auth.email.ts` (built on `email-layout.ts`).
  - **Login is two-step** (no NextAuth weakening): `requestLoginOtpAction(email, password)`
    verifies the password + `emailVerified`, then emails a code; the client then calls
    `signIn("credentials", { email, otp })` and `authorize()` (in `auth.ts`) verifies the
    OTP. Knowledge (password, step 1) + possession (code, step 2) across the two steps.
    Gated by **`AUTH_2FA_ENABLED`** (default true; `false` ⇒ `authorize` takes the
    password path and login is single-step). In dev the code lands in **Mailtrap**.
  - **Email verification gates login.** New panel users start `emailVerified: null`;
    `createUserAction` emails a verify link (`/verify-email?uid=&token=`), and login is
    blocked until verified (clear message + resend). Admin resend on the Users list
    (`resendUserVerificationAction`); public resend (`resendVerificationAction`) is
    enumeration-safe. **If you change the login gate, backfill `emailVerified` for
    existing panel users or they lock out** (seed sets it for the demo admin).
  - **Password reset:** `/forgot-password` (request → reset) via `requestPasswordResetAction`
    (generic response) + `resetPasswordAction`. All of these are rate-limited via
    `rate-limit.ts`; the old `loginAction` was replaced by `requestLoginOtpAction`.
- **Security hardening:** HTTP security headers + a Stripe-aware **CSP** live in
  `next.config.ts` (`headers()`); `frame-ancestors 'none'`, `object-src 'none'`,
  `base-uri 'self'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, prod-only
  HSTS + `upgrade-insecure-requests`, and `poweredByHeader: false`. The CSP keeps
  `'unsafe-inline'` (Next/Tailwind) and dev-only `'unsafe-eval'`/ws for HMR — don't
  tighten without testing carousels/Lenis/Stripe in the browser. **`AUTH_SECRET`
  must be a strong per-env random value** (`node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`)
  — it signs the admin JWTs. The image upload route (`app/api/upload/route.ts`) is
  guarded by `canAccessPanel` and **derives the stored extension from a MIME
  whitelist** (never the uploaded filename) so a spoofed-MIME `.svg`/`.html` can't be
  written. Admin login is throttled by an in-memory sliding window
  (`src/lib/rate-limit.ts`: 5 per (ip,email) + 30 per ip / 15 min) — swap to a shared
  store if it ever runs multi-node. Demo creds render only when `NODE_ENV !== production`.
  Known `npm audit`: `nodemailer`/`next-auth`/`@auth/core` chain carries a High
  CRLF/header-injection advisory with **no upstream fix** — mitigated because all
  email recipients are Zod `.email()`-validated (no CRLF) and subjects/from are static;
  do **NOT** run `npm audit fix --force` (it downgrades Next to v9).
- **Cart & wishlist** are client-only Zustand, persisted to localStorage
  (`features/cart/cart.store.ts` = `jci-cart`, `features/wishlist/wishlist.store.ts`
  = `jci-wishlist`) — guest-friendly, no login. Checkout re-prices authoritatively
  from the DB in `order.service.ts` — never trust client prices.
- **Appointments:** the availability engine is the pure function
  `generateSlots()` in `src/lib/slots.ts` (staff weekly windows ∩ business hours −
  existing bookings − time-off − buffers). Schedule times are stored as **minutes
  from midnight** (Int). Booking rules live in `src/lib/constants.ts`:
  `BOOKING_MIN_ADVANCE_DAYS` (= 2 — earliest bookable date) and
  `BOOKING_SLOT_STEP_MIN` (= 90 — spacing between slot start times). Both are
  enforced server-side (`appointment.service.getAvailableSlots` passes them to
  `generateSlots`; `book`/`createPendingForCheckout` reject earlier times) **and**
  in the UI (`components/booking/booking-wizard.tsx` date strip starts at today+2).
- **Stripe** powers both **product checkout** (`features/orders/checkout.actions.ts`)
  and **appointment booking** (`features/appointments/appointment.checkout.actions.ts`).
  Both create a Checkout Session; the webhook (`app/api/webhooks/stripe/route.ts`)
  branches on `session.metadata.type === "appointment"` vs an order. When no real
  key is set (`src/lib/stripe.ts` treats empty/`*xxx` keys as unconfigured) both
  flows fall back to a simulated successful payment. Stripe `images` must be
  absolute, well-formed URLs — build them with `new URL(image, APP_URL)` (paths
  with spaces aren't valid URLs otherwise).
- **Email (SMTP / nodemailer):** `src/lib/mailer.ts` builds a transport from
  `MAIL_HOST/PORT/USER/PASS/FROM` (Mailtrap in dev). When `MAIL_USER`/`MAIL_PASS`
  are empty it logs + skips instead of sending. Confirmation emails fire when a
  purchase/booking becomes **PAID/CONFIRMED**, centralized in the service layer:
  `order.service.markPaid` (webhook) + `markPaidById` (dev fallback) →
  `features/orders/order.email.ts`; `appointment.service.markPaidBySession` +
  `confirmWithoutPayment` + `book` → `features/appointments/appointment.email.ts`.
  Email senders never throw (they catch internally) so they can't break checkout.
  Both templates are built from the shared, email-safe (table + inline-style)
  layout in `src/lib/email-layout.ts` (pink-branded: logo header, summary bar,
  line items with thumbnails, info cards, pink "care guide" panel, totals, footer).
  Email images must be ABSOLUTE URLs — `absUrl()` builds them from
  `NEXT_PUBLIC_APP_URL`; in dev Mailtrap can't load `localhost` images (they show
  as alt text), and the `.webp` logo won't render in Outlook desktop.
  Env vars load at startup — restart the dev server after editing `.env`. For real
  Stripe payments the webhook only fires with `stripe listen` running.
- **Images:** brand assets are in `public/images/`; many filenames contain spaces,
  so reference them URL-encoded in data/seed (e.g. `/images/product%20assets/x.webp`).
  Admin image upload posts to `app/api/upload/route.ts` (admin-guarded, saves to
  `public/images/uploads/`). `components/admin/image-uploader.tsx` is reused for
  both galleries (`multiple`, default — read with `formData.getAll`) and single
  images (`multiple={false}` — read with `formData.get`, used by services/categories).
  The homepage hero serves per-breakpoint variants: `slide.mobileImage` (<md),
  `slide.tabletImage` (md–lg), `slide.image` (lg+) via the `HeroSlide` CMS type.
  Next's local-image optimizer ignores `?v=` cache-busting (400s); after swapping a
  same-named file, clear the cache and restart. **Dev uses Turbopack, which keeps
  its cache in `.next/dev` (not `.next/cache`) and locks it while running** — to
  fully clear: stop the dev server, delete `.next`, then restart.

### Theming (Glowify)

The storefront uses a "Glowify" beauty look: bright white base, charcoal `#303030`
text, **vivid pink accent `#e61f7f`**, plum secondary `#583fa8`, pale-pink tint
`#faeff2`. Fonts: **Barlow** (headings) + **Prompt** (body), both sans-serif
(`layout.tsx`, next/font).

**Intentional aliases — do NOT rename or "correct" them:**
- The brand **pink is wired through the legacy `--gold` token**, so `variant="gold"`,
  `bg-gold`, `text-gold`, `border-gold`, `fill-gold` (across ~60 files) all render
  pink. This is deliberate (avoids touching every file).
- `--font-serif` points to **Barlow (a sans-serif)**, so existing `font-serif`
  heading classes render Barlow.
- `--plum` token + `variant="plum"` (Button/Badge) is the purple secondary accent.
- Custom utilities in `globals.css`: `.text-shadow-soft` (light text over imagery),
  `.animate-marquee` (the homepage brand strip), `.tracking-luxe`, `.animate-fade-up`.
- Shared section header: `components/layout/page-hero.tsx` (`PageHero`) — pink
  eyebrow + two-line bold heading (2nd line pink) + optional scroll anchor; used by
  About / Contact / Book / Services.
- **Logo:** the brand wordmark is `public/images/JCI Beauty.webp`, referenced
  URL-encoded as `/images/JCI%20Beauty.webp` via `next/image` (`fill` +
  `object-contain`). Used in the storefront header/footer, the **auth layout**
  (`app/(auth)/layout.tsx` — login / OTP / verify-email / forgot-password) and the
  **admin layout** sidebar + mobile header (so it shows on the dashboard and every
  admin form). White variants exist (e.g. `JCI Beauty white logo.webp`) for dark
  backgrounds; `favicon.webp` is the compact icon.

### Motion: smooth scroll + parallax

- **Smooth scroll:** Lenis, mounted via `components/smooth-scroll.tsx` (rendered in
  `components/providers.tsx`). Smooths the mouse **wheel + in-page anchors only**
  (touch stays native so it never fights carousels). Disabled under
  `prefers-reduced-motion`. Baseline Lenis CSS lives in `globals.css`.
- **Scroll parallax:** the hero, home category cards, video poster, and newsletter
  background each wrap their image in an oversized layer (`-top-[25%] h-[150%]`)
  translated on scroll via a passive `requestAnimationFrame` listener. Strength is a
  `PARALLAX_STRENGTH` const per component (hero `0.45`, others `0.4`);
  `category-grid.tsx` adds `PARALLAX_STAGGER` so the three cards drift in sequence.
  All respect reduced-motion.
- **Carousels:** Embla (`embla-carousel-react`). The hero auto-advances; the shop
  category strip (`components/shop/category-strip.tsx`) auto-slides + is swipeable on
  mobile/tablet and a static grid on lg+. Embla **loop spacing uses per-slide padding
  (`pl-*` + container `-ml-*`), NOT `gap`** — `gap` breaks at the loop boundary.

### Storefront notes (shop, nav, home, checkout, admin lists)

- **Nav:** `MAIN_NAV` (`src/lib/constants.ts`) starts with **Home** (`/`). The header
  active-underline matches `/` exactly and the other links by prefix.
- **Shop filtering** is URL-driven (`?category=&price=&minRating=&sort=&view=`).
  `product.schema.ts` + `product.repository.ts` support a `price` bucket ("min-max")
  and `minRating`; options in `SHOP_PRICE_RANGES` / `SHOP_RATING_OPTIONS`.
  `components/shop/shop-toolbar.tsx` renders the chip filters + result count +
  grid/list toggle; `ProductGrid` takes a `view` prop and `ProductCard` a `layout`
  prop. The product-card rating line reads `(x/5) | N Sold`, where **N is the review
  count `ratingCount` relabeled "Sold"** (there is no real sales/sold field).
- **Home sections** (`app/(public)/page.tsx`): hero → brand marquee → featured →
  Best Categories → new arrivals → clinical treatments → `VideoSection` →
  testimonials → `PromoBanners` → newsletter. `VideoSection` shows a poster + play
  button that swaps to a local MP4 (`VIDEO_SRC`) or YouTube (`YOUTUBE_ID`). The old
  "Philosophy" section was removed; `PromoBanners` is the "Buy 1 Get 1" promo bento.
- **Checkout** (`app/(public)/checkout/page.tsx`): the Country field defaults to
  **Philippines** and is read-only.
- **Admin lists:** Orders and Appointments have summary cards + clickable rows
  (`components/admin/clickable-row.tsx`) linking to detail pages
  (`/admin/orders/[id]`, `/admin/appointments/[id]`). `appointment-status-select.tsx`
  stops event propagation so its inline dropdown works inside a clickable row.

### Adding a new admin CRUD module

Mirror an existing one (Products is the reference): add `*.schema.ts`,
`*.admin.ts`, `*.actions.ts` (guard with `requireSection("<section>")` — or
`requireAdmin` for admin-only modules — then `revalidatePath`), a form using
`src/components/admin/admin-form.tsx`, and `page.tsx` / `new/page.tsx`
/ `[id]/page.tsx`. Also add the section `layout.tsx` (`requireSection`) and a nav
entry — see **Admin access control** above. Wire delete with `ConfirmDeleteButton`
passing a bound action (`deleteXAction.bind(null, id)`). Edit forms bind the id
similarly: `updateXAction.bind(null, id)`.

## Demo accounts

- Admin: `admin@jcibeauty.com` / `admin123` (→ `/admin`) — the only account type.
  Customers don't log in (guest checkout/booking). The seed still creates a legacy
  customer row, but there's no customer login/registration UI.
- Catalog/services/staff/appointments are managed in the **admin panel**;
  `prisma/seed.ts` is the demo baseline, so `db:seed`/`db:reset` restore the seeded
  data (the live service menu may differ from the seed after admin edits).
