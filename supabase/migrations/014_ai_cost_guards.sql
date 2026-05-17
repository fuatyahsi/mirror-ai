-- Mirror AI AI cost guard metadata.
-- 012_ai_usage_logs logs token/cost data. This migration adds enough metadata
-- to distinguish free vs paid usage, premium model usage, and blocked calls.

alter table public.ai_usage_logs
  add column if not exists billing_tier text,
  add column if not exists is_premium_model boolean not null default false,
  add column if not exists preflight_est_cost_usd numeric(10, 6),
  add column if not exists blocked_reason text,
  add column if not exists budget_guard text;

create index if not exists ai_usage_logs_tier_created_idx
  on public.ai_usage_logs (billing_tier, created_at desc);

create index if not exists ai_usage_logs_success_created_idx
  on public.ai_usage_logs (success, created_at desc);

create index if not exists ai_usage_logs_premium_model_created_idx
  on public.ai_usage_logs (is_premium_model, created_at desc);
