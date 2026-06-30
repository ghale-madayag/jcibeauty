"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ email: z.string().email() });

export async function subscribeAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "Enter a valid email." };

  try {
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Subscription failed." };
  }
}
