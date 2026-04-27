import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";
import { buildSourceContext, normalizeLocale, sourceLabels } from "../shared/sourceContext.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();
    const locale = normalizeLocale(body.locale);
    const labels = sourceLabels(locale);

    const [{ data: dbProfile }, { data: relationship }] = user
      ? await Promise.all([
          supabase.from("user_personality_profile").select("*").eq("user_id", user.id).maybeSingle(),
          body.relationship_id
            ? supabase.from("relationships").select("*").eq("user_id", user.id).eq("id", body.relationship_id).maybeSingle()
            : Promise.resolve({ data: null })
        ])
      : [{ data: null }, { data: body.relationship ?? null }];

    const profile = dbProfile ?? body.profile ?? body.client_profile ?? null;
    const memory = body.memory ?? body.client_memory ?? [];
    const astrology = body.astrology ?? body.astro_context ?? body.natal_chart ?? null;

    const scores = {
      emotional_pull: 72,
      communication_clarity: 48,
      uncertainty_level: 81,
      user_projection_risk: 67
    };

    const provider = getAIProvider();
    const sourceContext = buildSourceContext({
      readingType: "relationship",
      locale,
      profile,
      memory,
      astrology,
      extra: [
        `${labels.status}: ${body.status ?? relationship?.status ?? labels.notProvided}`,
        `${labels.pullScore}: ${scores.emotional_pull}`,
        `${labels.uncertaintyScore}: ${scores.uncertainty_level}`
      ]
    });
    const result = await provider.generateReading({
      readingType: "relationship",
      topic: "relationship",
      question: body.question,
      context: {
        relationship,
        recent_context: body.recent_context,
        nickname: body.nickname,
        relation_type: body.relation_type,
        status: body.status,
        astrology_context: astrology,
        scores
      },
      profile,
      memory,
      astrology,
      locale
    });

    if (!user) {
      return jsonResponse({
        reading_id: crypto.randomUUID(),
        persisted: false,
        scores,
        ...result,
        source_context: sourceContext
      });
    }

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "relationship",
        topic: "relationship",
        question: body.question ?? null,
        result_json: { ...result, scores, source_context: sourceContext },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence,
        premium_used: true
      })
      .select("id")
      .single();

    if (error) throw error;

    return jsonResponse({ reading_id: reading.id, persisted: true, scores, ...result, source_context: sourceContext });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
