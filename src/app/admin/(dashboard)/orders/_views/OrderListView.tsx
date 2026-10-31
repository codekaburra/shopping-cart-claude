import { prisma } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";
import { formatPrice } from "@/i18n";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

export async function OrderListView({ filterStatus }: { filterStatus?: string }) {
  // From the schema enum, matching the status API, so the two cannot drift.
  const validStatuses: string[] = Object.values(OrderStatus);
  const where = filterStatus && validStatuses.includes(filterStatus)
    ? { status: filterStatus as OrderStatus }
    : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      user: { select: { inviteCode: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = orders.map((o) => ({
    id: o.id,
    contactName: o.contactName,
    contactPhone: o.contactPhone,
    note: o.note,
    fulfillment: o.fulfillment,
    address: o.address,
    status: o.status,
    inviteCode: o.user.inviteCode,
    createdAt: o.createdAt.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    items: o.items.map((i) => ({
      name: i.productName,
      size: i.variantSize,
      sku: i.sku,
      qty: i.quantity,
      priceCents: i.unitPriceCents,
    })),
    totalCents: o.items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0,
    ),
  }));

  const statuses = ["ALL", ...Object.values(OrderStatus)] as const;
  // Keyed by the enum, so adding a status without a label fails to compile
  // instead of rendering a raw code in the filter tabs.
  const statusLabels: Record<OrderStatus | "ALL", string> = {
    ALL: "全部",
    PENDING_PAYMENT: "待付款",
    PENDING_VERIFICATION: "待核實收款",
    PENDING_SHIPMENT: "待出貨",
    PENDING_PICKUP: "待客戶交收",
    COMPLETED: "已完成",
  };

  return (
    <>
      {/* Status filter */}
      <div className="mt-5 flex gap-2">
        {statuses.map((s) => {
          const active = s === "ALL" ? !filterStatus : filterStatus === s;
          return (
            <a
              key={s}
              href={s === "ALL" ? "/admin/orders" : `/admin/orders?status=${s}`}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                active
                  ? "border-copper bg-copper/15 text-copper"
                  : "border-metal-silver/30 text-text-secondary hover:border-copper/50 hover:text-copper"
              }`}
            >
              {statusLabels[s]}
            </a>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="mt-12 text-center text-text-muted">
          {filterStatus ? "沒有符合篩選條件的訂單" : "尚無訂單"}
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-metal-silver/20 bg-concrete/10 p-5"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <a
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-xs text-text-muted transition-colors hover:text-copper"
                  >
                    #{order.id.slice(0, 8)} →
                  </a>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    {order.contactName}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {order.contactPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-copper">
                    {formatPrice(order.totalCents)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {order.createdAt}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 grid gap-4 border-t border-metal-silver/15 pt-4 md:grid-cols-2">
                {/* Items */}
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">
                    商品明細
                  </p>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-text-primary">
                          {item.name}{" "}
                          <span className="text-text-muted">({item.size})</span>{" "}
                          × {item.qty}
                        </span>
                        <span className="text-text-secondary">
                          {formatPrice(item.priceCents * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <p className="text-xs uppercase tracking-wider text-text-muted">
                    訂單資訊
                  </p>
                  <p className="text-text-secondary">
                    <span className="text-text-muted">取貨方式：</span>
                    {order.fulfillment === "PICKUP" ? "到店自取" : "送貨上門"}
                  </p>
                  {order.address && (
                    <p className="text-text-secondary">
                      <span className="text-text-muted">地址：</span>
                      {order.address}
                    </p>
                  )}
                  {order.note && (
                    <p className="text-text-secondary">
                      <span className="text-text-muted">備註：</span>
                      {order.note}
                    </p>
                  )}
                  <p className="text-text-secondary">
                    <span className="text-text-muted">邀請碼：</span>
                    <span className="font-mono">{order.inviteCode}</span>
                  </p>
                </div>
              </div>

              {/* Status control */}
              <div className="mt-4 border-t border-metal-silver/15 pt-4">
                <OrderStatusControl
                  orderId={order.id}
                  currentStatus={order.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
