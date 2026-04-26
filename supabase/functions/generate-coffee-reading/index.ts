import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { requireUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await requireUser(req);
    const body = await req.json();

    if (!body.cup_image_url) {
      return jsonResponse({ error: "cup_image_url is required" }, 400);
    }

    const { data: profile } = await supabase
      .from("user_personality_profile")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

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
        detected_symbols: detectedSymbols
      },
      profile
    });

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
      cup_image_url: body.cup_image_url,
      plate_image_url: body.plate_image_url ?? null,
      detected_symbols: detectedSymbols,
      user_context: { topic: body.topic, context: body.context }
    });

    if (coffeeError) throw coffeeError;

    return jsonResponse({ reading_id: reading.id, detected_symbols: detectedSymbols, ...result });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

