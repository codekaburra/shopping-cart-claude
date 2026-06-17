import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

type OrderRequest = {
  items?: { variantId: string; quantity: number }[];
  contactName?: string;
  contactPhone?: string;
  note?: string;
  fulfillment?: "PICKUP" | "DELIVERY";
  address?: string;
};

export async function POST(request: Request) {
  // Require a valid session and resolve the ordering user by UUID.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.active) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as OrderRequest | null;
  const contactName = body?.contactName?.trim();
  const contactPhone = body?.contactPhone?.trim();
  const fulfillment = body?.fulfillment;
  const address = body?.address?.trim();
  const note = body?.note?.trim() || null;

  if (!contactName) {
    return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
  }
  if (!contactPhone) {
    return NextResponse.json({ error: "PHONE_REQUIRED" }, { status: 400 });
  }
  if (fulfillment !== "PICKUP" && fulfillment !== "DELIVERY") {
    return NextResponse.json({ error: "FULFILLMENT_INVALID" }, { status: 400 });
  }
  if (fulfillment === "DELIVERY" && !address) {
    return NextResponse.json({ error: "ADDRESS_REQUIRED" }, { status: 400 });
  }
  if (!body?.items || body.items.length === 0) {
    return NextResponse.json({ error: "EMPTY_CART" }, { status: 400 });
  }

  // Aggregate quantities by variant in case the client sent duplicates.
  const quantityByVariant = new Map<string, number>();
  for (const item of body.items) {
    if (
      !item.variantId ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return NextResponse.json({ error: "INVALID_ITEM" }, { status: 400 });
    }
    quantityByVariant.set(
      item.variantId,
      (quantityByVariant.get(item.variantId) ?? 0) + item.quantity,
    );
  }

  // Trust the database for prices, never the client.
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: [...quantityByVariant.keys()] }, active: true },
    include: { product: true },
  });
  if (variants.length !== quantityByVariant.size) {
    return NextResponse.json({ error: "VARIANT_UNAVAILABLE" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      contactName,
      contactPhone,
      note,
      fulfillment,
      address: fulfillment === "DELIVERY" ? address : null,
      items: {
        create: variants.map((variant) => ({
          variantId: variant.id,
          quantity: quantityByVariant.get(variant.id)!,
          unitPriceCents: variant.priceCents,
          // Snapshots so the order stays readable if the catalog changes.
          productName: variant.product.name,
          variantSize: variant.size,
          sku: variant.sku,
        })),
      },
    },
  });

  return NextResponse.json({ id: order.id });
}
