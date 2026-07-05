import { z } from "zod";
import type { Locale } from "@/i18n/types";
import {
  getSupabaseClient,
  isGuestbookConfigured,
  type GuestbookMessage,
  type GuestbookMessageInput,
} from "@/lib/supabase";

type TranslateFn = (key: string) => string;

export function createGuestbookSchema(t: TranslateFn) {
  return z.object({
    guest_name: z
      .string()
      .trim()
      .min(2, t("guestbook.validation.nameMin"))
      .max(80, t("guestbook.validation.nameMax")),
    message: z
      .string()
      .trim()
      .min(10, t("guestbook.validation.messageMin"))
      .max(1000, t("guestbook.validation.messageMax")),
    locale: z.enum(["en", "fr"], {
      required_error: t("guestbook.validation.languageRequired"),
    }),
  });
}

export async function fetchGuestbookMessages(
  t: TranslateFn,
  locale: Locale,
): Promise<GuestbookMessage[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("guestbook_messages")
    .select("id, guest_name, message, locale, created_at")
    .eq("is_visible", true)
    .eq("locale", locale)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(t("guestbook.errors.load"));
  return (data ?? []).map((row) => ({
    ...row,
    locale: row.locale as Locale,
  }));
}

export async function submitGuestbookMessage(
  input: GuestbookMessageInput,
  t: TranslateFn,
): Promise<GuestbookMessage> {
  if (!isGuestbookConfigured()) {
    throw new Error(t("guestbook.errors.notConnected"));
  }

  const parsed = createGuestbookSchema(t).parse(input);
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error(t("guestbook.errors.notConnected"));
  }

  const { data, error } = await supabase
    .from("guestbook_messages")
    .insert({
      guest_name: parsed.guest_name,
      message: parsed.message,
      locale: parsed.locale,
    })
    .select("id, guest_name, message, locale, created_at")
    .single();

  if (error) throw new Error(t("guestbook.errors.submit"));
  return { ...data, locale: data.locale as Locale };
}
