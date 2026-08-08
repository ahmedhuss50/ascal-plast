import type { Locale } from "@/i18n/config";

export function formatMoney(value: number | null | undefined, locale: Locale) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-US", {
    style: "currency",
    currency: "KWD",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatNumber(value: number | null | undefined, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-US").format(
    Number(value ?? 0)
  );
}

export function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
