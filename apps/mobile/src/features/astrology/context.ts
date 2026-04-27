import type { Locale } from "@/i18n";
import type { NatalChart, ZodiacPoint } from "@/types/astrology";

const labels = {
  tr: {
    sun: "Güneş",
    moon: "Ay",
    ascendant: "Yükselen",
    midheaven: "Tepe noktası",
    birthDescription: "Doğum haritası: doğum anındaki temel gök yerleşimleri.",
    starDescription: "Yıldız haritası: kişisel gezegenler, ev başlangıçları ve majör açılar.",
    natalDescription:
      "Natal horoskop: transit iddiası olmadan, doğum haritasının sembolik kişilik ve tema okuması.",
    natalNote:
      "Güncel transit hesaplaması henüz eklenmediği için yorumlar natal harita bağlamıyla sınırlıdır.",
    orb: "orb"
  },
  en: {
    sun: "Sun",
    moon: "Moon",
    ascendant: "Ascendant",
    midheaven: "Midheaven",
    birthDescription: "Birth chart: core sky placements at the moment of birth.",
    starDescription: "Star chart: personal planets, house cusps, and major aspects.",
    natalDescription:
      "Natal horoscope: a symbolic personality and theme reading from the birth chart, without claiming current transits.",
    natalNote: "Current transit calculation is not enabled yet, so readings are limited to natal-chart context.",
    orb: "orb"
  }
} as const;

function pointRef(label: string, point?: ZodiacPoint) {
  if (!point) return null;
  return `${label}: ${point.sign_label} ${point.degree.toFixed(1)}°`;
}

export function buildAstrologyContext(chart?: NatalChart, locale: Locale = "tr") {
  if (!chart) return undefined;
  const text = labels[locale];

  const personalPlanets = chart.planets.filter((planet) =>
    ["sun", "moon", "mercury", "venus", "mars"].includes(planet.key)
  );

  const referencePoints = [
    pointRef(text.sun, chart.sun),
    pointRef(text.moon, chart.moon),
    pointRef(text.ascendant, chart.ascendant),
    pointRef(text.midheaven, chart.midheaven),
    ...personalPlanets.map((planet) => pointRef(planet.label, planet)),
    ...chart.aspects
      .slice(0, 5)
      .map((aspect) => `${aspect.label}: ${aspect.between.join(" - ")} (${aspect.orb.toFixed(1)} ${text.orb})`)
  ].filter(Boolean) as string[];

  return {
    systems: {
      birth_chart: {
        description: text.birthDescription,
        sun: chart.sun,
        moon: chart.moon,
        ascendant: chart.ascendant,
        midheaven: chart.midheaven
      },
      star_chart: {
        description: text.starDescription,
        planets: chart.planets,
        houses: chart.houses,
        aspects: chart.aspects
      },
      natal_horoscope: {
        description: text.natalDescription,
        note: text.natalNote
      }
    },
    reference_points: referencePoints,
    engine: chart.engine,
    warnings: chart.warnings
  };
}
