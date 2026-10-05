"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { customerCancelSplit, type Policy } from "@/lib/money";

export async function submitManualPayment(formData: FormData): Promise<void> {
  const appointmentCode = (formData.get("appointmentCode") as string).toUpperCase();
  const reference = ((formData.get("reference") as string) || "").trim();

  if (!reference) throw new Error("Enter the transfer reference.");

  const appointment = await prisma.appointment.findUnique({
    where: { code: appointmentCode },
    include: { priceAgreement: true, payments: true },
  });
  if (!appointment) throw new Error("Appointment not found.");
  if (appointment.status !== "pending_deposit") {
    throw new Error("This appointment is no longer awaiting a deposit.");
  }
  const alreadyVerified = appointment.payments.some(
    (p) => p.type === "deposit" && p.status === "verified",
  );
  if (alreadyVerified) throw new Error("Deposit already verified.");
  const duplicateRef = await prisma.payment.findUnique({ where: { providerRef: reference } });
  if (duplicateRef) throw new Error("This reference was already submitted — Ese is verifying it. Do not pay again.");

  await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      type: "deposit",
      amountKobo: appointment.priceAgreement.depositKobo,
      method: "transfer",
      provider: "bank",
      providerRef: reference,
      status: "pending",
    },
  });

  redirect(`/appointments/${appointment.code}?submitted=1`);
}

export async function cancelMyAppointment(formData: FormData): Promise<void> {
  const appointmentCode = (formData.get("appointmentCode") as string).toUpperCase();
  const appointment = await prisma.appointment.findUnique({
    where: { code: appointmentCode },
    include: { payments: true },
  });
  if (!appointment) throw new Error("Appointment not found.");
  if (!["pending_deposit", "secured"].includes(appointment.status)) {
    throw new Error("This appointment can no longer be cancelled online — please contact Ese.");
  }
  const deposit = appointment.payments.find((p) => p.type === "deposit" && p.status === "verified");
  const policy = (await prisma.businessPolicy.findFirst({ orderBy: { effectiveFrom: "desc" } })) as unknown as Policy | null;

  if (deposit && policy) {
    const split = customerCancelSplit(policy, deposit.amountKobo);
    await prisma.refund.create({
      data: {
        paymentId: deposit.id,
        reason: "Customer cancellation",
        retainedKobo: split.retainedKobo,
        refundableKobo: split.refundableKobo,
        status: "requested",
      },
    });
  }
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "cancelled_customer" },
  });
  // Reverse loyalty earned on this visit, if any.
  const linked = await prisma.styleRequest.findUnique({ where: { id: appointment.requestId } });
  if (linked?.userId) {
    const earned = await prisma.loyaltyLedger.findFirst({ where: { appointmentId: appointment.id } });
    if (earned) {
      await prisma.loyaltyLedger.create({
        data: { userId: linked.userId, points: -earned.points, reason: `Reversed — ${appointmentCode} cancelled`, appointmentId: appointment.id },
      });
    }
  }
  await prisma.notification.create({
    data: { appointmentId: appointment.id, channel: "whatsapp", template: "cancelled", status: "queued" },
  });
  await prisma.auditLog.create({
    data: { entity: "appointment", entityId: appointment.id, oldValue: { status: appointment.status }, newValue: { status: "cancelled_customer" }, changedBy: "customer", reason: `Customer cancelled ${appointmentCode}` },
  });
  redirect(`/appointments/${appointmentCode}?cancelled=1`);
}

export async function submitReview(formData: FormData): Promise<void> {
  const appointmentCode = (formData.get("appointmentCode") as string).toUpperCase();
  const rating = Number(formData.get("rating") || 0);
  const text = ((formData.get("text") as string) || "").trim();
  const permission = formData.get("permission") === "on";
  if (rating < 1 || rating > 5) throw new Error("Pick a star rating from 1 to 5.");

  const appointment = await prisma.appointment.findUnique({
    where: { code: appointmentCode },
    include: { payments: true, priceAgreement: true },
  });
  if (!appointment) throw new Error("Appointment not found.");
  if (appointment.status !== "completed") throw new Error("Reviews open after your visit is completed.");
  const existing = await prisma.review.findUnique({ where: { appointmentId: appointment.id } });
  if (existing) throw new Error("You already reviewed this visit. Thank you!");

  await prisma.review.create({
    data: { appointmentId: appointment.id, rating, text: text || null, permissionToFeature: permission, status: "pending" },
  });
  redirect(`/appointments/${appointmentCode}?reviewed=1`);
}
