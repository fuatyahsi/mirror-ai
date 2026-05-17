import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type AiUsageSummary = {
  admin: boolean;
  scope: "user" | "global";
  days: number;
  limits: {
    daily_global_budget_usd: number;
    monthly_global_budget_usd: number;
    daily_premium_model_budget_usd: number;
    daily_user_free_budget_usd: number;
    daily_user_paid_budget_usd: number;
    monthly_user_paid_budget_usd: number;
    daily_user_free_calls: number;
    daily_user_paid_calls: number;
  };
  user: AiUsageBucket;
  global: AiUsageBucket | null;
};

export type AiUsageBucket = {
  calls: number;
  successful_calls: number;
  failed_or_blocked_calls: number;
  blocked_calls: number;
  premium_model_calls: number;
  total_tokens: number;
  est_cost_usd: number;
  blocked_preflight_usd: number;
  avg_latency_ms: number;
  by_model: Record<string, { calls: number; est_cost_usd: number; tokens: number }>;
  by_reading_type: Record<string, { calls: number; est_cost_usd: number; tokens: number }>;
  blocked_by_reason: Record<string, { calls: number; est_cost_usd: number; tokens: number }>;
  latest: {
    created_at: string;
    reading_type: string;
    access_mode?: string | null;
    model: string;
    est_cost_usd: number;
    success: boolean;
    blocked_reason?: string | null;
  }[];
};

export async function getAiUsageSummary(days = 30, scope: "user" | "global" = "user") {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.functions.invoke("get-ai-usage-summary", {
    body: { days, scope }
  });

  if (error) throw error;
  return data as AiUsageSummary;
}
