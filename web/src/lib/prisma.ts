import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function cleanDbUrl(v: string | undefined) {
  if (!v) return v;
  let s = v.trim();
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

// Lazy client: module import must NEVER throw (Netlify Functions would
// crash the whole route before callers' try/catch can fall back).
let _client: PrismaClient | null = null;

function getClient(): PrismaClient {
  if (!_client) {
    const connectionString = cleanDbUrl(
      process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL,
    );
    if (!connectionString) throw new Error("DATABASE_URL missing at runtime");
    const adapter = new PrismaPg({ connectionString });
    _client = new PrismaClient({ adapter });
  }
  return _client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_t, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const v = c[prop as string];
    return typeof v === "function" ? (v as Function).bind(c) : v;
  },
});
