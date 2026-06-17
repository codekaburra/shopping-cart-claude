import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Browsing, product pages and the cart are open to guests. Login (an invite
// code) is only required to check out — users sign in mid-purchase. The
// /api/orders route enforces its own session check, so it is not gated here.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (session) return NextResponse.next();

  // Not signed in: send them to login, remembering where they were heading.
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Only the checkout page is protected.
  matcher: ["/checkout"],
};
