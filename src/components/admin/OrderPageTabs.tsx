"use client";

import { useSearchParams } from "next/navigation";

const tabs = [
  { key: "orders", label: "訂單管理", href: "/admin/orders" },
  { key: "fulfillment", label: "備貨管理", href: "/admin/orders?tab=fulfillment" },
  { key: "picking", label: "點貨清單", href: "/admin/orders?tab=picking" },
] as const;

export function OrderPageTabs() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "orders";

  return (
    <div className="flex border-b border-metal-silver/20">
      {tabs.map((t) => (
        <a
          key={t.key}
          href={t.href}
          className={`px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === t.key
              ? "border-b-2 border-copper text-copper"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {t.label}
        </a>
      ))}
    </div>
  );
}
