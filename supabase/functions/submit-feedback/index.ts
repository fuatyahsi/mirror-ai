import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { requireUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await requireUser(req);
    const body = await req.json();

    const { data: reading } = await supabase
      .from("readings")
      .select("id,reading_type,topic")
      .eq("user_id", user.id)
      .eq("id", body.reading_id)
      .single();

    if (!reading) return jsonResponse({ error: "Reading not found" }, 404);

    const { data: feedback, error: feedbackError } = await supabase
      .from("reading_feedback")
      .insert({
        user_id: user.id,
        reading_id: body.reading_id,
        score: body.score,
        accuracy_rating: body.accuracy_rating,
        emotional_resonance: body.emotional_resonance,
        comment: body.comment ?? null
      })
      .select("*")
      .single();

    if (feedbackError) throw feedbackError;

    const weight = body.score === "accurate" ? 0.9 : body.score === "partial" ? 0.6 : 0.3;
    const { error: memoryError } = await supabase.from("memory_events").insert({
      user_id: user.id,
      event_type: "feedback_submitted",
      source_type: "reading_feedback",
      source_id: feedback.id,
      memory_key: "reading_feedback_signal",
      memory_value: {
        reading_type: reading.reading_type,
        topic: reading.topic,
        score: body.score,
        accuracy_rating: body.accuracy_rating,
        emotional_resonance: body.emotional_resonance
      },
      weight
    });

    if (memoryError) throw memoryError;

    return jsonResponse({ feedback });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

