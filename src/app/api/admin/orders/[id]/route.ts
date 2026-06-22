import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    contactName?: string;
    contactPhone?: string;
    note?: string;
    fulfillment?: string;
    address?: string | null;
    items?: { id: string; quantity: number }[];
    removeItems?: string[];
  };

  const data: Record<string, unknown> = {};
  if (body.contactName !== undefined) data.contactName = body.contactName;
  if (body.contactPhone !== undefined) data.contactPhone = body.contactPhone;
  if (body.note !== undefined) data.note = body.note;
  if (body.fulfillment !== undefined) data.fulfillment = body.fulfillment;
  if (body.address !== undefined) data.address = body.address;

  const order = await prisma.order.update({
    where: { id },
    data,
  });

  if (body.removeItems?.length) {
    await prisma.orderItem.deleteMany({
      where: { id: { in: body.removeItems }, orderId: id },
    });
  }

  if (body.items?.length) {
    for (const item of body.items) {
      if (item.quantity <= 0) {
        await prisma.orderItem.delete({ where: { id: item.id } });
      } else {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity },
        });
      }
    }
  }

  return NextResponse.json({ id: order.id });
}
