"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatPrice } from "@/i18n";
import { useT } from "@/i18n/locale-context";

export type SeriesSummary = {
  id: string;
  name: string;
  seriesCode: string;
  imageUrl: string | null;
  topCategoryCode: string | null;
  topCategoryName: string | null;
  subCategoryName: string | null;
  minPriceCents: number;
  variantCount: number;
};

export function ShopClient({ series }: { series: SeriesSummary[] }) {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const [query, setQuery] = useState("");

  // Distinct top categories (code + label) for the tag bar.
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of series) {
      if (s.topCategoryCode && !seen.has(s.topCategoryCode)) {
        seen.set(s.topCategoryCode, s.topCategoryName ?? s.topCategoryCode);
      }
    }
    return [...seen.entries()].map(([code, label]) => ({ code, label }));
  }, [series]);

  const q = query.trim().toLowerCase();
  const visible = series.filter((s) => {
    const inCategory = !activeCategory || s.topCategoryCode === activeCategory;
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.seriesCode.toLowerCase().includes(q);
    return inCategory && matchesQuery;
  });

  function selectCategory(code: string) {
    router.push(code ? `/?category=${code}` : "/");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          {t("shopTitle")}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">{t("appTagline")}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-metal-silver">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-2xl border border-metal-silver/50 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-copper focus:ring-2 focus:ring-copper/20"
        />
      </div>

      {/* Category tags */}
      <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <CategoryTag
          label={t("categoryAll")}
          active={!activeCategory}
          onClick={() => selectCategory("")}
        />
        {categories.map((c) => (
          <CategoryTag
            key={c.code}
            label={c.label}
            active={activeCategory === c.code}
            onClick={() => selectCategory(c.code)}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-20 text-center text-neutral-500">
          {t("emptyProducts")}
        </p>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5 xl:grid-cols-4">
          {visible.map((s) => (
            <div key={s.id} className="card card-hover flex flex-col overflow-hidden">
              <Link href={`/product/${s.id}`} className="block">
                <div className="flex aspect-square items-center justify-center bg-white p-6">
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-center font-serif text-sm text-stone-400">
                      {s.name}
                    </span>
                  )}
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <p className="font-mono text-[11px] uppercase tracking-wide text-copper">
                  {s.seriesCode}
                </p>
                <Link href={`/product/${s.id}`}>
                  <h2 className="mt-1 font-serif text-base font-medium leading-snug text-neutral-900">
                    {s.name}
                  </h2>
                </Link>
                <p className="mt-1 font-mono text-[11px] text-neutral-400">
                  {s.variantCount} {t("variantsCount")}
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatPrice(s.minPriceCents)}
                    <span className="ml-1 text-[11px] font-normal text-neutral-400">
                      {t("priceFrom")}
                    </span>
                  </span>
                  <Link
                    href={`/product/${s.id}`}
                    aria-label={t("addToCart")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-copper text-lg leading-none text-white transition-colors hover:bg-copper-light"
                  >
                    +
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryTag({
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
          ? "shrink-0 rounded-full border border-copper bg-copper px-4 py-1.5 text-sm font-medium text-white"
          : "shrink-0 rounded-full border border-metal-silver/50 bg-transparent px-4 py-1.5 text-sm text-neutral-700 transition-colors hover:border-copper hover:text-copper"
      }
    >
      {label}
    </button>
  );
}
