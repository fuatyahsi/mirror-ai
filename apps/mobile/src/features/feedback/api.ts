import { assertRemoteServicesAvailable, isSupabaseConfigured, shouldUseMockFallback, supabase } from "@/lib/supabase";
import type { FeedbackScore } from "@/types/readings";

export async function submitReadingFeedback(input: {
  reading_id: string;
  score: FeedbackScore;
  accuracy_rating: number;
  emotional_resonance: number;
  comment?: string;
}) {
  assertRemoteServicesAvailable();
  if (!isSupabaseConfigured) {
    if (!shouldUseMockFallback()) throw new Error("Feedback requires Supabase in production.");
    return { feedback: { ...input, id: `local_${Date.now()}`, created_at: new Date().toISOString() } };
  }

  const { data, error } = await supabase.functions.invoke("submit-feedback", {
    body: input
  });

  if (error) throw error;
  return data;
}
