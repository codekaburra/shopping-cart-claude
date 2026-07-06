import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { OrderDetailClient } from "@/components/admin/OrderDetailClient";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { variant: true } },
      user: true,
    },
  });

  if (!order) notFound();

  const totalCents = order.items.reduce(
    (s, i) => s + i.unitPriceCents * i.quantity,
    0,
  );

  const orderData = {
    id: order.id,
    contactName: order.contactName,
    contactPhone: order.contactPhone,
    note: order.note,
    fulfillment: order.fulfillment,
    address: order.address,
    status: order.status,
    createdAt: order.createdAt.toLocaleString("zh-TW"),
    inviteCode: order.user.inviteCode,
    totalCents,
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      variantSize: i.variantSize,
      sku: i.sku,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      picked: i.picked,
    })),
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-text-primary">
        訂單詳情
      </h1>

      {/* Status stepper */}
      <div className="rounded-xl border border-metal-silver/20 bg-concrete/10 p-5">
        <OrderStatusControl orderId={order.id} currentStatus={order.status} />
      </div>

      <OrderDetailClient order={orderData} />
    </div>
  );
}
