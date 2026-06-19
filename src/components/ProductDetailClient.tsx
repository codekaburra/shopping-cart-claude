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
  imageUrl,
  summary,
  detail,
  material,
  categoryName,
  variants,
}: {
  productName: string;
  seriesCode: string;
  imageUrl: string | null;
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
    <div className="pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← {t("backToShop")}
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Product image / neutral placeholder */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-stone-100 p-10">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={productName}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-center font-serif text-xl text-stone-400">
              {productName}
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          {categoryName && (
            <p className="text-xs uppercase tracking-wide text-brand-600/80">
              {categoryName}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-medium tracking-tight">
            {productName}
          </h1>
          <p className="mt-1 text-xs text-neutral-400">{seriesCode}</p>

          {summary && <p className="mt-5 text-neutral-700">{summary}</p>}
          {detail && (
            <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-600">
              {detail}
            </p>
          )}
          {material && (
            <p className="mt-5 text-sm text-neutral-500">
              <span className="font-medium text-neutral-700">
                {t("material")}
              </span>
              ：{material}
            </p>
          )}

          <div className="mt-8">
            <h2 className="text-sm font-semibold">{t("selectSize")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={
                    v.id === selected?.id
                      ? "rounded-full border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-medium text-white"
                      : "rounded-full border border-stone-300 bg-transparent px-4 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-400"
                  }
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky add-to-cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs text-neutral-500">{t("unitPrice")}</p>
            <p className="text-xl font-semibold">
              {selected ? formatPrice(selected.priceCents) : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selected}
            className="btn-primary flex-1 sm:flex-none sm:px-10"
          >
            {added ? `✓ ${t("added")}` : t("addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
