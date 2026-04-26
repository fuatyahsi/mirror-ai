create table public.birth_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_json jsonb not null default '{}'::jsonb,
  chart_json jsonb not null default '{}'::jsonb,
  engine text not null default 'swiss_ephemeris',
  created_at timestamptz not null default now()
);

create index birth_charts_user_created_idx on public.birth_charts(user_id, created_at desc);

alter table public.birth_charts enable row level security;

create policy "birth_charts_select_own" on public.birth_charts
for select using (auth.uid() = user_id);

create policy "birth_charts_insert_own" on public.birth_charts
for insert with check (auth.uid() = user_id);

create policy "birth_charts_delete_own" on public.birth_charts
for delete using (auth.uid() = user_id);

