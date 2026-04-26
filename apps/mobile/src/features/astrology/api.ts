import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { createMockNatalChart } from "@/features/astrology/mockChart";
import type { NatalChart, NatalChartInput } from "@/types/astrology";

const astrologyServiceUrl = process.env.EXPO_PUBLIC_ASTROLOGY_SERVICE_URL;

export async function calculateNatalChart(input: NatalChartInput): Promise<NatalChart> {
  if (astrologyServiceUrl) {
    const response = await fetch(`${astrologyServiceUrl.replace(/\/$/, "")}/natal-chart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.error || "Doğum haritası hesaplanamadı.");
    }
    return data;
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.functions.invoke("calculate-natal-chart", {
      body: input
    });
    if (error) throw error;
    return data.chart;
  }

  return createMockNatalChart(input);
}

