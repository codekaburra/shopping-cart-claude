import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SiteHeader } from "@/components/SiteHeader";
import { LocaleProvider } from "@/i18n/locale-context";
import { getLocale } from "@/i18n/server";
import { dictionary } from "@/i18n/zh-Hant";

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
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <LocaleProvider locale={locale}>
          <CartProvider>
            <SiteHeader />
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
              {children}
            </main>
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
