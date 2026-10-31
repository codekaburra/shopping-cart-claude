import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookieJar, jsonRequest, loginAsAdmin, resetDb, seed } from "@/test/helpers";

vi.mock("next/headers", () => import("@/test/cookie-jar"));

const { PATCH } = await import("./route");
const { prisma } = await import("@/lib/db");

let f: Awaited<ReturnType<typeof seed>>;

const setStatus = (orderId: string, status: string) =>
  PATCH(jsonRequest("PATCH", "/api/admin/orders", { orderId, status }));

const pickedFlags = async () =>
  (await prisma.orderItem.findMany({ where: { orderId: f.orderA.id } })).map((i) => i.picked);

beforeEach(async () => {
  await resetDb();
  f = await seed();
  await loginAsAdmin();
  await prisma.orderItem.updateMany({ where: { orderId: f.orderA.id }, data: { picked: true } });
});

describe("PATCH /api/admin/orders (status)", () => {
  it("rejects unauthenticated requests", async () => {
    cookieJar.clear();
    expect((await setStatus(f.orderA.id, "COMPLETED")).status).toBe(401);
  });

  it.each([
    ["malformed JSON", "{bad", 400],
    ["unknown status", { orderId: "x", status: "NOPE" }, 400],
    ["missing orderId", { status: "COMPLETED" }, 400],
  ])("rejects %s", async (_label, body, status) => {
    expect((await PATCH(jsonRequest("PATCH", "/api/admin/orders", body))).status).toBe(status);
  });

  it("returns 404 for an unknown order", async () => {
    expect((await setStatus("nope", "COMPLETED")).status).toBe(404);
  });

  it.each(["PENDING_PICKUP", "COMPLETED"])("keeps picking when moving forward to %s", async (status) => {
    expect((await setStatus(f.orderA.id, status)).status).toBe(200);
    expect(await pickedFlags()).toEqual([true, true]);
  });

  it.each(["PENDING_PAYMENT", "PENDING_VERIFICATION"])(
    "clears picking when sent back to %s",
    async (status) => {
      expect((await setStatus(f.orderA.id, status)).status).toBe(200);
      expect(await pickedFlags()).toEqual([false, false]);
    },
  );

  it("does not touch other orders' picking", async () => {
    await prisma.orderItem.updateMany({ where: { orderId: f.orderB.id }, data: { picked: true } });
    await setStatus(f.orderA.id, "PENDING_PAYMENT");
    const b = await prisma.orderItem.findUniqueOrThrow({ where: { id: f.itemB1.id } });
    expect(b.picked).toBe(true);
  });
});
