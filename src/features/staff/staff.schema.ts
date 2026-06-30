import { z } from "zod";

export const staffInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  serviceIds: z.array(z.string()).default([]),
});

export type StaffInput = z.infer<typeof staffInputSchema>;

export interface ScheduleEntry {
  dayOfWeek: number;
  startMin: number;
  endMin: number;
}
