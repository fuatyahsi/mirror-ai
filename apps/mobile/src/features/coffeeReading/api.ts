import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { buildAstrologyContext } from "@/features/astrology/context";
import { generateCoffeeMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateCoffeeReading(input: {
  cup_image_url?: string;
  plate_image_url?: string;
  topic: string;
  question: string;
  context?: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  useRemote?: boolean;
}) {
  if (!isSupabaseConfigured || input.useRemote === false) {
    return generateCoffeeMock(input.topic, input.question, input.context ?? "", input.profile);
  }

  const { data, error } = await supabase.functions.invoke("generate-coffee-reading", {
    body: {
      cup_image_url: input.cup_image_url,
      plate_image_url: input.plate_image_url,
      topic: input.topic,
      question: input.question,
      context: input.context,
      profile: input.profile,
      memory: input.memory ?? [],
      astrology: buildAstrologyContext(input.natalChart)
    }
  });

  if (error) throw error;
  return {
    reading: toReadingOutput(data, {
      reading_type: "coffee",
      topic: input.topic,
      question: input.question
    }),
    detected_symbols: data.detected_symbols ?? []
  };
}

export function coffeeStoragePath(userId: string, readingId: string, fileName = "cup.jpg") {
  return `${userId}/${readingId}/${fileName}`;
}
