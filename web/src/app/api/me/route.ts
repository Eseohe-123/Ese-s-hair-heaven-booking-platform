import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// Minimal identity probe for owner-only UI. No personal data beyond role.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ signedIn: false, role: null });
  return NextResponse.json({
    signedIn: true,
    role: (user as { role?: string }).role ?? "customer",
  });
}
