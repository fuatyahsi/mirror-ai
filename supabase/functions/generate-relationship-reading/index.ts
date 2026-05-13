import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";
import { buildSourceContext, normalizeLocale, sourceLabels } from "../shared/sourceContext.ts";
import { recordCreditSpend, requirePaidAccessForUser } from "../shared/credits.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();
    const locale = normalizeLocale(body.locale);
    const labels = sourceLabels(locale);
    const accessMode = body.access_mode === "basic" ? "basic" : body.access_mode === "timing" ? "timing" : "deep";
    const paidReadingType =
      accessMode === "deep" ? "relationship" : accessMode === "timing" ? "relationship_timing" : null;
    const creditAccess = paidReadingType ? await requirePaidAccessForUser(paidReadingType, user?.id) : null;

    const [
      { data: dbUserProfile },
      { data: latestBirthChart },
      { data: dbProfile },
      { data: relationship },
      { data: dbMemory },
      { data: rawRecentReadings }
    ] = user
      ? await Promise.all([
          supabase
            .from("users_profile")
            .select("birth_date,birth_time,birth_city,birth_country,latitude,longitude,timezone")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("birth_charts")
            .select("chart_json")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase.from("user_personality_profile").select("*").eq("user_id", user.id).maybeSingle(),
          body.relationship_id
            ? supabase.from("relationships").select("*").eq("user_id", user.id).eq("id", body.relationship_id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from("memory_events")
            .select("*")
            .eq("user_id", user.id)
            .in("memory_key", ["relationship_cycle_event", "relationship_pattern", "love_topic_frequency"])
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("readings")
            .select("id,question,result_json,created_at")
            .eq("user_id", user.id)
            .eq("reading_type", "relationship")
            .order("created_at", { ascending: false })
            .limit(20)
        ])
      : [{ data: null }, { data: null }, { data: null }, { data: body.relationship ?? null }, { data: [] }, { data: [] }];

    const profile = dbProfile ?? body.profile ?? body.client_profile ?? null;
    const memory = dbMemory?.length ? dbMemory : (body.memory ?? body.client_memory ?? []);
    const relationshipKey = normalizeRelationshipKey(body.nickname ?? relationship?.nickname ?? body.relationship_id ?? "unknown");
    const recentRelationshipReadings = filterReadingsByRelationship(rawRecentReadings ?? [], relationshipKey).slice(0, 5);
    const persistedRelationship = user
      ? await upsertRelationshipProfile(supabase, user.id, relationshipKey, relationship, body)
      : relationship;
    const serverAstrology =
      accessMode === "deep"
        ? await calculateServerSynastry(body, dbUserProfile, latestBirthChart?.chart_json, locale)
        : { synastry: null, partnerNatalChart: body.partner_natal_chart ?? null, transitTiming: null };
    const partnerNatalChart = serverAstrology.partnerNatalChart ?? body.partner_natal_chart ?? null;
    const synastry = serverAstrology.synastry ?? body.synastry ?? body.astrology?.synastry ?? null;
    const astrology = {
      ...(typeof body.astrology === "object" && body.astrology ? body.astrology : {}),
      natal_chart: body.natal_chart ?? latestBirthChart?.chart_json ?? null,
      partner_natal_chart: partnerNatalChart,
      synastry,
      relationship_timing: serverAstrology.transitTiming ?? null
    };
    const insertedJournalEntry = user
      ? await insertRelationshipJournalEntry(supabase, user.id, persistedRelationship?.id, relationshipKey, body)
      : null;
    const dbJournalEntries = user
      ? await loadRelationshipJournalEntries(supabase, user.id, relationshipKey)
      : [];
    const journalEntries = mergeJournalEntries(
      insertedJournalEntry,
      dbJournalEntries,
      Array.isArray(body.journal_entries) ? body.journal_entries : []
    ).slice(0, 8);
    const timingContext = mergeTimingContext(
      body.timing_context,
      buildRelationshipTimingContext({
        locale,
        profile,
        synastry,
        journalEntries,
        transitTiming: serverAstrology.transitTiming ?? null
      })
    );

    if (user && persistedRelationship?.id && synastry) {
      await supabase
        .from("relationships")
        .update({
          synastry_json: synastry,
          last_synastry_at: new Date().toISOString(),
          journal_summary_json: timingContext
        })
        .eq("user_id", user.id)
        .eq("id", persistedRelationship.id);
    }

    const scores = buildRelationshipScores(synastry, profile, journalEntries);
    const dynamicConfidence = computeRelationshipConfidence({
      synastry,
      partnerBirthTimeKnown: Boolean((body.partner_birth as Record<string, unknown> | undefined)?.birth_time_known),
      journalCount: journalEntries.length,
      hasUserChart: Boolean(latestBirthChart?.chart_json ?? body.natal_chart),
      hasPartnerChart: Boolean(partnerNatalChart),
      previousCount: recentRelationshipReadings.length
    });
    const historyCompare = buildHistoryCompare(recentRelationshipReadings, synastry, scores, locale);

    const provider = getAIProvider();
    const sourceContext = buildSourceContext({
      readingType: "relationship",
      locale,
      profile,
      memory,
      astrology,
      extra: [
        `${labels.status}: ${body.status ?? persistedRelationship?.status ?? relationship?.status ?? labels.notProvided}`,
        `${labels.pullScore}: ${scores.emotional_pull}`,
        `${labels.uncertaintyScore}: ${scores.uncertainty_level}`,
        locale === "en"
          ? `Synastry overall score: ${synastry?.overall_score ?? labels.notProvided}`
          : `Sinastri genel skor: ${synastry?.overall_score ?? labels.notProvided}`,
        locale === "en"
          ? `Relationship journal entries: ${journalEntries.length}`
          : `İlişki günlüğü kaydı: ${journalEntries.length}`,
        timingContext?.target_date
          ? locale === "en"
            ? `Timing date: ${timingContext.target_date}`
            : `Zamanlama tarihi: ${timingContext.target_date}`
          : undefined
      ].filter(Boolean) as string[]
    });
    let result = await provider.generateReading({
      readingType: "relationship",
      topic: "relationship",
      accessMode,
      question: body.question,
      context: {
        relationship: persistedRelationship ?? relationship,
        recent_context: body.recent_context,
        nickname: body.nickname,
        relation_type: body.relation_type,
        status: body.status,
        partner_birth: body.partner_birth,
        partner_natal_chart: partnerNatalChart,
        synastry,
        journal_entries: journalEntries,
        previous_relationship_readings: recentRelationshipReadings,
        history_compare: historyCompare,
        timing_context: timingContext,
        relationship_intelligence_rule:
          accessMode === "deep"
            ? locale === "en"
              ? "Synthesize natal chart + partner chart + synastry + timing + journal memory. Do not reduce this to compatibility score."
              : "Natal harita + karşı taraf haritası + sinastri + zamanlama + günlük hafızasını birlikte sentezle. Bunu sadece uyum skoruna indirgeme."
            : accessMode === "timing"
              ? locale === "en"
                ? "This is a paid quick message timing coach. Do not create a deep synastry report. Answer whether to message today, the exact tone, a copy-pasteable sample message, and what not to over-read."
                : "Bu krediyle açılan hızlı mesaj zamanlama koçudur. Derin sinastri raporu üretme. Bugün mesaj atılıp atılmamasını, net tonu, kopyalanabilir örnek mesajı ve fazla okunmaması gereken şeyi cevapla."
              : locale === "en"
              ? "This is the free basic layer. Give a short relationship mirror from status, question and journal context. Do not present it as deep synastry."
              : "Bu ücretsiz temel katmandır. Statü, soru ve günlük bağlamından kısa ilişki aynası üret. Derin sinastri gibi sunma.",
        access_mode: accessMode,
        astrology_context: astrology,
        scores,
        dynamic_confidence: dynamicConfidence
      },
      profile,
      memory,
      astrology,
      locale
    });

    if (accessMode === "timing") {
      result = finalizeTimingReading(result as Record<string, unknown>, {
        locale,
        question: String(body.question ?? ""),
        timingContext
      }) as typeof result;
    }

    const finalizedDeepReport =
      accessMode === "deep" && result.deep_report
        ? finalizeDeepReport(result.deep_report, {
            scores,
            synastry,
            timingContext,
            historyCompare,
            dynamicConfidence,
            partnerBirthTimeKnown: Boolean(
              (body.partner_birth as Record<string, unknown> | undefined)?.birth_time_known
            ),
            locale
          })
        : undefined;
    if (finalizedDeepReport) {
      result.deep_report = finalizedDeepReport;
    }

    if (!user) {
      return jsonResponse({
        reading_id: crypto.randomUUID(),
        persisted: false,
        access_mode: accessMode,
        relationship_key: relationshipKey,
        scores,
        ...result,
        source_context: sourceContext,
        relationship_intelligence: {
          synastry,
          timing_context: timingContext,
          relationship_spine: body.relationship_spine ?? timingContext.relationship_spine ?? null,
          journal_entries_count: journalEntries.length,
          partner_natal_chart: partnerNatalChart
        }
      });
    }

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "relationship",
        topic: "relationship",
        question: body.question ?? null,
        result_json: { ...result, scores, source_context: sourceContext, relationship_key: relationshipKey, access_mode: accessMode },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence,
        premium_used: Boolean(creditAccess?.isPremium || creditAccess?.shouldSpendCredits)
      })
      .select("id")
      .single();

    if (error) throw error;

    if (body.recent_context || journalEntries.length || synastry) {
      await supabase.from("memory_events").insert({
        user_id: user.id,
        event_type: "relationship_analysis",
        source_type: "relationship_reading",
        source_id: reading.id,
        memory_key: "relationship_cycle_event",
        memory_value: {
          nickname: body.nickname,
          status: body.status,
          relation_type: body.relation_type,
          recent_context: body.recent_context,
          journal_entries: journalEntries.slice(0, 3),
          synastry_score: synastry?.overall_score,
          risk_areas: synastry?.risk_areas
        },
        weight: 0.84
      });
    }

    const billing = creditAccess ? await recordCreditSpend(user.id, creditAccess, reading.id) : null;

    return jsonResponse({
      reading_id: reading.id,
      persisted: true,
      billing,
      access_mode: accessMode,
      relationship_key: relationshipKey,
      scores,
      ...result,
      source_context: sourceContext,
      relationship_intelligence: {
        synastry,
        timing_context: timingContext,
        relationship_spine: body.relationship_spine ?? timingContext.relationship_spine ?? null,
        journal_entries_count: journalEntries.length,
        partner_natal_chart: partnerNatalChart
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function finalizeTimingReading(
  result: Record<string, unknown>,
  input: {
    locale: "tr" | "en";
    question: string;
    timingContext: Record<string, unknown>;
  }
) {
  const isEn = input.locale === "en";
  const sections = Array.isArray(result.sections) ? (result.sections as Record<string, unknown>[]) : [];
  const suggestedTone = safeText(input.timingContext.suggested_tone, isEn ? "calm, clear and non-pressuring" : "sakin, net ve baskısız");
  const doNotDo = safeText(input.timingContext.do_not_do, isEn ? "Do not chase hidden certainty from a late reply." : "Geç cevaptan gizli kesinlik çıkarmaya çalışma.");
  const nextAction = safeText(input.timingContext.next_action, isEn ? "Choose one clear step, then stop checking." : "Tek net adım seç, sonra tekrar kontrol etmeyi bırak.");
  const sampleMessage = safeText(
    input.timingContext.sample_message,
    isEn ? "I want to understand this more calmly. If it works for you, we can talk later." : "Bunu daha sakin anlamak istiyorum. Uygunsa sonra konuşabiliriz."
  );
  const fallbackSections = [
    {
      title: isEn ? "Should I message today?" : "Bugün mesaj atmalı mıyım?",
      body: nextAction
    },
    {
      title: isEn ? "What tone?" : "Hangi ton?",
      body: `${suggestedTone} ${doNotDo}`
    },
    {
      title: isEn ? "Sample message" : "Örnek mesaj",
      body: sampleMessage
    }
  ];

  const normalizedSections = fallbackSections.map((fallback, index) => {
    const section = sections[index] ?? {};
    return {
      title: clampText(safeText(section.title, fallback.title), 72),
      body: clampText(safeText(section.body, fallback.body), 620),
      references: Array.isArray(section.references) ? section.references.map(String).slice(0, 4) : undefined
    };
  });
  const explanation = (result.explanation ?? {}) as Record<string, unknown>;
  const basedOn = Array.isArray(explanation.based_on)
    ? explanation.based_on.map(String).filter(Boolean).slice(0, 5)
    : [];

  return {
    ...result,
    title: clampText(
      safeText(result.title, isEn ? "Send, wait or soften?" : "Yaz, bekle veya yumuşat?"),
      90
    ),
    summary: clampText(
      safeText(result.summary, isEn ? "A focused message decision for today's relationship context." : "Bugünün ilişki bağlamı için net bir mesaj kararı."),
      220
    ),
    sections: normalizedSections,
    advice: clampText(safeText(result.advice, nextAction), 240),
    reflection_question: clampText(
      safeText(
        result.reflection_question,
        isEn ? "Can I send this once and then let the answer arrive?" : "Bunu bir kez gönderip cevabın gelmesine alan bırakabilir miyim?"
      ),
      160
    ),
    explanation: {
      based_on: basedOn.length
        ? basedOn
        : [
            isEn ? "your relationship question" : "ilişki sorun",
            isEn ? "recent journal context" : "son ilişki günlüğü",
            isEn ? "relationship timing signal" : "ilişki zamanlama sinyali"
          ],
      confidence: clampNumber(Number(explanation.confidence ?? result.confidence ?? 0.72), 0.45, 0.9),
      limitations: clampText(
        safeText(
          explanation.limitations,
          isEn
            ? "This is a reflective timing coach, not certainty about what the other person feels."
            : "Bu, karşı tarafın ne hissettiğine dair kesinlik değil; farkındalık amaçlı zamanlama koçudur."
        ),
        240
      )
    },
    safety_note: clampText(
      safeText(
        result.safety_note,
        isEn
          ? "It keeps your autonomy central and avoids pressure, obsession or deterministic claims."
          : "Karar hakkını sende bırakır; baskı, takıntı veya kesin hüküm üretmez."
      ),
      220
    )
  };
}

function safeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function clampText(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}…`;
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function buildRelationshipScores(
  synastry: Record<string, unknown> | null,
  profile: Record<string, unknown> | null,
  journalEntries: unknown[]
) {
  const synastryScores = synastry?.scores as Record<string, unknown> | undefined;
  const emotionalHarmony = Number(synastryScores?.emotional_harmony ?? synastry?.overall_score ?? 68);
  const mentalFlow = Number(synastryScores?.mental_flow ?? 58);
  const romanticPull = Number(synastryScores?.romantic_pull ?? synastry?.overall_score ?? 72);
  const attachmentDynamic = Number(synastryScores?.attachment_dynamic ?? 62);
  const crisisIntensity = Number(synastryScores?.crisis_intensity ?? 54);
  const uncertaintyProfile = Number(profile?.uncertainty_tolerance ?? 55);
  const journalPressure = Math.min(16, journalEntries.length * 4);

  return {
    emotional_pull: clampScore(Math.round((romanticPull * 0.58 + emotionalHarmony * 0.42))),
    communication_clarity: clampScore(Math.round(mentalFlow - crisisIntensity * 0.12 + 8)),
    uncertainty_level: clampScore(Math.round((100 - uncertaintyProfile) * 0.42 + attachmentDynamic * 0.36 + journalPressure)),
    user_projection_risk: clampScore(Math.round(crisisIntensity * 0.38 + attachmentDynamic * 0.32 + journalPressure + 18))
  };
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(1, Math.min(100, value));
}

function normalizeRelationshipKey(value: unknown) {
  const text = String(value ?? "unknown").trim().toLocaleLowerCase("tr-TR");
  return text.replace(/[^\p{Letter}\p{Number}]+/gu, "_").replace(/^_+|_+$/g, "") || "unknown";
}

async function upsertRelationshipProfile(
  supabase: any,
  userId: string,
  relationshipKey: string,
  existingRelationship: Record<string, unknown> | null,
  body: Record<string, unknown>
) {
  const partnerBirth = (body.partner_birth ?? {}) as Record<string, unknown>;
  const nickname = String(body.nickname ?? existingRelationship?.nickname ?? relationshipKey);
  const relationType = String(body.relation_type ?? existingRelationship?.relation_type ?? "relationship");
  const status = String(body.status ?? existingRelationship?.status ?? "unknown");
  const knownContext = String(body.recent_context ?? existingRelationship?.known_context ?? "");

  const payload = {
    id: existingRelationship?.id,
    user_id: userId,
    relationship_key: relationshipKey,
    nickname,
    relation_type: relationType,
    status,
    known_context: knownContext || null,
    main_question: typeof body.question === "string" ? body.question : null,
    birth_date: partnerBirth.birth_date ?? existingRelationship?.birth_date ?? null,
    birth_time: partnerBirth.birth_time ?? existingRelationship?.birth_time ?? null,
    birth_city: partnerBirth.birth_city ?? existingRelationship?.birth_city ?? null,
    birth_country: partnerBirth.birth_country ?? existingRelationship?.birth_country ?? null,
    latitude: numberOrNull(partnerBirth.latitude ?? existingRelationship?.latitude),
    longitude: numberOrNull(partnerBirth.longitude ?? existingRelationship?.longitude),
    timezone: partnerBirth.timezone ?? existingRelationship?.timezone ?? null,
    birth_time_known: Boolean(partnerBirth.birth_time_known ?? existingRelationship?.birth_time_known ?? false)
  };

  const { data, error } = await supabase
    .from("relationships")
    .upsert(payload, { onConflict: "user_id,relationship_key" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function insertRelationshipJournalEntry(
  supabase: any,
  userId: string,
  relationshipId: string | undefined,
  relationshipKey: string,
  body: Record<string, unknown>
) {
  const eventText = typeof body.recent_context === "string" ? body.recent_context.trim() : "";
  if (!eventText) return null;

  const { data, error } = await supabase
    .from("relationship_journal_entries")
    .insert({
      user_id: userId,
      relationship_id: relationshipId ?? null,
      relationship_key: relationshipKey,
      event_text: eventText,
      mood: body.journal_mood ?? body.mood ?? null,
      signals: Array.isArray(body.journal_signals) ? body.journal_signals.map(String) : []
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function loadRelationshipJournalEntries(supabase: any, userId: string, relationshipKey: string) {
  const { data, error } = await supabase
    .from("relationship_journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("relationship_key", relationshipKey)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) throw error;
  return data ?? [];
}

function mergeJournalEntries(insertedEntry: unknown, dbEntries: unknown[], clientEntries: unknown[]) {
  const seen = new Set<string>();
  return [insertedEntry, ...dbEntries, ...clientEntries].filter((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const value = entry as Record<string, unknown>;
    const key = String(value.id ?? `${value.event_text ?? ""}_${value.created_at ?? ""}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function calculateServerSynastry(
  body: Record<string, unknown>,
  dbUserProfile: Record<string, unknown> | null,
  latestChart: Record<string, unknown> | null,
  locale: "tr" | "en"
) {
  const partnerBirth = (body.partner_birth ?? {}) as Record<string, unknown>;
  const first = birthInputFromProfile(dbUserProfile, latestChart);
  const second = birthInputFromPartner(partnerBirth);

  if (!first || !second) {
    return { synastry: null, partnerNatalChart: body.partner_natal_chart ?? null, transitTiming: null };
  }

  const serviceUrl = Deno.env.get("ASTROLOGY_SERVICE_URL");
  if (!serviceUrl) {
    return { synastry: body.synastry ?? null, partnerNatalChart: body.partner_natal_chart ?? null, transitTiming: null };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = Deno.env.get("ASTROLOGY_SERVICE_TOKEN");
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/synastry`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      first,
      second,
      second_birth_time_known: Boolean(partnerBirth.birth_time_known),
      locale
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (body.synastry || body.partner_natal_chart) {
      return {
        synastry: body.synastry ?? null,
        partnerNatalChart: body.partner_natal_chart ?? null,
        transitTiming: null
      };
    }
    throw new Error(data?.detail || data?.error || "Astrology synastry service failed.");
  }

  const transitTiming = await calculateRelationshipTransitTiming(
    serviceUrl,
    headers,
    first,
    data.first_chart ?? latestChart,
    data.second_chart ?? body.partner_natal_chart ?? null,
    data.synastry ?? null,
    locale
  );

  return {
    synastry: data.synastry ?? null,
    partnerNatalChart: data.second_chart ?? body.partner_natal_chart ?? null,
    transitTiming
  };
}

function birthInputFromProfile(profile: Record<string, unknown> | null, chart: Record<string, unknown> | null) {
  const chartInput = (chart?.input ?? {}) as Record<string, unknown>;
  const birthDate = profile?.birth_date ?? chartInput.birth_date;
  const latitude = numberOrNull(profile?.latitude ?? chartInput.latitude);
  const longitude = numberOrNull(profile?.longitude ?? chartInput.longitude);

  if (!birthDate || latitude === null || longitude === null) return null;

  return {
    birth_date: String(birthDate),
    birth_time: String(profile?.birth_time ?? chartInput.birth_time ?? "12:00"),
    latitude,
    longitude,
    timezone: String(profile?.timezone ?? chartInput.timezone ?? "UTC"),
    house_system: "P"
  };
}

function birthInputFromPartner(partnerBirth: Record<string, unknown>) {
  const birthDate = partnerBirth.birth_date;
  const latitude = numberOrNull(partnerBirth.latitude);
  const longitude = numberOrNull(partnerBirth.longitude);

  if (!birthDate || latitude === null || longitude === null) return null;

  return {
    birth_date: String(birthDate),
    birth_time: String(partnerBirth.birth_time ?? "12:00"),
    latitude,
    longitude,
    timezone: String(partnerBirth.timezone ?? "UTC"),
    house_system: "P"
  };
}

async function calculateRelationshipTransitTiming(
  serviceUrl: string,
  headers: Record<string, string>,
  firstInput: Record<string, unknown>,
  firstChart: Record<string, unknown> | null,
  secondChart: Record<string, unknown> | null,
  synastry: Record<string, unknown> | null,
  locale: "tr" | "en"
) {
  const targetDate = new Date().toISOString().slice(0, 10);
  const latitude = numberOrNull(firstInput.latitude);
  const longitude = numberOrNull(firstInput.longitude);
  if (latitude === null || longitude === null) return null;

  const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/natal-chart`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      birth_date: targetDate,
      birth_time: "12:00",
      latitude,
      longitude,
      timezone: String(firstInput.timezone ?? "UTC"),
      house_system: "P"
    })
  });

  const dayChart = await response.json().catch(() => null);
  if (!response.ok || !dayChart) return null;

  const userAspects = calculateTransitAspects(dayChart, firstChart, locale, locale === "en" ? "you" : "sen");
  const partnerAspects = calculateTransitAspects(dayChart, secondChart, locale, locale === "en" ? "them" : "o");
  const relationshipHotspots = Array.isArray(synastry?.key_aspects)
    ? (synastry.key_aspects as Array<Record<string, unknown>>).slice(0, 4).map((aspect) => ({
        category: aspect.category,
        type: aspect.type,
        reference: aspect.reference,
        orb: aspect.orb
      }))
    : [];
  const pressureScore = Math.min(
    100,
    Math.round(
      userAspects.reduce((sum, aspect) => sum + Number(aspect.intensity ?? 0), 0) * 0.5 +
        partnerAspects.reduce((sum, aspect) => sum + Number(aspect.intensity ?? 0), 0) * 0.35 +
        relationshipHotspots.length * 5
    )
  );

  return {
    target_date: targetDate,
    daily_sky_anchor: compactDailySkyAnchor(dayChart),
    transit_aspects_to_user: userAspects,
    transit_aspects_to_partner: partnerAspects,
    relationship_hotspots: relationshipHotspots,
    pressure_score: pressureScore,
    timing_note:
      locale === "en"
        ? "Transit timing is calculated from today's noon sky against both natal charts and the strongest synastry hotspots."
        : "Transit zamanlaması bugünün öğle gökyüzünün iki natal harita ve güçlü sinastri temaslarıyla karşılaştırılmasından hesaplanır."
  };
}

const transitAspectDefs = [
  { type: "conjunction", tr: "Kavuşum", en: "Conjunction", angle: 0, orb: 6, intensity: 16 },
  { type: "sextile", tr: "Altmışlık", en: "Sextile", angle: 60, orb: 4, intensity: 8 },
  { type: "square", tr: "Kare", en: "Square", angle: 90, orb: 5, intensity: 18 },
  { type: "trine", tr: "Üçgen", en: "Trine", angle: 120, orb: 5, intensity: 10 },
  { type: "opposition", tr: "Karşıt", en: "Opposition", angle: 180, orb: 6, intensity: 16 }
];
const transitPriority = ["moon", "mercury", "venus", "mars", "sun", "saturn"];
const natalPriority = ["sun", "moon", "ascendant", "mercury", "venus", "mars", "saturn"];

function calculateTransitAspects(
  dayChart: Record<string, unknown> | null,
  natalChart: Record<string, unknown> | null,
  locale: "tr" | "en",
  owner: string
) {
  const transitPoints = pointMap(dayChart);
  const natalPoints = pointMap(natalChart);
  const aspects: Array<Record<string, unknown>> = [];

  for (const transitKey of transitPriority) {
    const transit = transitPoints.get(transitKey);
    if (!transit) continue;
    for (const natalKey of natalPriority) {
      const natal = natalPoints.get(natalKey);
      if (!natal) continue;
      const distance = normalizeAngleDistance(Number(transit.absolute_degree), Number(natal.absolute_degree));
      const aspect = transitAspectDefs.find((candidate) => Math.abs(distance - candidate.angle) <= candidate.orb);
      if (!aspect) continue;
      const orb = Number(Math.abs(distance - aspect.angle).toFixed(2));
      aspects.push({
        owner,
        type: aspect.type,
        label: locale === "en" ? aspect.en : aspect.tr,
        orb,
        intensity: Math.max(1, Math.round(aspect.intensity * (1 - Math.min(orb, aspect.orb) / (aspect.orb + 1)))),
        transit: pointReference(transit, locale === "en" ? "Transit" : "Transit"),
        natal: pointReference(natal, locale === "en" ? "Natal" : "Natal"),
        reference: `${owner}: ${pointReference(transit, "Transit")} - ${pointReference(natal, "Natal")} / ${
          locale === "en" ? aspect.en : aspect.tr
        }, orb ${orb.toFixed(2)}°`
      });
    }
  }

  return aspects.sort((first, second) => Number(second.intensity) - Number(first.intensity)).slice(0, 6);
}

function pointMap(chart: Record<string, unknown> | null) {
  const points = new Map<string, Record<string, unknown>>();
  if (!chart) return points;
  const planets = Array.isArray(chart.planets) ? chart.planets : [];
  for (const point of [chart.sun, chart.moon, chart.ascendant, chart.midheaven, ...planets]) {
    if (!point || typeof point !== "object") continue;
    const value = point as Record<string, unknown>;
    if (typeof value.key === "string" && Number.isFinite(Number(value.absolute_degree))) {
      points.set(value.key, value);
    }
  }
  return points;
}

function normalizeAngleDistance(a: number, b: number) {
  const distance = Math.abs((a - b) % 360);
  return Math.min(distance, 360 - distance);
}

function pointReference(point: Record<string, unknown>, prefix: string) {
  const label = String(point.label ?? point.key ?? "point");
  const sign = String(point.sign_label ?? point.sign_key ?? "");
  const degree = Number(point.degree);
  return `${prefix} ${label}: ${sign}${Number.isFinite(degree) ? ` ${degree.toFixed(1)}°` : ""}${
    point.retrograde ? " R" : ""
  }`;
}

function compactDailySkyAnchor(dayChart: Record<string, unknown>) {
  return {
    sun: dayChart.sun,
    moon: dayChart.moon,
    mercury: pointMap(dayChart).get("mercury"),
    venus: pointMap(dayChart).get("venus"),
    mars: pointMap(dayChart).get("mars")
  };
}

function buildRelationshipTimingContext(input: {
  locale: "tr" | "en";
  profile: Record<string, unknown> | null;
  synastry: Record<string, unknown> | null;
  journalEntries: unknown[];
  transitTiming?: Record<string, unknown> | null;
}) {
  const scores = (input.synastry?.scores ?? {}) as Record<string, unknown>;
  const attachment = Number(scores.attachment_dynamic ?? 58);
  const crisis = Number(scores.crisis_intensity ?? 48);
  const uncertaintyTolerance = Number(input.profile?.uncertainty_tolerance ?? 55);
  const loopThemes = inferLoopThemes(input.journalEntries, input.locale);
  const transitPressure = Number(input.transitTiming?.pressure_score ?? 0);
  const sensitive = attachment + crisis > 135 || uncertaintyTolerance < 45 || transitPressure >= 70;

  return {
    target_date: new Date().toISOString().slice(0, 10),
    loop_themes: loopThemes,
    transit_timing: input.transitTiming,
    sensitivity: sensitive ? "high" : "moderate",
    suggested_tone:
      input.locale === "en"
        ? sensitive
          ? "Ask one clear question without testing the other person."
          : "Keep the tone simple, warm and specific."
        : sensitive
          ? "Karşı tarafı test etmeden tek net soru sor."
          : "Tonu sade, sıcak ve somut tut.",
    do_not_do:
      input.locale === "en"
        ? "Do not treat silence or delay as proof."
        : "Sessizliği veya gecikmeyi kanıt gibi okuma."
  };
}

function mergeTimingContext(clientContext: unknown, serverContext: Record<string, unknown>) {
  if (!clientContext || typeof clientContext !== "object" || Array.isArray(clientContext)) {
    return serverContext;
  }

  const client = clientContext as Record<string, unknown>;
  return {
    ...client,
    ...serverContext,
    loop_themes: Array.isArray(serverContext.loop_themes) && serverContext.loop_themes.length
      ? serverContext.loop_themes
      : client.loop_themes,
    transit_timing: serverContext.transit_timing ?? client.transit_timing,
    relationship_spine: client.relationship_spine,
    next_action: client.next_action,
    sample_message: client.sample_message
  };
}

function inferLoopThemes(journalEntries: unknown[], locale: "tr" | "en") {
  const text = journalEntries
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      const value = entry as Record<string, unknown>;
      return `${value.event_text ?? ""} ${value.mood ?? ""} ${Array.isArray(value.signals) ? value.signals.join(" ") : ""}`;
    })
    .join(" ")
    .toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
  const themes = [
    { tr: "geç cevap", en: "late replies", patterns: ["geç", "cevap", "late", "reply", "seen"] },
    { tr: "belirsizlik", en: "uncertainty", patterns: ["belirsiz", "netlik", "kafam", "uncertain", "clarity"] },
    { tr: "geri çekilme", en: "withdrawal", patterns: ["uzak", "soğuk", "mesafe", "distant", "cold", "withdraw"] },
    { tr: "onarım ihtiyacı", en: "repair need", patterns: ["tartış", "kırıl", "gergin", "conflict", "hurt"] }
  ];
  const matched = themes
    .filter((theme) => theme.patterns.some((pattern) => text.includes(pattern)))
    .map((theme) => theme[locale]);
  return matched.length ? matched.slice(0, 3) : locale === "en" ? ["timing", "clarity"] : ["zamanlama", "netlik"];
}

function numberOrNull(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function filterReadingsByRelationship(
  readings: Array<Record<string, unknown>>,
  relationshipKey: string
) {
  if (!relationshipKey || relationshipKey === "unknown") return [];
  return readings.filter((reading) => {
    const result = reading.result_json as Record<string, unknown> | undefined;
    if (!result) return false;
    const stored =
      (result as { relationship_key?: unknown }).relationship_key ??
      ((result as { context?: Record<string, unknown> }).context?.relationship_key as unknown) ??
      null;
    if (typeof stored === "string" && stored.length) return stored === relationshipKey;
    const question = String(reading.question ?? "").toLocaleLowerCase("tr-TR");
    return question.includes(relationshipKey.replace(/_/g, " "));
  });
}

function computeRelationshipConfidence(input: {
  synastry: Record<string, unknown> | null;
  partnerBirthTimeKnown: boolean;
  journalCount: number;
  hasUserChart: boolean;
  hasPartnerChart: boolean;
  previousCount: number;
}) {
  let score = 0.55;
  const factors: string[] = [];

  if (input.hasUserChart && input.hasPartnerChart) {
    score += 0.12;
    factors.push("user_chart+partner_chart");
  }
  if (input.synastry && Array.isArray((input.synastry as { key_aspects?: unknown[] }).key_aspects) &&
      ((input.synastry as { key_aspects: unknown[] }).key_aspects).length >= 4) {
    score += 0.08;
    factors.push("synastry_aspects_rich");
  }
  if (input.partnerBirthTimeKnown) {
    score += 0.06;
    factors.push("partner_birth_time_known");
  } else {
    factors.push("partner_birth_time_unknown");
  }
  if (input.journalCount >= 3) {
    score += 0.08;
    factors.push("journal_evidence_present");
  } else if (input.journalCount >= 1) {
    score += 0.04;
    factors.push("journal_evidence_partial");
  }
  if (input.previousCount >= 1) {
    score += 0.04;
    factors.push("history_continuity");
  }

  score = Math.max(0.4, Math.min(0.95, Number(score.toFixed(2))));
  const label = score >= 0.8 ? "high" : score >= 0.62 ? "moderate" : "low";

  return { score, label, factors } as const;
}

function buildHistoryCompare(
  previousReadings: Array<Record<string, unknown>>,
  synastry: Record<string, unknown> | null,
  scores: Record<string, number>,
  locale: "tr" | "en"
) {
  const currentOverall = Number(synastry?.overall_score ?? scores.emotional_pull ?? 0) || null;
  if (!previousReadings.length) {
    return {
      has_previous: false,
      current_overall: currentOverall ?? undefined,
      insight:
        locale === "en"
          ? "First deep report for this bond — the loop will become clearer with the next entry."
          : "Bu bağ için ilk derin rapor — döngü bir sonraki kayıtla netleşecek."
    };
  }

  const previousResult = (previousReadings[0].result_json ?? {}) as Record<string, unknown>;
  const previousDeep = (previousResult.deep_report ?? {}) as Record<string, unknown>;
  const previousDeepScores = (previousDeep.scores ?? {}) as Record<string, unknown>;
  const previousScores = (previousResult.scores ?? {}) as Record<string, unknown>;
  const previousOverall =
    Number(previousDeepScores.synastry_overall ?? 0) ||
    Number(previousScores.emotional_pull ?? 0) ||
    null;

  const delta =
    typeof previousOverall === "number" && typeof currentOverall === "number"
      ? Number((currentOverall - previousOverall).toFixed(1))
      : undefined;

  let insight: string;
  if (delta === undefined) {
    insight =
      locale === "en"
        ? "Comparing to the previous entry to track the cycle."
        : "Aynı bağdaki bir önceki rapora kıyasla döngü takip ediliyor.";
  } else if (Math.abs(delta) < 4) {
    insight =
      locale === "en"
        ? "The signal is steady — the loop is repeating with similar pressure."
        : "Sinyal sabit — döngü benzer baskıyla tekrar ediyor.";
  } else if (delta > 0) {
    insight =
      locale === "en"
        ? "The bond signal is up vs. the previous reading — repair or relief is showing."
        : "Bağ sinyali bir önceki rapora göre yükselmiş — onarım ya da rahatlama görünüyor.";
  } else {
    insight =
      locale === "en"
        ? "The bond signal is down vs. the previous reading — pressure or distance has grown."
        : "Bağ sinyali bir önceki rapora göre düşmüş — baskı ya da mesafe büyümüş.";
  }

  return {
    has_previous: true,
    previous_overall: previousOverall ?? undefined,
    current_overall: currentOverall ?? undefined,
    delta,
    insight
  };
}

function finalizeDeepReport(
  deep: Record<string, unknown>,
  ctx: {
    scores: Record<string, number>;
    synastry: Record<string, unknown> | null;
    timingContext: Record<string, unknown>;
    historyCompare: Record<string, unknown>;
    dynamicConfidence: { score: number; label: string; factors: string[] };
    partnerBirthTimeKnown: boolean;
    locale: "tr" | "en";
  }
) {
  const synastryOverall = Number(ctx.synastry?.overall_score ?? 60) || 60;
  const scoresOut = {
    emotional_pull: Number(ctx.scores.emotional_pull) || 0,
    communication_clarity: Number(ctx.scores.communication_clarity) || 0,
    uncertainty_level: Number(ctx.scores.uncertainty_level) || 0,
    user_projection_risk: Number(ctx.scores.user_projection_risk) || 0,
    synastry_overall: synastryOverall
  };

  const targetDate = new Date().toISOString().slice(0, 10);
  const timingTransit = (ctx.timingContext.transit_timing ?? {}) as Record<string, unknown>;
  const pressureScore = Number(timingTransit.pressure_score ?? ctx.timingContext.pressure_score ?? 50);
  const pressureLabel = pressureScore >= 70 ? "high" : pressureScore >= 50 ? "moderate" : "low";
  const todayTiming = {
    ...(deep.today_timing as Record<string, unknown> | undefined),
    target_date: targetDate,
    pressure_label: pressureLabel
  };

  const historyCompare =
    ctx.historyCompare && Object.keys(ctx.historyCompare).length
      ? ctx.historyCompare
      : (deep.history_compare as Record<string, unknown> | undefined);

  const evidence = {
    ...(deep.evidence as Record<string, unknown> | undefined),
    time_known: ctx.partnerBirthTimeKnown
  };

  const confidence = {
    ...(deep.confidence as Record<string, unknown> | undefined),
    score: ctx.dynamicConfidence.score,
    label: ctx.dynamicConfidence.label,
    factors:
      Array.isArray((deep.confidence as Record<string, unknown> | undefined)?.factors) &&
      ((deep.confidence as { factors: unknown[] }).factors).length
        ? (deep.confidence as { factors: string[] }).factors
        : ctx.dynamicConfidence.factors
  };

  return {
    ...deep,
    scores: scoresOut,
    today_timing: todayTiming,
    history_compare: historyCompare,
    evidence,
    confidence
  };
}
