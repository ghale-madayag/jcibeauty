import { headers } from "next/headers";

/**
 * Hosts we trust to appear in the request's Host / X-Forwarded-Host header.
 *
 * The request host is only used when it matches one of these — a reverse proxy
 * can forward a client-supplied X-Forwarded-Host, so the raw header is NOT
 * trustworthy on its own (Host header injection). Add new production domains
 * here; anything unrecognised falls back to NEXT_PUBLIC_APP_URL.
 */
const ALLOWED_HOSTS = new Set([
  "jcibeauty.com",
  "www.jcibeauty.com",
  "localhost",
  "127.0.0.1",
]);

/**
 * Resolve the app's absolute base URL (e.g. "https://jcibeauty.com").
 *
 * Prefers the live request host so Stripe redirect URLs always match the domain
 * the visitor is on. This sidesteps the "redirected to localhost in production"
 * bug: `NEXT_PUBLIC_APP_URL` is inlined at build time, so a value baked wrong
 * during the production build can't be corrected at runtime — but the request
 * host reflects the live domain. The host is validated against ALLOWED_HOSTS
 * before use; otherwise we fall back to NEXT_PUBLIC_APP_URL, then localhost.
 *
 * Must be called within a request scope (server action / route handler).
 */
export async function getRequestBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    // X-Forwarded-Host can be a comma-separated proxy chain — take the first.
    const rawHost = (h.get("x-forwarded-host") ?? h.get("host") ?? "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    const hostname = rawHost.split(":")[0];
    if (rawHost && ALLOWED_HOSTS.has(hostname)) {
      // Scheme is derived from the (validated) host, never from a client-
      // controllable X-Forwarded-Proto: https everywhere except local dev.
      const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
      return `${isLocal ? "http" : "https"}://${rawHost}`;
    }
  } catch {
    // headers() throws outside a request scope — fall through to the env value.
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
