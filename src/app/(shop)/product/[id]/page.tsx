import Link from "next/link";
import { prisma } from "@/lib/db";
import { pick, t } from "@/i18n";
import { getLocale } from "@/i18n/server";
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
  const locale = await getLocale();
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { include: { parent: true } },
      variants: { where: { active: true }, orderBy: { priceCents: "asc" } },
    },
  });

  if (!product || !product.active) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500">{t("productNotFound", locale)}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t("backToShop", locale)}
        </Link>
      </div>
    );
  }

  const variants: DetailVariant[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    priceCents: v.priceCents,
    stock: v.stock,
  }));

  const leaf = product.category;
  const subCategoryName = leaf?.parent
    ? pick(locale, leaf.displayName, leaf.displayNameEn)
    : null;

  return (
    <ProductDetailClient
      productName={pick(locale, product.name, product.nameEn) ?? product.name}
      seriesCode={product.seriesCode}
      imageUrl={product.imageUrl}
      summary={pick(locale, product.summary, product.summaryEn)}
      detail={pick(locale, product.detail, product.detailEn)}
      material={pick(locale, product.material, product.materialEn)}
      categoryName={subCategoryName}
      variants={variants}
    />
  );
}
