import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { OrderStatus } from "@/generated/prisma/enums";

// Derived from the schema, so adding a status cannot leave this list stale.
// Declaration order in the schema is the order of the fulfilment flow.
const STATUSES: string[] = Object.values(OrderStatus);
const SHIPMENT_STAGE = STATUSES.indexOf(OrderStatus.PENDING_SHIPMENT);

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

  // Sending an order back before the shipment stage means it is no longer
  // being fulfilled, so any picking already recorded no longer describes it.
  const clearsPicking = STATUSES.indexOf(status) < SHIPMENT_STAGE;

  try {
    const count = await prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id: orderId },
        data: { status: status as OrderStatus },
      });
      if (count > 0 && clearsPicking) {
        await tx.orderItem.updateMany({
          where: { orderId, picked: true },
          data: { picked: false },
        });
      }
      return count;
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
