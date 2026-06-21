import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-industrial-dark">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-metal-silver/20 bg-industrial-dark">
        <div className="px-5 py-6">
          <Link href="/admin" className="font-serif text-lg font-semibold text-metal-gold">
            管理後台
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <AdminNavLink href="/admin" label="總覽" icon="📊" />
          <AdminNavLink href="/admin/orders" label="訂單管理" icon="📦" />
          <AdminNavLink href="/admin/products" label="商品管理" icon="🏷️" />
        </nav>
        <div className="border-t border-metal-silver/20 px-3 py-4">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-concrete/30 hover:text-text-primary"
          >
            ← 前往商店
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 pl-56">
        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-concrete/30 hover:text-text-primary"
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}
