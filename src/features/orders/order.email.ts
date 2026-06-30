import { addDays, format } from "date-fns";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/constants";
import {
  absUrl,
  C,
  darkGuide,
  emailShell,
  escapeHtml,
  infoCard,
  lineItem,
  sectionHeading,
  summaryBar,
  totalsBlock,
  twoCol,
} from "@/lib/email-layout";

type ShippingAddress = {
  fullName?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string | null;
  postalCode?: string;
  country?: string;
  phone?: string | null;
};

/**
 * Send the customer an order confirmation email. Safe to call multiple times —
 * the caller guards against re-sending. Never throws (logs on failure) so it
 * can't break the payment/webhook flow.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    const addr = (order.shippingAddress ?? {}) as ShippingAddress;

    const items = order.items
      .map((i, idx) =>
        lineItem({
          image: i.image,
          name: i.name,
          meta: `Qty: ${i.quantity}`,
          amount: formatMoney(Number(i.price) * i.quantity),
          last: idx === order.items.length - 1,
        }),
      )
      .join("");

    const summary = summaryBar([
      { label: "Order Number", value: `#${escapeHtml(order.orderNumber)}` },
      { label: "Date", value: format(order.createdAt, "MMMM d, yyyy") },
      { label: "Total", value: formatMoney(order.total) },
      {
        label: "Payment",
        value: order.paymentStatus === "PAID" ? "Card · Paid" : "Pending",
      },
    ]);

    const totalsRows = [
      { label: "Subtotal", value: formatMoney(order.subtotal) },
    ];
    if (Number(order.discountTotal) > 0) {
      totalsRows.push({
        label: "Discount",
        value: `-${formatMoney(order.discountTotal)}`,
      });
    }
    totalsRows.push({
      label: "Shipping",
      value:
        Number(order.shippingTotal) === 0
          ? "Complimentary"
          : formatMoney(order.shippingTotal),
    });
    if (Number(order.taxTotal) > 0) {
      totalsRows.push({ label: "Tax", value: formatMoney(order.taxTotal) });
    }
    const totals = totalsBlock(totalsRows, {
      label: "Total",
      value: formatMoney(order.total),
    });

    const addressHtml = addr.line1
      ? `${escapeHtml(addr.fullName || "")}<br/>` +
        `${escapeHtml(addr.line1 || "")}${addr.line2 ? "<br/>" + escapeHtml(addr.line2) : ""}<br/>` +
        `${escapeHtml([addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "))}<br/>` +
        `${escapeHtml(addr.country || "")}`
      : "Provided at checkout.";

    const deliveryHtml =
      `<div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${C.ink};">` +
      `${format(addDays(order.createdAt, 4), "MMMM d")} &ndash; ${format(addDays(order.createdAt, 7), "d, yyyy")}` +
      `</div><div style="margin-top:6px;color:${C.muted};">Via standard courier</div>`;

    const cards = twoCol(
      infoCard("Shipping Destination", addressHtml),
      infoCard("Estimated Delivery", deliveryHtml),
    );

    const guide = darkGuide({
      title: "Your Care Guide",
      subtitle: "Getting the most from your new routine.",
      tips: [
        {
          title: "Patch Test",
          body: "Try new actives on a small area for 24 hours before full use.",
        },
        {
          title: "Sun Protection",
          body: "Apply SPF 50 daily to protect freshly treated skin.",
        },
        {
          title: "Expert Support",
          body: `Questions? Reach our team at ${SITE.email}.`,
        },
      ],
      ctaLabel: "Shop the collection",
      ctaHref: absUrl("/shop"),
    });

    const html = emailShell({
      title: "Thank You",
      subtitle: "Your journey to radiant skin is on its way.",
      preheader: `Order #${order.orderNumber} confirmed — ${formatMoney(order.total)}`,
      content:
        summary +
        sectionHeading("Order Summary") +
        items +
        totals +
        cards +
        guide,
    });

    await sendMail({
      to: order.email,
      subject: `Your ${SITE.name} order ${order.orderNumber} is confirmed`,
      html,
      text: `Thank you for your order!\n\nOrder ${order.orderNumber}\nTotal: ${formatMoney(order.total)}\n\nWe've received your payment and are preparing your order.`,
    });
  } catch (err) {
    console.error("[order.email] failed to send confirmation:", err);
  }
}
