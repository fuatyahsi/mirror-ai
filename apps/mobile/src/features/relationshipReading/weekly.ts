import { toReadingOutput } from "@/features/readings/readingMapper";
import { assertRemoteServicesAvailable, isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";

export type WeeklyReportInput = {
  relationship_id?: string;
  relationship_key?: string;
  locale?: Locale;
};

export async function generateWeeklyRelationshipReport(input: WeeklyReportInput) {
  assertRemoteServicesAvailable();
  if (!isSupabaseConfigured) {
    throw new Error(
      input.locale === "en"
        ? "Weekly report requires Supabase. Configure your project to use this feature."
        : "Haftalık rapor Supabase bağlantısı ister. Lütfen ayarları yap."
    );
  }

  const { data, error } = await supabase.functions.invoke("generate-weekly-relationship-report", {
    body: {
      relationship_id: input.relationship_id,
      relationship_key: input.relationship_key,
      locale: input.locale ?? "tr"
    }
  });

  if (error) throw error;

  return {
    reading: toReadingOutput(
      data,
      { reading_type: "weekly_relationship", topic: "weekly_relationship" },
      input.locale
    ),
    billing: data.billing,
    relationship_intelligence: data.relationship_intelligence
  };
}
