import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateDailyMock } from "@/features/readings/mockReadings";
import type { MysticProfile } from "@/types/profile";

export async function generateDailyInsight(input: {
  topic: string;
  mood: string;
  question?: string;
  profile?: MysticProfile;
}) {
  if (!isSupabaseConfigured) {
    return generateDailyMock(input.topic, input.mood, input.question, input.profile);
  }

  const { data, error } = await supabase.functions.invoke("generate-daily-insight", {
    body: {
      topic: input.topic,
      mood: input.mood,
      question: input.question
    }
  });

  if (error) throw error;
  return data;
}

