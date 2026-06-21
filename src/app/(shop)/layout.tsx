import { prisma } from "@/lib/db";
import { pick, t } from "@/i18n";
import { getLocale } from "@/i18n/server";
import { CartProvider } from "@/context/CartContext";
import { UiProvider } from "@/components/ui-context";
import { Sidebar, type NavCategory } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { CartDrawer } from "@/components/CartDrawer";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const topCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { id: "asc" },
  });
  const categories: NavCategory[] = topCategories.map((c) => ({
    code: c.name,
    label: pick(locale, c.displayName, c.displayNameEn) ?? c.name,
  }));

  return (
    <UiProvider>
      <CartProvider>
        <Sidebar appName={t("appName", locale)} categories={categories} />
        <div className="flex min-h-screen flex-col lg:pl-64">
          <TopHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
        </div>
        <CartDrawer />
      </CartProvider>
    </UiProvider>
  );
}
