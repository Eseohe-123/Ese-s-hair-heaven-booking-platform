import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { prisma } from "@/lib/prisma";
import { formatKobo } from "@/lib/money";
import { submitManualPayment, cancelMyAppointment, submitReview } from "../actions";

export const metadata: Metadata = { title: "My appointment" };

export default async function AppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ submitted?: string; cancelled?: string; reviewed?: string }>;
}) {
  const { code } = await params;
  const query = await searchParams;
  const appointment = await prisma.appointment.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      request: { include: { hairstyle: true } },
      priceAgreement: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!appointment) notFound();

  const [refunds, existingReview, movedTo] = await Promise.all([
    prisma.refund.findMany({ where: { paymentId: { in: appointment.payments.map((p) => p.id) } } }),
    prisma.review.findUnique({ where: { appointmentId: appointment.id } }),
    prisma.appointment.findFirst({ where: { originalAppointmentId: appointment.id } }),
  ]);

  const agreement = appointment.priceAgreement;
  const policy = agreement.policySnapshot as {
    depositPct: number;
    cancelRetainPct: number;
    noticeHours: number;
  };
  const depositVerified = appointment.payments.some(
    (p) => p.type === "deposit" && p.status === "verified",
  );
  const pendingPayment = appointment.payments.find((p) => p.status === "pending");
  const cardEnabled = Boolean(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);

  const bankName = process.env.BANK_NAME || "Ask Ese on WhatsApp";
  const bankAccount = process.env.BANK_ACCOUNT_NUMBER || "—";
  const bankAccountName = process.env.BANK_ACCOUNT_NAME || "—";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        kicker={`APPOINTMENT ${appointment.code}`}
        title={appointment.request.hairstyle?.name ?? appointment.request.customName ?? "Custom appointment"}
        sub={`Status: ${appointment.status.replace(/_/g, " ")} • ${new Date(appointment.datetime).toLocaleString("en-NG")}`}
      />

      {query.submitted && (
        <p className="mb-4 rounded-2xl border-2 border-gold-500 bg-[#FEF9E7] p-4 text-sm font-bold text-[#92400E]">
          Reference received — Ese is verifying it. Your slot is secured once
          verified. Do not pay again while verification is pending.
        </p>
      )}

      <div className="rounded-[1.5rem] border border-blush-100 bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-plum-700">Agreed summary</h2>
        <dl className="mt-3 space-y-2 text-sm">
          {[
            ["Base price", agreement.basePriceKobo],
            ["Customisation", agreement.customKobo],
            ["Extensions / materials", agreement.extensionsKobo],
            ["Discount", -agreement.discountKobo],
          ].map(([label, kobo]) => (
            <div key={label as string} className="flex justify-between gap-4">
              <dt className="text-cocoa-500">{label}</dt>
              <dd className="font-bold">{formatKobo(kobo as number)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-blush-100 pt-2 text-base">
            <dt className="font-extrabold text-plum-700">Total</dt>
            <dd className="font-extrabold text-plum-700">{formatKobo(agreement.finalPriceKobo)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-extrabold text-plum-700">Deposit due ({policy.depositPct}%)</dt>
            <dd className="font-extrabold text-plum-700">{formatKobo(agreement.depositKobo)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-cocoa-500">Balance in studio</dt>
            <dd className="font-bold">{formatKobo(agreement.balanceKobo)}</dd>
          </div>
          {appointment.locationSnapshot && (
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa-500">Studio</dt>
              <dd className="font-bold">{appointment.locationSnapshot}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 rounded-2xl bg-blush-50 p-3 text-xs text-cocoa-700">
          Policy at agreement: {policy.depositPct}% deposit • customer cancel
          refunds {100 - policy.cancelRetainPct}% of the deposit • reschedule
          needs {policy.noticeHours}h notice. This snapshot cannot change after
          agreement.
        </p>
      </div>

      {!depositVerified && (
        <div className="mt-6 rounded-[1.5rem] bg-plum-700 p-6 text-white sm:p-8">
          <h2 className="font-display text-xl font-semibold">Secure your slot — {formatKobo(agreement.depositKobo)}</h2>
          {!cardEnabled && (
            <p className="mt-1 text-sm text-white/80">
              Card payments activate once Paystack keys are added. For now, pay
              by bank transfer:
            </p>
          )}
          <div className="mt-3 rounded-2xl bg-white/10 p-4 text-sm">
            <p><strong>Bank:</strong> {bankName}</p>
            <p><strong>Account:</strong> {bankAccount} ({bankAccountName})</p>
            <p><strong>Narration:</strong> {appointment.code}</p>
          </div>
          {pendingPayment ? (
            <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-bold">
              Reference “{pendingPayment.providerRef}” submitted and pending
              verification. Please wait — do not pay again.
            </p>
          ) : (
            <form action={submitManualPayment} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="appointmentCode" value={appointment.code} />
              <input
                name="reference"
                required
                placeholder="Transfer reference / sender name"
                className="flex-1 rounded-full px-5 py-3 text-sm font-bold text-cocoa-900 outline-none"
              />
              <button type="submit" className="rounded-full bg-blush-500 px-6 py-3 text-sm font-extrabold text-white hover:bg-blush-600">
                I have paid
              </button>
            </form>
          )}
        </div>
      )}

      {appointment.payments.length > 0 && (
        <div className="mt-6 rounded-[1.5rem] border border-blush-100 bg-white p-6">
          <h2 className="font-display text-xl font-semibold text-plum-700">Payments &amp; receipt</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {appointment.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2 border-b border-blush-100 pb-2">
                <span>
                  <strong className="capitalize">{p.type}</strong> • {formatKobo(p.amountKobo)} • {p.method}
                  {p.providerRef && <span className="text-cocoa-500"> • ref {p.providerRef}</span>}
                </span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${p.status === "verified" ? "bg-green-100 text-green-800" : p.status === "failed" ? "bg-red-100 text-red-800" : "bg-[#FEF3C7] text-[#92400E]"}`}>
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
          {depositVerified && (
            <p className="mt-3 text-sm font-bold text-green-800">
              Deposit verified — appointment secured. Receipt ref: {appointment.payments.find((p) => p.type === "deposit" && p.status === "verified")?.id.slice(0, 8).toUpperCase()}. Outstanding balance: {formatKobo(agreement.balanceKobo)}.
            </p>
          )}
        </div>
      )}

      {query.cancelled && (
        <p className="mb-4 rounded-2xl border-2 border-blush-500 bg-blush-50 p-4 text-sm font-bold text-plum-700">
          Cancelled. If you paid a deposit, your refund request is recorded
          below — Ese will process it to your original payment method.
        </p>
      )}
      {query.reviewed && (
        <p className="mb-4 rounded-2xl border-2 border-green-300 bg-green-50 p-4 text-sm font-bold text-green-800">
          Thank you! Your review is in moderation and will appear in Customer
          Looks once approved.
        </p>
      )}
      {movedTo && (
        <p className="mb-4 rounded-2xl border-2 border-gold-500 bg-[#FEF9E7] p-4 text-sm font-bold text-[#92400E]">
          This appointment was rescheduled — your new appointment is{" "}
          <a href={`/appointments/${movedTo.code}`} className="underline">{movedTo.code}</a>.
          Your deposit moved with it; no duplicate payment needed.
        </p>
      )}

      <div className="mt-6 text-center">
        <Button href={`/track/${appointment.request.code}`} variant="outline">
          Back to my request
        </Button>
      </div>

      {["pending_deposit", "secured"].includes(appointment.status) && (
        <form action={cancelMyAppointment} className="mt-6 rounded-[1.5rem] border border-blush-100 bg-white p-6 text-center">
          <input type="hidden" name="appointmentCode" value={appointment.code} />
          <p className="text-sm font-extrabold text-plum-700">Need to cancel?</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-cocoa-500">
            {policy.cancelRetainPct}% of your paid deposit is retained, the rest
            is refunded. Rescheduling instead? Contact Ese — no penalty when Ese
            moves you.
          </p>
          <button type="submit" className="mt-3 rounded-full border-2 border-red-200 px-5 py-2 text-sm font-extrabold text-red-700">
            Cancel this appointment
          </button>
        </form>
      )}

      {refunds.length > 0 && (
        <div className="mt-6 rounded-[1.5rem] border border-blush-100 bg-white p-6">
          <h2 className="font-display text-xl font-semibold text-plum-700">Refunds</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {refunds.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-blush-100 pb-2">
                <span>{r.reason} — refundable {formatKobo(r.refundableKobo)} (retained {formatKobo(r.retainedKobo)})</span>
                <span className="rounded-full bg-[#FEF3C7] px-3 py-0.5 text-xs font-bold text-[#92400E]">{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {appointment.status === "completed" && !existingReview && (
        <form action={submitReview} className="mt-6 rounded-[1.5rem] border border-blush-100 bg-white p-6">
          <input type="hidden" name="appointmentCode" value={appointment.code} />
          <h2 className="font-display text-xl font-semibold text-plum-700">How was your visit?</h2>
          <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Star rating">
            {[5, 4, 3, 2, 1].map((n) => (
              <label key={n} className="cursor-pointer rounded-full border-2 border-blush-100 px-4 py-2 text-sm font-extrabold text-plum-700 has-checked:border-blush-500 has-checked:bg-blush-50">
                <input type="radio" name="rating" value={n} defaultChecked={n === 5} className="mr-1 accent-[#e05286]" />
                {n}★
              </label>
            ))}
          </div>
          <textarea name="text" rows={3} placeholder="Tell others about your experience (optional)" className="mt-3 w-full rounded-2xl border-2 border-blush-100 bg-white px-4 py-3 text-sm outline-none placeholder:text-cocoa-500 focus:border-blush-500" />
          <label className="mt-3 flex items-start gap-2 text-sm text-cocoa-700">
            <input type="checkbox" name="permission" className="mt-1 accent-[#e05286]" />
            Hairven may feature my review (and name) on the homepage and Customer Looks.
          </label>
          <button type="submit" className="mt-4 w-full rounded-full bg-plum-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-plum-900">
            Leave review
          </button>
        </form>
      )}
      {existingReview && (
        <p className="mt-6 rounded-2xl bg-blush-50 p-4 text-center text-sm font-bold text-plum-700">
          You rated this visit {existingReview.rating}★ — thank you!
        </p>
      )}
    </div>
  );
}
