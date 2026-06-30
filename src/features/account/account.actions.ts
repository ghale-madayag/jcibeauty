"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { profileSchema, passwordChangeSchema } from "./account.schema";

type Result = { ok: boolean; error?: string };

async function currentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function updateProfileAction(
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  const id = await currentUserId();
  if (!id) return { ok: false, error: "You are not signed in." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await db.user.update({
      where: { id },
      data: { name: parsed.data.name, email: parsed.data.email },
    });
  } catch {
    return { ok: false, error: "That email is already in use." };
  }
  revalidatePath("/admin/account");
  return { ok: true };
}

export async function changePasswordAction(
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  const id = await currentUserId();
  if (!id) return { ok: false, error: "You are not signed in." };

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user?.passwordHash) {
    return { ok: false, error: "No password is set on this account." };
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return { ok: false, error: "Your current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({ where: { id }, data: { passwordHash } });
  return { ok: true };
}
