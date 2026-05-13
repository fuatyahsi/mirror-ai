import { buildAstrologyContext } from "@/features/astrology/context";
import { generateCoffeeMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import { assertRemoteServicesAvailable, isSupabaseConfigured, shouldUseMockFallback, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateCoffeeReading(input: {
  cup_image_url?: string;
  do_not_store_image?: boolean;
  plate_image_url?: string;
  topic: string;
  question: string;
  context?: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  locale?: Locale;
  useRemote?: boolean;
}) {
  assertRemoteServicesAvailable(input.useRemote);
  if (shouldUseMockFallback(input.useRemote)) {
    return generateCoffeeMock(input.topic, input.question, input.context ?? "", input.profile, input.locale);
  }

  const { data, error } = await supabase.functions.invoke("generate-coffee-reading", {
    body: {
      cup_image_url: input.cup_image_url,
      do_not_store_image: input.do_not_store_image ?? true,
      plate_image_url: input.plate_image_url,
      topic: input.topic,
      question: input.question,
      context: input.context,
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
        reading_type: "coffee",
        topic: input.topic,
        question: input.question
      },
      input.locale
    ),
    detected_symbols: data.detected_symbols ?? []
  };
}

export async function uploadCoffeeImage(input: {
  uri: string;
  userId: string;
  readingDraftId?: string;
  fileName?: string;
}) {
  assertRemoteServicesAvailable();
  if (!isSupabaseConfigured) {
    return {
      storagePath: input.uri,
      signedUrl: input.uri
    };
  }

  const readingId = input.readingDraftId ?? `draft_${Date.now()}`;
  const fileName = input.fileName ?? "cup.jpg";
  const storagePath = coffeeStoragePath(input.userId, readingId, fileName);
  const response = await fetch(input.uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from("coffee-readings")
    .upload(storagePath, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: true
    });

  if (uploadError) throw uploadError;

  const { data, error: signedUrlError } = await supabase.storage
    .from("coffee-readings")
    .createSignedUrl(storagePath, 60 * 60);

  if (signedUrlError) throw signedUrlError;

  return {
    storagePath,
    signedUrl: data.signedUrl
  };
}

export async function deleteCoffeeImage(storagePath?: string) {
  if (!storagePath || storagePath.startsWith("file:")) return;
  assertRemoteServicesAvailable();
  if (!isSupabaseConfigured) return;

  await supabase.storage.from("coffee-readings").remove([storagePath]);
}

export function coffeeStoragePath(userId: string, readingId: string, fileName = "cup.jpg") {
  return `${userId}/${readingId}/${fileName}`;
}
