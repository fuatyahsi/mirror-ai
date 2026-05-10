import { buildAstrologyContext } from "@/features/astrology/context";
import { generateDailyMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import type { Locale } from "@/i18n";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateDailySkyReading(input: {
  topic: string;
  mood?: string;
  question?: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  locale?: Locale;
  targetDate?: string;
  timezone?: string;
  useRemote?: boolean;
}) {
  const locale = input.locale ?? "tr";
  const topic = input.topic || (locale === "en" ? "daily sky" : "günlük gökyüzü");
  const mood = input.mood || "reflective";
  const question =
    input.question ||
    (locale === "en"
      ? "What should I notice in today's sky?"
      : "Bugünün gökyüzünde kendim için neyi fark etmeliyim?");

  if (!isSupabaseConfigured || input.useRemote === false) {
    return generateDailyMock(topic, mood, question, input.profile, locale);
  }

  const { data, error } = await supabase.functions.invoke("generate-daily-sky", {
    body: {
      topic,
      mood,
      question,
      target_date: input.targetDate ?? new Date().toISOString().slice(0, 10),
      timezone: input.timezone ?? input.natalChart?.input.timezone,
      profile: input.profile,
      memory: input.memory ?? [],
      natal_chart: input.natalChart,
      astrology: buildAstrologyContext(input.natalChart, locale),
      locale
    }
  });

  if (error) throw error;

  return toReadingOutput(
    data,
    {
      reading_type: "daily",
      topic,
      question
    },
    locale
  );
}
