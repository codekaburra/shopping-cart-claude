import Link from "next/link";
import { prisma } from "@/lib/db";
import { t, formatPrice } from "@/i18n/zh-Hant";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500">{t("orderNotFound")}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  const total = order.items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );

  return (
    <div>
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-2xl">✅</p>
        <h1 className="mt-1 text-xl font-semibold text-green-800">
          {t("orderConfirmedTitle")}
        </h1>
        <p className="mt-2 text-sm text-green-700">
          {t("orderNumber")}：
          <span className="font-mono font-medium">{order.id}</span>
        </p>
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t("orderConfirmedNotice")}
      </p>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium">{t("orderSummary")}</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span className="text-neutral-600">
                {item.productName}（{item.variantSize}） × {item.quantity}
              </span>
              <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 font-semibold">
          <span>{t("total")}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
        <h2 className="font-medium">{t("contactInfo")}</h2>
        <dl className="mt-2 space-y-1 text-neutral-600">
          <div className="flex gap-2">
            <dt>{t("contactName")}：</dt>
            <dd>{order.contactName}</dd>
          </div>
          <div className="flex gap-2">
            <dt>{t("contactPhone")}：</dt>
            <dd>{order.contactPhone}</dd>
          </div>
          <div className="flex gap-2">
            <dt>{t("fulfillmentLabel")}：</dt>
            <dd>
              {order.fulfillment === "DELIVERY"
                ? `${t("deliveryTo")} — ${order.address}`
                : t("pickupInStore")}
            </dd>
          </div>
          {order.note && (
            <div className="flex gap-2">
              <dt>{t("note")}：</dt>
              <dd>{order.note}</dd>
            </div>
          )}
        </dl>
      </div>

      <Link
        href="/"
        className="mt-6 inline-block rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:bg-neutral-100"
      >
        {t("backToShop")}
      </Link>
    </div>
  );
}
