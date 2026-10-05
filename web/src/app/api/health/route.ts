import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "up",
      service: "hairven-web",
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("healthcheck db failure", error);
    return NextResponse.json(
      { status: "degraded", db: "down", service: "hairven-web" },
      { status: 503 },
    );
  }
}
