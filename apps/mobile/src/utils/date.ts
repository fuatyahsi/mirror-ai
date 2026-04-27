import type { Locale } from "@/i18n";

export function formatReadableDate(value: string, locale: Locale = "tr") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export function nowIso() {
  return new Date().toISOString();
}
