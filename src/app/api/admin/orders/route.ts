import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { OrderStatus } from "@/generated/prisma/enums";

// Derived from the schema, so adding a status cannot leave this list stale.
const STATUSES: string[] = Object.values(OrderStatus);

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    orderId?: string;
    status?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { orderId, status } = body;
  if (!orderId || !status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  try {
    const { count } = await prisma.order.updateMany({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });
    if (count === 0) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ id: orderId, status });
  } catch (error) {
    console.error("PATCH /api/admin/orders failed:", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
