import type { NatalAspect, NatalChart, NatalChartInput, ZodiacPoint } from "@/types/astrology";

const signs = [
  ["aries", "Koç"],
  ["taurus", "Boğa"],
  ["gemini", "İkizler"],
  ["cancer", "Yengeç"],
  ["leo", "Aslan"],
  ["virgo", "Başak"],
  ["libra", "Terazi"],
  ["scorpio", "Akrep"],
  ["sagittarius", "Yay"],
  ["capricorn", "Oğlak"],
  ["aquarius", "Kova"],
  ["pisces", "Balık"]
] as const;

const planetSeeds = [
  ["sun", "Güneş", 0, 0.9856],
  ["moon", "Ay", 82, 13.1764],
  ["mercury", "Merkür", 18, 1.18],
  ["venus", "Venüs", 43, 1.02],
  ["mars", "Mars", 91, 0.52],
  ["jupiter", "Jüpiter", 134, 0.083],
  ["saturn", "Satürn", 201, 0.033],
  ["uranus", "Uranüs", 250, 0.012],
  ["neptune", "Neptün", 297, 0.006],
  ["pluto", "Plüton", 318, 0.004],
  ["true_node", "Kuzey Ay Düğümü", 167, -0.052]
] as const;

const aspectDefs = [
  ["conjunction", "Kavuşum", 0, 8],
  ["sextile", "Altmışlık", 60, 4],
  ["square", "Kare", 90, 6],
  ["trine", "Üçgen", 120, 6],
  ["opposition", "Karşıt", 180, 8]
] as const;

export function createMockNatalChart(input: NatalChartInput): NatalChart {
  const dateSeed = dateToSeed(input.birth_date, input.birth_time);
  const locationSeed = ((input.latitude || 0) * 1.7 + (input.longitude || 0) * 0.9 + 360) % 360;
  const planets = planetSeeds.map(([key, label, offset, speed]) =>
    point(key, label, dateSeed * speed + offset + locationSeed * 0.08, speed)
  );
  const ascendant = point("ascendant", "Yükselen", locationSeed + dateSeed * 0.25, 1);
  const midheaven = point("midheaven", "Tepe Noktası", ascendant.absolute_degree + 90, 1);
  const houses = Array.from({ length: 12 }).map((_, index) => {
    const sign = signForLongitude(ascendant.absolute_degree + index * 30);
    return {
      house: index + 1,
      ...sign
    };
  });

  return {
    input,
    time: {
      local: `${input.birth_date}T${input.birth_time || "12:00"}:00`,
      utc: `${input.birth_date}T${input.birth_time || "12:00"}:00Z`,
      julian_day_ut: 2440000 + dateSeed
    },
    engine: {
      name: "Mirror AI Embedded Chart Preview",
      python_package: "offline-preview"
    },
    sun: planets[0],
    moon: planets[1],
    ascendant,
    midheaven,
    planets,
    houses,
    aspects: calculateAspects(planets),
    warnings: []
  };
}

function dateToSeed(date: string, time?: string) {
  const [year = 2000, month = 1, day = 1] = date.split("-").map(Number);
  const [hour = 12, minute = 0] = (time || "12:00").split(":").map(Number);
  return Math.max(1, Math.round((year - 1900) * 365.25 + month * 30.4 + day + hour / 24 + minute / 1440));
}

function point(key: string, label: string, longitude: number, speed: number): ZodiacPoint {
  const normalizedSpeed = key === "saturn" || key === "true_node" ? -Math.abs(speed) : speed;
  return {
    key,
    label,
    ...signForLongitude(longitude),
    speed: Number(normalizedSpeed.toFixed(8)),
    retrograde: normalizedSpeed < 0
  };
}

function signForLongitude(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const [sign_key, sign_label] = signs[signIndex];

  return {
    absolute_degree: Number(normalized.toFixed(6)),
    sign_key,
    sign_label,
    degree: Number((normalized % 30).toFixed(6))
  };
}

function calculateAspects(planets: ZodiacPoint[]): NatalAspect[] {
  const aspects: NatalAspect[] = [];

  for (let firstIndex = 0; firstIndex < planets.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < planets.length; secondIndex += 1) {
      const first = planets[firstIndex];
      const second = planets[secondIndex];
      const distance = angleDistance(first.absolute_degree, second.absolute_degree);
      for (const [type, label, exact, orb] of aspectDefs) {
        const delta = Math.abs(distance - exact);
        if (delta <= orb) {
          aspects.push({
            type,
            label,
            between: [first.key, second.key],
            orb: Number(delta.toFixed(4))
          });
          break;
        }
      }
    }
  }

  return aspects.slice(0, 12);
}

function angleDistance(first: number, second: number) {
  const distance = Math.abs((first - second) % 360);
  return Math.min(distance, 360 - distance);
}
