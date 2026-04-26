import type { NatalChart, NatalChartInput } from "@/types/astrology";

export function createMockNatalChart(input: NatalChartInput): NatalChart {
  return {
    input,
    time: {
      local: `${input.birth_date}T${input.birth_time || "12:00"}:00`,
      utc: `${input.birth_date}T${input.birth_time || "12:00"}:00Z`,
      julian_day_ut: 2451049.0
    },
    engine: {
      name: "Mock Swiss Ephemeris Preview",
      python_package: "pysweph"
    },
    sun: {
      key: "sun",
      label: "Güneş",
      absolute_degree: 151.4,
      sign_key: "virgo",
      sign_label: "Başak",
      degree: 1.4
    },
    moon: {
      key: "moon",
      label: "Ay",
      absolute_degree: 218.7,
      sign_key: "scorpio",
      sign_label: "Akrep",
      degree: 8.7
    },
    ascendant: {
      key: "ascendant",
      label: "Yükselen",
      absolute_degree: 247.2,
      sign_key: "sagittarius",
      sign_label: "Yay",
      degree: 7.2
    },
    planets: [],
    houses: [],
    aspects: [],
    warnings: ["Astrology service URL is not configured; mock chart preview was used."]
  };
}

