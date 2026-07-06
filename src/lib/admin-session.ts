// Admin session tokens and credential check, built on the shared HMAC
// helpers in token.ts.

import { cookies } from "next/headers";
import { signToken, verifyToken, type TokenPayload } from "./token";

export const ADMIN_COOKIE = "admin_session";

// Token and cookie lifetime: 24 hours. Keep the two in sync so a cookie the
// browser still sends is never rejected as expired (or vice versa).
export const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 24;

function getCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set");
  }
  return { username, password };
}

export function validateCredentials(username: string, password: string): boolean {
  const creds = getCredentials();
  return username === creds.username && password === creds.password;
}

type AdminPayload = TokenPayload & { role: "admin" };

export async function createAdminToken(): Promise<string> {
  return signToken({ role: "admin" });
}

export async function verifyAdminToken(
  token: string | undefined,
): Promise<AdminPayload | null> {
  const payload = await verifyToken<AdminPayload>(
    token,
    ADMIN_MAX_AGE_SECONDS * 1000,
  );
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  return payload !== null;
}
