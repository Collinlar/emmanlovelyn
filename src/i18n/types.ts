import type en from "./locales/en.json";

export type Locale = "en" | "fr";

export type TranslationKey = keyof typeof en extends string
  ? {
      [K in keyof typeof en]: keyof (typeof en)[K] extends string
        ? `${K}.${keyof (typeof en)[K] & string}`
        : never;
    }[keyof typeof en]
  : never;

export type NestedTranslations = typeof en;
