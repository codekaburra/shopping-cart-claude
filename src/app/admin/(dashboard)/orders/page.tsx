import { prisma } from "@/lib/db";
import { formatPrice } from "@/i18n";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;

  const where = filterStatus && ["PENDING", "PAID", "COMPLETED"].includes(filterStatus)
    ? { status: filterStatus as "PENDING" | "PAID" | "COMPLETED" }
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

  const statuses = ["ALL", "PENDING", "PAID", "COMPLETED"] as const;
  const statusLabels: Record<string, string> = {
    ALL: "全部",
    PENDING: "待處理",
    PAID: "已付款",
    COMPLETED: "已完成",
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-text-primary">
        訂單管理
      </h1>

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
                  <p className="font-mono text-xs text-text-muted">
                    #{order.id.slice(0, 8)}
                  </p>
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
    </div>
  );
}
