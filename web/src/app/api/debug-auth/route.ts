import { NextResponse } from "next/server";

// TEMPORARY diagnostic — shows only presence/length, never secret values.
export async function GET() {
  const secret = process.env.BETTER_AUTH_SECRET ?? "";
  return NextResponse.json({
    secretPresent: secret.length > 0,
    secretLen: secret.length,
    authUrl: process.env.BETTER_AUTH_URL ?? null,
    nodeEnv: process.env.NODE_ENV,
  });
}
