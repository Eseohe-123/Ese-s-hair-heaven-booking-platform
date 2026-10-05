import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Paystack webhook — live once PAYSTACK_SECRET_KEY is set.
// Until then this route returns 503 with a clear message.
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Card payments not configured. Use manual transfer flow." },
      { status: 503 },
    );
  }

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  const valid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return NextResponse.json({ error: "Bad signature" }, { status: 401 });

  const event = JSON.parse(raw) as { event: string; data: { reference: string; status: string } };
  if (event.event === "charge.success") {
    const payment = await prisma.payment.findUnique({
      where: { providerRef: event.data.reference },
      include: { appointment: true },
    });
    if (payment && payment.status !== "verified") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "verified", verifiedBy: "paystack", settledAt: new Date() },
      });
      if (payment.type === "deposit") {
        await prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: "secured" },
        });
      }
      await prisma.auditLog.create({
        data: {
          entity: "payment",
          entityId: payment.id,
          oldValue: { status: payment.status },
          newValue: { status: "verified" },
          changedBy: "paystack",
          reason: `Webhook charge.success ${event.data.reference}`,
        },
      });
    }
  }
  return NextResponse.json({ received: true });
}
