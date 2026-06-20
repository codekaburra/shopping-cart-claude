import type { Metadata } from "next";
import "./globals.css";
import { dictionary } from "@/i18n/zh-Hant";
import { getLocale } from "@/i18n/server";
import { LocaleProvider } from "@/i18n/locale-context";

export const metadata: Metadata = {
  title: dictionary.appName,
  description: dictionary.appTagline,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale === "en" ? "en" : "zh-Hant"}
      className="h-full antialiased"
    >
      <body className="min-h-full bg-neutral-beige text-neutral-900">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
