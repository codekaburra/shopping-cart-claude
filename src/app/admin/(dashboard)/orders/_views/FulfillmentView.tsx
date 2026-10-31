import { prisma } from "@/lib/db";
import { formatPrice } from "@/i18n";
import { StatCard } from "./StatCard";

export async function FulfillmentView() {
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
