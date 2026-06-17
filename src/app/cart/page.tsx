"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/i18n";
import { useT } from "@/i18n/locale-context";

export default function CartPage() {
  const t = useT();
  const { items, subtotalCents, setQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">{t("cartTitle")}</h1>
        <p className="mt-3 text-neutral-500">{t("cartEmpty")}</p>
        <p className="mt-1 text-sm text-neutral-400">{t("cartEmptyHint")}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">{t("cartTitle")}</h1>

      <ul className="mt-4 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {item.productName}
                <span className="ml-2 text-sm font-normal text-neutral-500">
                  {item.size}
                </span>
              </p>
              <p className="text-sm text-neutral-500">
                {formatPrice(item.priceCents)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="-"
                onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                className="h-8 w-8 rounded-md border border-neutral-300 text-lg leading-none hover:bg-neutral-100"
              >
                −
              </button>
              <span className="w-6 text-center tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="+"
                onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                className="h-8 w-8 rounded-md border border-neutral-300 text-lg leading-none hover:bg-neutral-100"
              >
                +
              </button>
            </div>

            <div className="w-20 text-right font-medium">
              {formatPrice(item.priceCents * item.quantity)}
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.variantId)}
              className="text-sm text-red-600 hover:underline"
            >
              {t("remove")}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
        <span className="font-medium">{t("subtotal")}</span>
        <span className="text-lg font-semibold">
          {formatPrice(subtotalCents)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:bg-neutral-100"
        >
          {t("backToShop")}
        </Link>
        <Link
          href="/checkout"
          className="flex-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-center font-medium text-white"
        >
          {t("goToCheckout")}
        </Link>
      </div>
    </div>
  );
}
