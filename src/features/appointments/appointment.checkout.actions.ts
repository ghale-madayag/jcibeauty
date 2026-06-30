"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { toNumber, toStripeAmount } from "@/lib/money";
import { getRequestBaseUrl } from "@/lib/app-url";
import { appointmentService } from "./appointment.service";
import { bookingSchema, type BookingInput } from "./appointment.schema";

const CURRENCY = (process.env.NEXT_PUBLIC_CURRENCY || "PHP").toLowerCase();

export async function createBookingCheckoutAction(input: BookingInput): Promise<{
  ok: boolean;
  url?: string;
  error?: string;
}> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please complete all required fields." };
  }

  const session = await auth();

  let appointment;
  let service;
  try {
    const result = await appointmentService.createPendingForCheckout(
      parsed.data,
      session?.user?.id,
    );
    appointment = result.appointment;
    service = result.service;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Booking failed.",
    };
  }

  const price = toNumber(service.price);
  const APP_URL = await getRequestBaseUrl();

  // Dev fallback: no Stripe configured -> confirm without payment.
  if (!stripe || price <= 0) {
    await appointmentService.confirmWithoutPayment(appointment.id);
    revalidatePath("/admin/appointments");
    return {
      ok: true,
      url: `${APP_URL}/book/success?appointment=${appointment.id}&dev=1`,
    };
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: parsed.data.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: toStripeAmount(price),
          product_data: {
            name: `${service.name} — Appointment`,
            description: `Booking for ${appointment.start.toLocaleString()}`,
          },
        },
      },
    ],
    metadata: { type: "appointment", appointmentId: appointment.id },
    success_url: `${APP_URL}/book/success?appointment=${appointment.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/book?canceled=1`,
  });

  await appointmentService.setStripeSession(appointment.id, checkout.id);
  revalidatePath("/admin/appointments");

  return { ok: true, url: checkout.url ?? undefined };
}
