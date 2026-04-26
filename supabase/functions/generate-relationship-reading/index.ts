import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { requireUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await requireUser(req);
    const body = await req.json();

    const [{ data: profile }, { data: relationship }] = await Promise.all([
      supabase.from("user_personality_profile").select("*").eq("user_id", user.id).maybeSingle(),
      body.relationship_id
        ? supabase.from("relationships").select("*").eq("user_id", user.id).eq("id", body.relationship_id).maybeSingle()
        : Promise.resolve({ data: null })
    ]);

    const scores = {
      emotional_pull: 72,
      communication_clarity: 48,
      uncertainty_level: 81,
      user_projection_risk: 67
    };

    const provider = getAIProvider();
    const result = await provider.generateReading({
      readingType: "relationship",
      topic: "relationship",
      question: body.question,
      context: {
        relationship,
        recent_context: body.recent_context,
        scores
      },
      profile
    });

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "relationship",
        topic: "relationship",
        question: body.question ?? null,
        result_json: { ...result, scores },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence,
        premium_used: true
      })
      .select("id")
      .single();

    if (error) throw error;

    return jsonResponse({ reading_id: reading.id, scores, ...result });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

