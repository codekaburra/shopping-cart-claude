"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_FLOW: Record<string, { next: string; label: string } | null> = {
  PENDING: { next: "PAID", label: "標記為已付款" },
  PAID: { next: "COMPLETED", label: "標記為已完成" },
  COMPLETED: null,
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待處理",
  PAID: "已付款",
  COMPLETED: "已完成",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  PAID: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  COMPLETED: "border-green-500/30 bg-green-500/10 text-green-400",
};

export function OrderStatusControl({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const flow = STATUS_FLOW[currentStatus];

  async function handleUpdate(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[currentStatus] ?? ""}`}
      >
        {STATUS_LABELS[currentStatus] ?? currentStatus}
      </span>

      {flow && (
        <button
          type="button"
          onClick={() => handleUpdate(flow.next)}
          disabled={updating}
          className="rounded-lg bg-copper/20 px-3.5 py-1.5 text-xs font-medium text-copper transition-colors hover:bg-copper/30 disabled:opacity-50"
        >
          {updating ? "更新中…" : flow.label}
        </button>
      )}
    </div>
  );
}
