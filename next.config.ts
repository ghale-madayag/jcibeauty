import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * Tuned for this app: self-hosted assets (next/font), local images, and Stripe
 * Checkout (redirect + js.stripe.com). `'unsafe-inline'` is required for Next's
 * injected styles/scripts and Tailwind; `'unsafe-eval'` and the ws:/http dev
 * origins are only added in development for Turbopack HMR. The strong wins here
 * are `frame-ancestors 'none'` (clickjacking), `object-src 'none'`, and
 * `base-uri 'self'` — these hold regardless of the inline allowances.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://api.stripe.com${isDev ? " ws: http://localhost:* http://127.0.0.1:*" : ""}`,
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  // Only meaningful over HTTPS; omitted in dev so it can't try to upgrade
  // http://localhost subresources / the HMR websocket.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework/version.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
