import { buildAstrologyContext } from "@/features/astrology/context";
import { generateTarotMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import { assertRemoteServicesAvailable, shouldUseMockFallback, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";
import type { TarotCardDraw } from "@/types/readings";

export async function generateTarotReading(input: {
  spread_type: string;
  topic: string;
  question: string;
  clarifierQuestion?: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  selectedCards?: TarotCardDraw[];
  locale?: Locale;
  useRemote?: boolean;
}) {
  assertRemoteServicesAvailable(input.useRemote);
  if (shouldUseMockFallback(input.useRemote)) {
    return generateTarotMock(
      input.spread_type,
      input.topic,
      buildTarotQuestion(input.question, input.clarifierQuestion, input.locale),
      input.profile,
      input.locale,
      input.selectedCards
    );
  }

  const { data, error } = await supabase.functions.invoke("generate-tarot-reading", {
    body: {
      spread_type: input.spread_type,
      topic: input.topic,
      question: input.question,
      clarifier_question: input.clarifierQuestion,
      selected_cards: input.selectedCards ?? [],
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
        question: buildTarotQuestion(input.question, input.clarifierQuestion, input.locale)
      },
      input.locale
    ),
    cards: data.cards ?? []
  };
}

function buildTarotQuestion(question: string, clarifierQuestion?: string, locale: Locale = "tr") {
  const cleanQuestion = question.trim();
  const cleanClarifier = clarifierQuestion?.trim();
  if (!cleanClarifier) return cleanQuestion;

  return locale === "en"
    ? `Primary question: ${cleanQuestion}\nClarifier question: ${cleanClarifier}`
    : `Ana soru: ${cleanQuestion}\nNetleştirici soru: ${cleanClarifier}`;
}
