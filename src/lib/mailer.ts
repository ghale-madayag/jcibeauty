import { readFileSync } from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { LOGO_CID } from "@/lib/email-layout";

const host = process.env.MAIL_HOST;
const port = Number(process.env.MAIL_PORT ?? 587);
const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;

/**
 * Brand logo embedded inline (CID) in every email — see LOGO_CID in
 * email-layout.ts. Read once at startup; if the asset is missing we simply
 * send without it (the <img alt> shows) rather than breaking the email.
 */
const logoAttachment: { filename: string; content: Buffer; cid: string } | null =
  (() => {
    try {
      const content = readFileSync(
        path.join(process.cwd(), "public", "images", "JCI Beauty email.png"),
      );
      return { filename: "jci-beauty.png", content, cid: LOGO_CID };
    } catch {
      return null;
    }
  })();

export const MAIL_FROM =
  process.env.MAIL_FROM || "JCI Beauty <no-reply@jcibeauty.com>";

/** Email is "configured" only when host + credentials are present. */
export const isMailConfigured = Boolean(host && user && pass);

const transporter = isMailConfigured
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS; 587/2525 = STARTTLS
      auth: { user, pass },
    })
  : null;

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ skipped: boolean }> {
  if (!transporter) {
    // Not configured (e.g. Mailtrap creds not pasted yet) — log instead of fail.
    console.warn(
      `[mailer] SMTP not configured — skipping email to ${opts.to} ("${opts.subject}")`,
    );
    return { skipped: true };
  }
  await transporter.sendMail({
    from: MAIL_FROM,
    ...opts,
    ...(logoAttachment ? { attachments: [logoAttachment] } : {}),
  });
  return { skipped: false };
}
