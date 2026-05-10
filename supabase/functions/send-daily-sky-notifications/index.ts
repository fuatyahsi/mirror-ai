import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { createServiceClient } from "../shared/auth.ts";

type PushTokenRow = {
  id: string;
  user_id: string;
  expo_push_token: string;
  locale: "tr" | "en";
  timezone: string;
  daily_hour: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (!cronSecret) {
      return jsonResponse({ error: "CRON_SECRET is not configured." }, 500);
    }
    if (req.headers.get("x-cron-secret") !== cronSecret) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const now = body.now ? new Date(String(body.now)) : new Date();
    const dryRun = Boolean(body.dry_run);
    const supabase = createServiceClient();

    const { data: tokens, error } = await supabase
      .from("push_tokens")
      .select("id,user_id,expo_push_token,locale,timezone,daily_hour")
      .eq("enabled", true);
    if (error) throw error;

    const dueTokens = (tokens ?? []).filter((token: PushTokenRow) => isTokenDue(token, now));
    const unsentTokens = [];
    for (const token of dueTokens as PushTokenRow[]) {
      const sentKey = sentKeyFor(token, now);
      const { data: existing } = await supabase
        .from("notification_events")
        .select("id")
        .eq("push_token_id", token.id)
        .eq("event_key", sentKey)
        .maybeSingle();
      if (!existing) unsentTokens.push({ token, sentKey });
    }

    const messages = unsentTokens.map(({ token }) => buildExpoMessage(token));

    if (!dryRun && messages.length > 0) {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(messages)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        return jsonResponse({ error: "Expo push request failed", detail: result }, response.status);
      }

      await supabase.from("notification_events").insert(
        unsentTokens.map(({ token, sentKey }) => ({
          user_id: token.user_id,
          push_token_id: token.id,
          event_key: sentKey,
          event_type: "daily_sky",
          payload_json: {
            expo_push_token: token.expo_push_token,
            locale: token.locale,
            timezone: token.timezone,
            daily_hour: token.daily_hour
          }
        }))
      );
    }

    return jsonResponse({
      checked: tokens?.length ?? 0,
      due: dueTokens.length,
      sent: dryRun ? 0 : messages.length,
      dry_run: dryRun
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function isTokenDue(token: PushTokenRow, now: Date) {
  const hour = localHour(now, token.timezone || "UTC");
  return hour === Number(token.daily_hour ?? 9);
}

function localHour(now: Date, timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      hourCycle: "h23"
    }).formatToParts(now);
    return Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  } catch {
    return now.getUTCHours();
  }
}

function localDate(now: Date, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

function sentKeyFor(token: PushTokenRow, now: Date) {
  return `daily_sky:${token.user_id}:${localDate(now, token.timezone || "UTC")}`;
}

function buildExpoMessage(token: PushTokenRow) {
  const isEnglish = token.locale === "en";
  return {
    to: token.expo_push_token,
    sound: null,
    title: isEnglish ? "Your Daily Sky Mirror is ready" : "Günlük Gökyüzü Aynan hazır",
    body: isEnglish
      ? "Open Mirror AI for today's personal sky insight."
      : "Bugünün kişisel gökyüzü içgörüsünü Mirror AI’da aç.",
    data: {
      route: "/tabs/home",
      reading_type: "daily_sky"
    }
  };
}
