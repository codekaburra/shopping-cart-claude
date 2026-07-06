import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE_SECONDS,
  createAdminToken,
  validateCredentials,
} from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { username?: string; password?: string };
  const { username, password } = body;

  if (!username || !password || !validateCredentials(username, password)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const token = await createAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
