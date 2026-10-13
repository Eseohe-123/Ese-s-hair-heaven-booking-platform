import { prisma } from "@/lib/prisma";
import { sendOne } from "./send";

// Sends every queued notification whose time has come.
// Safe to run on a schedule and from the admin "Send due now" button:
// already-sent rows are skipped, failures are recorded, never thrown.
export async function processDueNotifications(limit = 50): Promise<{
  attempted: number;
  sent: number;
  failed: { id: string; error: string }[];
}> {
  const due = await prisma.notification.findMany({
    where: {
      status: { in: ["queued", "failed"] },
      OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let sent = 0;
  const failed: { id: string; error: string }[] = [];
  for (const n of due) {
    const result = await sendOne(n.id);
    if (result.ok) sent++;
    else failed.push({ id: n.id, error: result.error });
  }
  return { attempted: due.length, sent, failed };
}
