import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n/useTranslation";
import type { Locale } from "@/i18n/types";
import { isGuestbookConfigured } from "@/lib/supabase";
import {
  createGuestbookSchema,
  fetchGuestbookMessages,
  submitGuestbookMessage,
  type GuestbookMessage,
} from "@/lib/guestbook";

function GuestbookNote({ entry, index }: { entry: GuestbookMessage; index: number }) {
  const { locale } = useTranslation();
  const dateLocale = locale === "fr" ? fr : enUS;
  const tilt = index % 2 === 0 ? "-rotate-[0.6deg]" : "rotate-[0.6deg]";

  return (
    <article
      className={`relative rounded-sm border border-border/70 bg-[linear-gradient(145deg,oklch(0.97_0.012_75),oklch(0.945_0.015_75))] p-6 shadow-[var(--shadow-elegant)] ${tilt}`}
    >
      <div
        className="pointer-events-none absolute inset-3 rounded-sm border border-double border-accent/15"
        aria-hidden
      />
      <p className="font-display text-lg leading-relaxed text-foreground italic sm:text-xl">
        &ldquo;{entry.message}&rdquo;
      </p>
      <div className="mt-6 flex items-end justify-between gap-4">
        <p className="font-script text-2xl text-primary sm:text-3xl">{entry.guest_name}</p>
        <time
          dateTime={entry.created_at}
          className="shrink-0 font-sans text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground/70"
        >
          {format(new Date(entry.created_at), "d MMM yyyy", { locale: dateLocale })}
        </time>
      </div>
    </article>
  );
}

function MessageLanguagePicker({
  value,
  onChange,
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label className="font-sans text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
        {t("guestbook.messageLanguageLabel")}
      </Label>
      <div
        className="inline-flex rounded-sm border border-border bg-background/80 p-1"
        role="radiogroup"
        aria-label={t("guestbook.messageLanguageLabel")}
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === "en"}
          onClick={() => onChange("en")}
          className={`min-h-[44px] rounded-sm px-4 font-sans text-xs uppercase tracking-[0.25em] transition ${
            value === "en"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          {t("guestbook.messageLanguageEn")}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === "fr"}
          onClick={() => onChange("fr")}
          className={`min-h-[44px] rounded-sm px-4 font-sans text-xs uppercase tracking-[0.25em] transition ${
            value === "fr"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          {t("guestbook.messageLanguageFr")}
        </button>
      </div>
      <p className="font-sans text-sm text-muted-foreground">{t("guestbook.messageLanguageHint")}</p>
    </div>
  );
}

export default function Guestbook() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [messageLanguage, setMessageLanguage] = useState<Locale>(locale);
  const [fieldErrors, setFieldErrors] = useState<{
    guest_name?: string;
    message?: string;
    locale?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMessageLanguage(locale);
  }, [locale]);

  const configured = isGuestbookConfigured();

  const messagesQuery = useQuery({
    queryKey: ["guestbook-messages", locale],
    queryFn: () => fetchGuestbookMessages(t, locale),
    enabled: configured,
    staleTime: 30_000,
  });

  const submitMutation = useMutation({
    mutationFn: (input: { guest_name: string; message: string; locale: Locale }) =>
      submitGuestbookMessage(input, t),
    onSuccess: () => {
      setGuestName("");
      setMessage("");
      setFieldErrors({});
      setFormError(null);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["guestbook-messages"] });
      window.setTimeout(() => setSubmitted(false), 4000);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = createGuestbookSchema(t).safeParse({
      guest_name: guestName,
      message,
      locale: messageLanguage,
    });

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        guest_name: errors.guest_name?.[0],
        message: errors.message?.[0],
        locale: errors.locale?.[0],
      });
      return;
    }

    setFieldErrors({});
    submitMutation.mutate(parsed.data);
  }

  const messages = messagesQuery.data ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="text-center">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.5em] text-muted-foreground">
          {t("guestbook.subtitle")}
        </p>
        <h2 className="mt-4 font-script text-5xl text-primary sm:text-6xl">
          {t("guestbook.heading")}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl font-display text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {t("guestbook.intro")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-12 rounded-sm border border-border bg-card/50 p-6 shadow-[var(--shadow-elegant)] sm:p-8"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="guestbook-from"
              className="font-sans text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground"
            >
              {t("guestbook.fromLabel")}
            </Label>
            <Input
              id="guestbook-from"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder={t("guestbook.fromPlaceholder")}
              maxLength={80}
              className="min-h-[48px] border-border bg-background/80 px-4 text-base"
              autoComplete="name"
            />
            {fieldErrors.guest_name && (
              <p className="font-sans text-sm text-[#6d1b22]">{fieldErrors.guest_name}</p>
            )}
          </div>

          <MessageLanguagePicker value={messageLanguage} onChange={setMessageLanguage} />
          {fieldErrors.locale && (
            <p className="font-sans text-sm text-[#6d1b22]">{fieldErrors.locale}</p>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="guestbook-message"
              className="font-sans text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground"
            >
              {t("guestbook.messageLabel")}
            </Label>
            <Textarea
              id="guestbook-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t("guestbook.messagePlaceholder")}
              maxLength={1000}
              rows={5}
              className="min-h-[140px] resize-y border-border bg-background/80 px-4 py-3 text-base leading-relaxed"
            />
            {fieldErrors.message && (
              <p className="font-sans text-sm text-[#6d1b22]">{fieldErrors.message}</p>
            )}
          </div>
        </div>

        {!configured && (
          <p className="mt-6 font-sans text-sm text-muted-foreground">
            {t("guestbook.notConfigured")}
          </p>
        )}

        {formError && (
          <p className="mt-6 font-sans text-sm text-[#6d1b22]" role="alert">
            {formError}
          </p>
        )}

        {submitted && (
          <p className="mt-6 font-display text-lg italic text-primary" role="status">
            {t("guestbook.success")}
          </p>
        )}

        <button
          type="submit"
          disabled={!configured || submitMutation.isPending}
          className="mt-8 min-h-[48px] w-full rounded-sm bg-primary px-4 py-3 font-sans text-xs uppercase tracking-[0.35em] text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
        >
          {submitMutation.isPending ? t("guestbook.submitting") : t("guestbook.submit")}
        </button>
      </form>

      <div className="mt-16">
        <div className="divider-ornament mb-8 flex w-full items-center gap-4">
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.45em] text-muted-foreground">
            {t("guestbook.messagesHeading")}
          </span>
        </div>

        {messagesQuery.isLoading && configured && (
          <p className="text-center font-display text-lg text-muted-foreground">
            {t("guestbook.loading")}
          </p>
        )}

        {messagesQuery.isError && (
          <p className="text-center font-sans text-sm text-[#6d1b22]">
            {t("guestbook.loadError")}
          </p>
        )}

        {!messagesQuery.isLoading && messages.length === 0 && (
          <div className="rounded-sm border border-dashed border-border/80 bg-card/30 px-6 py-12 text-center">
            <p className="font-display text-xl italic text-muted-foreground">
              {t("guestbook.empty")}
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {messages.map((entry, index) => (
              <GuestbookNote key={entry.id} entry={entry} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
