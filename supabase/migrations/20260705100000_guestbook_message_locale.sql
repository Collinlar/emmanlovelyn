-- Tag guestbook messages with the language the guest wrote in (en | fr)
alter table public.guestbook_messages
  add column if not exists locale text not null default 'en'
  check (locale in ('en', 'fr'));

create index if not exists guestbook_messages_locale_created_at_idx
  on public.guestbook_messages (locale, created_at desc);
