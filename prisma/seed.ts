import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Test customers — invite code "xxxx" is just a human-friendly label; UUID is the key.
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

  // Categories
  const writing = await prisma.category.upsert({
    where: { name: "書寫工具" },
    update: {},
    create: { name: "書寫工具" },
  });
  const paper = await prisma.category.upsert({
    where: { name: "紙品筆記" },
    update: {},
    create: { name: "紙品筆記" },
  });
  const adhesive = await prisma.category.upsert({
    where: { name: "黏貼用品" },
    update: {},
    create: { name: "黏貼用品" },
  });

  // Helper: create a product series with its size variants.
  async function createSeries(opts: {
    seriesCode: string;
    name: string;
    description: string;
    categoryId: string;
    variants: { size: string; priceCents: number }[];
  }) {
    const product = await prisma.product.upsert({
      where: { seriesCode: opts.seriesCode },
      update: {},
      create: {
        seriesCode: opts.seriesCode,
        name: opts.name,
        description: opts.description,
        categoryId: opts.categoryId,
      },
    });
    for (const v of opts.variants) {
      const sku = `${opts.seriesCode}-${v.size}`;
      await prisma.productVariant.upsert({
        where: { sku },
        update: { priceCents: v.priceCents },
        create: {
          productId: product.id,
          sku,
          size: v.size,
          priceCents: v.priceCents,
        },
      });
    }
  }

  await createSeries({
    seriesCode: "NB-100",
    name: "牛皮硬皮筆記本",
    categoryId: paper.id,
    description: "100gsm 米色內頁，線裝平攤，適合日常書寫與繪圖。",
    variants: [
      { size: "A4", priceCents: 6800 },
      { size: "A5", priceCents: 4800 },
      { size: "B5", priceCents: 5800 },
    ],
  });

  await createSeries({
    seriesCode: "PEN-200",
    name: "順滑中性筆",
    categoryId: writing.id,
    description: "速乾墨水，書寫順滑不卡頓，黑色墨水。",
    variants: [
      { size: "0.5mm", priceCents: 1200 },
      { size: "0.7mm", priceCents: 1200 },
    ],
  });

  await createSeries({
    seriesCode: "TAPE-300",
    name: "和紙裝飾膠帶",
    categoryId: adhesive.id,
    description: "易撕易貼，可重複黏貼，適合手帳裝飾。",
    variants: [
      { size: "15mm", priceCents: 1500 },
      { size: "30mm", priceCents: 2500 },
    ],
  });

  await createSeries({
    seriesCode: "FILE-400",
    name: "透明文件夾",
    categoryId: paper.id,
    description: "PP 材質，耐用防水，11 孔可放入活頁夾。",
    variants: [{ size: "A4", priceCents: 900 }],
  });

  const userCount = await prisma.user.count();
  const variantCount = await prisma.productVariant.count();
  console.log(`Seeded ${userCount} users and ${variantCount} variants.`);
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
