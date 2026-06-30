"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  loginSchema,
  registerSchema,
  passwordResetSchema,
} from "./auth.schema";
import { registerUser } from "./auth.service";
import { checkRateLimit } from "@/lib/rate-limit";
import * as otpService from "./otp.service";
import { TWO_FACTOR_ENABLED } from "./otp.service";
import {
  sendLoginOtpEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./auth.email";
import { absUrl } from "@/lib/email-layout";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0] ??
    h.get("x-real-ip") ??
    "unknown"
  ).trim();
}

function verifyUrl(uid: string, token: string): string {
  return absUrl(`/verify-email?uid=${uid}&token=${token}`);
}

// ---------------------------------------------------------------------------
// Login (step 1): verify password, then email a 2FA code (if enabled)
// ---------------------------------------------------------------------------

export type LoginOtpResult = {
  ok: boolean;
  otpRequired?: boolean;
  status?: "UNVERIFIED";
  error?: string;
};

export async function requestLoginOtpAction(
  email: string,
  password: string,
): Promise<LoginOtpResult> {
  const ip = await clientIp();
  const em = String(email ?? "").toLowerCase().trim();

  const perAccount = checkRateLimit(`login:${ip}:${em}`, {
    max: 5,
    windowMs: 15 * 60 * 1000,
  });
  const perIp = checkRateLimit(`login-ip:${ip}`, {
    max: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!perAccount.allowed || !perIp.allowed) {
    const mins = Math.ceil(
      Math.max(perAccount.retryAfterMs, perIp.retryAfterMs) / 60000,
    );
    return {
      ok: false,
      error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }

  const parsed = loginSchema.safeParse({ email: em, password });
  if (!parsed.success) return { ok: false, error: "Invalid email or password." };

  const user = await db.user.findUnique({ where: { email: em } });
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }
  if (!user.emailVerified) {
    return {
      ok: false,
      status: "UNVERIFIED",
      error: "Please verify your email before signing in.",
    };
  }

  if (!TWO_FACTOR_ENABLED) {
    return { ok: true, otpRequired: false };
  }

  const code = await otpService.issueLoginOtp(user.id);
  await sendLoginOtpEmail(user.email, user.name, code);
  return { ok: true, otpRequired: true };
}

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export async function verifyEmailAction(
  uid: string,
  token: string,
): Promise<ActionState> {
  if (!uid || !token) {
    return { ok: false, error: "Invalid verification link." };
  }
  const ok = await otpService.verify(uid, "EMAIL_VERIFY", token);
  if (!ok) {
    return {
      ok: false,
      error: "This verification link is invalid or has expired.",
    };
  }
  await db.user.update({
    where: { id: uid },
    data: { emailVerified: new Date() },
  });
  return { ok: true };
}

/** Public resend — always returns ok (no account enumeration). */
export async function resendVerificationAction(
  email: string,
): Promise<ActionState> {
  const ip = await clientIp();
  const em = String(email ?? "").toLowerCase().trim();
  const rl = checkRateLimit(`verify-resend:${ip}:${em}`, {
    max: 3,
    windowMs: 15 * 60 * 1000,
  });
  if (rl.allowed) {
    const user = await db.user.findUnique({ where: { email: em } });
    if (user && !user.emailVerified) {
      const token = await otpService.issueEmailVerifyToken(user.id);
      await sendVerificationEmail(user.email, user.name, verifyUrl(user.id, token));
    }
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

/** Public request — always returns ok (no account enumeration). */
export async function requestPasswordResetAction(
  email: string,
): Promise<ActionState> {
  const ip = await clientIp();
  const em = String(email ?? "").toLowerCase().trim();
  const rl = checkRateLimit(`pwreset:${ip}:${em}`, {
    max: 3,
    windowMs: 15 * 60 * 1000,
  });
  const rlIp = checkRateLimit(`pwreset-ip:${ip}`, {
    max: 15,
    windowMs: 15 * 60 * 1000,
  });
  if (rl.allowed && rlIp.allowed) {
    const user = await db.user.findUnique({ where: { email: em } });
    if (user) {
      const code = await otpService.issuePasswordResetOtp(user.id);
      await sendPasswordResetEmail(user.email, user.name, code);
    }
  }
  return { ok: true };
}

export async function resetPasswordAction(
  email: string,
  code: string,
  password: string,
  confirmPassword: string,
): Promise<ActionState> {
  const parsed = passwordResetSchema.safeParse({
    email,
    code,
    password,
    confirmPassword,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const ip = await clientIp();
  const em = parsed.data.email.toLowerCase().trim();
  const rl = checkRateLimit(`pwreset-verify:${ip}:${em}`, {
    max: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const user = await db.user.findUnique({ where: { email: em } });
  if (!user) return { ok: false, error: "Invalid or expired code." };

  const ok = await otpService.verify(user.id, "PASSWORD_RESET", parsed.data.code);
  if (!ok) return { ok: false, error: "Invalid or expired code." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Register (legacy — storefront is guest-only; kept for completeness) / logout
// ---------------------------------------------------------------------------

export async function registerAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Registration failed.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Account created. Please sign in." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
