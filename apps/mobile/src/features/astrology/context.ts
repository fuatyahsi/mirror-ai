import type { NatalChart, ZodiacPoint } from "@/types/astrology";

function pointRef(label: string, point?: ZodiacPoint) {
  if (!point) return null;
  return `${label}: ${point.sign_label} ${point.degree.toFixed(1)}°`;
}

export function buildAstrologyContext(chart?: NatalChart) {
  if (!chart) return undefined;

  const personalPlanets = chart.planets.filter((planet) =>
    ["sun", "moon", "mercury", "venus", "mars"].includes(planet.key)
  );

  const referencePoints = [
    pointRef("Güneş", chart.sun),
    pointRef("Ay", chart.moon),
    pointRef("Yükselen", chart.ascendant),
    pointRef("Tepe noktası", chart.midheaven),
    ...personalPlanets.map((planet) => pointRef(planet.label, planet)),
    ...chart.aspects
      .slice(0, 5)
      .map((aspect) => `${aspect.label}: ${aspect.between.join(" - ")} (${aspect.orb.toFixed(1)} orb)`)
  ].filter(Boolean) as string[];

  return {
    systems: {
      birth_chart: {
        description: "Doğum haritası: doğum anındaki temel gök yerleşimleri.",
        sun: chart.sun,
        moon: chart.moon,
        ascendant: chart.ascendant,
        midheaven: chart.midheaven
      },
      star_chart: {
        description: "Yıldız haritası: kişisel gezegenler, ev başlangıçları ve majör açılar.",
        planets: chart.planets,
        houses: chart.houses,
        aspects: chart.aspects
      },
      natal_horoscope: {
        description:
          "Natal horoskop: transit iddiası olmadan, doğum haritasının sembolik kişilik ve tema okuması.",
        note: "Güncel transit hesaplaması henüz eklenmediği için yorumlar natal harita bağlamıyla sınırlıdır."
      }
    },
    reference_points: referencePoints,
    engine: chart.engine,
    warnings: chart.warnings
  };
}

