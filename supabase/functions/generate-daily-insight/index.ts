import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { requireUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await requireUser(req);
    const body = await req.json();

    const [{ data: profile }, { data: memory }, { data: recentReadings }] = await Promise.all([
      supabase.from("user_personality_profile").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("memory_events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("readings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
    ]);

    const provider = getAIProvider();
    const result = await provider.generateReading({
      readingType: "daily",
      topic: body.topic ?? "general",
      question: body.question,
      context: {
        mood: body.mood,
        recent_reading_count: recentReadings?.length ?? 0
      },
      profile,
      memory: memory ?? []
    });

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "daily",
        topic: body.topic ?? "general",
        question: body.question ?? null,
        result_json: result,
        explanation_json: result.explanation,
        confidence: result.explanation.confidence
      })
      .select("id")
      .single();

    if (error) throw error;

    return jsonResponse({ reading_id: reading.id, ...result });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

