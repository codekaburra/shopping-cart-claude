// Customer session tokens, built on the shared HMAC helpers in token.ts.

import { signToken, verifyToken, type TokenPayload } from "./token";

export const SESSION_COOKIE = "session";

// Token and cookie lifetime: 30 days. Keep the two in sync so a cookie the
// browser still sends is never rejected as expired (or vice versa).
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type SessionPayload = TokenPayload & {
  // The user's UUID — the key that orders relate to.
  userId: string;
  // The invite code used to sign in (a human-friendly label, kept for tracking).
  code: string;
};

/** Create a signed session token for the given user. */
export async function createSessionToken(
  userId: string,
  code: string,
): Promise<string> {
  return signToken({ userId, code });
}

/** Verify a session token and return its payload, or null if invalid/expired. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  return verifyToken<SessionPayload>(token, SESSION_MAX_AGE_SECONDS * 1000);
}
