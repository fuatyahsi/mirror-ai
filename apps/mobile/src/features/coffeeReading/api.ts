import { buildAstrologyContext } from "@/features/astrology/context";
import { generateCoffeeMock } from "@/features/readings/mockReadings";
import { toReadingOutput } from "@/features/readings/readingMapper";
import { assertRemoteServicesAvailable, shouldUseMockFallback, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

// Mirror AI kahve fotoğrafı no-store politikası:
// Cihazdaki fotoğraf Supabase Storage'a hiç yüklenmez. Vision API'ye gövdede
// base64 olarak gönderilir, vision sonucu döndükten sonra hiçbir yerde
// tutulmaz. Edge function da görseli kalıcı yazmaz.

export async function generateCoffeeReading(input: {
  cup_image_base64?: string;
  cup_image_mime_type?: string;
  plate_image_base64?: string;
  plate_image_mime_type?: string;
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
      cup_image_base64: input.cup_image_base64,
      cup_image_mime_type: input.cup_image_mime_type,
      plate_image_base64: input.plate_image_base64,
      plate_image_mime_type: input.plate_image_mime_type,
      do_not_store_image: true,
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

// Cihazdaki görsel URI'sini base64'e dönüştürür. Storage adımı YOKTUR.
export async function readImageAsBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error("Image could not be read for analysis");
  }
  const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  return { base64, mimeType };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("blob read failed"));
    reader.onloadend = () => {
      const result = String(reader.result ?? "");
      // FileReader.readAsDataURL → "data:image/jpeg;base64,XXXX"
      const idx = result.indexOf(",");
      resolve(idx === -1 ? result : result.slice(idx + 1));
    };
    reader.readAsDataURL(blob);
  });
}
