// Generic HMAC-signed token helpers built on the Web Crypto API so they work
// in both the Node.js runtime (API routes) and the Edge runtime (proxy).
// Shared by the customer session (session.ts) and admin session
// (admin-session.ts).

export type TokenPayload = { iat: number };

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Sign a payload into a `data.signature` token, stamping it with `iat`. */
export async function signToken<T extends object>(
  payload: T,
): Promise<string> {
  const stamped: T & TokenPayload = { ...payload, iat: Date.now() };
  const data = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(stamped)),
  );
  const key = await importKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/**
 * Verify a token's signature and age. Returns the payload, or null if the
 * token is missing, malformed, tampered with, or older than `maxAgeMs`.
 */
export async function verifyToken<T extends TokenPayload>(
  token: string | undefined,
  maxAgeMs: number,
): Promise<T | null> {
  if (!token) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  try {
    const key = await importKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      new TextEncoder().encode(data),
    );
    if (!valid) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(data)),
    ) as T;
    if (
      typeof payload.iat !== "number" ||
      Date.now() - payload.iat > maxAgeMs
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
