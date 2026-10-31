// Shared fixtures for the API route tests.
//
// Tests replace `next/headers` with ./cookie-jar (see the vi.mock in each
// test file). Tokens put in the jar are real signed tokens, so the auth checks
// under test run unmodified.
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-session";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";
import { cookieJar } from "./cookie-jar";

export { cookieJar };

export async function loginAsAdmin() {
  cookieJar.set(ADMIN_COOKIE, await createAdminToken());
}

export async function loginAsCustomer(userId: string, code: string) {
  cookieJar.set(SESSION_COOKIE, await createSessionToken(userId, code));
}

/** A request whose body is sent verbatim — pass a string to send invalid JSON. */
export function jsonRequest(method: string, path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

export async function resetDb() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  cookieJar.clear();
}

/**
 * Two customers, one variant, and two orders (one each) with two and one
 * line items. Returns the ids tests need.
 */
export async function seed() {
  const alice = await prisma.user.create({ data: { inviteCode: "alice" } });
  const bob = await prisma.user.create({ data: { inviteCode: "bob" } });
  const product = await prisma.product.create({
    data: { seriesCode: "S1", name: "原子筆" },
  });
  const variant = await prisma.productVariant.create({
    data: { productId: product.id, sku: "SKU-1", size: "0.5mm", priceCents: 1800 },
  });
  const line = (quantity: number) => ({
    variantId: variant.id,
    quantity,
    unitPriceCents: 1800,
    productName: "原子筆",
    variantSize: "0.5mm",
    sku: "SKU-1",
  });
  const orderA = await prisma.order.create({
    data: {
      userId: alice.id,
      contactName: "Alice",
      contactPhone: "0911",
      fulfillment: "PICKUP",
      status: "PENDING_SHIPMENT",
      items: { create: [line(4), line(5)] },
    },
    include: { items: { orderBy: { quantity: "asc" } } },
  });
  const orderB = await prisma.order.create({
    data: {
      userId: bob.id,
      contactName: "Bob",
      contactPhone: "0922",
      fulfillment: "PICKUP",
      items: { create: [line(1)] },
    },
    include: { items: true },
  });
  return {
    alice,
    bob,
    variant,
    orderA,
    orderB,
    itemA1: orderA.items[0], // quantity 4
    itemA2: orderA.items[1], // quantity 5
    itemB1: orderB.items[0],
  };
}
