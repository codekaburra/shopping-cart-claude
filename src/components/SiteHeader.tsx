"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useT } from "@/i18n/locale-context";
import { LanguageToggle } from "@/components/LanguageToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const t = useT();

  // Hide the header on the login screen.
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {t("appName")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            href="/cart"
            aria-label={t("cartTitle")}
            className="relative inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium hover:bg-neutral-100"
          >
            🛒 {t("cartTitle")}
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-xs font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
