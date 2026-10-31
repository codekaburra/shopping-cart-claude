import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookieJar, jsonRequest, loginAsAdmin, resetDb, seed } from "@/test/helpers";

vi.mock("next/headers", () => import("@/test/cookie-jar"));

const { PATCH } = await import("./route");
const { prisma } = await import("@/lib/db");

let f: Awaited<ReturnType<typeof seed>>;
const toggle = (body: unknown) => PATCH(jsonRequest("PATCH", "/api/admin/orders/items", body));

beforeEach(async () => {
  await resetDb();
  f = await seed();
  await loginAsAdmin();
});

describe("PATCH /api/admin/orders/items (picked toggle)", () => {
  it("rejects unauthenticated requests", async () => {
    cookieJar.clear();
    expect((await toggle({ itemId: f.itemA1.id, picked: true })).status).toBe(401);
  });

  it("marks an item picked", async () => {
    const res = await toggle({ itemId: f.itemA1.id, picked: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: f.itemA1.id, picked: true });
    const item = await prisma.orderItem.findUniqueOrThrow({ where: { id: f.itemA1.id } });
    expect(item.picked).toBe(true);
  });

  it.each([
    ["malformed JSON", "{bad", 400],
    ["picked not a boolean", { itemId: "x", picked: "yes" }, 400],
    ["missing itemId", { picked: true }, 400],
    ["unknown item", { itemId: "nope", picked: true }, 404],
  ])("rejects %s", async (_label, body, status) => {
    expect((await toggle(body)).status).toBe(status);
  });
});
