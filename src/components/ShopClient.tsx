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
  subCategoryCode: string | null;
  subCategoryName: string | null;
  minPriceCents: number;
  variantCount: number;
};

export function ShopClient({ series }: { series: SeriesSummary[] }) {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const activeSub = searchParams.get("sub");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of series) {
      if (s.topCategoryCode && !seen.has(s.topCategoryCode)) {
        seen.set(s.topCategoryCode, s.topCategoryName ?? s.topCategoryCode);
      }
    }
    return [...seen.entries()].map(([code, label]) => ({ code, label }));
  }, [series]);

  const subCategories = useMemo(() => {
    if (!activeCategory) return [];
    const seen = new Map<string, string>();
    for (const s of series) {
      if (
        s.topCategoryCode === activeCategory &&
        s.subCategoryCode &&
        !seen.has(s.subCategoryCode)
      ) {
        seen.set(s.subCategoryCode, s.subCategoryName ?? s.subCategoryCode);
      }
    }
    return [...seen.entries()].map(([code, label]) => ({ code, label }));
  }, [series, activeCategory]);

  const q = query.trim().toLowerCase();
  const visible = series.filter((s) => {
    const inCategory = !activeCategory || s.topCategoryCode === activeCategory;
    const inSub = !activeSub || s.subCategoryCode === activeSub;
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.seriesCode.toLowerCase().includes(q);
    return inCategory && inSub && matchesQuery;
  });

  function selectCategory(code: string) {
    router.push(code ? `/?category=${code}` : "/");
  }

  function selectSub(code: string) {
    router.push(
      code
        ? `/?category=${activeCategory}&sub=${code}`
        : `/?category=${activeCategory}`,
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tighter text-industrial-dark sm:text-5xl">
          {t("shopTitle")}
        </h1>
        <p className="mt-2 text-sm text-metal-silver">{t("appTagline")}</p>
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

      {/* Subcategory tags — shown when a top category is selected */}
      {subCategories.length > 0 && (
        <div className="mt-2.5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <SubCategoryTag
            label={t("categoryAll")}
            active={!activeSub}
            onClick={() => selectSub("")}
          />
          {subCategories.map((c) => (
            <SubCategoryTag
              key={c.code}
              label={c.label}
              active={activeSub === c.code}
              onClick={() => selectSub(c.code)}
            />
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-20 text-center text-neutral-500">
          {t("emptyProducts")}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {visible.map((s) => (
            <div key={s.id} className="card card-hover flex flex-col overflow-hidden">
              <Link href={`/product/${s.id}`} className="relative block">
                <div className="flex aspect-square items-center justify-center bg-neutral-light p-6">
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
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-neutral-light to-transparent" />
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-copper">
                  {s.seriesCode}
                </p>
                <Link href={`/product/${s.id}`}>
                  <h2 className="mt-1.5 font-serif text-base font-medium leading-snug text-neutral-900">
                    {s.name}
                  </h2>
                </Link>
                <p className="mt-1 font-mono text-[10px] text-metal-silver">
                  {s.variantCount} {t("variantsCount")}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-metal-silver/20 pt-3">
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatPrice(s.minPriceCents)}
                    <span className="ml-1 text-[10px] font-normal text-metal-silver">
                      {t("priceFrom")}
                    </span>
                  </span>
                  <Link
                    href={`/product/${s.id}`}
                    aria-label={t("addToCart")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-copper text-lg leading-none text-white shadow-[0_4px_12px_-4px_rgb(201,123,74,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-copper hover:via-copper-light hover:to-metal-gold hover:shadow-[0_6px_16px_-4px_rgb(201,123,74,0.6)]"
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
          ? "shrink-0 rounded-full border border-copper bg-copper px-4 py-1.5 text-sm font-medium text-white shadow-[inset_0_1px_2px_rgb(0,0,0,0.2)]"
          : "shrink-0 rounded-full border border-metal-silver/40 bg-transparent px-4 py-1.5 text-sm text-neutral-600 transition-all hover:border-copper hover:text-copper hover:shadow-sm"
      }
    >
      {label}
    </button>
  );
}

function SubCategoryTag({
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
          ? "shrink-0 rounded-full border border-copper/60 bg-copper/15 px-3.5 py-1 text-xs font-medium text-copper"
          : "shrink-0 rounded-full border border-metal-silver/30 bg-transparent px-3.5 py-1 text-xs text-neutral-500 transition-all hover:border-copper/50 hover:text-copper"
      }
    >
      {label}
    </button>
  );
}
