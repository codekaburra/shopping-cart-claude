import Link from "next/link";
import { prisma } from "@/lib/db";
import { t } from "@/i18n/zh-Hant";
import {
  ProductDetailClient,
  type DetailVariant,
} from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { where: { active: true }, orderBy: { priceCents: "asc" } },
    },
  });

  if (!product || !product.active) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500">{t("productNotFound")}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  const variants: DetailVariant[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    priceCents: v.priceCents,
  }));

  return (
    <ProductDetailClient
      productName={product.name}
      seriesCode={product.seriesCode}
      description={product.description}
      categoryName={product.category?.name ?? null}
      variants={variants}
    />
  );
}
