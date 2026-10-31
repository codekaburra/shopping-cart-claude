import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-session";

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    itemId?: string;
    picked?: boolean;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { itemId, picked } = body;
  if (!itemId || typeof picked !== "boolean") {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  try {
    // updateMany rather than update: a missing row yields count 0 instead of
    // throwing, so an unknown id is a 404 rather than a 500.
    const { count } = await prisma.orderItem.updateMany({
      where: { id: itemId },
      data: { picked },
    });
    if (count === 0) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ id: itemId, picked });
  } catch (error) {
    console.error("PATCH /api/admin/orders/items failed:", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
