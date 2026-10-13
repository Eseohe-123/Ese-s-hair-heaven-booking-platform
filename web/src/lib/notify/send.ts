import { prisma } from "@/lib/prisma";
import { renderTemplate, type AppointmentVars } from "./templates";

// Normalize Nigerian numbers to 234XXXXXXXXXX for WhatsApp / Termii.
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00234")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = "234" + digits.slice(1);
  if (digits.startsWith("234") && digits.length === 13) return digits;
  return null;
}

function looksLikeEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
}

export type Recipient = { phone: string | null; email: string | null; name: string };

// Best contact we have: member account → else the contact the guest typed
// into the request form (stored as "Contact: ..." in specialRequests).
export async function resolveRecipient(requestId: string): Promise<Recipient> {
  const request = await prisma.styleRequest.findUnique({
    where: { id: requestId },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  const fallback: Recipient = { phone: null, email: null, name: "" };
  if (!request) return fallback;

  let phone: string | null = null;
  let email: string | null = null;
  let name = "";

  if (request.user) {
    name = request.user.name.split(" ")[0] ?? "";
    email = request.user.email;
    if (request.user.phone) phone = normalizePhone(request.user.phone);
  }
  const contactMatch = request.specialRequests?.match(/Contact:\s*([^\n]+)/);
  const contact = contactMatch?.[1]?.trim();
  if (contact) {
    if (!email && looksLikeEmail(contact)) email = contact;
    if (!phone) {
      const maybePhone = normalizePhone(contact);
      if (maybePhone) phone = maybePhone;
    }
  }
  return { phone, email, name };
}

async function appointmentVars(appointmentId: string): Promise<AppointmentVars | null> {
  const a = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      request: { include: { hairstyle: true, user: { select: { name: true } } } },
      priceAgreement: true,
    },
  });
  if (!a) return null;
  const firstName = a.request.user?.name.split(" ")[0] ?? "";
  return {
    code: a.code,
    styleName: a.request.hairstyle?.name ?? a.request.customName ?? "Custom appointment",
    datetime: new Date(a.datetime).toLocaleString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }),
    deposit: a.priceAgreement.depositKobo,
    balance: a.priceAgreement.balanceKobo,
    total: a.priceAgreement.finalPriceKobo,
    location: a.locationSnapshot ?? "Hairven studio (address confirmed on WhatsApp)",
    customerName: firstName,
  };
}

async function sendWhatsApp(to: string, text: string): Promise<string> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error("missing-whatsapp-keys");
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
  if (!res.ok) throw new Error(`whatsapp-${res.status}:${(await res.text()).slice(0, 120)}`);
  const data = (await res.json()) as { messages?: { id: string }[] };
  return data.messages?.[0]?.id ?? "sent";
}

export async function sendEmail(to: string, subject: string, text: string): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("missing-email-keys");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) throw new Error(`email-${res.status}:${(await res.text()).slice(0, 120)}`);
  const data = (await res.json()) as { id?: string };
  return data.id ?? "sent";
}

async function sendSms(to: string, text: string): Promise<string> {
  const key = process.env.TERMII_API_KEY;
  const sender = process.env.TERMII_SENDER_ID;
  if (!key || !sender) throw new Error("missing-sms-keys");
  const res = await fetch("https://v3.api.termii.com/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, from: sender, sms: text.slice(0, 480), type: "plain", channel: "generic", api_key: key }),
  });
  if (!res.ok) throw new Error(`sms-${res.status}:${(await res.text()).slice(0, 120)}`);
  const data = (await res.json()) as { message_id?: string };
  return data.message_id ?? "sent";
}

export type SendResult =
  | { ok: true; providerRef: string }
  | { ok: false; error: string };

// Sends one queued Notification row. Never throws — failures are recorded
// on the row so Ese can see and retry them.
export async function sendOne(notificationId: string): Promise<SendResult> {
  const n = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!n || n.status === "sent") return { ok: true, providerRef: n?.providerRef ?? "already-sent" };
  try {
    if (!n.appointmentId) throw new Error("no-appointment");
    const vars = await appointmentVars(n.appointmentId);
    if (!vars) throw new Error("appointment-gone");
    const { subject, text } = renderTemplate(n.template, vars);
    const to = await resolveRecipient(
      (await prisma.appointment.findUnique({ where: { id: n.appointmentId } }))?.requestId ?? "",
    );

    let ref: string;
    if (n.channel === "whatsapp") {
      if (!to.phone) throw new Error("no-phone-number");
      ref = await sendWhatsApp(to.phone, text);
    } else if (n.channel === "email") {
      if (!to.email) throw new Error("no-email-address");
      ref = await sendEmail(to.email, subject, text);
    } else if (n.channel === "sms") {
      if (!to.phone) throw new Error("no-phone-number");
      ref = await sendSms(to.phone, text);
    } else {
      throw new Error(`unknown-channel:${n.channel}`);
    }
    await prisma.notification.update({
      where: { id: n.id },
      data: { status: "sent", providerRef: ref, sentAt: new Date() },
    });
    return { ok: true, providerRef: ref };
  } catch (err) {
    const error = err instanceof Error ? err.message : "unknown-error";
    await prisma.notification.update({
      where: { id: n.id },
      data: { status: "failed", providerRef: error.slice(0, 120) },
    });
    return { ok: false, error };
  }
}
