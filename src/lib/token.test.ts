import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signToken, verifyToken, type TokenPayload } from "./token";

type TestPayload = TokenPayload & { userId: string };

const DAY_MS = 24 * 60 * 60 * 1000;

beforeEach(() => {
  process.env.SESSION_SECRET = "test-secret";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("signToken / verifyToken", () => {
  it("round-trips a payload and stamps iat", async () => {
    const token = await signToken({ userId: "u1" });
    const payload = await verifyToken<TestPayload>(token, DAY_MS);
    expect(payload?.userId).toBe("u1");
    expect(payload?.iat).toBeTypeOf("number");
  });

  it("rejects missing or malformed tokens", async () => {
    expect(await verifyToken(undefined, DAY_MS)).toBeNull();
    expect(await verifyToken("", DAY_MS)).toBeNull();
    expect(await verifyToken("no-dot-separator", DAY_MS)).toBeNull();
    expect(await verifyToken("not.base64url.stuff", DAY_MS)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await signToken({ userId: "u1" });
    const [, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ userId: "someone-else", iat: Date.now() }),
    )
      .toString("base64url")
      .replace(/=+$/, "");
    expect(await verifyToken(`${forged}.${signature}`, DAY_MS)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signToken({ userId: "u1" });
    process.env.SESSION_SECRET = "rotated-secret";
    expect(await verifyToken(token, DAY_MS)).toBeNull();
  });

  it("rejects a token older than maxAgeMs", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await signToken({ userId: "u1" });

    vi.setSystemTime(new Date("2026-01-30T00:00:00Z"));
    expect(await verifyToken(token, 30 * DAY_MS)).not.toBeNull();

    vi.setSystemTime(new Date("2026-02-01T00:00:01Z"));
    expect(await verifyToken(token, 30 * DAY_MS)).toBeNull();
  });

});
