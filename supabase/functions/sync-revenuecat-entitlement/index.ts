import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { createServiceClient, requireUser } from "../shared/auth.ts";

type RevenueCatSubscriber = {
  subscriber?: {
    entitlements?: Record<string, { expires_date?: string; product_identifier?: string }>;
    non_subscriptions?: Record<string, Array<{ id?: string; purchase_date?: string; store?: string }>>;
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { user } = await requireUser(req);
    const secretKey = Deno.env.get("REVENUECAT_SECRET_KEY");
    if (!secretKey) {
      return jsonResponse({ configured: false, reason: "REVENUECAT_SECRET_KEY is not configured." });
    }

    const subscriber = await fetchRevenueCatSubscriber(user.id, secretKey);
    const entitlementId = Deno.env.get("REVENUECAT_ENTITLEMENT_ID") ?? "mirror_plus";
    const entitlement = subscriber.subscriber?.entitlements?.[entitlementId];
    const supabase = createServiceClient();

    if (entitlement) {
      await supabase.from("subscriptions").upsert(
        {
          user_id: user.id,
          provider: "revenuecat",
          provider_customer_id: user.id,
          entitlement: entitlementId,
          status: isFuture(entitlement.expires_date) ? "active" : "expired",
          expires_at: entitlement.expires_date ?? null
        },
        { onConflict: "provider,provider_customer_id,entitlement" }
      );
    }

    const credited = await syncCreditPurchases(user.id, subscriber);
    return jsonResponse({
      configured: true,
      entitlement: entitlement
        ? {
            id: entitlementId,
            active: isFuture(entitlement.expires_date),
            expires_at: entitlement.expires_date ?? null
          }
        : null,
      credited
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

async function fetchRevenueCatSubscriber(appUserId: string, secretKey: string): Promise<RevenueCatSubscriber> {
  const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? `RevenueCat subscriber request failed with status ${response.status}.`);
  }
  return data as RevenueCatSubscriber;
}

async function syncCreditPurchases(userId: string, subscriber: RevenueCatSubscriber) {
  const productId = Deno.env.get("REVENUECAT_CREDIT_SMALL_PRODUCT_ID") ?? "mirror_credits_10";
  const amount = Number(Deno.env.get("REVENUECAT_CREDIT_SMALL_AMOUNT") ?? "10");
  const purchases = subscriber.subscriber?.non_subscriptions?.[productId] ?? [];
  const supabase = createServiceClient();
  let credited = 0;

  for (const purchase of purchases) {
    const transactionId = purchase.id;
    if (!transactionId) continue;

    const { data: existing, error: existingError } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("provider", "revenuecat")
      .eq("provider_transaction_id", transactionId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) continue;

    const { data: balanceRow, error: balanceError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (balanceError) throw balanceError;
    const nextBalance = (balanceRow?.balance ?? 0) + amount;

    const { error: creditError } = await supabase
      .from("user_credits")
      .upsert({ user_id: userId, balance: nextBalance }, { onConflict: "user_id" });

    if (creditError) throw creditError;

    const { error: transactionError } = await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount,
      transaction_type: "purchase",
      reason: productId,
      provider: "revenuecat",
      provider_transaction_id: transactionId
    });

    if (transactionError) throw transactionError;
    credited += amount;
  }

  return credited;
}

function isFuture(value?: string) {
  if (!value) return true;
  return new Date(value).getTime() > Date.now();
}
