import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/i18n";
import {
  DailyRevenueOrdersChart,
  MonthlyRevenueChart,
  CategoryPieChart,
} from "@/components/admin/DashboardCharts";
import type {
  DailyData,
  MonthlyData,
  CategoryData,
} from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

function toDateKey(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function toMonthKey(d: Date) {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [totalOrders, pendingOrders, todayOrders, recentRawOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const allItems = await prisma.orderItem.findMany({
    select: { unitPriceCents: true, quantity: true },
  });
  const revenueCents = allItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );

  const recentOrders = recentRawOrders.map((o) => ({
    id: o.id,
    contactName: o.contactName,
    status: o.status,
    createdAt: o.createdAt,
    totalCents: o.items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0,
    ),
  }));

  // --- Chart data ---

  const chartOrders = await prisma.order.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: {
      createdAt: true,
      items: { select: { unitPriceCents: true, quantity: true } },
    },
  });

  // Daily (last 30 days)
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    dailyMap.set(toDateKey(d), { revenue: 0, orders: 0 });
  }
  for (const o of chartOrders) {
    if (o.createdAt >= thirtyDaysAgo) {
      const key = toDateKey(o.createdAt);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.orders += 1;
        entry.revenue += o.items.reduce(
          (s, i) => s + i.unitPriceCents * i.quantity,
          0,
        );
      }
    }
  }
  const dailyData: DailyData[] = Array.from(dailyMap.entries()).map(
    ([date, v]) => ({ date, ...v }),
  );

  // Monthly (last 6 months)
  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    monthlyMap.set(toMonthKey(d), { revenue: 0, orders: 0 });
  }
  for (const o of chartOrders) {
    const key = toMonthKey(o.createdAt);
    const entry = monthlyMap.get(key);
    if (entry) {
      entry.orders += 1;
      entry.revenue += o.items.reduce(
        (s, i) => s + i.unitPriceCents * i.quantity,
        0,
      );
    }
  }
  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries()).map(
    ([month, v]) => ({ month, ...v }),
  );

  // Category breakdown
  const categoryItems = await prisma.orderItem.findMany({
    select: {
      unitPriceCents: true,
      quantity: true,
      variant: {
        select: {
          product: {
            select: {
              category: {
                select: {
                  displayName: true,
                  name: true,
                  parent: { select: { displayName: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  const catMap = new Map<string, number>();
  for (const item of categoryItems) {
    const cat = item.variant.product.category;
    const topCat = cat?.parent ?? cat;
    const label = topCat?.displayName ?? topCat?.name ?? "未分類";
    catMap.set(
      label,
      (catMap.get(label) ?? 0) + item.unitPriceCents * item.quantity,
    );
  }
  const categoryData: CategoryData[] = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-text-primary">
        總覽
      </h1>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="總訂單" value={String(totalOrders)} />
        <StatCard
          label="待付款"
          value={String(pendingOrders)}
          highlight={pendingOrders > 0}
        />
        <StatCard label="今日訂單" value={String(todayOrders)} />
        <StatCard label="總營收" value={formatPrice(revenueCents)} />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <DailyRevenueOrdersChart data={dailyData} />
        </div>
        <MonthlyRevenueChart data={monthlyData} />
        <CategoryPieChart data={categoryData} />
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-text-primary">
            最近訂單
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-copper transition-colors hover:text-copper-light"
          >
            查看全部 →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="mt-6 text-center text-text-muted">尚無訂單</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-metal-silver/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-metal-silver/20 bg-concrete/30">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    訂單編號
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    客戶
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    狀態
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    時間
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-metal-silver/10 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {o.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {o.contactName}
                    </td>
                    <td className="px-4 py-3 text-copper">
                      {formatPrice(o.totalCents)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {o.createdAt.toLocaleDateString("zh-TW")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-metal-silver/20 bg-concrete/20 p-5">
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${highlight ? "text-copper" : "text-text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING_PAYMENT: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    PENDING_VERIFICATION: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    PENDING_SHIPMENT: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    PENDING_PICKUP: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    COMPLETED: "border-green-500/30 bg-green-500/10 text-green-400",
  };
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "待付款",
    PENDING_VERIFICATION: "待核實收款",
    PENDING_SHIPMENT: "待出貨",
    PENDING_PICKUP: "待客戶交收",
    COMPLETED: "已完成",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? ""}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
