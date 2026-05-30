-- Digital guestbook for Emmanuel & Lovelyne engagement invitation
create table if not exists public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(trim(guest_name)) >= 2 and char_length(guest_name) <= 80),
  message text not null check (char_length(trim(message)) >= 10 and char_length(message) <= 1000),
  created_at timestamptz not null default now(),
  is_visible boolean not null default true
);

create index if not exists guestbook_messages_created_at_idx
  on public.guestbook_messages (created_at desc);

alter table public.guestbook_messages enable row level security;

create policy "Public can read visible guestbook messages"
  on public.guestbook_messages
  for select
  using (is_visible = true);

create policy "Public can leave guestbook messages"
  on public.guestbook_messages
  for insert
  with check (is_visible = true);
