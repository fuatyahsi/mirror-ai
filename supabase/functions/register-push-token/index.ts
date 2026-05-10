import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getOptionalUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();
    const expoPushToken = String(body.expo_push_token ?? "");
    const enabled = body.enabled !== false;

    if (!expoPushToken) {
      return jsonResponse({ error: "expo_push_token is required" }, 400);
    }

    if (!user) {
      return jsonResponse({
        persisted: false,
        reason: "No authenticated user. Local notifications can still be scheduled on device."
      });
    }

    const { error } = await supabase.from("push_tokens").upsert(
      {
        user_id: user.id,
        expo_push_token: expoPushToken,
        platform: body.platform ?? "unknown",
        locale: body.locale === "en" ? "en" : "tr",
        timezone: body.timezone ?? "UTC",
        daily_hour: Number.isFinite(Number(body.daily_hour)) ? Number(body.daily_hour) : 9,
        enabled,
        updated_at: new Date().toISOString()
      },
      { onConflict: "expo_push_token" }
    );

    if (error) throw error;

    return jsonResponse({ persisted: true, enabled });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
