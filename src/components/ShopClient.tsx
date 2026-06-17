"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/i18n";
import { useT } from "@/i18n/locale-context";

export type SeriesSummary = {
  id: string;
  name: string;
  seriesCode: string;
  summary: string | null;
  topCategoryName: string | null;
  subCategoryName: string | null;
  minPriceCents: number;
  variantCount: number;
};

export function ShopClient({ series }: { series: SeriesSummary[] }) {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState<string>("__all__");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          series.map((s) => s.topCategoryName).filter(Boolean) as string[],
        ),
      ),
    [series],
  );

  const visible =
    activeCategory === "__all__"
      ? series
      : series.filter((s) => s.topCategoryName === activeCategory);

  return (
    <div>
      <h1 className="text-xl font-semibold">{t("shopTitle")}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <CategoryTab
          label={t("categoryAll")}
          active={activeCategory === "__all__"}
          onClick={() => setActiveCategory("__all__")}
        />
        {categories.map((category) => (
          <CategoryTab
            key={category}
            label={category}
            active={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">
          {t("emptyProducts")}
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => (
            <Link
              key={s.id}
              href={`/product/${s.id}`}
              className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-medium">{s.name}</h2>
                {s.subCategoryName && (
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                    {s.subCategoryName}
                  </span>
                )}
              </div>
              {s.summary && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                  {s.summary}
                </p>
              )}
              <div className="mt-4 flex items-end justify-between">
                <span className="text-lg font-semibold">
                  {formatPrice(s.minPriceCents)}
                  <span className="ml-1 text-xs font-normal text-neutral-500">
                    {t("priceFrom")}
                  </span>
                </span>
                <span className="text-sm text-neutral-500">
                  {s.variantCount} {t("variantsCount")} ·{" "}
                  <span className="font-medium text-neutral-900">
                    {t("viewProduct")}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-neutral-900 px-3 py-1 text-sm font-medium text-white"
          : "rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-100"
      }
    >
      {label}
    </button>
  );
}
