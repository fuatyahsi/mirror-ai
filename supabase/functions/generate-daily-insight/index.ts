import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";
import { buildSourceContext } from "../shared/sourceContext.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();

    const [{ data: dbProfile }, { data: dbMemory }, { data: recentReadings }] = user
      ? await Promise.all([
          supabase.from("user_personality_profile").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("memory_events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
          supabase.from("readings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
        ])
      : [{ data: null }, { data: [] }, { data: [] }];

    const profile = dbProfile ?? body.profile ?? body.client_profile ?? null;
    const memory = dbMemory?.length ? dbMemory : (body.memory ?? body.client_memory ?? []);
    const astrology = body.astrology ?? body.astro_context ?? body.natal_chart ?? null;

    const provider = getAIProvider();
    const sourceContext = buildSourceContext({
      readingType: "daily",
      profile,
      memory,
      astrology,
      extra: [`Konu: ${body.topic ?? "general"}`, `Ruh hali: ${body.mood ?? "belirtilmedi"}`]
    });
    const result = await provider.generateReading({
      readingType: "daily",
      topic: body.topic ?? "general",
      question: body.question,
      context: {
        mood: body.mood,
        recent_reading_count: recentReadings?.length ?? 0,
        astrology_context: astrology
      },
      profile,
      memory,
      astrology
    });

    if (!user) {
      return jsonResponse({ reading_id: crypto.randomUUID(), persisted: false, ...result, source_context: sourceContext });
    }

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "daily",
        topic: body.topic ?? "general",
        question: body.question ?? null,
        result_json: { ...result, source_context: sourceContext },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence
      })
      .select("id")
      .single();
    if (error) throw error;

    return jsonResponse({ reading_id: reading.id, persisted: true, ...result, source_context: sourceContext });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
