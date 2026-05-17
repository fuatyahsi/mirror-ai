-- Mirror AI Pro maliyet + telemetri izleme.
-- Her LLM çağrısı (Gemini) sonrası fire-and-forget kayıt; admin/service_role
-- okuyabilir. Kullanıcılar kendi satırlarını göremesin (PII içermez ama
-- her durumda private tutuyoruz).

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  reading_type text not null,
  access_mode text,
  model text not null,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  est_cost_usd numeric(10, 6),
  latency_ms integer,
  success boolean not null default true,
  error_code text,
  finish_reason text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_logs_created_idx
  on public.ai_usage_logs (created_at desc);

create index if not exists ai_usage_logs_model_idx
  on public.ai_usage_logs (model, created_at desc);

create index if not exists ai_usage_logs_user_idx
  on public.ai_usage_logs (user_id, created_at desc);

alter table public.ai_usage_logs enable row level security;

-- Kullanıcı kendi loglarını okuyabilir (gelecekteki "usage" ekranı için)
-- ama insert / update / delete edemez. Insert sadece service_role tarafından
-- edge function üzerinden yapılır.
drop policy if exists "ai_usage_logs_select_own" on public.ai_usage_logs;
create policy "ai_usage_logs_select_own"
  on public.ai_usage_logs
  for select
  using (auth.uid() = user_id);
