import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookieJar, jsonRequest, loginAsCustomer, resetDb, seed } from "@/test/helpers";

vi.mock("next/headers", () => import("@/test/cookie-jar"));

const { POST } = await import("./route");
const { prisma } = await import("@/lib/db");

let f: Awaited<ReturnType<typeof seed>>;

const order = (overrides: Record<string, unknown> = {}) =>
  POST(
    jsonRequest("POST", "/api/orders", {
      items: [{ variantId: f.variant.id, quantity: 2 }],
      contactName: "Alice",
      contactPhone: "0911",
      fulfillment: "PICKUP",
      ...overrides,
    }),
  );

beforeEach(async () => {
  await resetDb();
  f = await seed();
  await loginAsCustomer(f.alice.id, "alice");
});

describe("POST /api/orders", () => {
  it("requires a customer session", async () => {
    cookieJar.clear();
    expect((await order()).status).toBe(401);
  });

  it("creates an order priced from the database, not the client", async () => {
    const res = await order({ items: [{ variantId: f.variant.id, quantity: 2, priceCents: 1 }] });
    expect(res.status).toBe(200);
    const { id } = await res.json();
    const created = await prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    expect(created.userId).toBe(f.alice.id);
    expect(created.items[0]).toMatchObject({ quantity: 2, unitPriceCents: 1800 });
  });

  it.each([
    ["empty cart", { items: [] }, "EMPTY_CART"],
    ["delivery without address", { fulfillment: "DELIVERY" }, "ADDRESS_REQUIRED"],
    ["unknown variant", { items: [{ variantId: "nope", quantity: 1 }] }, "VARIANT_UNAVAILABLE"],
    ["quantity above the cap", { items: [{ variantId: "v", quantity: 1000 }] }, "INVALID_ITEM"],
    ["zero quantity", { items: [{ variantId: "v", quantity: 0 }] }, "INVALID_ITEM"],
  ])("rejects %s", async (_label, overrides, error) => {
    const res = await order(overrides);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error });
  });

  it("applies the cap after merging duplicate lines", async () => {
    const res = await order({
      items: [
        { variantId: f.variant.id, quantity: 600 },
        { variantId: f.variant.id, quantity: 600 },
      ],
    });
    expect(res.status).toBe(400);
  });
});
