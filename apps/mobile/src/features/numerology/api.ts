import { buildAstrologyContext } from "@/features/astrology/context";
import { buildNumerologyReading, calculateNumerologyReport } from "@/features/numerology/calculate";
import { toReadingOutput } from "@/features/readings/readingMapper";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";
import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";

export async function generateNumerologyReading(input: {
  birthDate: string;
  name?: string;
  profile?: MysticProfile;
  memory?: unknown[];
  natalChart?: NatalChart;
  locale?: Locale;
  deep?: boolean;
  useRemote?: boolean;
}) {
  const locale = input.locale === "en" ? "en" : "tr";

  if (!isSupabaseConfigured || input.useRemote === false) {
    const report = calculateNumerologyReport({
      birthDate: input.birthDate,
      name: input.name,
      locale,
      profile: input.profile,
      natalChart: input.natalChart
    });
    return buildNumerologyReading(report, locale);
  }

  const { data, error } = await supabase.functions.invoke("generate-numerology-reading", {
    body: {
      birth_date: input.birthDate,
      name: input.name,
      profile: input.profile,
      memory: input.memory ?? [],
      astrology: buildAstrologyContext(input.natalChart, locale),
      locale,
      deep: input.deep === true
    }
  });

  if (error) throw error;

  return toReadingOutput(
    data,
    {
      reading_type: "numerology",
      topic: locale === "en" ? "personal numerology" : "kişisel numeroloji"
    },
    locale
  );
}
