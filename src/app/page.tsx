import { prisma } from "@/lib/db";
import { ShopClient, type SeriesSummary } from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
      variants: { where: { active: true }, orderBy: { priceCents: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Only show series that have at least one purchasable variant.
  const series: SeriesSummary[] = products
    .filter((p) => p.variants.length > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      seriesCode: p.seriesCode,
      categoryName: p.category?.name ?? null,
      minPriceCents: p.variants[0].priceCents,
      variantCount: p.variants.length,
    }));

  return <ShopClient series={series} />;
}
