type Locale = "tr" | "en";

const copy = {
  tr: {
    sun: "Güneş",
    moon: "Ay",
    ascendant: "Yükselen",
    midheaven: "Tepe noktası",
    profile: "Mistik profil",
    style: "Yorum stili",
    uncertainty: "Belirsizlik toleransı",
    clarity: "Netlik ihtiyacı",
    memory: "Hafıza sinyali",
    aiSystem: "Mirror AI servis katmanı",
    personalProfile: "Mistik profil",
    personalMemory: "Kişisel hafıza",
    swiss: "Swiss Ephemeris doğum/yıldız haritası",
    tarot: "Tarot açılımı",
    coffee: "Kahve sembolleri",
    relationship: "İlişki bağlamı",
    engine: "Mirror AI + Supabase Edge Functions",
    tarotRef: "Tarot",
    coffeeSymbol: "Kahve sembolü",
    spreadType: "Açılım tipi",
    topic: "Konu",
    mood: "Ruh hali",
    notProvided: "belirtilmedi",
    status: "İlişki durumu",
    pullScore: "Duygusal çekim skoru",
    uncertaintyScore: "Belirsizlik seviyesi",
    positions: {
      message: "mesaj",
      past: "geçmiş",
      present: "şimdi",
      possible_direction: "olası yön",
      you: "sen",
      other: "karşı taraf",
      dynamic: "ilişki dinamiği",
      option_a: "seçenek A",
      option_b: "seçenek B",
      subconscious_influence: "bilinçaltı etki"
    },
    orientations: {
      upright: "düz",
      reversed: "ters"
    }
  },
  en: {
    sun: "Sun",
    moon: "Moon",
    ascendant: "Ascendant",
    midheaven: "Midheaven",
    profile: "Mystic profile",
    style: "Reading style",
    uncertainty: "Uncertainty tolerance",
    clarity: "Need for clarity",
    memory: "Memory signal",
    aiSystem: "Mirror AI service layer",
    personalProfile: "Mystic profile",
    personalMemory: "Personal memory",
    swiss: "Swiss Ephemeris birth/star chart",
    tarot: "Tarot spread",
    coffee: "Coffee symbols",
    relationship: "Relationship context",
    engine: "Mirror AI + Supabase Edge Functions",
    tarotRef: "Tarot",
    coffeeSymbol: "Coffee symbol",
    spreadType: "Spread type",
    topic: "Topic",
    mood: "Mood",
    notProvided: "not provided",
    status: "Relationship status",
    pullScore: "Emotional pull score",
    uncertaintyScore: "Uncertainty level",
    positions: {
      message: "message",
      past: "past",
      present: "present",
      possible_direction: "possible direction",
      you: "you",
      other: "other person",
      dynamic: "relationship dynamic",
      option_a: "option A",
      option_b: "option B",
      subconscious_influence: "subconscious influence"
    },
    orientations: {
      upright: "upright",
      reversed: "reversed"
    }
  }
} as const;

function compactPoint(label: string, point: Record<string, unknown> | undefined) {
  if (!point) return null;
  const sign = point.sign_label || point.sign || point.sign_key;
  const degree = typeof point.degree === "number" ? ` ${Number(point.degree).toFixed(1)}°` : "";
  return sign ? `${label}: ${sign}${degree}` : null;
}

function astrologyReferences(astrology: Record<string, unknown> | null | undefined, locale: Locale) {
  if (!astrology) return [];
  const text = copy[locale];

  const explicit = astrology.reference_points;
  if (Array.isArray(explicit)) return explicit.filter(Boolean).map(String);

  const birthChart = (astrology.systems as Record<string, unknown> | undefined)?.birth_chart as
    | Record<string, unknown>
    | undefined;
  const starChart = (astrology.systems as Record<string, unknown> | undefined)?.star_chart as
    | Record<string, unknown>
    | undefined;

  const refs = [
    compactPoint(text.sun, (astrology.sun as Record<string, unknown>) ?? (birthChart?.sun as Record<string, unknown>)),
    compactPoint(text.moon, (astrology.moon as Record<string, unknown>) ?? (birthChart?.moon as Record<string, unknown>)),
    compactPoint(
      text.ascendant,
      (astrology.ascendant as Record<string, unknown>) ?? (birthChart?.ascendant as Record<string, unknown>)
    ),
    compactPoint(
      text.midheaven,
      (astrology.midheaven as Record<string, unknown>) ?? (birthChart?.midheaven as Record<string, unknown>)
    )
  ].filter(Boolean) as string[];

  const planets = (astrology.planets ?? starChart?.planets) as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(planets)) {
    refs.push(
      ...planets
        .slice(0, 5)
        .map((planet) => compactPoint(String(planet.label || planet.key || "Planet"), planet))
        .filter(Boolean) as string[]
    );
  }

  const aspects = (astrology.aspects ?? starChart?.aspects) as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(aspects)) {
    refs.push(
      ...aspects.slice(0, 4).map((aspect) => {
        const between = Array.isArray(aspect.between) ? aspect.between.join(" - ") : "planets";
        return `${aspect.label || aspect.type}: ${between}`;
      })
    );
  }

  return refs;
}

function profileReferences(profile: Record<string, unknown> | null | undefined, locale: Locale) {
  if (!profile) return [];
  const text = copy[locale];
  return [
    profile.profile_title ? `${text.profile}: ${profile.profile_title}` : null,
    profile.preferred_reading_style ? `${text.style}: ${profile.preferred_reading_style}` : null,
    typeof profile.uncertainty_tolerance === "number"
      ? `${text.uncertainty}: ${profile.uncertainty_tolerance}`
      : null,
    typeof profile.rationality_need === "number" ? `${text.clarity}: ${profile.rationality_need}` : null
  ].filter(Boolean) as string[];
}

function memoryReferences(memory: Array<Record<string, unknown>> | undefined, locale: Locale) {
  if (!Array.isArray(memory) || memory.length === 0) return [];
  const text = copy[locale];
  return memory.slice(0, 4).map((item) => `${text.memory}: ${item.memory_key || item.event_type || "feedback"}`);
}

function tarotReferences(cards: Array<Record<string, unknown>> | undefined, locale: Locale) {
  if (!Array.isArray(cards) || cards.length === 0) return [];
  const text = copy[locale];
  return cards.map((card) => {
    const position = text.positions[String(card.position) as keyof typeof text.positions] ?? String(card.position);
    const orientation =
      text.orientations[String(card.orientation) as keyof typeof text.orientations] ?? String(card.orientation);
    return `${text.tarotRef}: ${position} / ${card.card} / ${orientation}`;
  });
}

function unique(items: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sourceLabels(locale: Locale = "tr") {
  return copy[locale];
}

export function normalizeLocale(locale: unknown): Locale {
  return locale === "en" ? "en" : "tr";
}

export function buildSourceContext(input: {
  readingType: string;
  locale?: Locale;
  profile?: Record<string, unknown> | null;
  memory?: Array<Record<string, unknown>>;
  astrology?: Record<string, unknown> | null;
  tarotCards?: Array<Record<string, unknown>>;
  extra?: string[];
}) {
  const locale = input.locale ?? "tr";
  const text = copy[locale];
  const systems = [
    text.aiSystem,
    input.profile ? text.personalProfile : null,
    input.memory?.length ? text.personalMemory : null,
    input.astrology ? text.swiss : null,
    input.readingType === "tarot" ? text.tarot : null,
    input.readingType === "coffee" ? text.coffee : null,
    input.readingType === "relationship" ? text.relationship : null
  ].filter(Boolean) as string[];

  return {
    systems: unique(systems),
    references: unique([
      ...tarotReferences(input.tarotCards, locale),
      ...astrologyReferences(input.astrology, locale),
      ...profileReferences(input.profile, locale),
      ...memoryReferences(input.memory, locale),
      ...(input.extra ?? [])
    ]).slice(0, 18),
    engine: text.engine
  };
}
