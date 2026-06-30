import { db } from "@/lib/db";
import { generateSlots, type TimeRange } from "@/lib/slots";
import {
  BOOKING_MIN_ADVANCE_DAYS,
  BOOKING_SLOT_STEP_MIN,
} from "@/lib/constants";
import { sendAppointmentConfirmation } from "./appointment.email";
import type { AvailabilityInput, BookingInput } from "./appointment.schema";

const DAY_START_MIN = 0;
const DAY_END_MIN = 24 * 60;

function dayBounds(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59.999`);
  return { start, end, weekday: start.getDay() };
}

/** Earliest instant a customer may book — midnight of (today + advance days). */
function minBookingStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + BOOKING_MIN_ADVANCE_DAYS);
  return d;
}

export const appointmentService = {
  /** Compute bookable start times for a service/staff/date. */
  async getAvailableSlots(input: AvailabilityInput): Promise<string[]> {
    const service = await db.service.findUnique({
      where: { id: input.serviceId },
      select: { durationMin: true, bufferMin: true, isActive: true },
    });
    if (!service || !service.isActive) return [];

    const { start, end, weekday } = dayBounds(input.date);

    const [schedules, business, appts, timeOff] = await Promise.all([
      db.staffSchedule.findMany({
        where: { staffId: input.staffId, dayOfWeek: weekday, isActive: true },
        select: { startMin: true, endMin: true },
      }),
      db.businessHours.findUnique({ where: { dayOfWeek: weekday } }),
      db.appointment.findMany({
        where: {
          staffId: input.staffId,
          start: { gte: start, lte: end },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { start: true, end: true },
      }),
      db.staffTimeOff.findMany({
        where: { staffId: input.staffId, start: { lte: end }, end: { gte: start } },
        select: { start: true, end: true },
      }),
    ]);

    const busy: TimeRange[] = [...appts, ...timeOff];

    return generateSlots({
      day: start,
      staffWindows: schedules,
      business: business
        ? {
            openMin: business.openMin,
            closeMin: business.closeMin,
            isClosed: business.isClosed,
          }
        : { openMin: DAY_START_MIN, closeMin: DAY_END_MIN, isClosed: false },
      busy,
      durationMin: service.durationMin,
      bufferMin: service.bufferMin,
      stepMin: BOOKING_SLOT_STEP_MIN,
      // Enforce the advance-notice window: nothing earlier than today + N days.
      now: minBookingStart(),
    });
  },

  /** Book an appointment, re-validating the slot inside a transaction. */
  async book(input: BookingInput, userId?: string) {
    const service = await db.service.findUnique({
      where: { id: input.serviceId },
      select: { durationMin: true, bufferMin: true, name: true },
    });
    if (!service) throw new Error("Service not found.");

    const start = new Date(input.start);
    const end = new Date(start.getTime() + service.durationMin * 60_000);

    if (start < minBookingStart()) {
      throw new Error(
        `Please book at least ${BOOKING_MIN_ADVANCE_DAYS} days in advance.`,
      );
    }

    const appointment = await db.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          staffId: input.staffId,
          status: { in: ["PENDING", "CONFIRMED"] },
          start: { lt: end },
          end: { gt: start },
        },
        select: { id: true },
      });
      if (conflict) {
        throw new Error("That time slot was just taken. Please choose another.");
      }

      return tx.appointment.create({
        data: {
          userId: userId ?? null,
          staffId: input.staffId,
          serviceId: input.serviceId,
          start,
          end,
          status: "CONFIRMED",
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          notes: input.notes,
        },
        include: { service: true, staff: true },
      });
    });

    await sendAppointmentConfirmation(appointment.id);
    return appointment;
  },

  /**
   * Create a PENDING/UNPAID appointment (slot re-validated in a transaction)
   * to be paid via Stripe Checkout. Returns the appointment + service.
   */
  async createPendingForCheckout(input: BookingInput, userId?: string) {
    const service = await db.service.findUnique({
      where: { id: input.serviceId },
      select: { durationMin: true, name: true, price: true },
    });
    if (!service) throw new Error("Service not found.");

    const start = new Date(input.start);
    const end = new Date(start.getTime() + service.durationMin * 60_000);
    if (start < minBookingStart()) {
      throw new Error(
        `Please book at least ${BOOKING_MIN_ADVANCE_DAYS} days in advance.`,
      );
    }

    const appointment = await db.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          staffId: input.staffId,
          status: { in: ["PENDING", "CONFIRMED"] },
          start: { lt: end },
          end: { gt: start },
        },
        select: { id: true },
      });
      if (conflict) {
        throw new Error("That time slot was just taken. Please choose another.");
      }
      return tx.appointment.create({
        data: {
          userId: userId ?? null,
          staffId: input.staffId,
          serviceId: input.serviceId,
          start,
          end,
          status: "PENDING",
          paymentStatus: "UNPAID",
          amount: service.price,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          notes: input.notes,
        },
        include: { service: true, staff: true },
      });
    });

    return { appointment, service };
  },

  setStripeSession(id: string, sessionId: string) {
    return db.appointment.update({
      where: { id },
      data: { stripeSessionId: sessionId },
    });
  },

  /** Confirm + mark paid from a Stripe webhook (matched by session id). */
  async markPaidBySession(sessionId: string, paymentIntentId: string) {
    const appt = await db.appointment.findFirst({
      where: { stripeSessionId: sessionId },
    });
    if (!appt || appt.paymentStatus === "PAID") return appt;
    const updated = await db.appointment.update({
      where: { id: appt.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        stripePaymentIntentId: paymentIntentId,
      },
    });
    await sendAppointmentConfirmation(updated.id);
    return updated;
  },

  /** Dev fallback: confirm without a real Stripe payment. */
  async confirmWithoutPayment(id: string) {
    const updated = await db.appointment.update({
      where: { id },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    });
    await sendAppointmentConfirmation(updated.id);
    return updated;
  },

  getById(id: string) {
    return db.appointment.findUnique({
      where: { id },
      include: { service: true, staff: true },
    });
  },

  /**
   * Authorized receipt lookup for the (public, guest) booking success page.
   * Only returns the appointment if the caller proves ownership via the
   * unguessable Stripe `session_id`. `devAllowed` opens the lookup only when
   * Stripe isn't configured (local dev simulated checkout).
   */
  async getReceipt(
    id: string,
    sessionId: string | undefined,
    devAllowed: boolean,
  ) {
    const appt = await db.appointment.findUnique({
      where: { id },
      include: { service: true, staff: true },
    });
    if (!appt) return null;
    if (devAllowed) return appt;
    if (sessionId && appt.stripeSessionId === sessionId) return appt;
    return null;
  },

  async listForUser(userId: string) {
    return db.appointment.findMany({
      where: { userId },
      orderBy: { start: "desc" },
      include: {
        service: { select: { name: true, durationMin: true } },
        staff: { select: { name: true } },
      },
    });
  },

  async cancel(id: string, userId: string) {
    const appt = await db.appointment.findUnique({ where: { id } });
    if (!appt || appt.userId !== userId) throw new Error("Appointment not found.");
    if (appt.status === "CANCELLED") return appt;
    return db.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  },

  async reschedule(id: string, userId: string, newStartIso: string) {
    const appt = await db.appointment.findUnique({
      where: { id },
      include: { service: { select: { durationMin: true } } },
    });
    if (!appt || appt.userId !== userId) throw new Error("Appointment not found.");

    const start = new Date(newStartIso);
    const end = new Date(start.getTime() + appt.service.durationMin * 60_000);
    if (start < new Date()) throw new Error("Cannot reschedule to the past.");

    return db.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          staffId: appt.staffId,
          id: { not: id },
          status: { in: ["PENDING", "CONFIRMED"] },
          start: { lt: end },
          end: { gt: start },
        },
        select: { id: true },
      });
      if (conflict) throw new Error("That time slot is unavailable.");
      return tx.appointment.update({
        where: { id },
        data: { start, end, status: "CONFIRMED" },
      });
    });
  },
};
