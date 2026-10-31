import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { Fulfillment } from "@/generated/prisma/enums";

// Everything in the body is untrusted until checked: a field typed `string`
// here would let `{ "contactName": null }` reach `.trim()` and throw.
type Body = Record<string, unknown>;

// Bounds on a line quantity. Removing an item goes through `removeItems`, so
// zero and negatives are rejected rather than treated as an implicit delete.
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 999;

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
    if (typeof body.contactName !== "string") return bad("NAME_REQUIRED");
    const name = body.contactName.trim();
    if (!name) return bad("NAME_REQUIRED");
    patch.contactName = name;
  }
  if (body.contactPhone !== undefined) {
    if (typeof body.contactPhone !== "string") return bad("PHONE_REQUIRED");
    const phone = body.contactPhone.trim();
    if (!phone) return bad("PHONE_REQUIRED");
    patch.contactPhone = phone;
  }
  if (body.note !== undefined) {
    if (body.note !== null && typeof body.note !== "string") {
      return bad("INVALID_NOTE");
    }
    patch.note = body.note?.trim() || null;
  }
  if (body.fulfillment !== undefined) {
    if (
      typeof body.fulfillment !== "string" ||
      !FULFILLMENTS.includes(body.fulfillment)
    ) {
      return bad("FULFILLMENT_INVALID");
    }
    patch.fulfillment = body.fulfillment as Fulfillment;
  }
  if (body.address !== undefined) {
    if (body.address !== null && typeof body.address !== "string") {
      return bad("ADDRESS_REQUIRED");
    }
    patch.address = body.address?.trim() || null;
  }

  if (body.items !== undefined && !Array.isArray(body.items)) {
    return bad("INVALID_ITEM");
  }
  const itemPatches: { id: string; quantity: number }[] = [];
  const seenIds = new Set<string>();
  for (const raw of (body.items as unknown[] | undefined) ?? []) {
    const item = raw as { id?: unknown; quantity?: unknown } | null;
    if (
      !item ||
      typeof item.id !== "string" ||
      !item.id ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < MIN_QUANTITY ||
      item.quantity > MAX_QUANTITY ||
      // A repeated id would make the second write act on stale state.
      seenIds.has(item.id)
    ) {
      return bad("INVALID_ITEM");
    }
    seenIds.add(item.id);
    itemPatches.push({ id: item.id, quantity: item.quantity });
  }

  if (body.removeItems !== undefined && !Array.isArray(body.removeItems)) {
    return bad("INVALID_ITEM");
  }
  const removeIds = (body.removeItems as unknown[] | undefined) ?? [];
  if (removeIds.some((removeId) => typeof removeId !== "string")) {
    return bad("INVALID_ITEM");
  }
  // Editing and removing the same line in one request is contradictory.
  if ((removeIds as string[]).some((removeId) => seenIds.has(removeId))) {
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
          where: { id: { in: removeIds as string[] }, orderId: id },
        });
      }

      // Read the order's own items once, so membership is checked against the
      // order rather than trusting the ids the client sent, and so a quantity
      // change can be told apart from a no-op resend.
      const ownItems = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { id: true, quantity: true },
      });
      const quantityById = new Map(ownItems.map((i) => [i.id, i.quantity]));

      for (const item of itemPatches) {
        const currentQuantity = quantityById.get(item.id);
        if (currentQuantity === undefined) {
          throw new PatchError("ITEM_NOT_IN_ORDER", 400);
        }
        if (item.quantity === currentQuantity) continue;
        await tx.orderItem.update({
          where: { id: item.id },
          // A picked item was counted off the shelf at the old quantity, so
          // changing it invalidates that check — the picker has to redo it.
          data: { quantity: item.quantity, picked: false },
        });
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
