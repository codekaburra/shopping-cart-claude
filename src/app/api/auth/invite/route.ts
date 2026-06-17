import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    code?: string;
  } | null;

  const code = body?.code?.trim();
  if (!code) {
    return NextResponse.json({ error: "EMPTY" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { inviteCode: code } });
  if (!user || !user.active) {
    return NextResponse.json({ error: "INVALID" }, { status: 401 });
  }

  const token = await createSessionToken(user.id, user.inviteCode);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
