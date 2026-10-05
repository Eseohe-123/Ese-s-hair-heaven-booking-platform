import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { formatKobo } from "@/lib/money";
import { rejectPayment, verifyPayment } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Payments to verify",
  robots: { index: false },
};

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { appointment: { select: { code: true } } },
  });
  const pending = payments.filter((p) => p.status === "pending");

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="ESE'S SIDE • MONEY"
        title="Payments"
        sub={`${pending.length} awaiting verification. Verify against the bank statement before confirming.`}
      />
      <div className="space-y-3">
        {payments.length === 0 && (
          <p className="rounded-2xl border border-blush-100 bg-white p-6 text-center text-cocoa-500">
            No payments yet — submitted transfer references will appear here.
          </p>
        )}
        {payments.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blush-100 bg-white p-4">
            <div className="text-sm">
              <p className="font-extrabold text-plum-700">
                {p.appointment.code} — <span className="capitalize">{p.type}</span> {formatKobo(p.amountKobo)}
              </p>
              <p className="text-cocoa-500">
                {p.method}{p.providerRef && ` • ref ${p.providerRef}`} •{" "}
                {new Date(p.createdAt).toLocaleString("en-NG")} • {p.status}
              </p>
            </div>
            {p.status === "pending" && (
              <div className="flex gap-2">
                <form action={verifyPayment}>
                  <input type="hidden" name="paymentId" value={p.id} />
                  <button type="submit" className="rounded-full bg-green-700 px-4 py-2 text-xs font-extrabold text-white">
                    Verify
                  </button>
                </form>
                <form action={rejectPayment}>
                  <input type="hidden" name="paymentId" value={p.id} />
                  <button type="submit" className="rounded-full border-2 border-red-200 px-4 py-2 text-xs font-extrabold text-red-700">
                    Reject
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
