import Stripe from "stripe";

/**
 * Server-side Stripe client. Lazily throws only if used without a key so the
 * rest of the app can run in environments where Stripe isn't configured yet.
 */
const key = process.env.STRIPE_SECRET_KEY;

// Treat empty or placeholder keys (e.g. "sk_test_xxx") as "not configured" so
// the app falls back to a simulated checkout in local development.
const isConfigured = !!key && key.startsWith("sk_") && !key.endsWith("xxx");

/** True when a real Stripe key is set (vs. the simulated dev-checkout fallback). */
export const isStripeConfigured = isConfigured;

export const stripe = isConfigured
  ? new Stripe(key as string, { typescript: true })
  : (null as unknown as Stripe);

export function assertStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  return stripe;
}
