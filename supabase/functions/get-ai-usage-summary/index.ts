import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { createServiceClient, requireUser } from "../shared/auth.ts";

type UsageRow = {
  user_id?: string | null;
  reading_type: string;
  access_mode?: string | null;
  model: string;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
  est_cost_usd?: number | string | null;
  preflight_est_cost_usd?: number | string | null;
  latency_ms?: number | null;
  success: boolean;
  error_code?: string | null;
  blocked_reason?: string | null;
  billing_tier?: string | null;
  is_premium_model?: boolean | null;
  created_at: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { user } = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const supabase = createServiceClient();
    const now = new Date();
    const days = Math.min(Math.max(Number(body.days ?? 30), 1), 90);
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: userRows, error: userError } = await supabase
      .from("ai_usage_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (userError) throw userError;

    const admin = isUsageAdmin(user.email);
    let globalRows: UsageRow[] = [];

    if (admin && body.scope === "global") {
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      if (error) throw error;
      globalRows = (data ?? []) as UsageRow[];
    }

    return jsonResponse({
      admin,
      scope: admin && body.scope === "global" ? "global" : "user",
      days,
      limits: publicLimits(),
      user: summarize((userRows ?? []) as UsageRow[]),
      global: admin && body.scope === "global" ? summarize(globalRows) : null
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function isUsageAdmin(email?: string | null) {
  if (!email) return false;
  const raw = Deno.env.get("AI_USAGE_ADMIN_EMAILS") ?? Deno.env.get("ADMIN_EMAILS") ?? "";
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

function publicLimits() {
  return {
    daily_global_budget_usd: numberEnv("AI_DAILY_GLOBAL_BUDGET_USD", 10),
    monthly_global_budget_usd: numberEnv("AI_MONTHLY_GLOBAL_BUDGET_USD", 250),
    daily_premium_model_budget_usd: numberEnv("AI_DAILY_PREMIUM_MODEL_BUDGET_USD", 5),
    daily_user_free_budget_usd: numberEnv("AI_DAILY_USER_FREE_BUDGET_USD", 0.08),
    daily_user_paid_budget_usd: numberEnv("AI_DAILY_USER_PAID_BUDGET_USD", 1.25),
    monthly_user_paid_budget_usd: numberEnv("AI_MONTHLY_USER_PAID_BUDGET_USD", 20),
    daily_user_free_calls: numberEnv("AI_DAILY_USER_FREE_CALLS", 6),
    daily_user_paid_calls: numberEnv("AI_DAILY_USER_PAID_CALLS", 60)
  };
}

function numberEnv(name: string, fallback: number) {
  const raw = Deno.env.get(name);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function summarize(rows: UsageRow[]) {
  const successfulRows = rows.filter((row) => row.success);
  const blockedRows = rows.filter((row) => row.error_code === "budget_guard" || row.blocked_reason);
  const cost = successfulRows.reduce((sum, row) => sum + money(row.est_cost_usd), 0);
  const preflightBlocked = blockedRows.reduce((sum, row) => sum + money(row.preflight_est_cost_usd), 0);
  const totalTokens = successfulRows.reduce((sum, row) => sum + Number(row.total_tokens ?? 0), 0);
  const premiumModelCalls = successfulRows.filter((row) => row.is_premium_model).length;
  const byModel = groupRows(successfulRows, (row) => row.model);
  const byType = groupRows(successfulRows, (row) => row.reading_type);
  const blockedByReason = groupRows(blockedRows, (row) => row.blocked_reason ?? row.error_code ?? "blocked");

  return {
    calls: rows.length,
    successful_calls: successfulRows.length,
    failed_or_blocked_calls: rows.length - successfulRows.length,
    blocked_calls: blockedRows.length,
    premium_model_calls: premiumModelCalls,
    total_tokens: totalTokens,
    est_cost_usd: Number(cost.toFixed(6)),
    blocked_preflight_usd: Number(preflightBlocked.toFixed(6)),
    avg_latency_ms: average(successfulRows.map((row) => Number(row.latency_ms ?? 0)).filter(Boolean)),
    by_model: byModel,
    by_reading_type: byType,
    blocked_by_reason: blockedByReason,
    latest: rows.slice(0, 10).map((row) => ({
      created_at: row.created_at,
      reading_type: row.reading_type,
      access_mode: row.access_mode,
      model: row.model,
      est_cost_usd: money(row.est_cost_usd),
      success: row.success,
      blocked_reason: row.blocked_reason ?? null
    }))
  };
}

function groupRows(rows: UsageRow[], keyFn: (row: UsageRow) => string) {
  const groups: Record<string, { calls: number; est_cost_usd: number; tokens: number }> = {};
  for (const row of rows) {
    const key = keyFn(row) || "unknown";
    groups[key] ??= { calls: 0, est_cost_usd: 0, tokens: 0 };
    groups[key].calls += 1;
    groups[key].est_cost_usd += money(row.est_cost_usd);
    groups[key].tokens += Number(row.total_tokens ?? 0);
  }
  return Object.fromEntries(
    Object.entries(groups).map(([key, value]) => [
      key,
      {
        ...value,
        est_cost_usd: Number(value.est_cost_usd.toFixed(6))
      }
    ])
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function money(value: unknown) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}
