"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useUi } from "@/components/ui-context";
import { useT } from "@/i18n/locale-context";

export type NavCategory = { code: string; label: string };

export function Sidebar({
  appName,
  categories,
}: {
  appName: string;
  categories: NavCategory[];
}) {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { navOpen, setNavOpen } = useUi();

  const activeCategory = searchParams.get("category");
  const onShop = pathname === "/";

  const items: NavCategory[] = [
    { code: "", label: t("categoryAll") },
    ...categories,
  ];

  return (
    <>
      {/* Mobile overlay */}
      {navOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-metal-silver/20 bg-industrial-dark transition-transform duration-300 lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-7">
          <Link
            href="/"
            onClick={() => setNavOpen(false)}
            className="font-serif text-xl font-semibold tracking-tight text-metal-gold"
          >
            {appName}
          </Link>
        </div>

        <nav className="flex-1 px-3">
          {items.map((item) => {
            const active = onShop
              ? item.code
                ? activeCategory === item.code
                : !activeCategory
              : false;
            return (
              <Link
                key={item.code || "all"}
                href={item.code ? `/?category=${item.code}` : "/"}
                onClick={() => setNavOpen(false)}
                className={`group relative block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-concrete/50 text-copper-light"
                    : "text-text-secondary hover:bg-concrete/30 hover:text-text-primary"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-sm bg-copper transition-all duration-200 ${
                    active ? "w-[3px]" : "w-0 group-hover:w-[3px]"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
