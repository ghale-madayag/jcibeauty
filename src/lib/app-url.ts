import { headers } from "next/headers";

/**
 * Resolve the app's absolute base URL (e.g. "https://jcibeauty.com").
 *
 * Prefers the real incoming request host so Stripe redirect URLs always match
 * the domain the visitor is actually on. This sidesteps the classic
 * "redirected to localhost in production" bug: `NEXT_PUBLIC_APP_URL` is inlined
 * at build time, so a value baked wrong during the production build can't be
 * corrected at runtime — but the request host always reflects the live domain.
 *
 * Must be called within a request scope (server action / route handler).
 * Falls back to NEXT_PUBLIC_APP_URL, then localhost, when no request is active.
 */
export async function getRequestBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    // x-forwarded-* are set by the Passenger/host reverse proxy.
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const isLocal =
        host.startsWith("localhost") || host.startsWith("127.0.0.1");
      const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // headers() throws outside a request scope — fall through to the env value.
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
