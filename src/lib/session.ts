// Signed session token helpers built on the Web Crypto API so they work in
// both the Node.js runtime (API routes) and the Edge runtime (middleware).

export const SESSION_COOKIE = "session";

type SessionPayload = {
  // The user's UUID — the key that orders relate to.
  userId: string;
  // The invite code used to sign in (a human-friendly label, kept for tracking).
  code: string;
  // Issued-at timestamp in milliseconds.
  iat: number;
};

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

/** Create a signed session token for the given user. */
export async function createSessionToken(
  userId: string,
  code: string,
): Promise<string> {
  const payload: SessionPayload = { userId, code, iat: Date.now() };
  const data = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const key = await importKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Verify a session token and return its payload, or null if invalid. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
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
    return JSON.parse(
      new TextDecoder().decode(base64UrlDecode(data)),
    ) as SessionPayload;
  } catch {
    return null;
  }
}
