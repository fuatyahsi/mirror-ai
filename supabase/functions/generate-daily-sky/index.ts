import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";
import { buildSourceContext, normalizeLocale, sourceLabels } from "../shared/sourceContext.ts";

type ZodiacPoint = {
  key: string;
  label: string;
  absolute_degree: number;
  sign_label: string;
  degree: number;
  retrograde?: boolean;
};

type ChartLike = {
  input?: {
    birth_date?: string;
    birth_time?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  time?: { local?: string; utc?: string; julian_day_ut?: number };
  engine?: Record<string, unknown>;
  sun?: ZodiacPoint;
  moon?: ZodiacPoint;
  ascendant?: ZodiacPoint;
  planets?: ZodiacPoint[];
  aspects?: unknown[];
  warnings?: string[];
};

const majorAspects = [
  { type: "conjunction", tr: "Kavuşum", en: "Conjunction", angle: 0, orb: 6 },
  { type: "sextile", tr: "Altmışlık", en: "Sextile", angle: 60, orb: 4 },
  { type: "square", tr: "Kare", en: "Square", angle: 90, orb: 5 },
  { type: "trine", tr: "Üçgen", en: "Trine", angle: 120, orb: 5 },
  { type: "opposition", tr: "Karşıt", en: "Opposition", angle: 180, orb: 6 }
];

const transitPlanetPriority = ["moon", "mercury", "venus", "mars", "sun", "jupiter", "saturn"];
const natalPlanetPriority = ["sun", "moon", "ascendant", "mercury", "venus", "mars", "saturn"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json().catch(() => ({}));
    const locale = normalizeLocale(body.locale);
    const labels = sourceLabels(locale);

    const [{ data: dbUserProfile }, { data: dbProfile }, { data: dbMemory }, { data: recentReadings }, { data: latestChart }] =
      user
        ? await Promise.all([
            supabase.from("users_profile").select("*").eq("user_id", user.id).maybeSingle(),
            supabase.from("user_personality_profile").select("*").eq("user_id", user.id).maybeSingle(),
            supabase.from("memory_events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
            supabase
              .from("readings")
              .select("*")
              .eq("user_id", user.id)
              .eq("reading_type", "daily")
              .order("created_at", { ascending: false })
              .limit(7),
            supabase.from("birth_charts").select("chart_json").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
          ])
        : [{ data: null }, { data: null }, { data: [] }, { data: [] }, { data: null }];

    const profile = dbProfile ?? body.profile ?? body.client_profile ?? null;
    const memory = dbMemory?.length ? dbMemory : (body.memory ?? body.client_memory ?? []);
    const natalChart = (body.natal_chart ?? body.natalChart ?? latestChart?.chart_json ?? null) as ChartLike | null;
    const targetDate = normalizeDate(body.target_date);
    const birthContext = normalizeBirthContext(body, dbUserProfile, natalChart);
    const dayChart = await calculateDayChart(targetDate, birthContext);
    const transitAspects = natalChart && dayChart ? calculateTransitAspects(dayChart, natalChart, locale) : [];

    const dailySkyContext = {
      target_date: targetDate,
      timezone: birthContext.timezone,
      daily_chart: compactChart(dayChart),
      natal_chart: compactChart(natalChart),
      transit_aspects: transitAspects,
      recent_daily_count: recentReadings?.length ?? 0,
      notification_positioning:
        locale === "en"
          ? "Daily notification should invite one calm check-in, not compulsive checking."
          : "Günlük bildirim tek sakin kontrol daveti olmalı; kompulsif bakışı teşvik etmemeli."
    };

    const sourceContext = buildSourceContext({
      readingType: "daily",
      locale,
      profile,
      memory,
      astrology: {
        ...body.astrology,
        daily_sky: dailySkyContext
      },
      extra: [
        `${labels.topic}: ${body.topic ?? "daily_sky"}`,
        `${labels.mood}: ${body.mood ?? labels.notProvided}`,
        locale === "en" ? `Target date: ${targetDate}` : `Yorum tarihi: ${targetDate}`,
        locale === "en" ? "System: natal chart + daily transit chart + memory" : "Sistem: natal harita + günlük transit harita + hafıza"
      ]
    });

    const provider = getAIProvider();
    const result = await provider.generateReading({
      readingType: "daily",
      topic: body.topic ?? (locale === "en" ? "daily sky" : "günlük gökyüzü"),
      question:
        body.question ??
        (locale === "en"
          ? "What should I notice in today's sky?"
          : "Bugünün gökyüzünde kendim için neyi fark etmeliyim?"),
      context: {
        daily_sky: dailySkyContext,
        recent_reading_count: recentReadings?.length ?? 0,
        mood: body.mood
      },
      profile,
      memory,
      astrology: {
        natal_chart: compactChart(natalChart),
        daily_chart: compactChart(dayChart),
        transit_aspects: transitAspects
      },
      locale
    });

    const notificationTitle = locale === "en" ? "Your Daily Sky Mirror is ready" : "Günlük Gökyüzü Aynan hazır";
    const notificationBody = summarizeForNotification(result.summary, locale);

    if (!user) {
      return jsonResponse({
        reading_id: crypto.randomUUID(),
        persisted: false,
        ...result,
        source_context: sourceContext,
        daily_sky_context: dailySkyContext,
        notification: { title: notificationTitle, body: notificationBody }
      });
    }

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "daily",
        topic: body.topic ?? "daily_sky",
        question: body.question ?? null,
        result_json: { ...result, source_context: sourceContext, daily_sky_context: dailySkyContext },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence
      })
      .select("id")
      .single();
    if (error) throw error;

    return jsonResponse({
      reading_id: reading.id,
      persisted: true,
      ...result,
      source_context: sourceContext,
      daily_sky_context: dailySkyContext,
      notification: { title: notificationTitle, body: notificationBody }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function normalizeDate(input?: string) {
  if (input && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return new Date().toISOString().slice(0, 10);
}

function normalizeBirthContext(body: Record<string, unknown>, profile: Record<string, unknown> | null, chart: ChartLike | null) {
  return {
    latitude: Number(body.latitude ?? profile?.latitude ?? chart?.input?.latitude),
    longitude: Number(body.longitude ?? profile?.longitude ?? chart?.input?.longitude),
    timezone: String(body.timezone ?? profile?.timezone ?? chart?.input?.timezone ?? "UTC")
  };
}

async function calculateDayChart(targetDate: string, birthContext: { latitude: number; longitude: number; timezone: string }) {
  if (!Number.isFinite(birthContext.latitude) || !Number.isFinite(birthContext.longitude)) return null;

  const serviceUrl = Deno.env.get("ASTROLOGY_SERVICE_URL");
  if (!serviceUrl) return null;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = Deno.env.get("ASTROLOGY_SERVICE_TOKEN");
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/natal-chart`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      birth_date: targetDate,
      birth_time: "12:00",
      latitude: birthContext.latitude,
      longitude: birthContext.longitude,
      timezone: birthContext.timezone,
      house_system: "P"
    })
  });

  if (!response.ok) return null;
  return (await response.json()) as ChartLike;
}

function compactChart(chart: ChartLike | null) {
  if (!chart) return null;
  return {
    input: chart.input,
    time: chart.time,
    engine: chart.engine,
    sun: chart.sun,
    moon: chart.moon,
    ascendant: chart.ascendant,
    planets: (chart.planets ?? []).filter((planet) =>
      ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"].includes(planet.key)
    ),
    aspects: chart.aspects?.slice(0, 8),
    warnings: chart.warnings ?? []
  };
}

function calculateTransitAspects(dayChart: ChartLike, natalChart: ChartLike, locale: "tr" | "en") {
  const transits = pointsByKey(dayChart);
  const natal = pointsByKey(natalChart);
  const result: Array<Record<string, unknown>> = [];

  for (const transitKey of transitPlanetPriority) {
    const transit = transits.get(transitKey);
    if (!transit) continue;

    for (const natalKey of natalPlanetPriority) {
      const natalPoint = natal.get(natalKey);
      if (!natalPoint) continue;
      const distance = normalizeAngleDistance(transit.absolute_degree, natalPoint.absolute_degree);
      const aspect = majorAspects.find((candidate) => Math.abs(distance - candidate.angle) <= candidate.orb);
      if (!aspect) continue;

      const orb = Math.abs(distance - aspect.angle);
      result.push({
        type: aspect.type,
        label: locale === "en" ? aspect.en : aspect.tr,
        orb: Number(orb.toFixed(2)),
        transit: pointReference(transit, locale === "en" ? "Transit" : "Transit"),
        natal: pointReference(natalPoint, locale === "en" ? "Natal" : "Natal")
      });
    }
  }

  return result.sort((first, second) => Number(first.orb) - Number(second.orb)).slice(0, 8);
}

function pointsByKey(chart: ChartLike) {
  const map = new Map<string, ZodiacPoint>();
  for (const point of [chart.sun, chart.moon, chart.ascendant, ...(chart.planets ?? [])]) {
    if (point?.key && Number.isFinite(point.absolute_degree)) map.set(point.key, point);
  }
  return map;
}

function normalizeAngleDistance(a: number, b: number) {
  const distance = Math.abs((a - b) % 360);
  return Math.min(distance, 360 - distance);
}

function pointReference(point: ZodiacPoint, prefix: string) {
  return `${prefix} ${point.label}: ${point.sign_label} ${point.degree.toFixed(1)}°${point.retrograde ? " R" : ""}`;
}

function summarizeForNotification(summary: string, locale: "tr" | "en") {
  const fallback =
    locale === "en"
      ? "Open Mirror AI for today's personal sky insight."
      : "Bugünün kişisel gökyüzü içgörüsünü Mirror AI’da aç.";
  const clean = summary?.replace(/\s+/g, " ").trim() || fallback;
  return clean.length > 120 ? `${clean.slice(0, 117)}...` : clean;
}
