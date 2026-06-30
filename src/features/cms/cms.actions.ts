"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";

export async function updateSectionAction(
  key: string,
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireAdmin();

  const title = (formData.get("title") as string) || null;
  const isActive = formData.get("isActive") === "on";
  const raw = (formData.get("content") as string) || "{}";

  let content: unknown;
  try {
    content = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Content is not valid JSON." };
  }

  await db.homepageSection.update({
    where: { key },
    data: { title, isActive, content: content as object },
  });

  revalidatePath("/admin/cms");
  revalidatePath("/");
  return { ok: true };
}
