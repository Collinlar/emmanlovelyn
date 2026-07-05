import en from "./locales/en.json";
import fr from "./locales/fr.json";
import type { Locale, NestedTranslations } from "./types";

export const translations: Record<Locale, NestedTranslations> = { en, fr };

export const LOCALE_STORAGE_KEY = "invitation-locale";
export const LOCALE_PROMPT_KEY = "invitation-lang-prompt-seen";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "fr";
}

export function getLocaleFromUrl(): Locale | null {
  if (typeof window === "undefined") return null;
  const lang = new URLSearchParams(window.location.search).get("lang");
  return isLocale(lang) ? lang : null;
}

export function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : null;
}

export function resolveInitialLocale(): Locale {
  return getLocaleFromUrl() ?? getStoredLocale() ?? "en";
}

export function syncLocaleToUrl(locale: Locale) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("lang", locale);
  window.history.replaceState({}, "", url.toString());
}

export function persistLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function getNestedValue(obj: NestedTranslations, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

export function interpolate(
  template: string,
  values: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values[key] != null ? String(values[key]) : `{${key}}`,
  );
}
