import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { createMockNatalChart } from "@/features/astrology/mockChart";
import type { NatalChart, NatalChartInput } from "@/types/astrology";

const astrologyServiceUrl = process.env.EXPO_PUBLIC_ASTROLOGY_SERVICE_URL;
const astrologyRequestTimeoutMs = 2500;
const strictAstrologyBackend = process.env.EXPO_PUBLIC_ASTROLOGY_STRICT === "true";
const shouldUseDirectAstrologyService = Boolean(astrologyServiceUrl) && __DEV__;

export async function calculateNatalChart(input: NatalChartInput): Promise<NatalChart> {
  if (shouldUseDirectAstrologyService && astrologyServiceUrl) {
    try {
      const data = await postNatalChart(`${astrologyServiceUrl.replace(/\/$/, "")}/natal-chart`, input);
      return sanitizeNatalChart(data);
    } catch (error) {
      if (strictAstrologyBackend) throw normalizeAstrologyError(error);
      // Local direct calls are only for Expo dev. Release builds use Supabase Edge Functions.
    }
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke("calculate-natal-chart", {
        body: input
      });
      if (error) throw error;
      return sanitizeNatalChart(data.chart);
    } catch (error) {
      if (strictAstrologyBackend) throw normalizeAstrologyError(error);
      return sanitizeNatalChart(createMockNatalChart(input));
    }
  }

  if (strictAstrologyBackend) {
    throw new Error("Supabase bağlantısı yok; gerçek doğum haritası hesaplanamadı.");
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

function normalizeAstrologyError(error: unknown) {
  if (error instanceof Error) return error;
  return new Error("Gerçek doğum haritası servisi yanıt vermedi.");
}
