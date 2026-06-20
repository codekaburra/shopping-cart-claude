import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-session";

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { orderId?: string; status?: string };
  const { orderId, status } = body;

  if (!orderId || !status || !["PENDING", "PAID", "COMPLETED"].includes(status)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as "PENDING" | "PAID" | "COMPLETED" },
  });

  return NextResponse.json({ id: order.id, status: order.status });
}
