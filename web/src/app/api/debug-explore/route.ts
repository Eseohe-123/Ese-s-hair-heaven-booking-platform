import { NextResponse } from "next/server";

// TEMPORARY diagnostic — visit /api/debug-explore in the browser to see
// which step fails. Delete this file once /explore is fixed.
export async function GET() {
  const out: Record<string, unknown> = {
    envPresent: !!process.env.DATABASE_URL,
    envLen: (process.env.DATABASE_URL ?? "").length,
    nodeEnv: process.env.NODE_ENV,
  };
  try {
    const { prisma } = await import("@/lib/prisma");
    out.importOk = true;
    try {
      const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
      out.catsOk = true;
      out.catsCount = cats.length;
    } catch (e) {
      out.catsOk = false;
      out.catsError = e instanceof Error ? `${e.name}: ${e.message}`.slice(0, 500) : String(e).slice(0, 500);
    }
    try {
      const { getHairstyles } = await import("@/lib/catalog");
      const rows = await getHairstyles({});
      out.stylesOk = true;
      out.stylesCount = rows.length;
    } catch (e) {
      out.stylesOk = false;
      out.stylesError = e instanceof Error ? `${e.name}: ${e.message}`.slice(0, 500) : String(e).slice(0, 500);
    }
  } catch (e) {
    out.importOk = false;
    out.importError = e instanceof Error ? `${e.name}: ${e.message}`.slice(0, 500) : String(e).slice(0, 500);
  }
  return NextResponse.json(out);
}
