import { createServiceClient } from "./auth.ts";

export type CreditAccess = {
  readingType: string;
  required: number;
  isPremium: boolean;
  shouldSpendCredits: boolean;
  balance: number | null;
};

export function requiredCredits(readingType: string) {
  switch (readingType) {
    case "coffee":
      return 3;
    case "relationship":
      return 4;
    case "relationship_timing":
      return 1;
    case "weekly_relationship":
      return 4;
    case "deep_birth_chart":
      return 10;
    case "deep_numerology":
      return 4;
    case "tarot_clarifier":
      return 2;
    default:
      return 0;
  }
}

export function isPremiumReading(readingType: string) {
  return [
    "coffee",
    "relationship",
    "relationship_timing",
    "weekly_relationship",
    "deep_birth_chart",
    "deep_numerology",
    "tarot_clarifier"
  ].includes(readingType);
}

export async function requirePaidAccess(readingType: string, userId: string): Promise<CreditAccess> {
  const required = requiredCredits(readingType);
  if (required <= 0) {
    return { readingType, required, isPremium: false, shouldSpendCredits: false, balance: null };
  }

  const supabase = createServiceClient();
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("status,expires_at,entitlement")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) throw subscriptionError;

  const isActiveSubscription =
    Boolean(subscription) &&
    (!subscription?.expires_at || new Date(subscription.expires_at).getTime() > Date.now());

  if (isActiveSubscription) {
    return { readingType, required, isPremium: true, shouldSpendCredits: false, balance: null };
  }

  const balance = await ensureCreditBalance(userId);
  if (balance < required) {
    throw new Response(
      JSON.stringify({
        error: "payment_required",
        required_credits: required,
        current_balance: balance,
        feature: readingType,
        entitlement: "mirror_plus"
      }),
      {
        status: 402,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  return { readingType, required, isPremium: false, shouldSpendCredits: true, balance };
}

export async function requirePaidAccessForUser(readingType: string, userId?: string | null): Promise<CreditAccess | null> {
  if (!isPremiumReading(readingType)) return null;

  if (!userId) {
    throw new Response(
      JSON.stringify({
        error: "auth_required",
        feature: readingType,
        entitlement: "mirror_plus"
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  return requirePaidAccess(readingType, userId);
}

export async function recordCreditSpend(userId: string, access: CreditAccess, readingId?: string) {
  if (!access.shouldSpendCredits || access.required <= 0) {
    return {
      premium_used: access.isPremium,
      credits_spent: 0,
      remaining_balance: access.balance
    };
  }

  const supabase = createServiceClient();
  const startingBalance = access.balance ?? (await ensureCreditBalance(userId));
  const nextBalance = Math.max(0, startingBalance - access.required);

  const { error: creditError } = await supabase
    .from("user_credits")
    .upsert({ user_id: userId, balance: nextBalance }, { onConflict: "user_id" });

  if (creditError) throw creditError;

  const { error: transactionError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: -access.required,
    transaction_type: "spend",
    reason: access.readingType,
    reading_id: readingId ?? null
  });

  if (transactionError) throw transactionError;

  return {
    premium_used: true,
    credits_spent: access.required,
    remaining_balance: nextBalance
  };
}

async function ensureCreditBalance(userId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data.balance ?? 0;

  const initialBalance = Number(Deno.env.get("INITIAL_FREE_CREDITS") ?? "5");
  const { data: created, error: createError } = await supabase
    .from("user_credits")
    .insert({ user_id: userId, balance: initialBalance })
    .select("balance")
    .single();

  if (createError) throw createError;
  return created.balance ?? initialBalance;
}
