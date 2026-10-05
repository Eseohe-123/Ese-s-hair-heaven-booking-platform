import { NextResponse } from "next/server";
import { siteLogo } from "@/lib/logo";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ logo: siteLogo() });
}
