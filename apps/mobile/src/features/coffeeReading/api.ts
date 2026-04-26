import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateCoffeeMock } from "@/features/readings/mockReadings";
import type { MysticProfile } from "@/types/profile";

export async function generateCoffeeReading(input: {
  cup_image_url?: string;
  plate_image_url?: string;
  topic: string;
  question: string;
  context?: string;
  profile?: MysticProfile;
}) {
  if (!isSupabaseConfigured || !input.cup_image_url) {
    return generateCoffeeMock(input.topic, input.question, input.context ?? "", input.profile);
  }

  const { data, error } = await supabase.functions.invoke("generate-coffee-reading", {
    body: input
  });

  if (error) throw error;
  return data;
}

export function coffeeStoragePath(userId: string, readingId: string, fileName = "cup.jpg") {
  return `${userId}/${readingId}/${fileName}`;
}

