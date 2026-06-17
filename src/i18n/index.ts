// i18n hub: dictionaries, locale type, and translation helpers.

import { dictionary as zh } from "./zh-Hant";
import { dictionary as en } from "./en";

export type Locale = "zh" | "en";
export type MessageKey = keyof typeof zh;

export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALES: Locale[] = ["zh", "en"];
export const LOCALE_COOKIE = "locale";

const dictionaries: Record<Locale, Record<MessageKey, string>> = { zh, en };

/** Translate a UI key in the given locale, falling back to zh then the key. */
export function t(key: MessageKey, locale: Locale): string {
  return dictionaries[locale][key] ?? dictionaries.zh[key] ?? key;
}

/** Format a price given in integer cents (locale-independent). */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Pick a localized data field, falling back to the Chinese value. */
export function pick(
  locale: Locale,
  zhVal: string | null | undefined,
  enVal: string | null | undefined,
): string | null {
  if (locale === "en") return enVal ?? zhVal ?? null;
  return zhVal ?? null;
}

/** Coerce an arbitrary cookie value into a supported locale. */
export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "en" ? "en" : "zh";
}
