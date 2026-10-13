import { NextResponse } from "next/server";
import { processDueNotifications } from "@/lib/notify/process";

// POST /api/cron/reminders with header: Authorization: Bearer <CRON_SECRET>
// Point a scheduler (Windows Task Scheduler, cron, or UptimeRobot) here
// every 15 minutes. Without the secret it returns 401.
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Reminders not configured (CRON_SECRET missing)." }, { status: 503 });
  }
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (given !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processDueNotifications();
  return NextResponse.json({ ok: true, ...result });
}
