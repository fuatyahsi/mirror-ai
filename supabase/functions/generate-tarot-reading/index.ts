import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";

const spreadPositions: Record<string, string[]> = {
  single: ["message"],
  three_card: ["past", "present", "possible_direction"],
  relationship: ["you", "other", "dynamic"],
  decision: ["option_a", "option_b", "subconscious_influence"]
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();
    const spreadType = body.spread_type ?? "three_card";
    const positions = spreadPositions[spreadType] ?? spreadPositions.three_card;

    const { data: deck, error: deckError } = await supabase
      .from("tarot_decks")
      .select("card_key,name,arcana,upright_meaning,reversed_meaning")
      .limit(positions.length * 2);

    if (deckError) throw deckError;

    const selectedCards = positions.map((position, index) => ({
      position,
      card: deck?.[index]?.name ?? "The Moon",
      orientation: index % 2 === 0 ? "upright" : "reversed"
    }));

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

    const provider = getAIProvider();
    const result = await provider.generateReading({
      readingType: "tarot",
      topic: body.topic ?? "general",
      question: body.question,
      context: { spread_type: spreadType, selected_cards: selectedCards, astrology_context: astrology },
      profile,
      memory,
      astrology
    });

    if (!user) {
      return jsonResponse({
        reading_id: crypto.randomUUID(),
        persisted: false,
        spread_type: spreadType,
        cards: selectedCards,
        ...result
      });
    }

    const { data: reading, error: readingError } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "tarot",
        topic: body.topic ?? "general",
        question: body.question ?? null,
        result_json: { ...result, cards: selectedCards },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence
      })
      .select("id")
      .single();

    if (readingError) throw readingError;

    const { error: spreadError } = await supabase.from("tarot_spreads").insert({
      user_id: user.id,
      reading_id: reading.id,
      spread_type: spreadType,
      selected_cards: selectedCards
    });

    if (spreadError) throw spreadError;

    return jsonResponse({ reading_id: reading.id, persisted: true, spread_type: spreadType, cards: selectedCards, ...result });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
