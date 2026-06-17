"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/i18n";
import { useLocale } from "@/i18n/locale-context";

// Toggles the locale cookie and refreshes so server components re-render in
// the chosen language.
export function LanguageToggle() {
  const router = useRouter();
  const locale = useLocale();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const base = "px-2.5 py-1 text-xs font-medium transition-colors";
  const active = "bg-neutral-900 text-white";
  const idle = "text-neutral-600 hover:bg-neutral-100";

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-neutral-300">
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={`${base} ${locale === "zh" ? active : idle}`}
      >
        中
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`${base} ${locale === "en" ? active : idle}`}
      >
        EN
      </button>
    </div>
  );
}
