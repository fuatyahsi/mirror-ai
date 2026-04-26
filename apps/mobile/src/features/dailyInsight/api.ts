import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateDailyMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateDailyInsight(input: {
  topic: string;
  mood: string;
  question?: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  useRemote?: boolean;
}) {
  if (!isSupabaseConfigured || input.useRemote === false) {
    return generateDailyMock(input.topic, input.mood, input.question, input.profile);
  }

  const { data, error } = await supabase.functions.invoke("generate-daily-insight", {
    body: {
      topic: input.topic,
      mood: input.mood,
      question: input.question,
      profile: input.profile,
      memory: input.memory ?? [],
      astrology: input.natalChart
    }
  });

  if (error) throw error;
  return toReadingOutput(data, {
    reading_type: "daily",
    topic: input.topic,
    question: input.question
  });
}
