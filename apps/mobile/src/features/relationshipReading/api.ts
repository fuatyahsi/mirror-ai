import { buildAstrologyContext } from "@/features/astrology/context";
import { generateRelationshipMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateRelationshipReading(input: {
  relationship_id?: string;
  nickname?: string;
  relation_type?: string;
  status: string;
  question: string;
  recent_context?: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  locale?: Locale;
  useRemote?: boolean;
}) {
  if (!isSupabaseConfigured || input.useRemote === false) {
    return generateRelationshipMock(
      input.nickname ?? "",
      input.status,
      input.question,
      input.recent_context ?? "",
      input.profile,
      input.locale
    );
  }

  const { data, error } = await supabase.functions.invoke("generate-relationship-reading", {
    body: {
      relationship_id: input.relationship_id,
      nickname: input.nickname,
      relation_type: input.relation_type,
      status: input.status,
      question: input.question,
      recent_context: input.recent_context,
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
        reading_type: "relationship",
        topic: "relationship",
        question: input.question
      },
      input.locale
    ),
    scores: data.scores
  };
}
