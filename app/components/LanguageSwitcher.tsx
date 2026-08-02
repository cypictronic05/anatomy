"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, locales, localizePathname, type Locale } from "../../i18n/config";
import { useI18n } from "./I18nProvider";

const cookieMaxAge = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const { locale, messages, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const languageName = messages.language.names[locale];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!selectedLocale) return;
    document.cookie = `${localeCookieName}=${selectedLocale}; path=/; max-age=${cookieMaxAge}; SameSite=Lax`;
    document.documentElement.lang = selectedLocale;
  }, [selectedLocale]);

  const switchLocale = (nextLocale: Locale) => {
    setSelectedLocale(nextLocale);
    setOpen(false);

    router.replace(`${localizePathname(pathname, nextLocale)}${window.location.search}`);
  };

  return (
    <div className="language-switcher" ref={rootRef}>
      <button
        className="language-trigger"
        type="button"
        aria-label={t("language.ariaLabel")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Languages size={16} />
        <span>{messages.language.shortNames[locale]}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="language-menu" role="listbox" aria-label={t("language.ariaLabel")}>
          <p>{t("language.current", { language: languageName })}</p>
          {locales.map((item) => (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={locale === item}
              onClick={() => switchLocale(item)}
            >
              <span>{messages.language.names[item]}</span>
              {locale === item && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
