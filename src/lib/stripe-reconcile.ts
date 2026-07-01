import { stripe } from "@/lib/stripe";
import { appointmentService } from "@/features/appointments/appointment.service";
import { orderService } from "@/features/orders/order.service";

/**
 * Fallback for a missed or delayed Stripe webhook.
 *
 * Given a completed Checkout `session_id` (as returned on the success-page
 * redirect), verify with Stripe that it is actually paid and apply the same
 * side effects the webhook would — mark the order/appointment paid and send the
 * confirmation email. Routing mirrors the webhook (`session.metadata.type`).
 *
 * Safe to call on the success page: it is best-effort (never throws),
 * idempotent (markPaid* early-return once PAID, so no duplicate emails), and a
 * no-op when Stripe isn't configured or the session isn't paid. The webhook
 * remains the authoritative path; this just makes confirmation resilient when
 * the webhook is misconfigured or lagging.
 */
export async function reconcileCheckoutSession(sessionId: string): Promise<void> {
  if (!stripe || !sessionId) return;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? "");
    if (session.metadata?.type === "appointment") {
      await appointmentService.markPaidBySession(session.id, paymentIntentId);
    } else {
      await orderService.markPaid(session.id, paymentIntentId);
    }
  } catch {
    // Best-effort only — the webhook is the authoritative confirmation path.
  }
}
