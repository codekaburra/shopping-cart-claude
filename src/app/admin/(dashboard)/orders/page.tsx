import { prisma } from "@/lib/db";
import { formatPrice } from "@/i18n";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { OrderPageTabs } from "@/components/admin/OrderPageTabs";
import { PickingViewClient } from "@/components/admin/PickingViewClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tab?: string }>;
}) {
  const { status: filterStatus, tab } = await searchParams;

  let content;
  if (tab === "fulfillment") {
    content = <FulfillmentView />;
  } else if (tab === "picking") {
    content = <PickingView />;
  } else {
    content = <OrderListView filterStatus={filterStatus} />;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-text-primary">
        訂單管理
      </h1>
      <div className="mt-4">
        <OrderPageTabs />
      </div>
      {content}
    </div>
  );
}

async function FulfillmentView() {
  const pendingShipmentOrders = await prisma.order.findMany({
    where: { status: "PENDING_SHIPMENT" },
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  const itemMap = new Map<
    string,
    {
      sku: string;
      productName: string;
      variantSize: string;
      totalQty: number;
      stock: number;
      orderCount: number;
      orderIds: string[];
    }
  >();

  for (const order of pendingShipmentOrders) {
    for (const item of order.items) {
      const existing = itemMap.get(item.variantId);
      if (existing) {
        existing.totalQty += item.quantity;
        existing.orderCount += 1;
        existing.orderIds.push(order.id);
      } else {
        itemMap.set(item.variantId, {
          sku: item.sku,
          productName: item.variant.product.name,
          variantSize: item.variantSize,
          totalQty: item.quantity,
          stock: item.variant.stock,
          orderCount: 1,
          orderIds: [order.id],
        });
      }
    }
  }

  const pendingItems = [...itemMap.values()].sort((a, b) => b.totalQty - a.totalQty);

  const outOfStockVariants = await prisma.productVariant.findMany({
    where: { stock: 0, active: true },
    include: { product: { select: { name: true, seriesCode: true } } },
    orderBy: { product: { name: "asc" } },
  });

  const pendingOrderCount = pendingShipmentOrders.length;
  const totalItemsToShip = pendingItems.reduce((s, i) => s + i.totalQty, 0);
  const shortageCount = pendingItems.filter((i) => i.totalQty > i.stock).length;

  return (
    <div className="mt-6 space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="待出貨訂單" value={pendingOrderCount} />
        <StatCard label="待出貨品項" value={pendingItems.length} />
        <StatCard label="待出貨數量" value={totalItemsToShip} />
        <StatCard
          label="庫存不足品項"
          value={shortageCount}
          alert={shortageCount > 0}
        />
      </div>

      {/* Pending shipment items */}
      <section>
        <h2 className="font-serif text-lg font-semibold text-text-primary">
          待出貨商品彙總
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          依商品合併所有待出貨訂單需求
        </p>
        {pendingItems.length === 0 ? (
          <p className="mt-8 text-center text-text-muted">目前沒有待出貨商品</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-metal-silver/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-metal-silver/15 bg-concrete/20 text-left text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">商品</th>
                  <th className="px-4 py-3">規格</th>
                  <th className="px-4 py-3 text-right">需出貨</th>
                  <th className="px-4 py-3 text-right">庫存</th>
                  <th className="px-4 py-3 text-right">差額</th>
                  <th className="px-4 py-3 text-right">涉及訂單</th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((item) => {
                  const diff = item.stock - item.totalQty;
                  const isShort = diff < 0;
                  return (
                    <tr
                      key={item.sku}
                      className={`border-b border-metal-silver/10 ${isShort ? "bg-red-500/5" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {item.variantSize}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-text-primary">
                        {item.totalQty}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        {item.stock}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${isShort ? "text-red-400" : "text-green-400"}`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td className="px-4 py-3 text-right text-text-muted">
                        {item.orderCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Out of stock */}
      <section>
        <h2 className="font-serif text-lg font-semibold text-text-primary">
          缺貨商品
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          目前庫存為 0 的上架商品
        </p>
        {outOfStockVariants.length === 0 ? (
          <p className="mt-8 text-center text-text-muted">沒有缺貨商品</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-metal-silver/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-metal-silver/15 bg-concrete/20 text-left text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">商品</th>
                  <th className="px-4 py-3">規格</th>
                  <th className="px-4 py-3 text-right">單價</th>
                </tr>
              </thead>
              <tbody>
                {outOfStockVariants.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-metal-silver/10"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      {v.sku}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {v.product.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {v.size}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {formatPrice(v.priceCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

async function PickingView() {
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

function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-metal-silver/20 bg-concrete/10 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${alert ? "text-red-400" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

async function OrderListView({ filterStatus }: { filterStatus?: string }) {
  const validStatuses = ["PENDING_PAYMENT", "PENDING_VERIFICATION", "PENDING_SHIPMENT", "PENDING_PICKUP", "COMPLETED"] as const;
  type Status = (typeof validStatuses)[number];
  const where = filterStatus && (validStatuses as readonly string[]).includes(filterStatus)
    ? { status: filterStatus as Status }
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

  const statuses = ["ALL", "PENDING_PAYMENT", "PENDING_VERIFICATION", "PENDING_SHIPMENT", "PENDING_PICKUP", "COMPLETED"] as const;
  const statusLabels: Record<string, string> = {
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
