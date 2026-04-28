import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { createMockNatalChart } from "@/features/astrology/mockChart";
import type { NatalChart, NatalChartInput } from "@/types/astrology";

const astrologyServiceUrl = process.env.EXPO_PUBLIC_ASTROLOGY_SERVICE_URL;
const astrologyRequestTimeoutMs = 2500;

export async function calculateNatalChart(input: NatalChartInput): Promise<NatalChart> {
  if (astrologyServiceUrl) {
    try {
      const data = await postNatalChart(`${astrologyServiceUrl.replace(/\/$/, "")}/natal-chart`, input);
      return sanitizeNatalChart(data);
    } catch {
      // Physical test devices cannot reach the emulator-only 10.0.2.2 service.
      // Continue with remote Supabase or embedded preview instead of breaking onboarding.
    }
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke("calculate-natal-chart", {
        body: input
      });
      if (error) throw error;
      return sanitizeNatalChart(data.chart);
    } catch {
      return sanitizeNatalChart(createMockNatalChart(input));
    }
  }

  return sanitizeNatalChart(createMockNatalChart(input));
}

async function postNatalChart(url: string, input: NatalChartInput) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), astrologyRequestTimeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input),
      signal: controller.signal
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.error || "Doğum haritası hesaplanamadı.");
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizeNatalChart(chart: NatalChart): NatalChart {
  return {
    ...chart,
    warnings: chart.warnings.filter(isUserFacingChartWarning)
  };
}

export function isUserFacingChartWarning(message: string) {
  const lower = message.toLocaleLowerCase("en-US");
  return !["not found in path", "using moshier", "sepl_", "semo_", "seas_", ".se1"].some((fragment) =>
    lower.includes(fragment)
  );
}
