import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { Fulfillment } from "@/generated/prisma/enums";

type ItemPatch = { id?: string; quantity?: number };

type Body = {
  contactName?: string;
  contactPhone?: string;
  note?: string | null;
  fulfillment?: string;
  address?: string | null;
  items?: ItemPatch[];
  removeItems?: string[];
};

const FULFILLMENTS: string[] = Object.values(Fulfillment);

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

// Thrown from inside the transaction. Prisma only rolls back when the callback
// throws — returning an error value would commit the writes made so far.
class PatchError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return bad("INVALID_JSON");

  // --- Validate the patch itself, before touching the database. ---

  const patch: {
    contactName?: string;
    contactPhone?: string;
    note?: string | null;
    fulfillment?: Fulfillment;
    address?: string | null;
  } = {};

  if (body.contactName !== undefined) {
    const name = body.contactName.trim();
    if (!name) return bad("NAME_REQUIRED");
    patch.contactName = name;
  }
  if (body.contactPhone !== undefined) {
    const phone = body.contactPhone.trim();
    if (!phone) return bad("PHONE_REQUIRED");
    patch.contactPhone = phone;
  }
  if (body.note !== undefined) {
    patch.note = body.note?.trim() || null;
  }
  if (body.fulfillment !== undefined) {
    if (!FULFILLMENTS.includes(body.fulfillment)) {
      return bad("FULFILLMENT_INVALID");
    }
    patch.fulfillment = body.fulfillment as Fulfillment;
  }
  if (body.address !== undefined) {
    patch.address = body.address?.trim() || null;
  }

  const itemPatches: { id: string; quantity: number }[] = [];
  for (const item of body.items ?? []) {
    if (!item.id || !Number.isInteger(item.quantity)) {
      return bad("INVALID_ITEM");
    }
    itemPatches.push({ id: item.id, quantity: item.quantity as number });
  }

  const removeIds = body.removeItems ?? [];
  if (removeIds.some((removeId) => typeof removeId !== "string")) {
    return bad("INVALID_ITEM");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        select: { fulfillment: true, address: true },
      });
      if (!existing) throw new PatchError("NOT_FOUND", 404);

      // Validate against the resulting state, not just the patch: a delivery
      // order still needs an address when only one of the two fields is sent.
      const fulfillment = patch.fulfillment ?? existing.fulfillment;
      const address =
        patch.address !== undefined ? patch.address : existing.address;
      if (fulfillment === Fulfillment.DELIVERY && !address) {
        throw new PatchError("ADDRESS_REQUIRED", 400);
      }
      // Keep a stale address from lingering on a pickup order.
      const data =
        fulfillment === Fulfillment.PICKUP
          ? { ...patch, address: null }
          : patch;

      const order = await tx.order.update({ where: { id }, data });

      if (removeIds.length) {
        await tx.orderItem.deleteMany({
          where: { id: { in: removeIds }, orderId: id },
        });
      }

      for (const item of itemPatches) {
        // Scope every write by orderId so a stale or malicious client cannot
        // reach into a different order's items. updateMany/deleteMany accept
        // a compound filter where update/delete would only take the id.
        const { count } =
          item.quantity <= 0
            ? await tx.orderItem.deleteMany({
                where: { id: item.id, orderId: id },
              })
            : await tx.orderItem.updateMany({
                where: { id: item.id, orderId: id },
                data: { quantity: item.quantity },
              });
        if (count === 0) throw new PatchError("ITEM_NOT_IN_ORDER", 400);
      }

      return { id: order.id };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PatchError) {
      return NextResponse.json({ error: error.code }, { status: error.status });
    }
    console.error(`PATCH /api/admin/orders/${id} failed:`, error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
