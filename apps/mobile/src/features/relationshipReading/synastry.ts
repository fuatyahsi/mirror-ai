import type { NatalChart, SynastryAspect, SynastryReport, ZodiacPoint } from "@/types/astrology";

const aspectDefs = [
  { type: "conjunction", tr: "Kavuşum", en: "Conjunction", angle: 0, orb: 7, score: 8 },
  { type: "sextile", tr: "Altmışlık", en: "Sextile", angle: 60, orb: 4, score: 7 },
  { type: "square", tr: "Kare", en: "Square", angle: 90, orb: 5, score: -5 },
  { type: "trine", tr: "Üçgen", en: "Trine", angle: 120, orb: 5, score: 8 },
  { type: "opposition", tr: "Karşıt", en: "Opposition", angle: 180, orb: 6, score: -3 }
] as const;

const synastryPairs = [
  { a: "sun", b: "moon", category: "emotional", weight: 1.2 },
  { a: "moon", b: "sun", category: "emotional", weight: 1.2 },
  { a: "moon", b: "venus", category: "emotional", weight: 1.1 },
  { a: "venus", b: "moon", category: "emotional", weight: 1.1 },
  { a: "mercury", b: "mercury", category: "mental", weight: 1.2 },
  { a: "sun", b: "mercury", category: "mental", weight: 0.8 },
  { a: "mercury", b: "sun", category: "mental", weight: 0.8 },
  { a: "venus", b: "mars", category: "romantic", weight: 1.4 },
  { a: "mars", b: "venus", category: "romantic", weight: 1.4 },
  { a: "venus", b: "venus", category: "romantic", weight: 0.9 },
  { a: "mars", b: "mars", category: "crisis", weight: 1 },
  { a: "moon", b: "saturn", category: "attachment", weight: 1.35 },
  { a: "saturn", b: "moon", category: "attachment", weight: 1.35 },
  { a: "venus", b: "saturn", category: "long_term", weight: 1.2 },
  { a: "saturn", b: "venus", category: "long_term", weight: 1.2 },
  { a: "sun", b: "saturn", category: "long_term", weight: 0.95 },
  { a: "saturn", b: "sun", category: "long_term", weight: 0.95 },
  { a: "true_node", b: "sun", category: "karmic", weight: 1 },
  { a: "sun", b: "true_node", category: "karmic", weight: 1 },
  { a: "true_node", b: "moon", category: "karmic", weight: 1 },
  { a: "moon", b: "true_node", category: "karmic", weight: 1 }
] as const;

const categoryCopy = {
  tr: {
    emotional: "duygusal güven ve tepki ritmi",
    mental: "iletişim ve zihinsel akış",
    romantic: "romantik çekim ve temas dili",
    long_term: "uzun vadeli sorumluluk",
    crisis: "gerilim ve dürtü yönetimi",
    attachment: "bağlanma ve güvenlik ihtiyacı",
    karmic: "tekrarlayan/tanıdık tema"
  },
  en: {
    emotional: "emotional safety and reaction rhythm",
    mental: "communication and mental flow",
    romantic: "romantic pull and contact style",
    long_term: "long-term responsibility",
    crisis: "tension and impulse management",
    attachment: "attachment and need for safety",
    karmic: "repeating/familiar theme"
  }
} as const;

type Locale = "tr" | "en";
type SynastryCategory = SynastryAspect["category"];

export function buildSynastryReport(
  userChart?: NatalChart,
  partnerChart?: NatalChart,
  options?: { partnerBirthTimeKnown?: boolean; locale?: Locale }
): SynastryReport | undefined {
  if (!userChart || !partnerChart) return undefined;

  const locale = options?.locale ?? "tr";
  const userPoints = pointMap(userChart);
  const partnerPoints = pointMap(partnerChart);
  const keyAspects: SynastryAspect[] = [];

  for (const pair of synastryPairs) {
    const first = userPoints.get(pair.a);
    const second = partnerPoints.get(pair.b);
    if (!first || !second) continue;

    const distance = normalizeAngleDistance(first.absolute_degree, second.absolute_degree);
    const aspect = aspectDefs.find((candidate) => Math.abs(distance - candidate.angle) <= candidate.orb);
    if (!aspect) continue;

    const orb = Number(Math.abs(distance - aspect.angle).toFixed(2));
    const category = pair.category as SynastryCategory;
    keyAspects.push({
      type: aspect.type,
      label: locale === "en" ? aspect.en : aspect.tr,
      between: [first.key, second.key],
      orb,
      category,
      weight: pair.weight,
      reference: `${first.label} ${formatPoint(first)} - ${second.label} ${formatPoint(second)}: ${
        locale === "en" ? aspect.en : aspect.tr
      }, orb ${orb.toFixed(2)}°`
    });
  }

  const sortedAspects = keyAspects.sort((first, second) => first.orb - second.orb).slice(0, 10);
  const scores = {
    emotional_harmony: categoryScore(sortedAspects, "emotional"),
    mental_flow: categoryScore(sortedAspects, "mental"),
    romantic_pull: categoryScore(sortedAspects, "romantic"),
    long_term_potential: categoryScore(sortedAspects, "long_term"),
    crisis_intensity: categoryIntensity(sortedAspects, "crisis"),
    attachment_dynamic: categoryIntensity(sortedAspects, "attachment"),
    repeating_theme: categoryIntensity(sortedAspects, "karmic")
  };
  const supportiveAverage =
    (scores.emotional_harmony + scores.mental_flow + scores.romantic_pull + scores.long_term_potential) / 4;
  const pressure = (scores.crisis_intensity + scores.attachment_dynamic + scores.repeating_theme) / 3;
  const overall = Math.round(Math.max(28, Math.min(92, supportiveAverage * 0.74 + (100 - pressure) * 0.26)));

  return {
    overall_score: overall,
    confidence: options?.partnerBirthTimeKnown === false ? 0.66 : 0.81,
    time_accuracy_note:
      options?.partnerBirthTimeKnown === false
        ? locale === "en"
          ? "Partner birth time is unknown, so houses and Ascendant are read flexibly. The report leans on planet-to-planet synastry."
          : "Karşı tarafın doğum saati bilinmediği için evler ve yükselen esnek okunur. Analiz gezegenler arası sinastriye dayanır."
        : undefined,
    strengths: topCategories(sortedAspects, ["emotional", "mental", "romantic", "long_term"], locale),
    risk_areas: topCategories(sortedAspects, ["crisis", "attachment", "karmic"], locale),
    scores,
    key_aspects: sortedAspects
  };
}

function pointMap(chart: NatalChart) {
  const points = new Map<string, ZodiacPoint>();
  for (const point of [chart.sun, chart.moon, chart.ascendant, chart.midheaven, ...(chart.planets ?? [])]) {
    if (point?.key && Number.isFinite(point.absolute_degree)) points.set(point.key, point);
  }
  return points;
}

function normalizeAngleDistance(a: number, b: number) {
  const distance = Math.abs((a - b) % 360);
  return Math.min(distance, 360 - distance);
}

function categoryScore(aspects: SynastryAspect[], category: SynastryCategory) {
  const matches = aspects.filter((aspect) => aspect.category === category);
  if (!matches.length) return 54;

  const raw = matches.reduce((sum, aspect) => {
    const def = aspectDefs.find((item) => item.type === aspect.type);
    return sum + (def?.score ?? 0) * aspect.weight * (1 - Math.min(aspect.orb, 8) / 14);
  }, 0);

  return Math.round(Math.max(24, Math.min(94, 56 + raw * 5)));
}

function categoryIntensity(aspects: SynastryAspect[], category: SynastryCategory) {
  const matches = aspects.filter((aspect) => aspect.category === category);
  if (!matches.length) return 42;
  const raw = matches.reduce((sum, aspect) => sum + aspect.weight * (1 - Math.min(aspect.orb, 8) / 10), 0);
  return Math.round(Math.max(38, Math.min(91, 46 + raw * 21)));
}

function topCategories(aspects: SynastryAspect[], categories: SynastryCategory[], locale: Locale) {
  const seen = new Set<SynastryCategory>();
  const result: string[] = [];
  for (const aspect of aspects) {
    if (!categories.includes(aspect.category) || seen.has(aspect.category)) continue;
    seen.add(aspect.category);
    result.push(`${categoryCopy[locale][aspect.category]}: ${aspect.reference}`);
  }
  return result.slice(0, 3);
}

function formatPoint(point: ZodiacPoint) {
  return `${point.sign_label} ${point.degree.toFixed(1)}°${point.retrograde ? " R" : ""}`;
}
