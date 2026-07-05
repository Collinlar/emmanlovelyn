import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Locale } from "@/i18n/types";

export type GuestbookMessage = {
  id: string;
  guest_name: string;
  message: string;
  locale: Locale;
  created_at: string;
};

export type GuestbookMessageInput = {
  guest_name: string;
  message: string;
  locale: Locale;
};

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined);

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined);

export function isGuestbookConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!isGuestbookConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!);
  }
  return client;
}
