"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/i18n";
import { useT } from "@/i18n/locale-context";

export type DetailVariant = {
  id: string;
  sku: string;
  size: string;
  priceCents: number;
  stock: number;
};

export function ProductDetailClient({
  productName,
  seriesCode,
  summary,
  detail,
  material,
  categoryName,
  variants,
}: {
  productName: string;
  seriesCode: string;
  summary: string | null;
  detail: string | null;
  material: string | null;
  categoryName: string | null;
  variants: DetailVariant[];
}) {
  const { addItem } = useCart();
  const t = useT();
  const [selectedId, setSelectedId] = useState<string>(variants[0]?.id ?? "");
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  function handleAdd() {
    if (!selected) return;
    addItem({
      variantId: selected.id,
      sku: selected.sku,
      productName,
      size: selected.size,
      priceCents: selected.priceCents,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  return (
    <div>
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← {t("backToShop")}
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{productName}</h1>
          <p className="mt-1 text-xs text-neutral-400">{seriesCode}</p>
        </div>
        {categoryName && (
          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
            {categoryName}
          </span>
        )}
      </div>

      {summary && <p className="mt-4 text-neutral-700">{summary}</p>}

      {detail && (
        <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-600">
          {detail}
        </p>
      )}

      {material && (
        <p className="mt-3 text-sm text-neutral-500">
          {t("material")}：{material}
        </p>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-medium">{t("selectSize")}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedId(v.id)}
              className={
                v.id === selected?.id
                  ? "rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
              }
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <p className="text-sm text-neutral-500">{t("unitPrice")}</p>
          <p className="text-2xl font-semibold">
            {selected ? formatPrice(selected.priceCents) : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {added ? t("added") : t("addToCart")}
        </button>
      </div>
    </div>
  );
}
