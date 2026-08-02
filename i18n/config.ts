export const locales = ["en", "es", "fr", "de", "zh-CN"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "anatomy_locale";

const localeSet = new Set<string>(locales);

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && localeSet.has(value));
}

export function normalizeLocale(value: string | undefined | null): Locale | null {
  if (!value) return null;
  const normalized = value.trim();
  if (isLocale(normalized)) return normalized;

  const lower = normalized.toLowerCase();
  if (lower === "zh" || lower === "zh-cn" || lower === "zh-hans") return "zh-CN";

  const baseLanguage = lower.split("-")[0];
  return locales.find((locale) => locale.toLowerCase() === baseLanguage) ?? null;
}

export function resolveLocale({
  cookieLocale,
  acceptLanguage,
}: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  return normalizeLocale(cookieLocale) ?? resolveAcceptLanguage(acceptLanguage) ?? defaultLocale;
}

export function resolveAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;

  return (
    header
      .split(",")
      .map((item) => {
        const [language, quality = "q=1"] = item.trim().split(";");
        const q = Number.parseFloat(quality.replace("q=", ""));
        return { locale: normalizeLocale(language), q: Number.isFinite(q) ? q : 1 };
      })
      .filter((item): item is { locale: Locale; q: number } => Boolean(item.locale))
      .sort((a, b) => b.q - a.q)[0]?.locale ?? null
  );
}

export function pathnameHasLocale(pathname: string): boolean {
  return isLocale(pathname.split("/").filter(Boolean)[0]);
}

export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

export function localizePathname(pathname: string, locale: Locale): string {
  const stripped = stripLocaleFromPathname(pathname);
  return stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
}
