"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useUi } from "@/components/ui-context";
import { useT } from "@/i18n/locale-context";
import { formatPrice } from "@/i18n";

export function CartDrawer() {
  const { items, subtotalCents, setQuantity, removeItem } = useCart();
  const { cartOpen, setCartOpen } = useUi();
  const t = useT();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setCartOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-industrial-dark text-text-primary shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="border-b border-concrete px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-text-primary">
              {t("cartTitle")}
            </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close"
            className="text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-copper/40 via-metal-gold/20 to-transparent" />
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
            <p className="text-text-secondary">{t("cartEmpty")}</p>
            <p className="mt-1 text-sm text-text-muted">{t("cartEmptyHint")}</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-concrete overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 py-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-concrete font-mono text-[10px] text-text-muted">
                    {item.sku.slice(0, 6)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {item.productName}
                    </p>
                    <p className="font-mono text-xs text-text-secondary">
                      {item.size}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="-"
                        onClick={() =>
                          setQuantity(item.variantId, item.quantity - 1)
                        }
                        className="h-7 w-7 rounded-md border border-concrete text-text-secondary hover:border-copper hover:text-copper"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="+"
                        onClick={() =>
                          setQuantity(item.variantId, item.quantity + 1)
                        }
                        className="h-7 w-7 rounded-md border border-concrete text-text-secondary hover:border-copper hover:text-copper"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="ml-auto text-xs text-text-muted hover:text-copper-light"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-medium">
                    {formatPrice(item.priceCents * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-concrete px-5 py-4">
              <input
                type="text"
                placeholder={t("promoCode")}
                className="w-full rounded-lg border border-concrete bg-industrial-gray px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-copper"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-text-secondary">{t("total")}</span>
                <span className="text-lg font-semibold text-copper-light">
                  {formatPrice(subtotalCents)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="btn-primary mt-4 w-full"
              >
                {t("goToCheckout")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
