import { z } from "zod";
import {
  getSupabaseClient,
  isGuestbookConfigured,
  type GuestbookMessage,
  type GuestbookMessageInput,
} from "@/lib/supabase";

export const guestbookSchema = z.object({
  guest_name: z
    .string()
    .trim()
    .min(2, "Your name needs at least 2 characters")
    .max(80, "Your name cannot be longer than 80 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Your message needs at least 10 characters")
    .max(1000, "Your message cannot be longer than 1000 characters"),
});

export async function fetchGuestbookMessages(): Promise<GuestbookMessage[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("guestbook_messages")
    .select("id, guest_name, message, created_at")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error("We could not load the guestbook just now.");
  return data ?? [];
}

export async function submitGuestbookMessage(input: GuestbookMessageInput): Promise<GuestbookMessage> {
  if (!isGuestbookConfigured()) {
    throw new Error("The guestbook is not connected yet. Please check back shortly.");
  }

  const parsed = guestbookSchema.parse(input);
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("The guestbook is not connected yet. Please check back shortly.");
  }

  const { data, error } = await supabase
    .from("guestbook_messages")
    .insert({
      guest_name: parsed.guest_name,
      message: parsed.message,
    })
    .select("id, guest_name, message, created_at")
    .single();

  if (error) throw new Error("Your message did not go through. Please try again.");
  return data;
}
