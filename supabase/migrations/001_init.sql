create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  gender text,
  birth_date date,
  birth_time time,
  birth_city text,
  birth_country text,
  latitude numeric,
  longitude numeric,
  timezone text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table public.user_personality_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  uncertainty_tolerance numeric not null default 50,
  intuitive_openness numeric not null default 50,
  romantic_idealization numeric not null default 50,
  control_need numeric not null default 50,
  emotional_intensity numeric not null default 50,
  rationality_need numeric not null default 50,
  spiritual_openness numeric not null default 50,
  attachment_anxiety numeric not null default 50,
  avoidance_tendency numeric not null default 50,
  profile_title text,
  profile_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reading_type text not null check (
    reading_type in ('daily', 'coffee', 'tarot', 'numerology', 'relationship', 'birth_chart')
  ),
  topic text not null,
  question text,
  result_json jsonb not null default '{}'::jsonb,
  explanation_json jsonb not null default '{}'::jsonb,
  confidence numeric,
  premium_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reading_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reading_id uuid not null references public.readings(id) on delete cascade,
  score text not null check (score in ('accurate', 'partial', 'inaccurate')),
  accuracy_rating int not null check (accuracy_rating between 1 and 5),
  emotional_resonance int not null check (emotional_resonance between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, reading_id)
);

create table public.memory_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  source_type text not null,
  source_id uuid,
  memory_key text not null,
  memory_value jsonb not null default '{}'::jsonb,
  weight numeric not null default 1,
  created_at timestamptz not null default now()
);

create table public.coffee_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reading_id uuid not null references public.readings(id) on delete cascade,
  cup_image_url text not null,
  plate_image_url text,
  detected_symbols jsonb not null default '[]'::jsonb,
  user_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (reading_id)
);

create table public.tarot_decks (
  id uuid primary key default gen_random_uuid(),
  card_key text not null unique,
  name text not null,
  suit text,
  arcana text not null,
  upright_meaning text not null,
  reversed_meaning text not null,
  image_url text
);

create table public.tarot_spreads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reading_id uuid not null references public.readings(id) on delete cascade,
  spread_type text not null,
  selected_cards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (reading_id)
);

create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  relation_type text not null,
  birth_date date,
  birth_time time,
  birth_city text,
  known_context text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  balance int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  transaction_type text not null,
  reason text not null,
  reading_id uuid references public.readings(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_customer_id text not null,
  entitlement text not null,
  status text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_customer_id, entitlement)
);

create index readings_user_created_idx on public.readings(user_id, created_at desc);
create index reading_feedback_user_idx on public.reading_feedback(user_id, created_at desc);
create index memory_events_user_key_idx on public.memory_events(user_id, memory_key, created_at desc);
create index coffee_readings_user_idx on public.coffee_readings(user_id, created_at desc);
create index tarot_spreads_user_idx on public.tarot_spreads(user_id, created_at desc);
create index relationships_user_idx on public.relationships(user_id, updated_at desc);
create index credit_transactions_user_idx on public.credit_transactions(user_id, created_at desc);
create index subscriptions_user_idx on public.subscriptions(user_id, status);

create trigger set_users_profile_updated_at
before update on public.users_profile
for each row execute function public.set_updated_at();

create trigger set_user_personality_profile_updated_at
before update on public.user_personality_profile
for each row execute function public.set_updated_at();

create trigger set_relationships_updated_at
before update on public.relationships
for each row execute function public.set_updated_at();

create trigger set_user_credits_updated_at
before update on public.user_credits
for each row execute function public.set_updated_at();

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

