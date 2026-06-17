"use client";

import { createContext, useContext, type ReactNode } from "react";
import { t as translate, type Locale, type MessageKey } from "./index";

const LocaleContext = createContext<Locale>("zh");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Returns a translator bound to the current locale. */
export function useT(): (key: MessageKey) => string {
  const locale = useLocale();
  return (key) => translate(key, locale);
}
