"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { quoteAgreement, toKobo, type Policy } from "@/lib/money";
import { generateAppointmentCode } from "@/lib/requests";

// TODO Phase 7: gate all admin actions behind owner/staff role. Local dev only.

export async function createAgreement(formData: FormData): Promise<void> {
  const requestCode = (formData.get("requestCode") as string).toUpperCase();
  const baseKobo = toKobo(Number(formData.get("baseNaira") || 0));
  const customKobo = toKobo(Number(formData.get("customNaira") || 0));
  const extensionsKobo = toKobo(Number(formData.get("extensionsNaira") || 0));
  const discountKobo = toKobo(Number(formData.get("discountNaira") || 0));
  const datetimeRaw = formData.get("datetime") as string;
  const location = ((formData.get("location") as string) || "").trim();
  const notes = ((formData.get("notes") as string) || "").trim();

  if (!datetimeRaw) throw new Error("Appointment date and time are required.");
  if (baseKobo <= 0) throw new Error("Base price must be above zero.");

  const request = await prisma.styleRequest.findUnique({
    where: { code: requestCode },
    include: { priceAgreement: true },
  });
  if (!request) throw new Error("Request not found.");
  if (request.priceAgreement) throw new Error("This request already has a price agreement.");

  const policy = await prisma.businessPolicy.findFirst({
    orderBy: { effectiveFrom: "desc" },
  });
  if (!policy) throw new Error("No business policy configured.");

  const quote = quoteAgreement(policy as Policy, {
    baseKobo,
    customKobo,
    extensionsKobo,
    discountKobo,
  });

  const agreement = await prisma.priceAgreement.create({
    data: {
      requestId: request.id,
      basePriceKobo: baseKobo,
      customKobo,
      extensionsKobo,
      discountKobo,
      finalPriceKobo: quote.finalPriceKobo,
      depositKobo: quote.depositKobo,
      balanceKobo: quote.balanceKobo,
      policySnapshot: JSON.parse(JSON.stringify(policy)),
      notes: notes || null,
      createdBy: "ese",
      approvedAt: new Date(),
    },
  });

  const appointment = await prisma.appointment.create({
    data: {
      code: await generateAppointmentCode(),
      requestId: request.id,
      priceAgreementId: agreement.id,
      datetime: new Date(datetimeRaw),
      status: "pending_deposit",
      locationSnapshot: location || null,
    },
  });

  await prisma.styleRequest.update({
    where: { id: request.id },
    data: { status: "agreed" },
  });

  await prisma.notification.create({
    data: { appointmentId: appointment.id, channel: "whatsapp", template: "deposit_due", status: "queued" },
  });

  await prisma.auditLog.create({
    data: {
      entity: "price_agreement",
      entityId: agreement.id,
      newValue: JSON.parse(JSON.stringify({ ...agreement, appointmentCode: appointment.code })),
      changedBy: "ese",
      reason: `Agreement + appointment ${appointment.code} created for ${requestCode}`,
    },
  });

  redirect(`/appointments/${appointment.code}`);
}

export async function verifyPayment(formData: FormData): Promise<void> {
  const paymentId = formData.get("paymentId") as string;
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { appointment: true },
  });
  if (!payment) throw new Error("Payment not found.");
  if (payment.status === "verified") throw new Error("Already verified.");

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "verified", verifiedBy: "ese", settledAt: new Date() },
  });

  if (payment.type === "deposit") {
    await prisma.appointment.update({
      where: { id: payment.appointmentId },
      data: { status: "secured" },
    });
    const secured = await prisma.appointment.findUnique({ where: { id: payment.appointmentId } });
    if (secured) {
      await notify(payment.appointmentId, "secured");
      await scheduleReminders(payment.appointmentId, secured.datetime);
    }
  }

  await prisma.auditLog.create({
    data: {
      entity: "payment",
      entityId: paymentId,
      oldValue: { status: payment.status },
      newValue: { status: "verified" },
      changedBy: "ese",
      reason: `Verified ${payment.type} of ${payment.amountKobo} kobo for ${payment.appointment.code}`,
    },
  });

  redirect("/admin/payments");
}

export async function rejectPayment(formData: FormData): Promise<void> {
  const paymentId = formData.get("paymentId") as string;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found.");

  await prisma.payment.update({ where: { id: paymentId }, data: { status: "failed" } });
  await prisma.auditLog.create({
    data: {
      entity: "payment",
      entityId: paymentId,
      oldValue: { status: payment.status },
      newValue: { status: "failed" },
      changedBy: "ese",
      reason: "Rejected after verification check",
    },
  });

  redirect("/admin/payments");
}

async function notify(appointmentId: string, template: string, channel = "whatsapp") {
  await prisma.notification.create({ data: { appointmentId, channel, template, status: "queued" } });
}

export async function scheduleReminders(appointmentId: string, when: Date) {
  const day = 86400000;
  const slots: [string, number][] = [
    ["reminder_3d", when.getTime() - 3 * day],
    ["reminder_1d", when.getTime() - 1 * day],
    ["reminder_day", when.getTime() - 4 * 3600000],
  ];
  for (const [template, at] of slots) {
    if (at < Date.now()) continue;
    const exists = await prisma.notification.findFirst({ where: { appointmentId, template } });
    if (!exists) {
      await prisma.notification.create({
        data: { appointmentId, channel: "whatsapp", template, status: "queued", scheduledFor: new Date(at) },
      });
    }
  }
}

export async function completeAppointment(formData: FormData): Promise<void> {
  const appointmentId = formData.get("appointmentId") as string;
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { priceAgreement: true, request: true },
  });
  if (!appointment) throw new Error("Appointment not found.");
  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "completed" } });
  await notify(appointmentId, "review_ask");
  // Loyalty: 1 point per ₦1,000 of final price.
  if (appointment.request.userId) {
    const points = Math.floor(appointment.priceAgreement.finalPriceKobo / 100000);
    if (points > 0) {
      await prisma.loyaltyLedger.create({
        data: { userId: appointment.request.userId, points, reason: `Visit ${appointment.code}`, appointmentId },
      });
    }
  }
  await prisma.auditLog.create({
    data: { entity: "appointment", entityId: appointmentId, oldValue: { status: appointment.status }, newValue: { status: "completed" }, changedBy: "ese", reason: "Visit completed" },
  });
  redirect("/admin/appointments");
}

export async function markNoShow(formData: FormData): Promise<void> {
  const appointmentId = formData.get("appointmentId") as string;
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) throw new Error("Appointment not found.");
  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "no_show" } });
  await prisma.auditLog.create({
    data: { entity: "appointment", entityId: appointmentId, oldValue: { status: appointment.status }, newValue: { status: "no_show" }, changedBy: "ese", reason: "Customer did not show up" },
  });
  redirect("/admin/appointments");
}

export async function cancelBusiness(formData: FormData): Promise<void> {
  const appointmentId = formData.get("appointmentId") as string;
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payments: true },
  });
  if (!appointment) throw new Error("Appointment not found.");
  const deposit = appointment.payments.find((p) => p.type === "deposit" && p.status === "verified");
  if (deposit) {
    await prisma.refund.create({
      data: { paymentId: deposit.id, reason: "Cancelled by Hairven", retainedKobo: 0, refundableKobo: deposit.amountKobo, approvedBy: "ese", status: "approved" },
    });
  }
  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "cancelled_business" } });
  await notify(appointmentId, "cancelled");
  // Reverse loyalty earned on this visit, if any.
  const earned = await prisma.loyaltyLedger.findFirst({ where: { appointmentId } });
  if (earned && appointment.requestId) {
    const req = await prisma.styleRequest.findUnique({ where: { id: appointment.requestId } });
    if (req?.userId) {
      await prisma.loyaltyLedger.create({
        data: { userId: req.userId, points: -earned.points, reason: `Reversed — ${appointment.code} cancelled`, appointmentId },
      });
    }
  }
  await prisma.auditLog.create({
    data: { entity: "appointment", entityId: appointmentId, oldValue: { status: appointment.status }, newValue: { status: "cancelled_business" }, changedBy: "ese", reason: "Cancelled by Hairven — 100% deposit refund" },
  });
  redirect("/admin/appointments");
}

export async function rescheduleAppointment(formData: FormData): Promise<void> {
  const appointmentId = formData.get("appointmentId") as string;
  const datetimeRaw = formData.get("datetime") as string;
  if (!datetimeRaw) throw new Error("New date and time required.");
  const original = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payments: true, priceAgreement: true },
  });
  if (!original) throw new Error("Appointment not found.");
  if (!["pending_deposit", "secured"].includes(original.status)) {
    throw new Error("Only upcoming appointments can be rescheduled.");
  }
  const policy = await prisma.businessPolicy.findFirst({ orderBy: { effectiveFrom: "desc" } });
  const feeKobo = policy?.rescheduleFeeKobo ?? 0;
  const deposit = original.payments.find((p) => p.type === "deposit" && p.status === "verified");
  const carried = deposit ? deposit.amountKobo : 0;

  const next = await prisma.appointment.create({
    data: {
      code: await generateAppointmentCode(),
      requestId: original.requestId,
      priceAgreementId: original.priceAgreementId,
      datetime: new Date(datetimeRaw),
      status: carried > 0 ? "secured" : "pending_deposit",
      locationSnapshot: original.locationSnapshot,
      originalAppointmentId: original.id,
    },
  });
  if (feeKobo > 0) {
    await prisma.payment.create({
      data: { appointmentId: next.id, type: "reschedule_fee", amountKobo: feeKobo, method: "transfer", provider: "bank", status: "pending" },
    });
  }
  await prisma.reschedule.create({
    data: { originalAppointmentId: original.id, newAppointmentId: next.id, feeKobo, depositCarriedKobo: carried, createdBy: "ese" },
  });
  await prisma.appointment.update({ where: { id: original.id }, data: { status: "rescheduled" } });
  await notify(next.id, "rescheduled");
  await prisma.auditLog.create({
    data: { entity: "appointment", entityId: original.id, oldValue: { status: original.status }, newValue: { status: "rescheduled", to: next.code }, changedBy: "ese", reason: `Rescheduled to ${next.code}, deposit carried ${carried} kobo` },
  });
  redirect(`/appointments/${next.code}`);
}

export async function moderateReview(formData: FormData): Promise<void> {
  const reviewId = formData.get("reviewId") as string;
  const status = formData.get("status") as string;
  if (!["approved", "rejected"].includes(status)) throw new Error("Invalid moderation decision.");
  await prisma.review.update({ where: { id: reviewId }, data: { status } });
  redirect("/admin/reviews");
}
