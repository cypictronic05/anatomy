import de from "../messages/de.json";
import en from "../messages/en.json";
import es from "../messages/es.json";
import fr from "../messages/fr.json";
import zhCN from "../messages/zh-CN.json";
import { defaultLocale, type Locale } from "./config";

export const messagesByLocale = {
  en,
  es,
  fr,
  de,
  "zh-CN": zhCN,
} as const;

export type Messages = typeof en;

export function getMessages(locale: Locale): Messages {
  return messagesByLocale[locale] ?? messagesByLocale[defaultLocale];
}
