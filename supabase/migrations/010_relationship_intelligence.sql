alter table public.relationships
  add column if not exists relationship_key text,
  add column if not exists birth_country text,
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists timezone text,
  add column if not exists birth_time_known boolean not null default false,
  add column if not exists main_question text,
  add column if not exists synastry_json jsonb not null default '{}'::jsonb,
  add column if not exists last_synastry_at timestamptz,
  add column if not exists journal_summary_json jsonb not null default '{}'::jsonb;

update public.relationships
set relationship_key = lower(regexp_replace(coalesce(nickname, id::text), '\s+', '_', 'g'))
where relationship_key is null;

alter table public.relationships
  alter column relationship_key set not null;

create unique index if not exists relationships_user_relationship_key_idx
  on public.relationships(user_id, relationship_key);

create table if not exists public.relationship_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship_id uuid references public.relationships(id) on delete cascade,
  relationship_key text not null,
  mood text,
  event_text text not null,
  signals text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create index if not exists relationship_journal_user_relationship_idx
  on public.relationship_journal_entries(user_id, relationship_key, created_at desc);

alter table public.relationship_journal_entries enable row level security;

drop policy if exists "relationship_journal_select_own" on public.relationship_journal_entries;
create policy "relationship_journal_select_own" on public.relationship_journal_entries
for select using (auth.uid() = user_id);

drop policy if exists "relationship_journal_insert_own" on public.relationship_journal_entries;
create policy "relationship_journal_insert_own" on public.relationship_journal_entries
for insert with check (auth.uid() = user_id);

drop policy if exists "relationship_journal_update_own" on public.relationship_journal_entries;
create policy "relationship_journal_update_own" on public.relationship_journal_entries
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "relationship_journal_delete_own" on public.relationship_journal_entries;
create policy "relationship_journal_delete_own" on public.relationship_journal_entries
for delete using (auth.uid() = user_id);
