"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "../../i18n/config";
import type { Messages } from "../../i18n/messages";

type FormatValues = Record<string, string | number | Date>;
type MessageValue = string | MessageTree | MessageValue[];
type MessageTree = { [key: string]: MessageValue };

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  t: (key: string, values?: FormatValues) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
  formatUnit: (value: number, unit: string, options?: Intl.NumberFormatOptions) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, values?: FormatValues) => interpolate(readMessage(messages, key), values);

    return {
      locale,
      messages,
      t,
      formatNumber: (numberValue, options) => new Intl.NumberFormat(locale, options).format(numberValue),
      formatDate: (dateValue, options) => new Intl.DateTimeFormat(locale, options).format(new Date(dateValue)),
      formatUnit: (numberValue, unit, options) =>
        new Intl.NumberFormat(locale, { style: "unit", unit, ...options }).format(numberValue),
    };
  }, [locale, messages]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

function readMessage(messages: MessageTree, key: string): string {
  const value = key.split(".").reduce<MessageValue | undefined>((current, segment) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    return current[segment];
  }, messages);

  if (typeof value !== "string") {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Missing translation key: ${key}`);
    }
    return key;
  }

  return value;
}

function interpolate(template: string, values?: FormatValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
