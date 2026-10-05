import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function cleanDbUrl(v: string | undefined) {
  if (!v) return v;
  let s = v.trim();
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function createClient() {
  const connectionString = cleanDbUrl(
    process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL,
  );
  const adapter = new PrismaPg({
    connectionString,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
