import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();

    const cupImageUrl = body.cup_image_url ?? "local-dev-coffee-image-placeholder";

    const { data: dbProfile } = user
      ? await supabase
          .from("user_personality_profile")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };

    const profile = dbProfile ?? body.profile ?? body.client_profile ?? null;
    const memory = body.memory ?? body.client_memory ?? [];
    const astrology = body.astrology ?? body.astro_context ?? body.natal_chart ?? null;

    const detectedSymbols = [
      { symbol: "road", label: "Road", meaning: "Movement or direction shift", confidence: 0.71 },
      { symbol: "ring", label: "Ring", meaning: "Loop, bond, or repeated theme", confidence: 0.64 }
    ];

    const provider = getAIProvider();
    const result = await provider.generateReading({
      readingType: "coffee",
      topic: body.topic ?? "general",
      question: body.question,
      context: {
        cup_image_url: body.cup_image_url,
        plate_image_url: body.plate_image_url,
        user_context: body.context,
        detected_symbols: detectedSymbols,
        astrology_context: astrology
      },
      profile,
      memory,
      astrology
    });

    if (!user) {
      return jsonResponse({
        reading_id: crypto.randomUUID(),
        persisted: false,
        detected_symbols: detectedSymbols,
        ...result
      });
    }

    const { data: reading, error: readingError } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "coffee",
        topic: body.topic ?? "general",
        question: body.question ?? null,
        result_json: result,
        explanation_json: result.explanation,
        confidence: result.explanation.confidence,
        premium_used: true
      })
      .select("id")
      .single();

    if (readingError) throw readingError;

    const { error: coffeeError } = await supabase.from("coffee_readings").insert({
        user_id: user.id,
        reading_id: reading.id,
      cup_image_url: cupImageUrl,
      plate_image_url: body.plate_image_url ?? null,
      detected_symbols: detectedSymbols,
      user_context: { topic: body.topic, context: body.context }
    });

    if (coffeeError) throw coffeeError;

    return jsonResponse({ reading_id: reading.id, persisted: true, detected_symbols: detectedSymbols, ...result });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
