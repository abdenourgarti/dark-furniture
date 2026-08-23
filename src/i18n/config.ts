export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

export const localeLabel: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
};

/** Short label shown inside the header switch. */
export const localeShort: Record<Locale, string> = {
  fr: "FR",
  ar: "ع",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
