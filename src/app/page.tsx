import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { pick } from "@/i18n";
import { getLocale } from "@/i18n/server";
import { ShopClient, type SeriesSummary } from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const locale = await getLocale();
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: { include: { parent: true } },
      variants: { where: { active: true }, orderBy: { priceCents: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Only show series that have at least one purchasable variant.
  const series: SeriesSummary[] = products
    .filter((p) => p.variants.length > 0)
    .map((p) => {
      const leaf = p.category;
      const top = leaf?.parent ?? leaf; // leaf is itself top-level if no parent
      return {
        id: p.id,
        name: pick(locale, p.name, p.nameEn) ?? p.name,
        seriesCode: p.seriesCode,
        imageUrl: p.imageUrl,
        topCategoryCode: top?.name ?? null,
        topCategoryName: top
          ? pick(locale, top.displayName, top.displayNameEn)
          : null,
        subCategoryCode: leaf?.parent ? leaf.name : null,
        subCategoryName: leaf?.parent
          ? pick(locale, leaf.displayName, leaf.displayNameEn)
          : null,
        minPriceCents: p.variants[0].priceCents,
        variantCount: p.variants.length,
      };
    });

  return (
    <Suspense>
      <ShopClient series={series} />
    </Suspense>
  );
}
