import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-session";

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { itemId?: string; picked?: boolean };
  const { itemId, picked } = body;

  if (!itemId || typeof picked !== "boolean") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { picked },
  });

  return NextResponse.json({ id: item.id, picked: item.picked });
}
