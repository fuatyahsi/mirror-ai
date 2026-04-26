import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateTarotMock } from "@/features/readings/mockReadings";
import type { MysticProfile } from "@/types/profile";

export async function generateTarotReading(input: {
  spread_type: string;
  topic: string;
  question: string;
  profile?: MysticProfile;
}) {
  if (!isSupabaseConfigured) {
    return generateTarotMock(input.spread_type, input.topic, input.question, input.profile);
  }

  const { data, error } = await supabase.functions.invoke("generate-tarot-reading", {
    body: input
  });

  if (error) throw error;
  return data;
}

