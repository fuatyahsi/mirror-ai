import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateTarotMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateTarotReading(input: {
  spread_type: string;
  topic: string;
  question: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  useRemote?: boolean;
}) {
  if (!isSupabaseConfigured || input.useRemote === false) {
    return generateTarotMock(input.spread_type, input.topic, input.question, input.profile);
  }

  const { data, error } = await supabase.functions.invoke("generate-tarot-reading", {
    body: {
      spread_type: input.spread_type,
      topic: input.topic,
      question: input.question,
      profile: input.profile,
      memory: input.memory ?? [],
      astrology: input.natalChart
    }
  });

  if (error) throw error;
  return {
    reading: toReadingOutput(data, {
      reading_type: "tarot",
      topic: input.topic,
      question: input.question
    }),
    cards: data.cards ?? []
  };
}
