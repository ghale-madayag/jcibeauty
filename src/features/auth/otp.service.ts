import { randomBytes, randomInt } from "crypto";
import bcrypt from "bcryptjs";
import type { VerificationPurpose } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * One-time codes/tokens for email-OTP 2FA, email verification, and password
 * reset. Secrets are bcrypt-hashed at rest, expire quickly, are single-use, and
 * are attempt-limited. One active secret per (user, purpose).
 */

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** Email-OTP 2FA can be turned off (e.g. in dev) with AUTH_2FA_ENABLED=false. */
export const TWO_FACTOR_ENABLED = process.env.AUTH_2FA_ENABLED !== "false";

function sixDigitCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function urlToken(): string {
  return randomBytes(32).toString("hex");
}

async function store(
  userId: string,
  purpose: VerificationPurpose,
  secret: string,
): Promise<void> {
  const codeHash = await bcrypt.hash(secret, 10);
  await db.verificationCode.deleteMany({ where: { userId, purpose } });
  await db.verificationCode.create({
    data: {
      userId,
      purpose,
      codeHash,
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });
}

export async function issueLoginOtp(userId: string): Promise<string> {
  const code = sixDigitCode();
  await store(userId, "LOGIN_2FA", code);
  return code;
}

export async function issuePasswordResetOtp(userId: string): Promise<string> {
  const code = sixDigitCode();
  await store(userId, "PASSWORD_RESET", code);
  return code;
}

export async function issueEmailVerifyToken(userId: string): Promise<string> {
  const token = urlToken();
  await store(userId, "EMAIL_VERIFY", token);
  return token;
}

/** Verify and consume a secret. Returns true only on an exact, fresh match. */
export async function verify(
  userId: string,
  purpose: VerificationPurpose,
  secret: string,
): Promise<boolean> {
  if (!secret) return false;
  const rec = await db.verificationCode.findFirst({
    where: { userId, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (!rec) return false;

  const dead =
    rec.expiresAt.getTime() < Date.now() || rec.attempts >= MAX_ATTEMPTS;
  if (dead) {
    await db.verificationCode.delete({ where: { id: rec.id } }).catch(() => {});
    return false;
  }

  const match = await bcrypt.compare(secret, rec.codeHash);
  if (!match) {
    await db.verificationCode.update({
      where: { id: rec.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  // Single-use: consume on success.
  await db.verificationCode.delete({ where: { id: rec.id } }).catch(() => {});
  return true;
}
