"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export type DailyData = { date: string; revenue: number; orders: number };
export type MonthlyData = { month: string; revenue: number; orders: number };
export type CategoryData = { name: string; value: number };

const COPPER = "#c97b4a";
const COPPER_LIGHT = "#e8b88a";
const METAL_GOLD = "#d4af88";
const METAL_SILVER = "#a8b0b8";
const CONCRETE = "#3f3f3f";

const PIE_COLORS = [COPPER, COPPER_LIGHT, METAL_GOLD, METAL_SILVER, "#8b6f5e", "#6b8f8e"];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#2a2a2a",
    border: "1px solid rgba(168,176,184,0.2)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#eaeaea",
  },
  itemStyle: { color: "#eaeaea" },
  labelStyle: { color: "#b8b8b8" },
};

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function DailyRevenueOrdersChart({ data }: { data: DailyData[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ChartCard title="近 30 天營收與訂單">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COPPER} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COPPER} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,176,184,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(168,176,184,0.2)" }}
          />
          <YAxis
            yAxisId="revenue"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(value: number, name: string) =>
              name === "revenue"
                ? [`$${(value / 100).toFixed(2)}`, "營收"]
                : [value, "訂單數"]
            }
          />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke={COPPER}
            strokeWidth={2}
            fill="url(#revenueGrad)"
            name="revenue"
          />
          <Bar
            yAxisId="orders"
            dataKey="orders"
            fill={METAL_GOLD}
            opacity={0.6}
            radius={[3, 3, 0, 0]}
            name="orders"
            barSize={12}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyRevenueChart({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ChartCard title="月營收與訂單數">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,176,184,0.1)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(168,176,184,0.2)" }}
          />
          <YAxis
            yAxisId="revenue"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(value: number, name: string) =>
              name === "revenue"
                ? [`$${(value / 100).toFixed(2)}`, "營收"]
                : [value, "訂單數"]
            }
          />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            fill={COPPER}
            radius={[6, 6, 0, 0]}
            barSize={28}
            name="revenue"
          />
          <Bar
            yAxisId="orders"
            dataKey="orders"
            fill={METAL_GOLD}
            opacity={0.7}
            radius={[6, 6, 0, 0]}
            barSize={28}
            name="orders"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ChartCard title="分類營收佔比">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            {...tooltipStyle}
            formatter={(value: number) => [`$${(value / 100).toFixed(2)}`, "營收"]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#b8b8b8" }}
            formatter={(value: string) => (
              <span style={{ color: "#b8b8b8" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-metal-silver/20 bg-concrete/10 p-5">
      <h3 className="mb-4 text-sm font-medium text-text-secondary">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-xl border border-metal-silver/20 bg-concrete/10">
      <p className="text-sm text-text-muted">尚無數據</p>
    </div>
  );
}
