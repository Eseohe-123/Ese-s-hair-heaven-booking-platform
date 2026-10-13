// One-off admin tool: grant owner/staff role to a member account.
// Usage (against any DB via DATABASE_URL env):
//   npx tsx prisma/promote-owner.ts user@example.com [owner|staff]
// Never commit real database URLs — pass via $env:DATABASE_URL.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = (process.argv[2] ?? "").toLowerCase().trim();
  const role = (process.argv[3] ?? "owner").toLowerCase().trim();
  if (!email || !["owner", "staff"].includes(role)) {
    console.log('USAGE: npx tsx prisma/promote-owner.ts user@example.com [owner|staff]');
    process.exit(2);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`NOT_FOUND: no account for ${email} on this database. Sign up first, then retry.`);
    process.exit(1);
  }
  await prisma.user.update({ where: { id: user.id }, data: { role } });
  console.log(`ROLE_SET:${email}:${role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
