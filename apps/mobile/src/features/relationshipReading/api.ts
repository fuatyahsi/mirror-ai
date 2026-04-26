import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateRelationshipMock } from "@/features/readings/mockReadings";
import type { MysticProfile } from "@/types/profile";

export async function generateRelationshipReading(input: {
  relationship_id?: string;
  nickname?: string;
  status: string;
  question: string;
  recent_context?: string;
  profile?: MysticProfile;
}) {
  if (!isSupabaseConfigured) {
    return generateRelationshipMock(
      input.nickname ?? "",
      input.status,
      input.question,
      input.recent_context ?? "",
      input.profile
    );
  }

  const { data, error } = await supabase.functions.invoke("generate-relationship-reading", {
    body: input
  });

  if (error) throw error;
  return data;
}

