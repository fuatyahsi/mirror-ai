import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";
import { recordCreditSpend, requirePaidAccessForUser } from "../shared/credits.ts";
import { buildSourceContext, normalizeLocale, sourceLabels } from "../shared/sourceContext.ts";
import { extractCoffeeSymbols } from "../shared/visionProvider.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();
    const locale = normalizeLocale(body.locale);
    const labels = sourceLabels(locale);
    const creditAccess = await requirePaidAccessForUser("coffee", user?.id);
    // Kahve fotoğrafları sunucuda HİÇ saklanmaz. Mobile base64 ile gönderir,
    // vision API bir kez okur, RAM dışında hiçbir yere yazılmaz.
    const cupImageBase64 = typeof body.cup_image_base64 === "string" ? body.cup_image_base64 : undefined;
    const cupImageMimeType = typeof body.cup_image_mime_type === "string" ? body.cup_image_mime_type : undefined;
    const plateImageBase64 = typeof body.plate_image_base64 === "string" ? body.plate_image_base64 : undefined;
    const plateImageMimeType = typeof body.plate_image_mime_type === "string" ? body.plate_image_mime_type : undefined;
    const cupImageUrl = typeof body.cup_image_url === "string" ? body.cup_image_url : undefined;

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
    const vision = await extractCoffeeSymbols({
      cupImageBase64,
      cupImageMimeType,
      plateImageBase64,
      plateImageMimeType,
      cupImageUrl,
      plateImageUrl: body.plate_image_url,
      topic: body.topic,
      question: body.question,
      locale
    });
    const detectedSymbols = vision.detected_symbols;

    const provider = getAIProvider();
    const sourceContext = buildSourceContext({
      readingType: "coffee",
      locale,
      profile,
      memory,
      astrology,
      extra: [
        `${labels.topic}: ${body.topic ?? "general"}`,
        ...detectedSymbols.map((symbol) => `${labels.coffeeSymbol}: ${symbol.label} (${symbol.meaning})`)
      ]
    });
    const result = await provider.generateReading({
      readingType: "coffee",
      userId: user?.id,
      topic: body.topic ?? "general",
      question: body.question,
      context: {
        cup_image_url: "not_stored",
        plate_image_url: "not_stored",
        user_context: body.context,
        detected_symbols: detectedSymbols,
        image_quality: vision.image_quality,
        astrology_context: astrology
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
        detected_symbols: detectedSymbols,
        image_quality: vision.image_quality,
        ...result,
        source_context: sourceContext
      });
    }

    const { data: reading, error: readingError } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "coffee",
        topic: body.topic ?? "general",
        question: body.question ?? null,
        result_json: { ...result, detected_symbols: detectedSymbols, source_context: sourceContext },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence,
        premium_used: Boolean(creditAccess?.isPremium || creditAccess?.shouldSpendCredits)
      })
      .select("id")
      .single();

    if (readingError) throw readingError;

    const { error: coffeeError } = await supabase.from("coffee_readings").insert({
      user_id: user.id,
      reading_id: reading.id,
      cup_image_url: "not_stored",
      plate_image_url: null,
      detected_symbols: detectedSymbols,
      user_context: {
        topic: body.topic,
        context: body.context,
        image_quality: vision.image_quality,
        image_retention: "not_stored"
      }
    });

    if (coffeeError) throw coffeeError;

    const billing = creditAccess ? await recordCreditSpend(user.id, creditAccess, reading.id) : null;

    return jsonResponse({
      reading_id: reading.id,
      persisted: true,
      billing,
      detected_symbols: detectedSymbols,
      image_quality: vision.image_quality,
      ...result,
      source_context: sourceContext
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
