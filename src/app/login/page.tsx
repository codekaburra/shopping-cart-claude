"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { t } from "@/i18n/zh-Hant";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only allow same-site relative paths as the post-login destination.
  const nextParam = searchParams.get("next");
  const nextPath = nextParam && nextParam.startsWith("/") ? nextParam : "/";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError(t("loginErrorEmpty"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        setError(t("loginErrorInvalid"));
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError(t("loginErrorInvalid"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
      <h1 className="text-2xl font-semibold">{t("appName")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{t("appTagline")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="code">
            {t("loginTitle")}
          </label>
          <p className="mt-1 text-xs text-neutral-500">{t("loginSubtitle")}</p>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("inviteCodePlaceholder")}
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {t("loginButton")}
        </button>
      </form>
    </div>
  );
}
