import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookieJar, jsonRequest, loginAsAdmin, resetDb, seed } from "@/test/helpers";

vi.mock("next/headers", () => import("@/test/cookie-jar"));

const { PATCH } = await import("./route");
const { prisma } = await import("@/lib/db");

type Fixture = Awaited<ReturnType<typeof seed>>;
let f: Fixture;

function patch(orderId: string, body: unknown) {
  return PATCH(jsonRequest("PATCH", `/api/admin/orders/${orderId}`, body), {
    params: Promise.resolve({ id: orderId }),
  });
}

async function expectError(res: Response, status: number, error: string) {
  expect(res.status).toBe(status);
  expect(await res.json()).toEqual({ error });
}

beforeEach(async () => {
  await resetDb();
  f = await seed();
  await loginAsAdmin();
});

describe("PATCH /api/admin/orders/[id]", () => {
  it("rejects unauthenticated requests", async () => {
    cookieJar.clear();
    await expectError(await patch(f.orderA.id, { contactName: "x" }), 401, "UNAUTHORIZED");
  });

  it("updates contact details", async () => {
    const res = await patch(f.orderA.id, { contactName: "  Alicia  ", note: "fragile" });
    expect(res.status).toBe(200);
    const order = await prisma.order.findUniqueOrThrow({ where: { id: f.orderA.id } });
    expect(order.contactName).toBe("Alicia");
    expect(order.note).toBe("fragile");
  });

  it("returns 404 for an unknown order", async () => {
    await expectError(await patch("nope", { contactName: "x" }), 404, "NOT_FOUND");
  });

  describe("body validation (400, never 500)", () => {
    it.each([
      ["malformed JSON", "{not json", "INVALID_JSON"],
      ["contactName: null", { contactName: null }, "NAME_REQUIRED"],
      ["contactName blank", { contactName: "   " }, "NAME_REQUIRED"],
      ["contactPhone: 5", { contactPhone: 5 }, "PHONE_REQUIRED"],
      ["note: 5", { note: 5 }, "INVALID_NOTE"],
      ["unknown fulfillment", { fulfillment: "TELEPORT" }, "FULFILLMENT_INVALID"],
      ["items: {}", { items: {} }, "INVALID_ITEM"],
      ["items: [null]", { items: [null] }, "INVALID_ITEM"],
      ["removeItems: string", { removeItems: "abc" }, "INVALID_ITEM"],
    ])("%s", async (_label, body, error) => {
      await expectError(await patch(f.orderA.id, body), 400, error);
    });

    it.each([
      ["zero", 0],
      ["negative", -1],
      ["fractional", 1.5],
      ["above the cap", 1000],
      ["3e9", 3_000_000_000],
    ])("rejects a %s quantity", async (_label, quantity) => {
      await expectError(
        await patch(f.orderA.id, { items: [{ id: f.itemA1.id, quantity }] }),
        400,
        "INVALID_ITEM",
      );
    });

    it("rejects a repeated item id", async () => {
      const items = [
        { id: f.itemA1.id, quantity: 2 },
        { id: f.itemA1.id, quantity: 3 },
      ];
      await expectError(await patch(f.orderA.id, { items }), 400, "INVALID_ITEM");
    });

    it("rejects an item both edited and removed", async () => {
      await expectError(
        await patch(f.orderA.id, {
          items: [{ id: f.itemA1.id, quantity: 2 }],
          removeItems: [f.itemA1.id],
        }),
        400,
        "INVALID_ITEM",
      );
    });
  });

  describe("fulfillment and address", () => {
    it("requires an address for delivery, judged on the resulting order", async () => {
      await expectError(await patch(f.orderA.id, { fulfillment: "DELIVERY" }), 400, "ADDRESS_REQUIRED");
    });

    it("accepts delivery with an address", async () => {
      const res = await patch(f.orderA.id, { fulfillment: "DELIVERY", address: "中環 1 號" });
      expect(res.status).toBe(200);
    });

    it("clears a stale address when switching back to pickup", async () => {
      await patch(f.orderA.id, { fulfillment: "DELIVERY", address: "中環 1 號" });
      await patch(f.orderA.id, { fulfillment: "PICKUP" });
      const order = await prisma.order.findUniqueOrThrow({ where: { id: f.orderA.id } });
      expect(order.address).toBeNull();
    });
  });

  describe("cross-order safety", () => {
    it("refuses to edit another order's item", async () => {
      await expectError(
        await patch(f.orderA.id, { items: [{ id: f.itemB1.id, quantity: 9 }] }),
        400,
        "ITEM_NOT_IN_ORDER",
      );
      const item = await prisma.orderItem.findUniqueOrThrow({ where: { id: f.itemB1.id } });
      expect(item.quantity).toBe(1);
    });

    it("ignores another order's item in removeItems", async () => {
      await patch(f.orderA.id, { removeItems: [f.itemB1.id] });
      expect(await prisma.orderItem.count({ where: { id: f.itemB1.id } })).toBe(1);
    });

    it("rolls back every write when a later step fails", async () => {
      // The rename is applied before the bad item is reached; the whole
      // request must leave no trace.
      await expectError(
        await patch(f.orderA.id, {
          contactName: "SHOULD_NOT_PERSIST",
          items: [{ id: f.itemB1.id, quantity: 9 }],
        }),
        400,
        "ITEM_NOT_IN_ORDER",
      );
      const order = await prisma.order.findUniqueOrThrow({ where: { id: f.orderA.id } });
      expect(order.contactName).toBe("Alice");
    });
  });

  describe("picked flag", () => {
    beforeEach(async () => {
      await prisma.orderItem.updateMany({ where: { orderId: f.orderA.id }, data: { picked: true } });
    });

    it("clears picked on the item whose quantity changed, and only that item", async () => {
      await patch(f.orderA.id, { items: [{ id: f.itemA1.id, quantity: 6 }] });
      const a1 = await prisma.orderItem.findUniqueOrThrow({ where: { id: f.itemA1.id } });
      const a2 = await prisma.orderItem.findUniqueOrThrow({ where: { id: f.itemA2.id } });
      expect(a1).toMatchObject({ quantity: 6, picked: false });
      expect(a2.picked).toBe(true);
    });

    it("keeps picked when the quantity is resent unchanged", async () => {
      await patch(f.orderA.id, { items: [{ id: f.itemA1.id, quantity: 4 }] });
      const a1 = await prisma.orderItem.findUniqueOrThrow({ where: { id: f.itemA1.id } });
      expect(a1.picked).toBe(true);
    });
  });
});
