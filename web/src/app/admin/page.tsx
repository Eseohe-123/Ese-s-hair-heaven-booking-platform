import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Ese's dashboard",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const [newRequests, pendingPayments, upcoming, pendingReviews, queuedNotes] = await Promise.all([
    prisma.styleRequest.count({ where: { status: "submitted" } }),
    prisma.payment.count({ where: { status: "pending" } }),
    prisma.appointment.count({ where: { status: { in: ["pending_deposit", "secured", "reminded"] } } }),
    prisma.review.count({ where: { status: "pending" } }),
    prisma.notification.count({ where: { status: { in: ["queued", "failed"] } } }),
  ]);

  const cards = [
    { href: "/admin/requests", title: "Requests inbox", desc: "Consult, agree price + time, create appointments.", badge: newRequests > 0 ? `${newRequests} new` : null },
    { href: "/admin/payments", title: "Payments", desc: "Verify transfer references. Verification secures the slot.", badge: pendingPayments > 0 ? `${pendingPayments} to verify` : null },
    { href: "/admin/appointments", title: "Appointments", desc: "Complete visits, no-show, reschedule, cancel.", badge: upcoming > 0 ? `${upcoming} upcoming` : null },
    { href: "/admin/reviews", title: "Reviews", desc: "Approve customer reviews into Customer Looks.", badge: pendingReviews > 0 ? `${pendingReviews} waiting` : null },
    { href: "/admin/photos", title: "Style photos", desc: "Upload hairstyle photos + logo instructions.", badge: null },
    { href: "/admin/notifications", title: "Notifications", desc: "Reminder queue + send everything due now.", badge: queuedNotes > 0 ? `${queuedNotes} queued` : null },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="ESE'S SIDE"
        title="Dashboard"
        sub="Everything waiting for you, in one place."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-[1.5rem] border border-blush-100 bg-white p-6 shadow-[0_10px_30px_rgba(107,33,72,0.08)] transition-shadow hover:shadow-[0_10px_30px_rgba(107,33,72,0.18)]"
          >
            <p className="font-display text-xl font-semibold text-plum-700">{c.title}</p>
            <p className="mt-1 text-sm text-cocoa-500">{c.desc}</p>
            {c.badge ? (
              <span className="mt-3 inline-block rounded-full bg-blush-500 px-3 py-1 text-xs font-extrabold text-white">
                {c.badge}
              </span>
            ) : (
              <span className="mt-3 inline-block rounded-full bg-blush-50 px-3 py-1 text-xs font-bold text-cocoa-500">
                All clear
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
