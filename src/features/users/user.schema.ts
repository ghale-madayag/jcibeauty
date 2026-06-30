import { z } from "zod";
import { ASSIGNABLE_ROLES } from "@/lib/permissions";

const roleSchema = z.enum(ASSIGNABLE_ROLES, {
  errorMap: () => ({ message: "Choose a valid role" }),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Please enter a name"),
  email: z.string().email("Enter a valid email address"),
  role: roleSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Please enter a name"),
  email: z.string().email("Enter a valid email address"),
  role: roleSchema,
  // Blank means "keep current password"; otherwise enforce a minimum length.
  password: z
    .string()
    .refine((v) => v === "" || v.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
