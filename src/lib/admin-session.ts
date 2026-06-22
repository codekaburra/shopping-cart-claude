import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";

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

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
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

type AdminPayload = { role: "admin"; iat: number };

export async function createAdminToken(): Promise<string> {
  const payload: AdminPayload = { role: "admin", iat: Date.now() };
  const data = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyAdminToken(token: string | undefined): Promise<AdminPayload | null> {
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
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(data))) as AdminPayload;
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  return payload !== null;
}
