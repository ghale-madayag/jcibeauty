import { sendMail } from "@/lib/mailer";
import { emailShell, escapeHtml, C } from "@/lib/email-layout";
import { SITE } from "@/lib/constants";

/**
 * Transactional auth emails (sign-in code, email verification, password reset),
 * built from the shared branded email layout. All senders are best-effort and
 * never throw — they catch internally so they can't break a flow.
 */

const SANS = "Arial,Helvetica,sans-serif";

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">${text}</p>`;
}

function codeBlock(code: string): string {
  return `<div style="text-align:center;margin:6px 0 4px;">
    <div style="display:inline-block;font-family:${SANS};font-size:34px;letter-spacing:10px;font-weight:bold;color:${C.ink};background:${C.card};border:1px solid ${C.line};padding:18px 26px 18px 36px;">${escapeHtml(code)}</div>
  </div>`;
}

function button(label: string, href: string): string {
  return `<div style="text-align:center;margin:8px 0 4px;">
    <a href="${href}" style="display:inline-block;background:${C.gold};color:#ffffff;font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:14px 30px;">${escapeHtml(label)}</a>
  </div>`;
}

function note(html: string): string {
  return `<p style="margin:20px 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">${html}</p>`;
}

export async function sendLoginOtpEmail(
  to: string,
  name: string | null,
  code: string,
): Promise<void> {
  try {
    const content =
      paragraph(
        `Hi ${escapeHtml(name || "there")}, use this code to finish signing in to the ${escapeHtml(SITE.name)} admin panel:`,
      ) +
      codeBlock(code) +
      note(
        "This code expires in 10 minutes. If you didn't try to sign in, you can safely ignore this email.",
      );
    await sendMail({
      to,
      subject: `Your ${SITE.name} sign-in code`,
      html: emailShell({
        title: "Sign-in code",
        subtitle: "Two-factor verification",
        content,
        preheader: `Your sign-in code is ${code}`,
      }),
      text: `Your ${SITE.name} sign-in code is ${code} (expires in 10 minutes).`,
    });
  } catch (e) {
    console.error("[auth.email] sendLoginOtpEmail failed", e);
  }
}

export async function sendVerificationEmail(
  to: string,
  name: string | null,
  verifyUrl: string,
): Promise<void> {
  try {
    const content =
      paragraph(
        `Hi ${escapeHtml(name || "there")}, welcome to ${escapeHtml(SITE.name)}. Please confirm your email address to activate your account.`,
      ) +
      button("Verify my email", verifyUrl) +
      note(
        `This link expires in 10 minutes. If the button doesn't work, copy and paste this link into your browser:<br/><span style="color:${C.gold};word-break:break-all;">${escapeHtml(verifyUrl)}</span>`,
      );
    await sendMail({
      to,
      subject: `Verify your ${SITE.name} account`,
      html: emailShell({
        title: "Verify your email",
        subtitle: "Activate your account",
        content,
        preheader: "Confirm your email to activate your account",
      }),
    });
  } catch (e) {
    console.error("[auth.email] sendVerificationEmail failed", e);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string | null,
  code: string,
): Promise<void> {
  try {
    const content =
      paragraph(
        `Hi ${escapeHtml(name || "there")}, use this code to reset your ${escapeHtml(SITE.name)} password:`,
      ) +
      codeBlock(code) +
      note(
        "This code expires in 10 minutes. If you didn't request a password reset, you can safely ignore this email.",
      );
    await sendMail({
      to,
      subject: `Your ${SITE.name} password reset code`,
      html: emailShell({
        title: "Password reset",
        subtitle: "Reset your password",
        content,
        preheader: `Your password reset code is ${code}`,
      }),
      text: `Your ${SITE.name} password reset code is ${code} (expires in 10 minutes).`,
    });
  } catch (e) {
    console.error("[auth.email] sendPasswordResetEmail failed", e);
  }
}
