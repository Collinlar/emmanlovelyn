import { useTranslation } from "@/i18n/useTranslation";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      className="fixed right-4 top-4 z-[45] flex items-center rounded-sm border border-border bg-card/90 p-1 shadow-[var(--shadow-elegant)] backdrop-blur-md sm:right-6 sm:top-6"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`min-h-[36px] rounded-sm px-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] transition ${
          locale === "en"
            ? "min-w-[44px] bg-primary text-primary-foreground"
            : "px-2 text-muted-foreground hover:text-primary"
        }`}
        aria-pressed={locale === "en"}
      >
        {locale === "en" ? "EN" : t("language.switchToEnglish")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("fr")}
        className={`min-h-[36px] rounded-sm px-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] transition ${
          locale === "fr"
            ? "min-w-[44px] bg-primary text-primary-foreground"
            : "px-2 text-muted-foreground hover:text-primary"
        }`}
        aria-pressed={locale === "fr"}
        aria-label={t("language.switchToFrench")}
      >
        {locale === "fr" ? "FR" : t("language.switchToFrench")}
      </button>
    </div>
  );
}
