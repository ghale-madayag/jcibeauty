import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { RegisterInput } from "./auth.schema";

/** Create a new customer account. Throws if the email already exists. */
export async function registerUser(input: RegisterInput) {
  const existing = await db.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await db.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "CUSTOMER",
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}
