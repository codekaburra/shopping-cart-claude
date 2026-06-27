"use client";

import { useState } from "react";
import { PickedToggle } from "./PickedToggle";

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

export function PickingViewClient({
  cards,
  orderCount,
}: {
  cards: PickingCard[];
  orderCount: number;
}) {
  const [picking, setPicking] = useState(false);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          共 {cards.length} 項商品，來自 {orderCount} 張訂單
        </p>
        <button
          type="button"
          onClick={() => setPicking(!picking)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            picking
              ? "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              : "border-green-500/40 text-green-400 hover:bg-green-500/10"
          }`}
        >
          {picking ? "完成點貨" : "點貨模式"}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const isShort = card.totalQty > card.stock;
          return (
            <div
              key={card.variantId}
              className={`rounded-xl border p-4 ${
                isShort
                  ? "border-red-400/40 bg-red-500/5"
                  : "border-metal-silver/20 bg-concrete/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">
                    {card.productName}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {card.variantSize}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-text-muted">
                    {card.sku}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-text-primary">
                    {card.totalQty}
                  </p>
                  <p className="text-xs text-text-muted">需出貨</p>
                </div>
              </div>

              <div className="mt-3 flex gap-3 text-xs">
                <span className="text-text-muted">
                  庫存：<span className="font-semibold text-text-secondary">{card.stock}</span>
                </span>
                <span className={isShort ? "font-semibold text-red-400" : "text-green-400"}>
                  {isShort ? `缺 ${card.totalQty - card.stock}` : "庫存充足"}
                </span>
              </div>

              <div className="mt-3 border-t border-metal-silver/15 pt-3">
                <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">
                  訂單明細
                </p>
                <div className="space-y-1.5">
                  {card.orders.map((o) => (
                    <div
                      key={o.itemId}
                      className={`flex items-center gap-2.5 text-sm ${o.picked ? "opacity-50" : ""}`}
                    >
                      {picking && (
                        <PickedToggle itemId={o.itemId} initialPicked={o.picked} />
                      )}
                      <span className={`flex-1 text-text-secondary ${o.picked ? "line-through" : ""}`}>
                        <span className="font-mono text-xs text-text-muted">
                          #{o.orderId.slice(0, 8)}
                        </span>{" "}
                        {o.contactName}
                      </span>
                      <span className="font-semibold text-text-primary">
                        ×{o.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
