import { prisma } from "@/lib/db";
import { PickingViewClient } from "@/components/admin/PickingViewClient";

export async function PickingView() {
  const pendingOrders = await prisma.order.findMany({
    where: { status: "PENDING_SHIPMENT" },
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  type PickingOrder = {
    itemId: string;
    orderId: string;
    contactName: string;
    qty: number;
    picked: boolean;
  };
  type PickingCard = {
    variantId: string;
    sku: string;
    productName: string;
    variantSize: string;
    stock: number;
    totalQty: number;
    orders: PickingOrder[];
  };

  const cardMap = new Map<string, PickingCard>();

  for (const order of pendingOrders) {
    for (const item of order.items) {
      const existing = cardMap.get(item.variantId);
      const entry: PickingOrder = {
        itemId: item.id,
        orderId: order.id,
        contactName: order.contactName,
        qty: item.quantity,
        picked: item.picked,
      };
      if (existing) {
        existing.totalQty += item.quantity;
        existing.orders.push(entry);
      } else {
        cardMap.set(item.variantId, {
          variantId: item.variantId,
          sku: item.sku,
          productName: item.variant.product.name,
          variantSize: item.variantSize,
          stock: item.variant.stock,
          totalQty: item.quantity,
          orders: [entry],
        });
      }
    }
  }

  const cards = [...cardMap.values()].sort((a, b) => b.totalQty - a.totalQty);

  if (cards.length === 0) {
    return (
      <p className="mt-12 text-center text-text-muted">目前沒有待出貨商品</p>
    );
  }

  return <PickingViewClient cards={cards} orderCount={pendingOrders.length} />;
}
