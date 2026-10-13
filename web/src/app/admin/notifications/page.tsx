import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { sendDueNotifications } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Notifications log",
  robots: { index: false },
};

export default async function AdminNotificationsPage() {
  const notes = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="ESE'S SIDE • COMMS"
        title="Notifications"
        sub="Queued reminders and updates. Actual WhatsApp / email / SMS sending activates when provider keys are added — the queue and schedule are already real."
      />
      <form action={sendDueNotifications} className="mb-6 text-center">
        <button type="submit" className="rounded-full bg-plum-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-plum-900">
          Send everything due now
        </button>
        <p className="mt-2 text-xs text-cocoa-500">
          Same job the 15-minute scheduler runs. Failures are recorded below with the reason.
        </p>
      </form>
      <div className="space-y-2">
        {notes.length === 0 && (
          <p className="rounded-2xl border border-blush-100 bg-white p-6 text-center text-cocoa-500">
            Nothing queued yet — entries appear when agreements are finalised and deposits verified.
          </p>
        )}
        {notes.map((n) => (
          <div key={n.id} className="flex flex-wrap justify-between gap-2 rounded-2xl border border-blush-100 bg-white px-4 py-3 text-sm">
            <span>
              <strong className="text-plum-700">{n.template.replace(/_/g, " ")}</strong>
              <span className="text-cocoa-500"> • {n.channel}</span>
            </span>
            <span className="text-cocoa-500">
              {n.status}
              {n.providerRef && n.status === "failed" && ` • ${n.providerRef}`}
              {n.scheduledFor && ` • due ${new Date(n.scheduledFor).toLocaleString("en-NG")}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
