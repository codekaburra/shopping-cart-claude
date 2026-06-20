"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = [
  { key: "PENDING_PAYMENT", label: "待付款", icon: "💳" },
  { key: "PENDING_VERIFICATION", label: "待核實收款", icon: "🔍" },
  { key: "PENDING_SHIPMENT", label: "待出貨", icon: "📦" },
  { key: "PENDING_PICKUP", label: "待客戶交收", icon: "🚚" },
  { key: "COMPLETED", label: "已完成", icon: "✓" },
] as const;

const STATUS_FLOW: Record<string, { next: string; label: string } | null> = {
  PENDING_PAYMENT: { next: "PENDING_VERIFICATION", label: "標記為待核實收款" },
  PENDING_VERIFICATION: { next: "PENDING_SHIPMENT", label: "標記為待出貨" },
  PENDING_SHIPMENT: { next: "PENDING_PICKUP", label: "標記為待客戶交收" },
  PENDING_PICKUP: { next: "COMPLETED", label: "標記為已完成" },
  COMPLETED: null,
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
  const currentIdx = STEPS.findIndex((s) => s.key === currentStatus);

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
    <div className="space-y-4">
      {/* Stepper bar */}
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const last = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex flex-1 items-start">
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm transition-colors ${
                    done
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : active
                        ? "border-copper bg-copper/20 text-copper"
                        : "border-metal-silver/30 bg-concrete/30 text-text-muted"
                  }`}
                >
                  {done ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{step.icon}</span>
                  )}
                </div>
                {/* Label */}
                <p
                  className={`mt-2 text-center text-[10px] leading-tight ${
                    done
                      ? "text-green-400"
                      : active
                        ? "font-medium text-copper"
                        : "text-text-muted"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector line */}
              {!last && (
                <div className="mt-[18px] flex-1 px-1">
                  <div
                    className={`h-0.5 w-full ${
                      i < currentIdx
                        ? "bg-green-500"
                        : "bg-metal-silver/20"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action button */}
      {flow && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleUpdate(flow.next)}
            disabled={updating}
            className="rounded-lg bg-copper/20 px-4 py-2 text-xs font-medium text-copper transition-colors hover:bg-copper/30 disabled:opacity-50"
          >
            {updating ? "更新中…" : `${flow.label} →`}
          </button>
        </div>
      )}
    </div>
  );
}
