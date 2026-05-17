import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";
import { buildSourceContext, normalizeLocale, sourceLabels } from "../shared/sourceContext.ts";
import { recordCreditSpend, requirePaidAccess } from "../shared/credits.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    if (!user) {
      return jsonResponse(
        { error: "auth_required", feature: "weekly_relationship_report" },
        401
      );
    }
    const body = await req.json();
    const locale = normalizeLocale(body.locale);
    const labels = sourceLabels(locale);

    const creditAccess = await requirePaidAccess("weekly_relationship", user.id);

    // Resolve target relationship: either explicit id, or by relationship_key,
    // or fall back to the most recently touched relationship.
    let relationship: Record<string, unknown> | null = null;
    if (body.relationship_id) {
      const { data } = await supabase
        .from("relationships")
        .select("*")
        .eq("user_id", user.id)
        .eq("id", body.relationship_id)
        .maybeSingle();
      relationship = data;
    } else if (body.relationship_key) {
      const { data } = await supabase
        .from("relationships")
        .select("*")
        .eq("user_id", user.id)
        .eq("relationship_key", String(body.relationship_key))
        .maybeSingle();
      relationship = data;
    } else {
      const { data } = await supabase
        .from("relationships")
        .select("*")
        .eq("user_id", user.id)
        .order("last_synastry_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      relationship = data;
    }

    if (!relationship) {
      return jsonResponse(
        {
          error: "no_relationship",
          message:
            locale === "en"
              ? "No relationship profile found. Add a person from the Relationship tab first."
              : "Kayıtlı ilişki profili bulunamadı. Önce İlişki sekmesinden bir kişi ekle."
        },
        404
      );
    }

    const relationshipKey = String(relationship.relationship_key ?? "");
    const today = new Date();
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekStartIso = weekStart.toISOString();
    const weekEnd = today.toISOString();
    const weekStartDate = weekStartIso.slice(0, 10);
    const weekEndDate = weekEnd.slice(0, 10);

    const [
      { data: dbProfile },
      { data: dbMemory },
      { data: latestBirthChart },
      { data: journalEntries },
      { data: recentReadings }
    ] = await Promise.all([
      supabase.from("user_personality_profile").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("memory_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("birth_charts")
        .select("chart_json")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("relationship_journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("relationship_key", relationshipKey)
        .gte("created_at", weekStartIso)
        .order("created_at", { ascending: true }),
      supabase
        .from("readings")
        .select("id,question,result_json,created_at")
        .eq("user_id", user.id)
        .eq("reading_type", "relationship")
        .gte("created_at", weekStartIso)
        .order("created_at", { ascending: true })
    ]);

    // Filter readings to only the same relationship_key when possible.
    const filteredReadings = (recentReadings ?? []).filter((reading) => {
      const result = reading.result_json as Record<string, unknown> | undefined;
      const stored = result?.relationship_key;
      if (typeof stored === "string" && stored.length) return stored === relationshipKey;
      const question = String(reading.question ?? "").toLocaleLowerCase("tr-TR");
      return question.includes(String(relationship.nickname ?? "").toLocaleLowerCase("tr-TR"));
    });

    const profile = dbProfile ?? null;
    const synastry = relationship.synastry_json ?? null;
    const partnerNatalChart = null; // partner chart isn't stored; baseline scores come from synastry_json
    const userNatalChart = latestBirthChart?.chart_json ?? null;

    const period = {
      week_start: weekStartDate,
      week_end: weekEndDate,
      relationship_nickname: String(relationship.nickname ?? "—"),
      relation_type: String(relationship.relation_type ?? "ilişki")
    };

    const evidence = {
      journal_entries_count: journalEntries?.length ?? 0,
      readings_count: filteredReadings.length,
      days_with_data: new Set(
        (journalEntries ?? []).map((entry) => String(entry.created_at ?? "").slice(0, 10))
      ).size
    };

    const provider = getAIProvider();
    const sourceContext = buildSourceContext({
      readingType: "relationship",
      locale,
      profile: profile ?? undefined,
      memory: dbMemory ?? [],
      astrology: {
        natal_chart: userNatalChart,
        partner_natal_chart: partnerNatalChart,
        synastry
      },
      extra: [
        locale === "en"
          ? `Period: ${weekStartDate} → ${weekEndDate}`
          : `Dönem: ${weekStartDate} → ${weekEndDate}`,
        locale === "en"
          ? `Journal entries: ${evidence.journal_entries_count}`
          : `Günlük kaydı: ${evidence.journal_entries_count}`,
        locale === "en"
          ? `Readings this week: ${evidence.readings_count}`
          : `Bu haftaki yorumlar: ${evidence.readings_count}`
      ]
    });

    const result = await provider.generateReading({
      readingType: "weekly_relationship",
      userId: user?.id,
      topic: "weekly_relationship",
      accessMode: "deep",
      question: locale === "en" ? "How was this week with this bond?" : "Bu hafta bu bağda neler oldu?",
      context: {
        period,
        relationship,
        synastry,
        journal_entries: journalEntries ?? [],
        recent_readings: filteredReadings,
        evidence
      },
      profile: profile ?? undefined,
      memory: dbMemory ?? [],
      astrology: {
        natal_chart: userNatalChart,
        partner_natal_chart: partnerNatalChart,
        synastry
      },
      locale
    });

    // Finalize: pin period values and evidence counts so UI never sees drift.
    const finalizedWeekly = result.weekly_report
      ? finalizeWeeklyReport(result.weekly_report, { period, evidence, locale })
      : undefined;
    if (finalizedWeekly) {
      result.weekly_report = finalizedWeekly;
    }

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "weekly_relationship",
        topic: "weekly_relationship",
        question: locale === "en" ? "Weekly review" : "Haftalık özet",
        result_json: {
          ...result,
          source_context: sourceContext,
          relationship_key: relationshipKey,
          access_mode: "deep"
        },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence,
        premium_used: Boolean(creditAccess?.isPremium || creditAccess?.shouldSpendCredits)
      })
      .select("id")
      .single();

    if (error) throw error;

    const billing = creditAccess ? await recordCreditSpend(user.id, creditAccess, reading.id) : null;

    return jsonResponse({
      reading_id: reading.id,
      persisted: true,
      billing,
      access_mode: "deep",
      relationship_key: relationshipKey,
      ...result,
      source_context: sourceContext,
      relationship_intelligence: {
        synastry,
        period,
        evidence,
        relationship_id: relationship.id,
        relationship_key: relationshipKey
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function finalizeWeeklyReport(
  weekly: Record<string, unknown>,
  ctx: {
    period: {
      week_start: string;
      week_end: string;
      relationship_nickname: string;
      relation_type: string;
    };
    evidence: {
      journal_entries_count: number;
      readings_count: number;
      days_with_data: number;
    };
    locale: "tr" | "en";
  }
) {
  // Echo authoritative period + evidence from server, never trust LLM dates.
  const period = ctx.period;

  const evidenceBlock = {
    ...(weekly.evidence as Record<string, unknown> | undefined),
    journal_entries_count: ctx.evidence.journal_entries_count,
    readings_count: ctx.evidence.readings_count,
    days_with_data: ctx.evidence.days_with_data,
    swiss_ephemeris_note:
      ((weekly.evidence as Record<string, unknown> | undefined)?.swiss_ephemeris_note as string) ??
      (ctx.locale === "en"
        ? "Synastry baseline calculated via Swiss Ephemeris."
        : "Sinastri temel hesabı Swiss Ephemeris üzerinden yapıldı.")
  };

  return {
    ...weekly,
    period,
    evidence: evidenceBlock
  };
}
