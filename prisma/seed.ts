import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// Seeds only customers/invite codes. The product catalog is loaded separately
// via scripts/import-catalog.ts so it can be versioned and re-imported.
async function main() {
  await prisma.user.upsert({
    where: { inviteCode: "xxxx" },
    update: {},
    create: { inviteCode: "xxxx", displayName: "Demo customer" },
  });
  await prisma.user.upsert({
    where: { inviteCode: "demo2" },
    update: {},
    create: { inviteCode: "demo2", displayName: "Second customer" },
  });

  const userCount = await prisma.user.count();
  console.log(`Seeded ${userCount} users.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
