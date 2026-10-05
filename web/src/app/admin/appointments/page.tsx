import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { formatKobo } from "@/lib/money";
import { cancelBusiness, completeAppointment, markNoShow, rescheduleAppointment } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Appointments",
  robots: { index: false },
};

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "upcoming";
  const upcoming = ["pending_deposit", "secured", "reminded"];
  const appointments = await prisma.appointment.findMany({
    where: status === "all" ? {} : status === "upcoming" ? { status: { in: upcoming } } : { status },
    include: { request: { include: { hairstyle: true } }, priceAgreement: true },
    orderBy: { datetime: "asc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="ESE'S SIDE • DIARY"
        title="Appointments"
        sub="Complete visits, mark no-shows, reschedule or cancel. Money moves are audit-logged."
      />
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {["upcoming", "all", "completed", "cancelled_customer", "cancelled_business", "rescheduled", "no_show"].map((f) => (
          <Link
            key={f}
            href={f === "upcoming" ? "/admin/appointments" : `/admin/appointments?status=${f}`}
            className={`rounded-full px-4 py-2 text-sm font-bold ${(status === f || (f === "upcoming" && status === "upcoming")) ? "bg-plum-700 text-white" : "border-2 border-blush-100 bg-white text-cocoa-700"}`}
          >
            {f.replace(/_/g, " ")}
          </Link>
        ))}
      </div>
      <div className="space-y-4">
        {appointments.length === 0 && (
          <p className="rounded-2xl border border-blush-100 bg-white p-6 text-center text-cocoa-500">
            Nothing here. Agreements you finalise will appear as appointments.
          </p>
        )}
        {appointments.map((a) => (
          <div key={a.id} className="rounded-2xl border border-blush-100 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-extrabold text-plum-700">
                <Link href={`/appointments/${a.code}`} className="underline">{a.code}</Link>
                {" "}• {a.request.hairstyle?.name ?? a.request.customName ?? "Custom"}
              </p>
              <span className="rounded-full bg-blush-50 px-3 py-1 text-xs font-bold text-blush-700">
                {a.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-1 text-sm text-cocoa-500">
              {new Date(a.datetime).toLocaleString("en-NG")} • total {formatKobo(a.priceAgreement.finalPriceKobo)} •
              deposit {formatKobo(a.priceAgreement.depositKobo)}
            </p>
            {upcoming.includes(a.status) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={completeAppointment}>
                  <input type="hidden" name="appointmentId" value={a.id} />
                  <button type="submit" className="rounded-full bg-green-700 px-4 py-2 text-xs font-extrabold text-white">Complete</button>
                </form>
                <form action={markNoShow}>
                  <input type="hidden" name="appointmentId" value={a.id} />
                  <button type="submit" className="rounded-full border-2 border-gold-500 px-4 py-2 text-xs font-extrabold text-[#92400E]">No-show</button>
                </form>
                <form action={cancelBusiness}>
                  <input type="hidden" name="appointmentId" value={a.id} />
                  <button type="submit" className="rounded-full border-2 border-red-200 px-4 py-2 text-xs font-extrabold text-red-700">Cancel (100% refund)</button>
                </form>
                <form action={rescheduleAppointment} className="flex gap-2">
                  <input type="hidden" name="appointmentId" value={a.id} />
                  <input name="datetime" type="datetime-local" required className="rounded-full border-2 border-blush-100 px-3 py-1.5 text-xs" />
                  <button type="submit" className="rounded-full bg-plum-700 px-4 py-2 text-xs font-extrabold text-white">Reschedule</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
