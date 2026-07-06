"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PickedToggle } from "./PickedToggle";

type OrderItem = {
  id: string;
  productName: string;
  variantSize: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  picked: boolean;
};

type OrderData = {
  id: string;
  contactName: string;
  contactPhone: string;
  note: string | null;
  fulfillment: string;
  address: string | null;
  status: string;
  createdAt: string;
  inviteCode: string;
  items: OrderItem[];
  totalCents: number;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "待付款",
  PENDING_VERIFICATION: "待核實收款",
  PENDING_SHIPMENT: "待出貨",
  PENDING_PICKUP: "待客戶交收",
  COMPLETED: "已完成",
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type Mode = "view" | "edit" | "picking";

export function OrderDetailClient({ order }: { order: OrderData }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("view");
  const [saving, setSaving] = useState(false);

  const editing = mode === "edit";
  const picking = mode === "picking";

  const [contactName, setContactName] = useState(order.contactName);
  const [contactPhone, setContactPhone] = useState(order.contactPhone);
  const [note, setNote] = useState(order.note ?? "");
  const [fulfillment, setFulfillment] = useState(order.fulfillment);
  const [address, setAddress] = useState(order.address ?? "");
  const [items, setItems] = useState(order.items.map((i) => ({ ...i })));
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  function startEdit() {
    setMode("edit");
    setContactName(order.contactName);
    setContactPhone(order.contactPhone);
    setNote(order.note ?? "");
    setFulfillment(order.fulfillment);
    setAddress(order.address ?? "");
    setItems(order.items.map((i) => ({ ...i })));
    setRemovedIds([]);
  }

  function exitMode() {
    setMode("view");
  }

  function updateQty(id: string, qty: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setRemovedIds((prev) => [...prev, id]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const changedItems = items
        .filter((i) => {
          const orig = order.items.find((o) => o.id === i.id);
          return orig && orig.quantity !== i.quantity;
        })
        .map((i) => ({ id: i.id, quantity: i.quantity }));

      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName,
          contactPhone,
          note: note || null,
          fulfillment,
          address: fulfillment === "DELIVERY" ? address : null,
          items: changedItems.length ? changedItems : undefined,
          removeItems: removedIds.length ? removedIds : undefined,
        }),
      });
      if (res.ok) {
        setMode("view");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const displayItems = editing ? items : order.items;
  const totalCents = displayItems.reduce(
    (s, i) => s + i.unitPriceCents * i.quantity,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <a
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-lg border border-metal-silver/30 px-4 py-2 text-sm text-text-secondary transition-colors hover:border-copper/50 hover:text-copper"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" />
          </svg>
          返回訂單列表
        </a>
        {mode === "view" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("picking")}
              className="rounded-lg border border-green-500/40 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/10"
            >
              點貨模式
            </button>
            <button
              type="button"
              onClick={startEdit}
              className="rounded-lg border border-copper/40 px-4 py-2 text-sm font-medium text-copper transition-colors hover:bg-copper/10"
            >
              編輯訂單
            </button>
          </div>
        )}
        {mode === "picking" && (
          <button
            type="button"
            onClick={exitMode}
            className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
          >
            完成點貨
          </button>
        )}
        {mode === "edit" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exitMode}
              className="rounded-lg border border-metal-silver/30 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-concrete/30"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-copper px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-copper-dark disabled:opacity-50"
            >
              {saving ? "儲存中…" : "儲存變更"}
            </button>
          </div>
        )}
      </div>

      {/* Order header */}
      <div className="rounded-xl border border-metal-silver/20 bg-concrete/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-text-muted">#{order.id.slice(0, 8)}</p>
            <p className="mt-1 text-sm text-text-muted">{order.createdAt}</p>
          </div>
          <div className="rounded-full border border-copper/30 bg-copper/10 px-3 py-1 text-xs font-medium text-copper">
            {STATUS_LABELS[order.status] ?? order.status}
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-text-muted">聯絡資訊</h3>
            {editing ? (
              <>
                <Field label="姓名" value={contactName} onChange={setContactName} />
                <Field label="電話" value={contactPhone} onChange={setContactPhone} />
              </>
            ) : (
              <>
                <InfoRow label="姓名" value={order.contactName} />
                <InfoRow label="電話" value={order.contactPhone} />
              </>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-text-muted">取貨資訊</h3>
            {editing ? (
              <>
                <div>
                  <label className="block text-xs text-text-muted">取貨方式</label>
                  <select
                    value={fulfillment}
                    onChange={(e) => setFulfillment(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-metal-silver/30 bg-industrial-dark px-3 py-2 text-sm text-text-primary outline-none focus:border-copper"
                  >
                    <option value="PICKUP">到店自取</option>
                    <option value="DELIVERY">送貨上門</option>
                  </select>
                </div>
                {fulfillment === "DELIVERY" && (
                  <Field label="地址" value={address} onChange={setAddress} />
                )}
                <Field label="備註" value={note} onChange={setNote} />
              </>
            ) : (
              <>
                <InfoRow label="取貨方式" value={order.fulfillment === "PICKUP" ? "到店自取" : "送貨上門"} />
                {order.address && <InfoRow label="地址" value={order.address} />}
                {order.note && <InfoRow label="備註" value={order.note} />}
                <InfoRow label="邀請碼" value={order.inviteCode} mono />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-metal-silver/20 bg-concrete/10 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-text-muted">商品明細</h3>
          <p className="text-lg font-semibold text-copper">{formatPrice(totalCents)}</p>
        </div>

        <div className="space-y-3">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border border-metal-silver/10 p-3 ${item.picked && !editing ? "bg-green-500/5" : ""} ${picking ? "border-green-500/20" : ""}`}
            >
              <div className="flex items-center gap-3">
                {picking && (
                  <PickedToggle itemId={item.id} initialPicked={item.picked} />
                )}

                <div className={`min-w-0 flex-1 ${item.picked && !editing ? "opacity-50" : ""}`}>
                  <p className={`text-sm font-medium text-text-primary ${item.picked && !editing ? "line-through" : ""}`}>
                    {item.productName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.variantSize}
                    <span className="ml-2 font-mono">{item.sku}</span>
                  </p>
                </div>

                {!editing && (
                  <>
                    <span className="text-sm text-text-secondary">×{item.quantity}</span>
                    <span className="w-20 text-right text-sm text-text-secondary">
                      {formatPrice(item.unitPriceCents * item.quantity)}
                    </span>
                  </>
                )}
              </div>

              {editing && (
                <div className="mt-2 flex items-center justify-between border-t border-metal-silver/10 pt-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-metal-silver/30 text-text-secondary hover:border-copper hover:text-copper"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                      className="w-12 rounded border border-metal-silver/30 bg-industrial-dark px-2 py-1 text-center text-sm text-text-primary outline-none focus:border-copper"
                      min={1}
                    />
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-metal-silver/30 text-text-secondary hover:border-copper hover:text-copper"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {formatPrice(item.unitPriceCents * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    刪除
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-text-muted">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-metal-silver/30 bg-industrial-dark px-3 py-2 text-sm text-text-primary outline-none focus:border-copper"
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <p className="text-sm text-text-secondary">
      <span className="text-text-muted">{label}：</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
    </p>
  );
}
