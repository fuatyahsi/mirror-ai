import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { requireUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await requireUser(req);
    const { data: memoryEvents, error } = await supabase
      .from("memory_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const positiveSignals = (memoryEvents ?? []).filter((event) => Number(event.weight) >= 0.6).length;

    const { error: updateError } = await supabase
      .from("user_personality_profile")
      .update({
        profile_summary:
          positiveSignals > 3
            ? "Son geri bildirimler, açıklanabilir ve sakin sembolik yorumların sende daha iyi çalıştığını gösteriyor."
            : "Profil kalibrasyonu devam ediyor; daha fazla feedback ile yorum stili netleşecek."
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return jsonResponse({ updated: true, memory_event_count: memoryEvents?.length ?? 0 });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

