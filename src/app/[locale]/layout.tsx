import type { Metadata } from "next";
import "../globals.css";
import { dir, isLocale, locales, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Ascal Plast — Smart Operations",
  description: "Ascal Plast operations, sales-force and production system",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;

  return (
    <html lang={locale} dir={dir(locale)}>
      <body>{children}</body>
    </html>
  );
}
