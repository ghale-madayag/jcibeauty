import { format } from "date-fns";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/constants";
import {
  absUrl,
  darkGuide,
  emailShell,
  lineItem,
  sectionHeading,
  summaryBar,
} from "@/lib/email-layout";

/**
 * Email the customer their appointment confirmation. Safe to call repeatedly
 * (callers guard against re-confirming). Never throws — logs on failure so it
 * can't break the booking/payment flow.
 */
export async function sendAppointmentConfirmation(
  appointmentId: string,
): Promise<void> {
  try {
    const appt = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, staff: true },
    });
    if (!appt) return;

    const when = format(appt.start, "EEEE, MMMM d, yyyy 'at' h:mm a");
    const paid = appt.paymentStatus === "PAID" && appt.amount != null;

    const summary = summaryBar([
      { label: "Date", value: format(appt.start, "MMM d, yyyy") },
      { label: "Time", value: format(appt.start, "h:mm a") },
      { label: "Duration", value: `${appt.service.durationMin} min` },
      { label: "Status", value: paid ? "Paid" : "Confirmed" },
    ]);

    const detail = lineItem({
      image: appt.service.image,
      name: appt.service.name,
      meta: `With ${appt.staff.name}`,
      amount: paid ? formatMoney(appt.amount!) : undefined,
      last: true,
    });

    const guide = darkGuide({
      title: "Before Your Visit",
      subtitle: "A few tips to help you prepare.",
      tips: [
        {
          title: "Arrive Early",
          body: "Please arrive 10 minutes before your scheduled time.",
        },
        {
          title: "Skip Actives",
          body: "Avoid retinoids and strong exfoliants for 48 hours prior.",
        },
        {
          title: "Need Changes?",
          body: `Reply to this email or call ${SITE.phone}.`,
        },
      ],
      ctaLabel: "Get directions",
      ctaHref: absUrl("/contact"),
    });

    const html = emailShell({
      title: "You're Confirmed",
      subtitle: "We look forward to seeing you.",
      preheader: `${appt.service.name} — ${when}`,
      content:
        summary + sectionHeading("Appointment Details") + detail + guide,
    });

    await sendMail({
      to: appt.customerEmail,
      subject: `Your ${SITE.name} appointment is confirmed`,
      html,
      text: `Your appointment is confirmed.\n\n${appt.service.name} with ${appt.staff.name}\n${when} (${appt.service.durationMin} min)`,
    });
  } catch (err) {
    console.error("[appointment.email] failed to send confirmation:", err);
  }
}
