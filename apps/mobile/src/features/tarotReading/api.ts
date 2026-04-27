import { buildAstrologyContext } from "@/features/astrology/context";
import { generateTarotMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateTarotReading(input: {
  spread_type: string;
  topic: string;
  question: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  locale?: Locale;
  useRemote?: boolean;
}) {
  if (!isSupabaseConfigured || input.useRemote === false) {
    return generateTarotMock(input.spread_type, input.topic, input.question, input.profile, input.locale);
  }

  const { data, error } = await supabase.functions.invoke("generate-tarot-reading", {
    body: {
      spread_type: input.spread_type,
      topic: input.topic,
      question: input.question,
      profile: input.profile,
      memory: input.memory ?? [],
      astrology: buildAstrologyContext(input.natalChart, input.locale),
      locale: input.locale ?? "tr"
    }
  });

  if (error) throw error;
  return {
    reading: toReadingOutput(
      data,
      {
        reading_type: "tarot",
        topic: input.topic,
        question: input.question
      },
      input.locale
    ),
    cards: data.cards ?? []
  };
}
