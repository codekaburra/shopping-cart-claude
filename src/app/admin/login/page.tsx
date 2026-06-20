"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("請輸入帳號和密碼");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError("帳號或密碼錯誤");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("登入失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-industrial-dark">
      <div className="w-full max-w-sm rounded-2xl border border-metal-silver/20 bg-concrete/50 p-8 shadow-2xl">
        <h1 className="font-serif text-2xl font-semibold text-metal-gold">
          管理後台
        </h1>
        <p className="mt-1 text-sm text-text-secondary">請登入以管理訂單</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-primary">
              帳號
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-xl border border-metal-silver/30 bg-industrial-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-copper focus:ring-2 focus:ring-copper/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              密碼
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-metal-silver/30 bg-industrial-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-copper focus:ring-2 focus:ring-copper/20"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "登入中…" : "登入"}
          </button>
        </form>
      </div>
    </div>
  );
}
