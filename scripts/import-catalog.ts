import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { catalog } from "../data/products/catalog-2026-06-17.js";
import {
  topCategoryEn,
  subCategoryEn,
  seriesEn,
} from "../data/products/translations-en.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// Chinese display labels for the top-level category codes used in the catalog.
const topCategoryLabels: Record<string, string> = {
  Pens: "筆類",
  Notebooks: "筆記簿",
  Tape: "膠帶",
  Paper: "紙品",
  Tools: "事務／工具",
  Refills: "補充／替芯",
};

async function main() {
  // Replace the whole catalog; customers/orders aside, this is the source of truth.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Cache category rows so shared codes/subcategories are created once.
  const topByCode = new Map<string, string>(); // code -> id
  const leafByKey = new Map<string, string>(); // `${topId}::${subName}` -> id

  async function ensureTop(code: string): Promise<string> {
    const cached = topByCode.get(code);
    if (cached) return cached;
    const row = await prisma.category.create({
      data: {
        name: code,
        displayName: topCategoryLabels[code] ?? code,
        displayNameEn: topCategoryEn[code] ?? code,
      },
    });
    topByCode.set(code, row.id);
    return row.id;
  }

  async function ensureLeaf(topId: string, subName: string): Promise<string> {
    const key = `${topId}::${subName}`;
    const cached = leafByKey.get(key);
    if (cached) return cached;
    const row = await prisma.category.create({
      data: {
        name: subName,
        displayName: subName,
        displayNameEn: subCategoryEn[subName] ?? subName,
        parentId: topId,
      },
    });
    leafByKey.set(key, row.id);
    return row.id;
  }

  let variantCount = 0;
  for (const series of catalog) {
    const topId = await ensureTop(series.category);
    const leafId = await ensureLeaf(topId, series.subCategory);
    const en = seriesEn[series.seriesId];

    await prisma.product.create({
      data: {
        seriesCode: series.seriesId,
        name: series.name,
        nameEn: en?.name ?? null,
        summary: series.summary,
        summaryEn: en?.summary ?? null,
        detail: series.detail,
        detailEn: en?.detail ?? null,
        material: series.material,
        materialEn: en?.material ?? null,
        accent: series.accent,
        categoryId: leafId,
        variants: {
          create: series.variants.map((v) => ({
            sku: v.productId,
            size: v.standard,
            priceCents: Math.round(v.price * 100),
            stock: v.stock,
          })),
        },
      },
    });
    variantCount += series.variants.length;
  }

  console.log(
    `Imported ${catalog.length} series, ${variantCount} variants, ` +
      `${topByCode.size} top categories, ${leafByKey.size} subcategories.`,
  );
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
