"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-text-muted transition-colors hover:bg-concrete/30 hover:text-red-400"
    >
      登出
    </button>
  );
}
