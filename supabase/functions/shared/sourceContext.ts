function compactPoint(label: string, point: Record<string, unknown> | undefined) {
  if (!point) return null;
  const sign = point.sign_label || point.sign || point.sign_key;
  const degree = typeof point.degree === "number" ? ` ${Number(point.degree).toFixed(1)}°` : "";
  return sign ? `${label}: ${sign}${degree}` : null;
}

function astrologyReferences(astrology: Record<string, unknown> | null | undefined) {
  if (!astrology) return [];

  const explicit = astrology.reference_points;
  if (Array.isArray(explicit)) return explicit.filter(Boolean).map(String);

  const birthChart = (astrology.systems as Record<string, unknown> | undefined)?.birth_chart as
    | Record<string, unknown>
    | undefined;
  const starChart = (astrology.systems as Record<string, unknown> | undefined)?.star_chart as
    | Record<string, unknown>
    | undefined;

  const refs = [
    compactPoint("Güneş", (astrology.sun as Record<string, unknown>) ?? (birthChart?.sun as Record<string, unknown>)),
    compactPoint("Ay", (astrology.moon as Record<string, unknown>) ?? (birthChart?.moon as Record<string, unknown>)),
    compactPoint(
      "Yükselen",
      (astrology.ascendant as Record<string, unknown>) ?? (birthChart?.ascendant as Record<string, unknown>)
    ),
    compactPoint(
      "Tepe noktası",
      (astrology.midheaven as Record<string, unknown>) ?? (birthChart?.midheaven as Record<string, unknown>)
    )
  ].filter(Boolean) as string[];

  const planets = (astrology.planets ?? starChart?.planets) as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(planets)) {
    refs.push(
      ...planets
        .slice(0, 5)
        .map((planet) => compactPoint(String(planet.label || planet.key || "Gezegen"), planet))
        .filter(Boolean) as string[]
    );
  }

  const aspects = (astrology.aspects ?? starChart?.aspects) as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(aspects)) {
    refs.push(
      ...aspects.slice(0, 4).map((aspect) => {
        const between = Array.isArray(aspect.between) ? aspect.between.join(" - ") : "gezegenler";
        return `${aspect.label || aspect.type}: ${between}`;
      })
    );
  }

  return refs;
}

function profileReferences(profile: Record<string, unknown> | null | undefined) {
  if (!profile) return [];
  return [
    profile.profile_title ? `Mistik profil: ${profile.profile_title}` : null,
    profile.preferred_reading_style ? `Yorum stili: ${profile.preferred_reading_style}` : null,
    typeof profile.uncertainty_tolerance === "number"
      ? `Belirsizlik toleransı: ${profile.uncertainty_tolerance}`
      : null,
    typeof profile.rationality_need === "number" ? `Netlik ihtiyacı: ${profile.rationality_need}` : null
  ].filter(Boolean) as string[];
}

function memoryReferences(memory: Array<Record<string, unknown>> | undefined) {
  if (!Array.isArray(memory) || memory.length === 0) return [];
  return memory.slice(0, 4).map((item) => `Hafıza sinyali: ${item.memory_key || item.event_type || "geri bildirim"}`);
}

const positionLabels: Record<string, string> = {
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
};

const orientationLabels: Record<string, string> = {
  upright: "düz",
  reversed: "ters"
};

function tarotReferences(cards: Array<Record<string, unknown>> | undefined) {
  if (!Array.isArray(cards) || cards.length === 0) return [];
  return cards.map((card) => {
    const position = positionLabels[String(card.position)] ?? String(card.position);
    const orientation = orientationLabels[String(card.orientation)] ?? String(card.orientation);
    return `Tarot: ${position} / ${card.card} / ${orientation}`;
  });
}

export function buildSourceContext(input: {
  readingType: string;
  profile?: Record<string, unknown> | null;
  memory?: Array<Record<string, unknown>>;
  astrology?: Record<string, unknown> | null;
  tarotCards?: Array<Record<string, unknown>>;
  extra?: string[];
}) {
  const systems = [
    "Gemini LLM",
    input.profile ? "Mistik profil" : null,
    input.memory?.length ? "Kişisel hafıza" : null,
    input.astrology ? "Swiss Ephemeris doğum/yıldız haritası" : null,
    input.readingType === "tarot" ? "Tarot açılımı" : null,
    input.readingType === "coffee" ? "Kahve sembolleri" : null,
    input.readingType === "relationship" ? "İlişki bağlamı" : null
  ].filter(Boolean) as string[];

  return {
    systems,
    references: [
      ...tarotReferences(input.tarotCards),
      ...astrologyReferences(input.astrology),
      ...profileReferences(input.profile),
      ...memoryReferences(input.memory),
      ...(input.extra ?? [])
    ].slice(0, 18),
    engine: "Gemini + Supabase Edge Functions"
  };
}
