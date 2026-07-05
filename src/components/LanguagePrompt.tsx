import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { getLocaleFromUrl, LOCALE_PROMPT_KEY } from "@/i18n/translations";

function browserPrefersFrench() {
  if (typeof navigator === "undefined") return false;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((lang) => lang?.toLowerCase().startsWith("fr"));
}

export default function LanguagePrompt() {
  const { locale, setLocale, t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (locale !== "en") return;
    if (getLocaleFromUrl()) return;
    if (window.localStorage.getItem(LOCALE_PROMPT_KEY)) return;
    if (!browserPrefersFrench()) return;
    setVisible(true);
  }, [locale]);

  function dismiss() {
    window.localStorage.setItem(LOCALE_PROMPT_KEY, "1");
    setVisible(false);
  }

  function acceptFrench() {
    dismiss();
    setLocale("fr");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-24 z-[45] mx-auto max-w-md rounded-sm border border-border bg-card/95 p-5 shadow-[var(--shadow-elegant)] backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:mx-0"
      role="dialog"
      aria-label={t("language.promptQuestion")}
    >
      <p className="font-display text-lg text-primary">{t("language.promptQuestion")}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={acceptFrench}
          className="min-h-[44px] flex-1 rounded-sm bg-primary px-4 py-2 font-sans text-xs uppercase tracking-[0.25em] text-primary-foreground transition hover:bg-primary/90"
        >
          {t("language.promptAccept")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[44px] flex-1 rounded-sm border border-border bg-background px-4 py-2 font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground transition hover:text-primary"
        >
          {t("language.promptDecline")}
        </button>
      </div>
    </div>
  );
}
