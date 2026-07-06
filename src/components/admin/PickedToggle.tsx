"use client";

import { useState } from "react";

export function PickedToggle({
  itemId,
  initialPicked,
}: {
  itemId: string;
  initialPicked: boolean;
}) {
  const [picked, setPicked] = useState(initialPicked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !picked;
    setPicked(next);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, picked: next }),
      });
      if (!res.ok) setPicked(!next);
    } catch {
      setPicked(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
        picked
          ? "border-green-500 bg-green-500 text-white"
          : "border-metal-silver/40 bg-transparent hover:border-copper"
      } ${loading ? "opacity-50" : ""}`}
      aria-label={picked ? "標記為未備貨" : "標記為已備貨"}
    >
      {picked && (
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6l3 3 5-5" />
        </svg>
      )}
    </button>
  );
}
