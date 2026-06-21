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
    <div className="pb-28 md:pb-0">
      {/* Back link — hidden on mobile (use browser back), shown on desktop */}
      <Link
        href="/"
        className="hidden items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 md:inline-flex"
      >
        ← {t("backToShop")}
      </Link>

      <div className="md:mt-4 md:grid md:grid-cols-2 md:gap-12">
        {/* Product image — full-bleed on mobile, contained on desktop */}
        <div className="-mx-4 sm:-mx-6 md:mx-0">
          <div className="flex aspect-[4/3] items-center justify-center bg-neutral-light shadow-inner md:aspect-square md:overflow-hidden md:rounded-2xl md:border md:border-metal-silver/20">
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
        </div>

        {/* Details */}
        <div className="mt-6 md:mt-0">
          {categoryName && (
            <p className="text-xs uppercase tracking-widest text-copper">
              {categoryName}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tighter text-industrial-dark sm:text-3xl md:text-4xl">
            {productName}
          </h1>
          <p className="mt-1 font-mono text-xs tracking-wide text-metal-silver">
            {seriesCode}
          </p>

          {summary && (
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
              {summary}
            </p>
          )}
          {detail && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-500">
              {detail}
            </p>
          )}
          {material && (
            <p className="mt-4 text-sm text-neutral-500">
              <span className="font-medium text-neutral-700">
                {t("material")}
              </span>
              ：{material}
            </p>
          )}

          {/* Variant selector — 2-col grid on mobile, flex-wrap on desktop */}
          <div className="mt-6 border-t border-metal-silver/20 pt-5">
            <h2 className="text-sm font-semibold text-neutral-800">
              {t("selectSize")}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5 md:flex md:flex-wrap md:gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={
                    v.id === selected?.id
                      ? "rounded-2xl border border-copper bg-copper px-3 py-3 text-sm font-medium text-white shadow-[inset_0_1px_2px_rgb(0,0,0,0.15)] md:rounded-full md:px-4 md:py-2"
                      : "rounded-2xl border border-metal-silver/40 bg-white px-3 py-3 text-sm text-neutral-700 transition-all hover:border-copper hover:text-copper md:rounded-full md:px-4 md:py-2"
                  }
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          {/* Price + Add to cart — desktop inline version */}
          <div className="mt-6 hidden border-t border-metal-silver/30 pt-6 md:block">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-neutral-500">{t("unitPrice")}</span>
              <span className="text-2xl font-semibold text-copper">
                {selected ? formatPrice(selected.priceCents) : "—"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selected}
              className="btn-primary mt-4 w-full sm:w-auto sm:px-12"
            >
              {added ? `✓ ${t("added")}` : t("addToCart")}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-metal-silver/30 bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-metal-silver">
              {t("unitPrice")}
            </p>
            <p className="text-xl font-semibold text-copper">
              {selected ? formatPrice(selected.priceCents) : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selected}
            className="btn-primary flex-1 py-3.5 text-base"
          >
            {added ? `✓ ${t("added")}` : t("addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
