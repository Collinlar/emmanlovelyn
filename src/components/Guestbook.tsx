import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { isGuestbookConfigured } from "@/lib/supabase";
import {
  fetchGuestbookMessages,
  guestbookSchema,
  submitGuestbookMessage,
  type GuestbookMessage,
} from "@/lib/guestbook";

function GuestbookNote({ entry, index }: { entry: GuestbookMessage; index: number }) {
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
          {format(new Date(entry.created_at), "d MMM yyyy")}
        </time>
      </div>
    </article>
  );
}

export default function Guestbook() {
  const queryClient = useQueryClient();
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ guest_name?: string; message?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const configured = isGuestbookConfigured();

  const messagesQuery = useQuery({
    queryKey: ["guestbook-messages"],
    queryFn: fetchGuestbookMessages,
    enabled: configured,
    staleTime: 30_000,
  });

  const submitMutation = useMutation({
    mutationFn: submitGuestbookMessage,
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

    const parsed = guestbookSchema.safeParse({
      guest_name: guestName,
      message,
    });

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        guest_name: errors.guest_name?.[0],
        message: errors.message?.[0],
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
          Words for the Future
        </p>
        <h2 className="mt-4 font-script text-5xl text-primary sm:text-6xl">
          A Note for the Bride &amp; Groom
        </h2>
        <p className="mx-auto mt-6 max-w-2xl font-display text-lg leading-relaxed text-muted-foreground sm:text-xl">
          We would love to read your blessings! Please leave a message or favourite memory for us on
          our digital guestbook.
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
              From
            </Label>
            <Input
              id="guestbook-from"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="min-h-[48px] border-border bg-background/80 px-4 text-base"
              autoComplete="name"
            />
            {fieldErrors.guest_name && (
              <p className="font-sans text-sm text-[#6d1b22]">{fieldErrors.guest_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="guestbook-message"
              className="font-sans text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground"
            >
              Message
            </Label>
            <Textarea
              id="guestbook-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share your blessing, advice, or a favourite memory..."
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
            The guestbook is almost ready. Messages will appear here once the database is connected.
          </p>
        )}

        {formError && (
          <p className="mt-6 font-sans text-sm text-[#6d1b22]" role="alert">
            {formError}
          </p>
        )}

        {submitted && (
          <p className="mt-6 font-display text-lg italic text-primary" role="status">
            Thank you. Your blessing has been added to our guestbook.
          </p>
        )}

        <button
          type="submit"
          disabled={!configured || submitMutation.isPending}
          className="mt-8 min-h-[48px] w-full rounded-sm bg-primary px-4 py-3 font-sans text-xs uppercase tracking-[0.35em] text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
        >
          {submitMutation.isPending ? "Adding your blessing..." : "Leave our blessing"}
        </button>
      </form>

      <div className="mt-16">
        <div className="divider-ornament mb-8 flex w-full items-center gap-4">
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.45em] text-muted-foreground">
            Messages of love
          </span>
        </div>

        {messagesQuery.isLoading && configured && (
          <p className="text-center font-display text-lg text-muted-foreground">
            Gathering blessings...
          </p>
        )}

        {messagesQuery.isError && (
          <p className="text-center font-sans text-sm text-[#6d1b22]">
            We could not load messages just now. Refresh and try again.
          </p>
        )}

        {!messagesQuery.isLoading && messages.length === 0 && (
          <div className="rounded-sm border border-dashed border-border/80 bg-card/30 px-6 py-12 text-center">
            <p className="font-display text-xl italic text-muted-foreground">
              Be the first to leave a note for Emmanuel &amp; Lovelyne.
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
