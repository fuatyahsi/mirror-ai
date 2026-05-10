import { buildAstrologyContext } from "@/features/astrology/context";
import { generateRelationshipMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";
import type { BirthInfo } from "@/types/profile";
import type { NatalChart, SynastryReport } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateRelationshipReading(input: {
  relationship_id?: string;
  nickname?: string;
  relation_type?: string;
  status: string;
  question: string;
  recent_context?: string;
  journal_mood?: string;
  journal_signals?: string[];
  partner_birth?: BirthInfo & { birth_time_known?: boolean };
  partnerNatalChart?: NatalChart;
  synastry?: SynastryReport;
  journal_entries?: unknown[];
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  locale?: Locale;
  useRemote?: boolean;
  accessMode?: "basic" | "deep";
}) {
  const accessMode = input.accessMode ?? "deep";
  const timingContext = buildRelationshipTimingContext({
    natalChart: input.natalChart,
    synastry: input.synastry,
    journalEntries: input.journal_entries,
    recentContext: input.recent_context,
    profile: input.profile,
    locale: input.locale,
    status: input.status,
    question: input.question
  });

  if (!isSupabaseConfigured || input.useRemote === false) {
    const mock = generateRelationshipMock(
      input.nickname ?? "",
      input.status,
      input.question,
      input.recent_context ?? "",
      input.profile,
      input.locale
    );
    return {
      ...mock,
      relationship_intelligence: {
        synastry: input.synastry,
        timing_context: timingContext,
        relationship_spine: buildRelationshipSpineSummary(input.synastry, timingContext, input.locale),
        journal_entries_count: input.journal_entries?.length ?? 0,
        partner_natal_chart: input.partnerNatalChart
      }
    };
  }

  const { data, error } = await supabase.functions.invoke("generate-relationship-reading", {
    body: {
      relationship_id: input.relationship_id,
      access_mode: accessMode,
      nickname: input.nickname,
      relation_type: input.relation_type,
      status: input.status,
      question: input.question,
      recent_context: input.recent_context,
      journal_mood: input.journal_mood,
      journal_signals: input.journal_signals ?? [],
      partner_birth: input.partner_birth,
      partner_natal_chart: input.partnerNatalChart,
      synastry: input.synastry,
      journal_entries: input.journal_entries ?? [],
      timing_context: timingContext,
      relationship_spine: buildRelationshipSpineSummary(input.synastry, timingContext, input.locale),
      profile: input.profile,
      memory: input.memory ?? [],
      astrology: {
        ...buildAstrologyContext(input.natalChart, input.locale),
        partner_natal_chart: input.partnerNatalChart,
        synastry: input.synastry
      },
      locale: input.locale ?? "tr"
    }
  });

  if (error) throw error;
  return {
    reading: toReadingOutput(
      data,
      {
        reading_type: "relationship",
        topic: "relationship",
        question: input.question
      },
      input.locale
    ),
    scores: data.scores,
    billing: data.billing,
    relationship_intelligence: data.relationship_intelligence
  };
}

function buildRelationshipTimingContext(input: {
  natalChart?: NatalChart;
  synastry?: SynastryReport;
  journalEntries?: unknown[];
  recentContext?: string;
  profile?: MysticProfile;
  locale?: Locale;
  status?: string;
  question?: string;
}) {
  const locale = input.locale ?? "tr";
  const today = new Date().toISOString().slice(0, 10);
  const synastryScores = input.synastry?.scores;
  const attachment = synastryScores?.attachment_dynamic ?? 54;
  const crisis = synastryScores?.crisis_intensity ?? 46;
  const uncertaintyTolerance = input.profile?.uncertainty_tolerance ?? 58;
  const loopThemes = inferLoopThemes(input.journalEntries ?? [], input.recentContext, locale);
  const journalPressure = Math.min(18, (input.journalEntries?.length ?? 0) * 4 + (input.recentContext?.trim() ? 6 : 0));
  const pressureScore = clampScore(
    Math.round(attachment * 0.34 + crisis * 0.28 + (100 - uncertaintyTolerance) * 0.2 + journalPressure)
  );
  const sensitivity = pressureScore >= 72 ? "high" : pressureScore >= 55 ? "moderate" : "low";
  const asksAboutMessage = /mesaj|yaz|ara|text|message|call/i.test(input.question ?? "");

  return {
    target_date: today,
    timing_basis: "synastry + relationship memory + current question",
    natal_anchor: input.natalChart
      ? {
          sun: input.natalChart.sun,
          moon: input.natalChart.moon,
          ascendant: input.natalChart.ascendant
        }
      : null,
    synastry_anchor: input.synastry
      ? {
          overall_score: input.synastry.overall_score,
          confidence: input.synastry.confidence,
          strongest_strength: input.synastry.strengths[0],
          strongest_risk: input.synastry.risk_areas[0]
        }
      : null,
    loop_themes: loopThemes,
    journal_entries_count: input.journalEntries?.length ?? 0,
    current_status: input.status,
    pressure_score: pressureScore,
    sensitivity,
    suggested_tone: suggestedTone(sensitivity, locale),
    do_not_do: doNotDo(loopThemes, sensitivity, locale),
    next_action: nextAction(loopThemes, sensitivity, asksAboutMessage, locale),
    sample_message: asksAboutMessage ? sampleMessage(sensitivity, locale) : undefined
  };
}

function buildRelationshipSpineSummary(
  synastry: SynastryReport | undefined,
  timingContext: Record<string, unknown>,
  locale: Locale = "tr"
) {
  const loopThemes = Array.isArray(timingContext.loop_themes) ? timingContext.loop_themes.map(String) : [];
  return {
    pillars: [
      {
        key: "synastry",
        label: locale === "en" ? "Synastry" : "Sinastri",
        ready: Boolean(synastry),
        summary: synastry
          ? locale === "en"
            ? `Overall bond signal ${synastry.overall_score}/100.`
            : `Genel bağ sinyali ${synastry.overall_score}/100.`
          : locale === "en"
            ? "Add partner birth context to calculate chart-to-chart dynamics."
            : "Haritalar arası dinamiği hesaplamak için karşı kişinin doğum bağlamını ekle."
      },
      {
        key: "memory",
        label: locale === "en" ? "Relationship memory" : "İlişki hafızası",
        ready: loopThemes.length > 0,
        summary: loopThemes.length
          ? loopThemes.join(" / ")
          : locale === "en"
            ? "Journal entries will reveal recurring patterns."
            : "Günlük kayıtları tekrar eden ilişki temasını çıkaracak."
      },
      {
        key: "timing",
        label: locale === "en" ? "Timing" : "Zamanlama",
        ready: true,
        summary: String(timingContext.next_action ?? timingContext.suggested_tone ?? "")
      }
    ]
  };
}

function inferLoopThemes(entries: unknown[], currentContext: string | undefined, locale: Locale) {
  const text = [
    currentContext,
    ...entries.map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      const value = entry as Record<string, unknown>;
      return `${value.event_text ?? ""} ${value.mood ?? ""} ${Array.isArray(value.signals) ? value.signals.join(" ") : ""}`;
    })
  ]
    .join(" ")
    .toLocaleLowerCase(locale === "en" ? "en-US" : "tr-TR");
  const themes = [
    {
      tr: "geç cevap / bekleme",
      en: "late replies / waiting",
      patterns: ["geç", "cevap", "bekle", "late", "reply", "seen", "wait"]
    },
    {
      tr: "belirsizlikte anlam arama",
      en: "meaning-seeking in uncertainty",
      patterns: ["belirsiz", "netlik", "kafam", "karış", "uncertain", "clarity", "confused"]
    },
    {
      tr: "yakınlık sonrası geri çekilme",
      en: "withdrawal after closeness",
      patterns: ["uzak", "soğuk", "mesafe", "geri", "distant", "cold", "withdraw"]
    },
    {
      tr: "kırılma ve onarım ihtiyacı",
      en: "hurt and repair need",
      patterns: ["tartış", "kırıl", "gergin", "conflict", "fight", "hurt"]
    },
    {
      tr: "çekim ile sınır arasında kalma",
      en: "pull versus boundary",
      patterns: ["çekim", "özlü", "sınır", "kopam", "attraction", "miss", "boundary", "detach"]
    }
  ];
  const matched = themes
    .filter((theme) => theme.patterns.some((pattern) => text.includes(pattern)))
    .map((theme) => (locale === "en" ? theme.en : theme.tr));
  return matched.length
    ? matched.slice(0, 3)
    : locale === "en"
      ? ["timing", "clarity", "communication tone"]
      : ["zamanlama", "netlik", "iletişim tonu"];
}

function suggestedTone(sensitivity: string, locale: Locale) {
  if (locale === "en") {
    if (sensitivity === "high") return "Use one clear, calm sentence. Do not test the other person indirectly.";
    if (sensitivity === "moderate") return "Keep the tone warm but specific; ask for clarity without pressure.";
    return "This is a good moment for simple contact rather than heavy meaning.";
  }
  if (sensitivity === "high") return "Tek net ve sakin cümle kullan. Karşı tarafı dolaylı biçimde test etme.";
  if (sensitivity === "moderate") return "Tonu sıcak ama somut tut; baskı kurmadan netlik iste.";
  return "Ağır anlam yüklemek yerine sade bir temas için uygun bir zemin var.";
}

function doNotDo(loopThemes: string[], sensitivity: string, locale: Locale) {
  const hasWaiting = loopThemes.some((theme) => /geç|bekleme|late|waiting/i.test(theme));
  if (locale === "en") {
    if (hasWaiting) return "Do not read delay as proof of rejection.";
    if (sensitivity === "high") return "Do not turn the conversation into a verdict about the whole relationship.";
    return "Do not ask more than one emotional question at once.";
  }
  if (hasWaiting) return "Gecikmeyi reddedilmenin kanıtı gibi okuma.";
  if (sensitivity === "high") return "Konuşmayı ilişkinin tamamı hakkında hüküm anına çevirme.";
  return "Aynı anda birden fazla duygusal soru sorma.";
}

function nextAction(loopThemes: string[], sensitivity: string, asksAboutMessage: boolean, locale: Locale) {
  if (locale === "en") {
    if (asksAboutMessage) return sensitivity === "high" ? "Message later with a short emotional check-in." : "Send a short, clear message and leave room for response.";
    if (loopThemes.length) return "Name the pattern softly, then ask for one concrete clarification.";
    return "Observe the next interaction before making a large decision.";
  }
  if (asksAboutMessage) return sensitivity === "high" ? "Biraz sonra kısa ve duygu paylaşan bir mesaj at." : "Kısa, açık bir mesaj at ve cevap için alan bırak.";
  if (loopThemes.length) return "Döngüyü yumuşakça adlandır, sonra tek somut netlik iste.";
  return "Büyük karar vermeden önce bir sonraki etkileşimi gözlemle.";
}

function sampleMessage(sensitivity: string, locale: Locale) {
  if (locale === "en") {
    return sensitivity === "high"
      ? "I felt a bit distant today. When you have space, I’d like to talk calmly."
      : "I’d like to understand where we stand. Are you open to talking today?";
  }
  return sensitivity === "high"
    ? "Bugün biraz mesafe hissettim. Uygun olduğunda sakin konuşmak isterim."
    : "Aramızdaki durumu daha net anlamak istiyorum. Bugün konuşmaya açık mısın?";
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(1, Math.min(100, value));
}
