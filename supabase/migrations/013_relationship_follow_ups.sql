-- Mirror AI - automatic relationship follow-up notification.
-- A deep relationship report enqueues a pending row for 7 days later.
-- The hourly pg_cron worker processes pending rows and sends a push
-- notification that routes the user back to the relationship tab.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create table if not exists public.relationship_follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship_id uuid references public.relationships(id) on delete cascade,
  relationship_key text not null,
  source_reading_id uuid references public.readings(id) on delete set null,
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  sent_reading_id uuid references public.readings(id),
  push_notification_id text,
  last_attempt_at timestamptz,
  attempts integer not null default 0,
  error_message text,
  locale text not null default 'tr' check (locale in ('tr', 'en')),
  created_at timestamptz not null default now()
);

create index if not exists relationship_follow_ups_due_idx
  on public.relationship_follow_ups (status, due_at)
  where status = 'pending';

create index if not exists relationship_follow_ups_user_idx
  on public.relationship_follow_ups (user_id, created_at desc);

create unique index if not exists relationship_follow_ups_uniq_pending_idx
  on public.relationship_follow_ups (user_id, relationship_key)
  where status = 'pending';

alter table public.relationship_follow_ups enable row level security;

drop policy if exists "relationship_follow_ups_select_own" on public.relationship_follow_ups;
create policy "relationship_follow_ups_select_own"
  on public.relationship_follow_ups
  for select
  using (auth.uid() = user_id);

do $$
begin
  perform cron.unschedule('process_relationship_follow_ups_hourly');
exception when others then
  -- Continue if the job does not exist yet or pg_cron refuses unschedule.
  null;
end $$;

select cron.schedule(
  'process_relationship_follow_ups_hourly',
  '17 * * * *',
  $$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'mirror_project_url')
        || '/functions/v1/process-relationship-follow-ups',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'mirror_anon_key'),
        'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'mirror_anon_key'),
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'mirror_cron_secret')
      ),
      body := jsonb_build_object('now', now()),
      timeout_milliseconds := 10000
    ) as request_id;
  $$
);
