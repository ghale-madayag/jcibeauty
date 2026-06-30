import { z } from "zod";

export const availabilitySchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Select a service"),
  staffId: z.string().min(1, "Select a staff member"),
  start: z.string().datetime("Select a time slot"),
  customerName: z.string().min(2, "Enter your name"),
  customerEmail: z.string().email("Enter a valid email"),
  customerPhone: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
