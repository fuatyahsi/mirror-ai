import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateRelationshipMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateRelationshipReading(input: {
  relationship_id?: string;
  nickname?: string;
  status: string;
  question: string;
  recent_context?: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  useRemote?: boolean;
}) {
  if (!isSupabaseConfigured || input.useRemote === false) {
    return generateRelationshipMock(
      input.nickname ?? "",
      input.status,
      input.question,
      input.recent_context ?? "",
      input.profile
    );
  }

  const { data, error } = await supabase.functions.invoke("generate-relationship-reading", {
    body: {
      relationship_id: input.relationship_id,
      nickname: input.nickname,
      status: input.status,
      question: input.question,
      recent_context: input.recent_context,
      profile: input.profile,
      memory: input.memory ?? [],
      astrology: input.natalChart
    }
  });

  if (error) throw error;
  return {
    reading: toReadingOutput(data, {
      reading_type: "relationship",
      topic: "relationship",
      question: input.question
    }),
    scores: data.scores
  };
}
