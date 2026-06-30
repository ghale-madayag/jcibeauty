"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { appointmentService } from "./appointment.service";
import {
  availabilitySchema,
  bookingSchema,
  type BookingInput,
} from "./appointment.schema";

export async function getSlotsAction(input: {
  serviceId: string;
  staffId: string;
  date: string;
}): Promise<{ slots: string[]; error?: string }> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) return { slots: [], error: "Invalid request." };
  const slots = await appointmentService.getAvailableSlots(parsed.data);
  return { slots };
}

export async function bookAppointmentAction(input: BookingInput): Promise<{
  ok: boolean;
  error?: string;
  appointmentId?: string;
}> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please complete all required fields." };
  }
  const session = await auth();
  try {
    const appt = await appointmentService.book(parsed.data, session?.user?.id);
    revalidatePath("/admin/appointments");
    return { ok: true, appointmentId: appt.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Booking failed.",
    };
  }
}

export async function cancelAppointmentAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };
  try {
    await appointmentService.cancel(id, session.user.id);
    revalidatePath("/admin/appointments");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Cancel failed.",
    };
  }
}

export async function rescheduleAppointmentAction(id: string, start: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };
  try {
    await appointmentService.reschedule(id, session.user.id, start);
    revalidatePath("/admin/appointments");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Reschedule failed.",
    };
  }
}
