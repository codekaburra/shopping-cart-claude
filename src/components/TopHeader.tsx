"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useUi } from "@/components/ui-context";
import { useT } from "@/i18n/locale-context";
import { LanguageToggle } from "@/components/LanguageToggle";

export function TopHeader() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { setNavOpen, setCartOpen } = useUi();
  const t = useT();

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-20 bg-neutral-beige/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-metal-silver/50 text-neutral-700 lg:hidden"
        >
          ☰
        </button>

        <div className="flex flex-1 items-center justify-end gap-2">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={t("cartTitle")}
            className="relative inline-flex items-center gap-2 rounded-full border border-metal-silver/50 px-4 py-1.5 text-sm font-medium text-neutral-800 transition-colors hover:border-copper hover:text-copper"
          >
            🛒 {t("cartTitle")}
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1 text-xs font-semibold text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-metal-silver/40 to-transparent" />
    </header>
  );
}
