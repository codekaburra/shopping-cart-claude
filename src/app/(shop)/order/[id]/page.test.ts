import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookieJar, loginAsCustomer, resetDb, seed } from "@/test/helpers";

vi.mock("next/headers", () => import("@/test/cookie-jar"));

const { default: OrderPage } = await import("./page");

let f: Awaited<ReturnType<typeof seed>>;

// Collect the text in the returned element tree. Enough to assert what a
// visitor can read, without a DOM renderer.
function text(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join(" ");
  const props = (node as { props?: { children?: unknown } }).props;
  return props ? text(props.children) : "";
}

async function render(orderId: string) {
  return text(await OrderPage({ params: Promise.resolve({ id: orderId }) }));
}

beforeEach(async () => {
  await resetDb();
  f = await seed();
});

describe("/order/[id] access control", () => {
  it("redirects a visitor with no session to login, keeping the destination", async () => {
    cookieJar.clear();
    // Next's redirect() throws; the target is carried in the error digest.
    await expect(render(f.orderA.id)).rejects.toMatchObject({
      digest: expect.stringContaining(`/login?next=/order/${f.orderA.id}`),
    });
  });

  it("does not reveal another customer's order", async () => {
    await loginAsCustomer(f.bob.id, "bob");
    const html = await render(f.orderA.id);
    expect(html).not.toContain("Alice");
    expect(html).not.toContain("0911");
  });

  it("shows the owner their order", async () => {
    await loginAsCustomer(f.alice.id, "alice");
    const html = await render(f.orderA.id);
    expect(html).toContain("Alice");
    expect(html).toContain("0911");
  });
});
