import { SITE } from "@/lib/constants";

/**
 * Shared, email-safe building blocks for transactional emails.
 *
 * Everything here is table-based with inline styles (the only thing email
 * clients reliably support). Images must be ABSOLUTE URLs — built from
 * NEXT_PUBLIC_APP_URL — or recipients' mail clients can't load them.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Build an absolute URL (and URL-encode paths with spaces) for email assets. */
export function absUrl(path: string): string {
  try {
    return new URL(path, APP_URL).toString();
  } catch {
    return path;
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Glowify pink brand palette. `gold` keeps its name (the app aliases the gold
 * token to pink too) but renders the brand pink so all accents go pink at once.
 */
export const C = {
  page: "#fbeef4", // pale pink outer
  sheet: "#ffffff", // email sheet
  card: "#faeff2", // brand pale-pink tint
  panel: "#e61f7f", // care-guide block (brand pink)
  gold: "#e61f7f", // primary accent (aliased to pink)
  ink: "#303030", // brand charcoal
  muted: "#7c7575",
  faint: "#b9b3b0",
  line: "#f3dbe6", // soft pink divider
};

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "Arial,Helvetica,sans-serif";
const LOGO_URL = absUrl("/images/JCI Beauty.webp");

/** Page chrome: logo header, centered title/subtitle, content, brand footer. */
export function emailShell(opts: {
  title: string;
  subtitle: string;
  content: string;
  preheader?: string;
}): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${C.page};">
  ${
    opts.preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>`
      : ""
  }
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:${C.sheet};border:1px solid ${C.line};">
        <tr><td align="center" style="padding:30px 24px 18px;border-bottom:1px solid ${C.line};">
          <img src="${LOGO_URL}" alt="${escapeHtml(SITE.name)}" height="42" style="height:42px;display:block;border:0;"/>
        </td></tr>
        <tr><td align="center" style="padding:42px 24px 0;">
          <h1 style="margin:0;font-family:${SERIF};font-size:38px;font-weight:400;color:${C.ink};letter-spacing:0.5px;">${escapeHtml(opts.title)}</h1>
          <p style="margin:14px 0 0;font-family:${SERIF};font-style:italic;font-size:15px;color:${C.muted};">${escapeHtml(opts.subtitle)}</p>
          <div style="width:48px;height:1px;background:${C.gold};margin:24px auto 0;opacity:0.6;line-height:1px;font-size:0;">&nbsp;</div>
        </td></tr>
        <tr><td style="padding:32px 36px 8px;">${opts.content}</td></tr>
        <tr><td align="center" style="padding:34px 24px 40px;border-top:1px solid ${C.line};">
          <p style="margin:0 0 10px;font-family:${SANS};font-size:10px;letter-spacing:2px;color:${C.muted};text-transform:uppercase;">Experience the art of precision</p>
          <p style="margin:0 0 16px;font-family:${SERIF};font-size:18px;letter-spacing:3px;color:${C.gold};text-transform:uppercase;">${escapeHtml(SITE.name)}</p>
          <p style="margin:0 0 16px;font-family:${SANS};font-size:12px;">
            <a href="${absUrl("/shop")}" style="color:${C.muted};text-decoration:none;margin:0 9px;">Shop</a>
            <a href="${absUrl("/services")}" style="color:${C.muted};text-decoration:none;margin:0 9px;">Services</a>
            <a href="${absUrl("/contact")}" style="color:${C.muted};text-decoration:none;margin:0 9px;">Contact</a>
          </p>
          <p style="margin:0;font-family:${SANS};font-size:11px;color:${C.muted};">&copy; ${year} ${escapeHtml(SITE.name)}. All rights reserved.</p>
          <p style="margin:12px auto 0;max-width:440px;font-family:${SANS};font-size:10px;line-height:1.5;color:${C.faint};">
            You're receiving this email because you placed an order or booking with ${escapeHtml(SITE.name)}.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** The four-cell summary strip (Order #, Date, Total, Payment …). */
export function summaryBar(cells: { label: string; value: string }[]): string {
  const tds = cells
    .map(
      (c) => `<td style="padding:15px 16px;font-family:${SANS};vertical-align:top;">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};">${escapeHtml(c.label)}</div>
        <div style="margin-top:7px;font-size:14px;color:${C.ink};">${c.value}</div>
      </td>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.line};margin:0 0 28px;"><tr>${tds}</tr></table>`;
}

/** A product/treatment line: thumbnail + name + meta on the left, amount right. */
export function lineItem(opts: {
  image?: string | null;
  name: string;
  meta?: string;
  amount?: string;
  last?: boolean;
}): string {
  const thumb = opts.image
    ? `<img src="${absUrl(opts.image)}" width="62" height="62" alt="" style="width:62px;height:62px;object-fit:cover;border:1px solid ${C.line};border-radius:4px;display:block;background:${C.card};"/>`
    : `<div style="width:62px;height:62px;border:1px solid ${C.line};border-radius:4px;background:${C.card};"></div>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${opts.last ? "" : `border-bottom:1px solid ${C.line};`}">
    <tr>
      <td width="62" style="padding:16px 0;vertical-align:top;">${thumb}</td>
      <td style="padding:16px 0 16px 16px;vertical-align:top;font-family:${SANS};">
        <div style="font-family:${SERIF};font-size:16px;color:${C.ink};">${escapeHtml(opts.name)}</div>
        ${opts.meta ? `<div style="margin-top:5px;font-size:12px;color:${C.muted};">${escapeHtml(opts.meta)}</div>` : ""}
      </td>
      <td style="padding:16px 0;vertical-align:top;text-align:right;font-family:${SANS};font-size:14px;color:${C.ink};white-space:nowrap;">${opts.amount ? escapeHtml(opts.amount) : ""}</td>
    </tr>
  </table>`;
}

/** A labeled info card (Shipping Destination / Estimated Delivery …). */
export function infoCard(title: string, bodyHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="height:100%;">
    <tr><td style="background:${C.card};border:1px solid ${C.line};padding:18px;font-family:${SANS};vertical-align:top;">
      <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};margin-bottom:11px;">${escapeHtml(title)}</div>
      <div style="font-size:13px;line-height:1.65;color:${C.ink};">${bodyHtml}</div>
    </td></tr>
  </table>`;
}

/** Lay two blocks side by side with a small gutter. */
export function twoCol(left: string, right: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 4px;">
    <tr>
      <td width="48%" style="vertical-align:top;">${left}</td>
      <td width="4%">&nbsp;</td>
      <td width="48%" style="vertical-align:top;">${right}</td>
    </tr>
  </table>`;
}

/** The dark, three-column "care guide" panel with an optional CTA. */
export function darkGuide(opts: {
  title: string;
  subtitle: string;
  tips: { title: string; body: string }[];
  ctaLabel?: string;
  ctaHref?: string;
}): string {
  const cols = opts.tips
    .map(
      (t) => `<td width="33%" style="padding:8px 12px;vertical-align:top;text-align:center;font-family:${SANS};">
        <div style="font-family:${SERIF};font-size:13px;color:#ffffff;margin-bottom:7px;">${escapeHtml(t.title)}</div>
        <div style="font-size:11px;line-height:1.6;color:#fbdcea;">${escapeHtml(t.body)}</div>
      </td>`,
    )
    .join("");
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<div style="text-align:center;margin-top:24px;">
          <a href="${opts.ctaHref}" style="display:inline-block;background:#ffffff;color:${C.gold};font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13px 28px;">${escapeHtml(opts.ctaLabel)}</a>
        </div>`
      : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel};margin:32px 0 8px;">
    <tr><td style="padding:32px 26px;">
      <div style="text-align:center;font-family:${SERIF};font-size:22px;color:#ffffff;">${escapeHtml(opts.title)}</div>
      <div style="text-align:center;font-family:${SERIF};font-style:italic;font-size:13px;color:#fbdcea;margin-top:8px;">${escapeHtml(opts.subtitle)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr>${cols}</tr></table>
      ${cta}
    </td></tr>
  </table>`;
}

/** Right-aligned totals stack used under the order summary. */
export function totalsBlock(
  rows: { label: string; value: string }[],
  total: { label: string; value: string },
): string {
  const lines = rows
    .map(
      (r) => `<tr>
        <td style="padding:5px 24px 5px 0;font-family:${SANS};font-size:13px;color:${C.muted};">${escapeHtml(r.label)}</td>
        <td style="padding:5px 0;font-family:${SANS};font-size:13px;color:${C.ink};text-align:right;white-space:nowrap;">${escapeHtml(r.value)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 0;border-top:1px solid ${C.line};">
    <tr><td align="right" style="padding-top:14px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="min-width:260px;">
        ${lines}
        <tr>
          <td style="padding:12px 24px 0 0;font-family:${SERIF};font-size:17px;color:${C.ink};border-top:1px solid ${C.line};">${escapeHtml(total.label)}</td>
          <td style="padding:12px 0 0;font-family:${SERIF};font-size:17px;color:${C.gold};text-align:right;white-space:nowrap;border-top:1px solid ${C.line};">${escapeHtml(total.value)}</td>
        </tr>
      </table>
    </td></tr>
  </table>`;
}

const SECTION_SERIF = SERIF;
/** A small left-aligned section heading ("Order Summary"). */
export function sectionHeading(text: string): string {
  return `<h2 style="margin:6px 0 0;font-family:${SECTION_SERIF};font-size:20px;font-weight:400;color:${C.ink};">${escapeHtml(text)}</h2>`;
}
