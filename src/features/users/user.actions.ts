"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";
import { createUserSchema, updateUserSchema } from "./user.schema";
import { userAdminService } from "./user.admin";
import { issueEmailVerifyToken } from "@/features/auth/otp.service";
import { sendVerificationEmail } from "@/features/auth/auth.email";
import { absUrl } from "@/lib/email-layout";

type Result = { ok: boolean; error?: string };

async function sendVerify(userId: string, email: string, name: string | null) {
  const token = await issueEmailVerifyToken(userId);
  await sendVerificationEmail(
    email,
    name,
    absUrl(`/verify-email?uid=${userId}&token=${token}`),
  );
}

function fields(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password") || "",
  };
}

export async function createUserAction(
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(fields(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  let created;
  try {
    created = await userAdminService.create(parsed.data);
  } catch {
    return { ok: false, error: "A user with this email already exists." };
  }
  // New panel accounts start unverified — email them a verification link.
  try {
    await sendVerify(created.id, created.email, created.name);
  } catch {
    /* best-effort — account is created either way; admin can resend */
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function resendUserVerificationAction(id: string): Promise<Result> {
  await requireAdmin();
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { ok: false, error: "User not found." };
  if (user.emailVerified) {
    return { ok: false, error: "This user is already verified." };
  }
  try {
    await sendVerify(user.id, user.email, user.name);
  } catch {
    return { ok: false, error: "Could not send the verification email." };
  }
  return { ok: true };
}

export async function updateUserAction(
  id: string,
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  await requireAdmin();
  const parsed = updateUserSchema.safeParse(fields(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const target = await userAdminService.getForEdit(id);
  if (!target) return { ok: false, error: "User not found." };

  // Don't let the last remaining admin be demoted out of the role.
  if (target.role === "ADMIN" && parsed.data.role !== "ADMIN") {
    const admins = await userAdminService.countAdmins();
    if (admins <= 1) {
      return { ok: false, error: "You cannot remove the last admin." };
    }
  }

  try {
    await userAdminService.update(id, parsed.data);
  } catch {
    return { ok: false, error: "A user with this email already exists." };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUserAction(id: string): Promise<Result> {
  const session = await requireAdmin();
  if (session.user.id === id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  const target = await userAdminService.getForEdit(id);
  if (!target) return { ok: false, error: "User not found." };

  if (target.role === "ADMIN") {
    const admins = await userAdminService.countAdmins();
    if (admins <= 1) {
      return { ok: false, error: "You cannot delete the last admin." };
    }
  }

  try {
    await userAdminService.remove(id);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete this user." };
  }
}
