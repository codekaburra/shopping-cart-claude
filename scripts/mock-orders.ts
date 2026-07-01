import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const NAMES = [
  "王小明", "李美玲", "張大偉", "陳雅婷", "林志豪",
  "黃淑芬", "劉建宏", "吳家豪", "蔡佩珊", "周俊傑",
  "鄭宇翔", "楊詩涵", "許文龍", "郭芳如", "謝宗翰",
  "洪雅琪", "蕭明哲", "葉靜宜", "呂品辰", "賴怡君",
];

const PHONES = [
  "0912345678", "0923456789", "0934567890", "0945678901", "0956789012",
  "0967890123", "0978901234", "0989012345", "0911223344", "0922334455",
];

const STATUSES = ["PENDING", "PAID", "COMPLETED"] as const;

function randomDate(monthsBack: number): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const ms = now.getTime() - start.getTime();
  return new Date(start.getTime() + Math.random() * ms);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  const variants = await prisma.productVariant.findMany({
    select: {
      id: true,
      priceCents: true,
      product: { select: { name: true } },
      size: true,
      sku: true,
    },
  });

  if (users.length === 0 || variants.length === 0) {
    console.error("No users or variants found. Run seed first.");
    process.exit(1);
  }

  console.log(`Found ${users.length} users, ${variants.length} variants`);
  console.log("Creating 1000 mock orders...");

  for (let i = 0; i < 1000; i++) {
    const date = randomDate(7);
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const chosenVariants = Array.from({ length: itemCount }, () => pick(variants));

    const statusRoll = Math.random();
    const status = date < new Date(Date.now() - 7 * 86400000)
      ? (statusRoll < 0.5 ? "COMPLETED" : statusRoll < 0.7 ? "PENDING_PICKUP" : statusRoll < 0.85 ? "PENDING_SHIPMENT" : statusRoll < 0.95 ? "PENDING_VERIFICATION" : "PENDING_PAYMENT")
      : (statusRoll < 0.2 ? "COMPLETED" : statusRoll < 0.4 ? "PENDING_PICKUP" : statusRoll < 0.6 ? "PENDING_SHIPMENT" : statusRoll < 0.8 ? "PENDING_VERIFICATION" : "PENDING_PAYMENT");

    const isDelivery = Math.random() < 0.3;

    await prisma.order.create({
      data: {
        userId: pick(users).id,
        contactName: pick(NAMES),
        contactPhone: pick(PHONES),
        fulfillment: isDelivery ? "DELIVERY" : "PICKUP",
        address: isDelivery ? "台北市信義區松壽路 " + Math.floor(Math.random() * 200 + 1) + " 號" : null,
        status,
        createdAt: date,
        items: {
          create: chosenVariants.map((v) => ({
            variantId: v.id,
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPriceCents: v.priceCents,
            productName: v.product.name,
            variantSize: v.size,
            sku: v.sku,
          })),
        },
      },
    });

    if ((i + 1) % 100 === 0) console.log(`  ${i + 1}/1000`);
  }

  console.log("Done! 1000 mock orders created.");
  await prisma.$disconnect();
}

main();
